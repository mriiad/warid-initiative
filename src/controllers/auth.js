const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const moment = require('moment-timezone');

const User = require('../models/user');
const { validationResult } = require('express-validator');
const config = require('../utils/config');
const constants = require('../utils/constants');
const ApiError = require('../utils/errors/ApiError');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { logger } = require('../utils/logger');

const createTransporter = () => {
	if (!config.email.enabled) {
		return null;
	}

	if (!config.email.smtp.auth.user || !config.email.smtp.auth.pass) {
		return null;
	}

	return nodemailer.createTransport({
		host: config.email.smtp.host,
		secureConnection: config.email.smtp.secure,
		port: config.email.smtp.port,
		tls: {
			ciphers: config.email.smtp.tls.ciphers,
		},
		requireTLS: config.email.smtp.tls.requireTLS,
		auth: {
			user: config.email.smtp.auth.user,
			pass: config.email.smtp.auth.pass,
		},
	});
};

const transporter = createTransporter();

exports.signup = (req, res, next) => {
	const body = req.body;
	const { username, email, password, gender, phoneNumber } = body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new ApiError(constants.ERROR_MESSAGES.VALIDATION_FAILED, STATUS_CODE.BAD_REQUEST);
		throw error;
	}

	const token = jwt.sign({ email: req.body.email }, config.auth.secretKey);
	// Points at a frontend page (issue #357), not the backend API route
	// directly -- that used to leave whoever clicked it looking at a raw
	// JSON response with no UI and no way back to login.
	const activationLink = `${config.frontend.url}/activate/${token}`;

	bcrypt
		.hash(password, config.constants.bcryptRounds)
		.then((hashedPw) => {
			const user = new User({
				username,
				email,
				password: hashedPw,
				phoneNumber,
				gender,
				isAdmin: false,
				isActive: false,
				confirmationCode: token,
			});
			return user.save();
		})
		.then((result) => {
			res.status(STATUS_CODE.CREATED).json({
				message: constants.ERROR_MESSAGES.USER_CREATED,
				userId: result._id,
			});

			if (transporter) {
				// The account already exists and the 201 has been sent, so a
				// mail failure must not reach the shared .catch below -- that
				// would call next(err) after the response, crashing the error
				// middleware with ERR_HTTP_HEADERS_SENT. Log it instead.
				return transporter
					.sendMail({
						from: config.email.from,
						to: email,
						subject: constants.EMAIL_SUBJECTS.ACCOUNT_ACTIVATION,
						text: constants.EMAIL_TEMPLATES.ACTIVATION.TEXT(username),
						html: constants.EMAIL_TEMPLATES.ACTIVATION.HTML(
							username,
							activationLink
						),
					})
					.catch((mailErr) => {
						logger.error({ err: mailErr }, 'Failed to send activation email');
					});
			} else {
				return Promise.resolve();
			}
		})
		.catch((err) => {
			next(err);
		});
};

// Lets a user get a second copy of the activation email if the first is
// lost (spam, typo'd at signup, never arrived). See issue #365. Responds the
// same way whether or not the email is registered, and whether or not it's
// already active -- same reasoning as requestPasswordReset (issue #359):
// don't reopen the enumeration hole while closing this gap. Only a
// registered, not-yet-active account actually gets a new email.
exports.resendActivation = async (req, res, next) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email });

		if (user && !user.isActive) {
			const token = jwt.sign({ email }, config.auth.secretKey);
			// Same destination as signup's own activation link -- see the
			// comment there (issue #357).
			const activationLink = `${config.frontend.url}/activate/${token}`;
			user.confirmationCode = token;
			await user.save();

			if (transporter) {
				try {
					await transporter.sendMail({
						from: config.email.from,
						to: email,
						subject: constants.EMAIL_SUBJECTS.ACCOUNT_ACTIVATION,
						text: constants.EMAIL_TEMPLATES.ACTIVATION.TEXT(user.username),
						html: constants.EMAIL_TEMPLATES.ACTIVATION.HTML(
							user.username,
							activationLink
						),
					});
				} catch (mailErr) {
					logger.error({ err: mailErr }, 'Failed to resend activation email');
				}
			}
		}

		res.status(STATUS_CODE.OK).json({
			message: constants.ERROR_MESSAGES.ACTIVATION_EMAIL_RESENT,
		});
	} catch (err) {
		next(err);
	}
};

exports.login = (req, res, next) => {
	const body = req.body;
	const username = body.username;
	const password = body.password;
	let loadedUser;

	User.findOne({ username: username })
		.then((user) => {
			if (!user) {
				const error = new ApiError(constants.ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODE.UNAUTHORIZED);
				throw error;
			}
			loadedUser = user;
			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new ApiError(constants.ERROR_MESSAGES.WRONG_PASSWORD, STATUS_CODE.UNAUTHORIZED);
				throw error;
			}

			// Only enforced when mail is actually configured -- otherwise
			// nobody could ever reach the activation link, permanently
			// locking every new account out with no way to clear it. See
			// issue #357. Existing accounts from before this check existed
			// are covered by the backfill-activate-users script.
			if (transporter && !loadedUser.isActive) {
				const error = new ApiError(constants.ERROR_MESSAGES.ACCOUNT_NOT_ACTIVATED, STATUS_CODE.FORBIDDEN);
				throw error;
			}

			const token = jwt.sign(
				{
					email: loadedUser.email,
					userId: loadedUser._id.toString(),
				},
				config.auth.jwtSecretKey,
				{ expiresIn: config.auth.jwtExpire }
			);

			const refreshToken = jwt.sign(
				{ userId: loadedUser._id.toString() },
				config.auth.refreshSecretKey,
				{ expiresIn: config.auth.refreshTokenExpire }
			);

			loadedUser.refreshToken = refreshToken;
			return loadedUser.save().then(() => {
				return res
					.cookie('token', token)
					.status(STATUS_CODE.OK)
					.json({
						token: token,
						refreshToken: refreshToken,
						userId: loadedUser._id.toString(),
						isAdmin: loadedUser.isAdmin,
						// Undefined for a plain admin from before roles existed --
						// see requireAdminRole.js for why that's treated as full
						// (principal) access rather than none. See issue #183.
						role: loadedUser.role,
					});
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.verifyUser = (req, res, next) => {
	const params = req.params;
	User.findOne({
		confirmationCode: params.confirmationCode,
	})
		.then((user) => {
			if (!user) {
				return res.status(STATUS_CODE.NOT_FOUND).send({
					message: constants.ERROR_MESSAGES.USER_NOT_FOUND,
				});
			}
			user.isActive = true;
			user.save();
			return res.status(STATUS_CODE.OK).send({
				message: constants.ERROR_MESSAGES.ACCOUNT_ACTIVATED,
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.logout = (req, res, next) => {
	try {
		res.clearCookie('token');
		res.status(STATUS_CODE.OK).json({
			message: constants.ERROR_MESSAGES.LOGGED_OUT_SUCCESSFULLY,
		});
	} catch (error) {
		next(error);
	}
};

exports.refreshToken = (req, res, next) => {
	const refreshToken = req.body.refreshToken;

	if (!refreshToken) {
		const error = new ApiError(constants.ERROR_MESSAGES.REFRESH_TOKEN_INVALID, STATUS_CODE.BAD_REQUEST);
		return next(error);
	}

	jwt.verify(refreshToken, config.auth.refreshSecretKey, (err, decodedData) => {
		if (err) {
			const error = new ApiError(constants.ERROR_MESSAGES.REFRESH_TOKEN_INVALID, STATUS_CODE.UNAUTHORIZED);
			return next(error);
		}

		User.findOne({ _id: decodedData.userId })
			.select('+refreshToken')
			.then((user) => {
				if (!user) {
					const error = new ApiError(constants.ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
					return next(error);
				}

				if (user.refreshToken !== refreshToken) {
					const error = new ApiError(constants.ERROR_MESSAGES.REFRESH_TOKEN_NOT_VALID, STATUS_CODE.UNAUTHORIZED);
					return next(error);
				}

				const newAccessToken = jwt.sign(
					{
						email: user.email,
						userId: user._id.toString(),
					},
					config.auth.jwtSecretKey,
					{ expiresIn: config.auth.jwtExpire }
				);

				const newRefreshToken = jwt.sign(
					{ userId: user._id.toString() },
					config.auth.refreshSecretKey,
					{ expiresIn: config.auth.refreshTokenExpire }
				);

				user.refreshToken = newRefreshToken;
				return user.save().then(() => {
					res.status(STATUS_CODE.OK).json({
						accessToken: newAccessToken,
						refreshToken: newRefreshToken,
					});
				});
			})
			.catch((err) => {
				next(err);
			});
	});
};

// Always responds the same way whether or not the email is registered --
// returning 404 for an unknown email vs 200 for a known one lets anyone
// enumerate which emails have an account (see issue #359). The reset
// token/email are only generated when a user is actually found; for an
// unknown email this is a no-op that still reports success.
exports.requestPasswordReset = async (req, res, next) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email: email });

		if (user) {
			const resetToken = crypto
				.randomBytes(constants.VALIDATION.PASSWORD_RESET_TOKEN_BYTES)
				.toString('hex');
			user.passwordResetToken = resetToken;

			const expiryDate = moment
				.utc()
				.add(config.auth.passwordResetExpireMinutes, 'minutes')
				.toDate();
			user.passwordResetExpires = expiryDate;
			await user.save();

			if (transporter) {
				const resetURL = `${config.frontend.url}/reset-password/${resetToken}`;

				await transporter.sendMail({
					from: config.email.from,
					to: email,
					subject: constants.EMAIL_SUBJECTS.PASSWORD_RESET_REQUEST,
					text: constants.EMAIL_TEMPLATES.PASSWORD_RESET_REQUEST.TEXT(resetURL),
					html: constants.EMAIL_TEMPLATES.PASSWORD_RESET_REQUEST.HTML(resetURL),
				});
			}
		}

		res.status(STATUS_CODE.OK).json({
			message: constants.ERROR_MESSAGES.PASSWORD_RESET_LINK_SENT,
		});
	} catch (err) {
		next(err);
	}
};

exports.resetPassword = (req, res, next) => {
	const resetToken = req.params.token;
	const newPassword = req.body.password;
	let user;

	User.findOne({
		passwordResetToken: resetToken,
		passwordResetExpires: { $gt: moment.utc().toDate() }, // Consistent UTC validation
	})
		.then((foundUser) => {
			if (!foundUser) {
				const error = new ApiError(constants.ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED, STATUS_CODE.BAD_REQUEST);
				throw error;
			}
			user = foundUser;
			return bcrypt.hash(newPassword, config.constants.bcryptRounds);
		})
		.then((hashedPw) => {
			user.password = hashedPw;
			user.passwordResetToken = undefined;
			user.passwordResetExpires = undefined;
			return user.save();
		})
		.then(() => {
			sendPasswordResetSuccessEmail(user.email);

			res.status(STATUS_CODE.OK).json({
				message: constants.ERROR_MESSAGES.PASSWORD_RESET_SUCCESSFUL,
			});
		})
		.catch((err) => {
			next(err);
		});
};

function sendPasswordResetSuccessEmail(email) {
	if (!transporter) {
		return;
	}

	const loginURL = `${config.frontend.url}/login`;

	const mailOptions = {
		from: config.email.from,
		to: email,
		subject: constants.EMAIL_SUBJECTS.PASSWORD_RESET_SUCCESS,
		text: constants.EMAIL_TEMPLATES.PASSWORD_RESET_SUCCESS.TEXT,
		html: constants.EMAIL_TEMPLATES.PASSWORD_RESET_SUCCESS.HTML(loginURL),
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			logger.error({ err: error }, 'Failed to send password reset confirmation');
		} else {
			logger.info({ response: info.response }, 'Password reset confirmation sent');
		}
	});
}

exports.checkResetTokenValidity = (req, res, next) => {
	const resetToken = req.params.token;

	User.findOne({
		passwordResetToken: resetToken,
		passwordResetExpires: { $gt: moment.utc().toDate() }, // Consistent UTC validation
	})
		.then((user) => {
			if (!user) {
				const error = new ApiError(constants.ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED, STATUS_CODE.BAD_REQUEST);
				throw error;
			}
			res.status(STATUS_CODE.OK).json({
				message: 'Token is valid.',
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.updatePassword = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { currentPassword, newPassword } = req.body;

		const user = await User.findById(userId).select('+password');
		if (!user) {
			const error = new ApiError(constants.ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODE.NOT_FOUND);
			throw error;
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			const error = new ApiError(constants.ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT, STATUS_CODE.UNAUTHORIZED);
			throw error;
		}

		user.password = await bcrypt.hash(
			newPassword,
			config.constants.bcryptRounds
		);
		await user.save();

		res.status(STATUS_CODE.OK).json({
			message: constants.ERROR_MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY,
		});
	} catch (err) {
		next(err);
	}
};

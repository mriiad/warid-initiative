const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const moment = require('moment-timezone');

const User = require('../models/user');
const { validationResult } = require('express-validator');
const config = require('../utils/config');
const constants = require('../utils/constants');
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
		const error = new Error(constants.ERROR_MESSAGES.VALIDATION_FAILED);
		error.statusCode = constants.HTTP_STATUS.BAD_REQUEST;
		throw error;
	}

	const token = jwt.sign({ email: req.body.email }, config.auth.secretKey);
	const activationLink = `${config.frontend.url}/api/auth/activation/${token}`;

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
			res.status(constants.HTTP_STATUS.CREATED).json({
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
			if (!err.statusCode) {
				err.statusCode = constants.HTTP_STATUS.INTERNAL_SERVER;
			}
			next(err);
		});
};

exports.login = (req, res, next) => {
	const body = req.body;
	const username = body.username;
	const password = body.password;
	let loadedUser;

	User.findOne({ username: username })
		.then((user) => {
			if (!user) {
				const error = new Error(constants.ERROR_MESSAGES.USER_NOT_FOUND);
				error.statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
				throw error;
			}
			loadedUser = user;
			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new Error(constants.ERROR_MESSAGES.WRONG_PASSWORD);
				error.statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
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
					.status(constants.HTTP_STATUS.OK)
					.json({
						token: token,
						refreshToken: refreshToken,
						userId: loadedUser._id.toString(),
						isAdmin: loadedUser.isAdmin,
					});
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = constants.HTTP_STATUS.INTERNAL_SERVER;
			}
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
				return res.status(constants.HTTP_STATUS.NOT_FOUND).send({
					message: constants.ERROR_MESSAGES.USER_NOT_FOUND,
				});
			}
			user.isActive = true;
			user.save();
			return res.status(constants.HTTP_STATUS.OK).send({
				message: constants.ERROR_MESSAGES.ACCOUNT_ACTIVATED,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = constants.HTTP_STATUS.INTERNAL_SERVER;
			}
			next(err);
		});
};

exports.logout = (req, res, next) => {
	try {
		res.clearCookie('token');
		res.status(constants.HTTP_STATUS.OK).json({
			message: constants.ERROR_MESSAGES.LOGGED_OUT_SUCCESSFULLY,
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = constants.HTTP_STATUS.INTERNAL_SERVER;
		}
		next(error);
	}
};

exports.refreshToken = (req, res, next) => {
	const refreshToken = req.body.refreshToken;

	if (!refreshToken) {
		const error = new Error(constants.ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
		error.statusCode = constants.HTTP_STATUS.BAD_REQUEST;
		return next(error);
	}

	jwt.verify(refreshToken, config.auth.refreshSecretKey, (err, decodedData) => {
		if (err) {
			const error = new Error(constants.ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
			error.statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
			return next(error);
		}

		User.findOne({ _id: decodedData.userId })
			.select('+refreshToken')
			.then((user) => {
				if (!user) {
					const error = new Error(constants.ERROR_MESSAGES.USER_NOT_FOUND);
					error.statusCode = constants.HTTP_STATUS.NOT_FOUND;
					return next(error);
				}

				if (user.refreshToken !== refreshToken) {
					const error = new Error(
						constants.ERROR_MESSAGES.REFRESH_TOKEN_NOT_VALID
					);
					error.statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
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
					res.status(constants.HTTP_STATUS.OK).json({
						accessToken: newAccessToken,
						refreshToken: newRefreshToken,
					});
				});
			})
			.catch((err) => {
				if (!err.statusCode) {
					err.statusCode = constants.HTTP_STATUS.INTERNAL_SERVER;
				}
				next(err);
			});
	});
};

exports.requestPasswordReset = (req, res, next) => {
	const email = req.body.email;

	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				const error = new Error(constants.ERROR_MESSAGES.NO_USER_FOUND);
				error.statusCode = constants.HTTP_STATUS.NOT_FOUND;
				throw error;
			}

			const resetToken = crypto
				.randomBytes(constants.VALIDATION.PASSWORD_RESET_TOKEN_BYTES)
				.toString('hex');
			user.passwordResetToken = resetToken;

			const expiryDate = moment
				.utc()
				.add(config.auth.passwordResetExpireMinutes, 'minutes')
				.toDate();

			user.passwordResetExpires = expiryDate;
			return user.save();
		})
		.then((user) => {
			if (transporter) {
				const resetURL = `${config.frontend.url}/reset-password/${user.passwordResetToken}`;

				return transporter.sendMail({
					from: config.email.from,
					to: email,
					subject: constants.EMAIL_SUBJECTS.PASSWORD_RESET_REQUEST,
					text: constants.EMAIL_TEMPLATES.PASSWORD_RESET_REQUEST.TEXT(resetURL),
					html: constants.EMAIL_TEMPLATES.PASSWORD_RESET_REQUEST.HTML(resetURL),
				});
			} else {
				return Promise.resolve();
			}
		})
		.then(() => {
			res.status(constants.HTTP_STATUS.OK).json({
				message: constants.ERROR_MESSAGES.PASSWORD_RESET_LINK_SENT,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = constants.HTTP_STATUS.INTERNAL_SERVER;
			}
			next(err);
		});
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
				const error = new Error(
					constants.ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED
				);
				error.statusCode = constants.HTTP_STATUS.BAD_REQUEST;
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

			res.status(constants.HTTP_STATUS.OK).json({
				message: constants.ERROR_MESSAGES.PASSWORD_RESET_SUCCESSFUL,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = constants.HTTP_STATUS.INTERNAL_SERVER;
			}
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
				const error = new Error(
					constants.ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED
				);
				error.statusCode = constants.HTTP_STATUS.BAD_REQUEST;
				throw error;
			}
			res.status(constants.HTTP_STATUS.OK).json({
				message: 'Token is valid.',
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = constants.HTTP_STATUS.INTERNAL_SERVER;
			}
			next(err);
		});
};

exports.updatePassword = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { currentPassword, newPassword } = req.body;

		const user = await User.findById(userId).select('+password');
		if (!user) {
			const error = new Error(constants.ERROR_MESSAGES.USER_NOT_FOUND);
			error.statusCode = constants.HTTP_STATUS.NOT_FOUND;
			throw error;
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			const error = new Error(
				constants.ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT
			);
			error.statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
			throw error;
		}

		user.password = await bcrypt.hash(
			newPassword,
			config.constants.bcryptRounds
		);
		await user.save();

		res.status(constants.HTTP_STATUS.OK).json({
			message: constants.ERROR_MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY,
		});
	} catch (err) {
		if (!err.statusCode) err.statusCode = constants.HTTP_STATUS.INTERNAL_SERVER;
		next(err);
	}
};

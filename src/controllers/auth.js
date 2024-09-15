const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const config = require('../../config.json');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const crypto = require('crypto');
const moment = require('moment-timezone');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: { headless: true },
});

client.initialize();

client.on('qr', (qr) => {
	// Generate and display the QR code in terminal
	qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
	console.log('Client is ready!');
});

exports.signup = (req, res, next) => {
	const body = req.body;
	const { username, email, password, gender, phoneNumber } = body;
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const error = new Error('Validation failed.');
		error.statusCode = STATUS_CODE.BAD_REQUEST;
		error.data = errors.array();
		return next(error);
	}

	const token = jwt.sign({ email: req.body.email }, config.secret);
	bcrypt
		.hash(password, 12)
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
		.then((user) => {
			res.status(201).json({
				message: 'User created!',
				userId: user._id,
			});

			const internationalPhoneNumber = `212${phoneNumber.substring(1)}@c.us`;
			console.log('internationalPhoneNumber', internationalPhoneNumber);
			return client.sendMessage(
				internationalPhoneNumber,
				`Hello ${username}, your account was created successfully!`
			);
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			}
			next(err);
		});
};

client.on('qr', (qr) => {
	console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
	console.log('Client is ready!');
});

exports.login = (req, res, next) => {
	const body = req.body;
	const username = body.username;
	const password = body.password;
	let loadedUser;
	User.findOne({ username: username })
		.then((user) => {
			if (!user) {
				const error = new Error(
					'A user with this username could not be found.'
				);
				error.statusCode = STATUS_CODE.UNAUTHORIZED;
				throw error;
			}
			loadedUser = user;
			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new Error('Wrong password.');
				error.statusCode = STATUS_CODE.UNAUTHORIZED;
				throw error;
			}
			const token = jwt.sign(
				{
					email: loadedUser.email,
					userId: loadedUser._id.toString(),
				},
				config.authConfig.SECRET_KEY,
				{ expiresIn: config.authConfig.JWT_EXPIRE }
			);
			const refreshToken = jwt.sign(
				{ userId: loadedUser._id.toString() },
				config.authConfig.REFRESH_SECRET_KEY,
				{ expiresIn: config.authConfig.REFRESH_TOKEN_EXPIRE }
			);

			// Store refresh token in the database
			loadedUser.refreshToken = refreshToken;
			return loadedUser.save().then(() => {
				return res.cookie('token', token).status(200).json({
					token: token,
					refreshToken: refreshToken,
					userId: loadedUser._id.toString(),
					isAdmin: loadedUser.isAdmin,
				});
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
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
				return res.status(404).send({ message: 'User Not found.' });
			}
			user.isActive = true;
			user.save();
			return res.status(200).send({ message: 'Account activated.' });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			console.log('error', err);
			next(err);
		});
};

exports.logout = (req, res, next) => {
	try {
		res.clearCookie('token');
		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = STATUS_CODE.INTERNAL_SERVER;
		}
		next(error);
	}
};

exports.refreshToken = (req, res, next) => {
	const refreshToken = req.body.refreshToken;

	if (!refreshToken) {
		const error = new Error('Refresh token is required.');
		error.statusCode = STATUS_CODE.BAD_REQUEST;
		return next(error);
	}

	// Validate refresh token
	jwt.verify(
		refreshToken,
		config.authConfig.REFRESH_SECRET_KEY,
		(err, decodedData) => {
			if (err) {
				const error = new Error('Invalid refresh token.');
				error.statusCode = STATUS_CODE.UNAUTHORIZED;
				return next(error);
			}

			// Find user with decoded userId
			User.findOne({ _id: decodedData.userId })
				.select('+refreshToken')
				.then((user) => {
					if (!user) {
						const error = new Error('User not found.');
						error.statusCode = STATUS_CODE.NOT_FOUND;
						return next(error);
					}

					// Check if the refresh token exists for the user and is valid
					if (user.refreshToken !== refreshToken) {
						const error = new Error('Refresh token is not valid.');
						error.statusCode = STATUS_CODE.UNAUTHORIZED;
						return next(error);
					}

					// Generate a new access token
					const newAccessToken = jwt.sign(
						{
							email: user.email,
							userId: user._id.toString(),
						},
						config.authConfig.SECRET_KEY,
						{ expiresIn: config.authConfig.JWT_EXPIRE }
					);

					// Generate a new refresh token
					const newRefreshToken = jwt.sign(
						{ userId: user._id.toString() },
						config.authConfig.REFRESH_SECRET_KEY,
						{ expiresIn: config.authConfig.REFRESH_TOKEN_EXPIRE }
					);

					// Update refresh token in the database
					user.refreshToken = newRefreshToken;
					return user.save().then(() => {
						// Send the new access and refresh tokens to the client
						res.status(200).json({
							accessToken: newAccessToken,
							refreshToken: newRefreshToken,
						});
					});
				})
				.catch((err) => {
					if (!err.statusCode) {
						err.statusCode = STATUS_CODE.INTERNAL_SERVER;
					}
					next(err);
				});
		}
	);
};

exports.requestPasswordReset = (req, res, next) => {
	const email = req.body.email;
	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				const error = new Error('No user found with that email address.');
				error.statusCode = STATUS_CODE.NOT_FOUND;
				throw error;
			}

			// Generate a reset token and set its expiration
			const resetToken = crypto.randomBytes(32).toString('hex');
			user.passwordResetToken = resetToken;
			// in order to avoid timezone's problems
			const expiryDate = moment
				.utc()
				.add(10, 'minutes')
				.add(2, 'hours')
				.valueOf();
			user.passwordResetExpires = expiryDate;
			return user.save();
		})
		.then((user) => {
			// Send reset email
			const resetURL = `http://localhost:${config.port}/reset-password/${user.passwordResetToken}`;
			const message = `Forgot your password? Click the link below to reset it: ${resetURL}`;

			return transporter.sendMail({
				from: 'do-not-reply@warid.ma',
				to: email,
				subject: 'Password Reset Request',
				text: message,
				html: `<p>${message}</p>`,
			});
		})
		.then(() => {
			res.status(200).json({
				message: 'Password reset link sent to email!',
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
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
		passwordResetExpires: { $gt: moment().utc().add(2, 'hours').toDate() }, // Adjust for UTC+2 using moment
	})
		.then((foundUser) => {
			if (!foundUser) {
				const error = new Error('Token is invalid or has expired.');
				error.statusCode = STATUS_CODE.BAD_REQUEST;
				throw error;
			}
			user = foundUser;
			return bcrypt.hash(newPassword, 12);
		})
		.then((hashedPw) => {
			user.password = hashedPw;
			user.passwordResetToken = undefined;
			user.passwordResetExpires = undefined;
			return user.save();
		})
		.then(() => {
			// Send the success email to the user
			sendPasswordResetSuccessEmail(user.email);

			res.status(200).json({
				message: 'Password reset successful!',
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			}
			next(err);
		});
};

function sendPasswordResetSuccessEmail(email) {
	const mailOptions = {
		from: 'do-not-reply@warid.ma',
		to: email,
		subject: 'Password Reset Successful',
		text: 'Your password has been reset successfully. You can now log in with your new password.',
		html: `
            <p>Your password has been reset successfully.</p>
            <p>You can now <a href="http://localhost:3001/login">log in</a> with your new password.</p>
        `,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error('Error sending email:', error);
		} else {
			console.log('Password reset success email sent: ' + info.response);
		}
	});
}

exports.checkResetTokenValidity = (req, res, next) => {
	const resetToken = req.params.token;

	console.log('resetToken', resetToken);

	User.findOne({
		passwordResetToken: resetToken,
		passwordResetExpires: { $gt: moment().utc().toDate() },
	})
		.then((user) => {
			if (!user) {
				const error = new Error('Token is invalid or has expired.');
				error.statusCode = STATUS_CODE.BAD_REQUEST;
				throw error;
			}
			res.status(200).json({ message: 'Token is valid.' });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			}
			next(err);
		});
};

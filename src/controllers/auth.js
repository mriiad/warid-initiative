const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const config = require('../../config.json');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

const { email, password, host, secureConnection, port, ciphers, requireTLS } =
	config.mailerConfig;

const transporter = nodemailer.createTransport({
	host: host,
	secureConnection: secureConnection,
	port: port,
	tls: {
		ciphers: ciphers,
	},
	requireTLS: requireTLS,
	auth: {
		user: email,
		pass: password,
	},
});

exports.signup = (req, res, next) => {
	const body = req.body;
	const { username, email, password, phoneNumber } = body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed.');
		error.statusCode = STATUS_CODE.BAD_REQUEST;
		throw error;
	}
	const token = jwt.sign({ email: req.body.email }, config.secret);
	var activationLink = `http://localhost:${config.port}/api/auth/activation/${token}`;
	bcrypt
		.hash(password, 12)
		.then((hashedPw) => {
			const user = new User({
				username,
				email,
				password: hashedPw,
				phoneNumber,
				isAdmin: false,
				isActive: false,
				confirmationCode: token,
			});
			return user.save();
		})
		.then((result) => {
			res.status(201).json({
				message: 'User created!',
				userId: result._id,
			});
			return transporter.sendMail({
				from: 'do-not-reply@warid.ma',
				to: email,
				subject: 'Activation du compte',
				text: `Bonjour M. ${username}, veuillez activez votre compte s'il vous plait. Merci`,
				html: `<h1>Email Confirmation</h1>
					<h2>Hello ${username}</h2>
					<p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
					<a href=${activationLink}> Click here</a>
					</div>`,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
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

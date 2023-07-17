const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Donation = require('../models/donation');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const config = require('../../config.json');
const STATUS_CODE = require('../utils/errors/httpStatusCode');

const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key: config.senderKey,
		},
	})
);

exports.signup = (req, res, next) => {
	const body = req.body;
	const {
		username,
		firstName,
		lastName,
		birthDate,
		email,
		password,
		gender,
		phoneNumber,
	} = body;
	const { bloodGroup, lastDonationDate, donationType, disease } = body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed.');
		error.statusCode = STATUS_CODE.UNPROCESSABLE_ENTITY;
		throw error;
	}
	const token = jwt.sign({ email: req.body.email }, config.secret);
	var activationLink = `http://localhost:${config.port}/api/auth/activation/${token}`;
	bcrypt
		.hash(password, 12)
		.then((hashedPw) => {
			const user = new User({
				username,
				firstName,
				lastName,
				birthDate,
				email,
				password: hashedPw,
				gender,
				phoneNumber,
				isAdmin: false,
				isActive: false,
				confirmationCode: token,
			});
			return user.save();
		})
		.then((result) => {
			const donation = new Donation({
				bloodGroup,
				lastDonationDate,
				donationType,
				disease,
				userId: new mongoose.Types.ObjectId(result._id),
			});
			donation.save();
			res.status(201).json({
				message: 'User created!',
				userId: result._id,
			});
			return transporter.sendMail({
				from: config.email,
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
				err.statusCode = 500;
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
				const error = new BaseError('Wrong password!');
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

			return res.cookie('token', token).status(200).json({
				token: token,
				userId: loadedUser._id.toString(),
				isAdmin: loadedUser.isAdmin,
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

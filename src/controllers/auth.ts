import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { IUser, User } from '../models/user';
import {
	LoginPayload,
	SignupPayload,
	VerifyAccountParams,
} from '../payloads/authPayload';
import { BaseError } from '../utils/errors/baseError';
import { STATUS_CODE } from '../utils/errors/httpStatusCodes';
const { validationResult } = require('express-validator');
const config = require('../../config.json');

const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key: config.senderKey,
		},
	})
);

export const signup = (req: Request, res: Response, next: NextFunction) => {
	const body = req.body as SignupPayload;
	const { username, email, password, phoneNumber } = body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new BaseError(
			STATUS_CODE.UNPROCESSABLE_ENTITY,
			'Validation failed.'
		);
		throw error;
	}
	const token = jwt.sign({ email: req.body.email }, config.secret);
	var activationLink = `http://localhost:${config.port}/api/auth/activation/${token}`;
	bcrypt
		.hash(password, 12)
		.then((hashedPw) => {
			const user = new User({
				username: username,
				email: email,
				password: hashedPw,
				phoneNumber: phoneNumber,
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

export const login = (req: Request, res: Response, next: NextFunction) => {
	const body = req.body as LoginPayload;
	const username = body.username;
	const password = body.password;
	let loadedUser: IUser;
	User.findOne({ username: username })
		.then((user) => {
			if (!user) {
				const error = new BaseError(
					STATUS_CODE.UNAUTHORIZED,
					'A user with this username could not be found.'
				);
				throw error;
			}
			// user found
			loadedUser = user;
			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new BaseError(
					STATUS_CODE.UNAUTHORIZED,
					'Wrong password!'
				);
				throw error;
			}
			const token = jwt.sign(
				{
					email: loadedUser.email,
					userId: loadedUser._id.toString(),
				},
				'somesupersecretsecret',
				{ expiresIn: '1h' }
			);
			res.status(200).json({
				token: token,
				userId: loadedUser._id.toString(),
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
	const params = req.params as unknown as VerifyAccountParams;
	User.findOne({
		confirmationCode: params.confirmationCode,
	})
		.then((user) => {
			if (!user) {
				return res.status(404).send({ message: 'User Not found.' });
			}
			// activate the user account
			user.isActive = true;
			user.save();
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			console.log('error', err);
			next(err);
		});
};

import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { IUser, User } from '../models/user';
import { AuthParams, AuthPayload } from '../payloads/authPayload';
import { BaseError } from '../utils/errors/baseError';
import { STATUS_CODE } from '../utils/errors/httpStatusCodes';
const { validationResult } = require('express-validator');
const config = require('../../config.json');

const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key:
				'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',
		},
	})
);

type RequestBody = AuthPayload;
type RequestParams = AuthParams;

export const signup = (req: Request, res: Response, next: NextFunction) => {
	const body = req.body as RequestBody;
	const { username, email, password, phoneNumber } = body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new BaseError(
			STATUS_CODE.UNPROCESSABLE_ENTITY,
			'Validation failed.'
		);
		throw error;
	}

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
				text: "Bonjour, veuillez activez votre compte s'il vous plait. Merci",
				html: '<h1>Compte créé avec succès!</h1>',
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
	const body = req.body as RequestParams;
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

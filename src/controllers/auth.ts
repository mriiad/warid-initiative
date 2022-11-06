import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user';
import { AuthParams, AuthPayload } from '../payloads/authPayload';
import { STATUS_CODE } from '../utils/errors/httpStatusCodes';
const { validationResult } = require('express-validator');

const BaseError = require('../utils/errors/baseError');

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
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

export const login = (req: Request, res: Response, next: NextFunction) => {
	// const body = req.body as RequestParams;
	// const email = req.body.email;
	// const password = req.body.password;
	// let loadedUser;
	// User.findOne({ email: email })
	// 	.then((user) => {
	// 		if (!user) {
	// 			const error = new Error(
	// 				'A user with this email could not be found.'
	// 			);
	// 			error.statusCode = 401;
	// 			throw error;
	// 		}
	// 		loadedUser = user;
	// 		return bcrypt.compare(password, user.password);
	// 	})
	// 	.then((isEqual) => {
	// 		if (!isEqual) {
	// 			const error = new Error('Wrong password!');
	// 			error.statusCode = 401;
	// 			throw error;
	// 		}
	// 		const token = jwt.sign(
	// 			{
	// 				email: loadedUser.email,
	// 				userId: loadedUser._id.toString(),
	// 			},
	// 			'somesupersecretsecret',
	// 			{ expiresIn: '1h' }
	// 		);
	// 		res.status(200).json({
	// 			token: token,
	// 			userId: loadedUser._id.toString(),
	// 		});
	// 	})
	// 	.catch((err) => {
	// 		if (!err.statusCode) {
	// 			err.statusCode = 500;
	// 		}
	// 		next(err);
	// 	});
};

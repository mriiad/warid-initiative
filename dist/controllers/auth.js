"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../models/user");
const httpStatusCodes_1 = require("../utils/errors/httpStatusCodes");
const { validationResult } = require('express-validator');
const BaseError = require('../utils/errors/baseError');
const signup = (req, res, next) => {
    const body = req.body;
    const { username, email, password, phoneNumber } = body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new BaseError(httpStatusCodes_1.STATUS_CODE.UNPROCESSABLE_ENTITY, 'Validation failed.');
        throw error;
    }
    bcrypt_1.default
        .hash(password, 12)
        .then((hashedPw) => {
        const user = new user_1.User({
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
exports.signup = signup;
const login = (req, res, next) => {
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
exports.login = login;

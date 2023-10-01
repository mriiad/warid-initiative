const express = require('express');
const { body } = require('express-validator');
const { login, logout, signup, verifyUser } = require('../controllers/auth');
const User = require('../models/user');

/**
 * Could contain news & other data from different resources (Event)
 */
const authRouter = express.Router();

authRouter.put(
	'/api/auth/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject('E-Mail address already exists!');
					}
				});
			})
			.normalizeEmail(),
		body('password').trim().isLength({ min: 5 }),
		body('phoneNumber').trim().isLength({ min: 10 }),
		body('username')
			.trim()
			.not()
			.isEmpty()
			.custom((value, { req }) => {
				return User.findOne({ username: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject('The CIN already exists!');
					}
				});
			}),
	],
	signup
);

authRouter.post('/api/auth/login', login);

authRouter.post('/api/auth/logout', logout);

authRouter.get('/api/auth/activation/:confirmationCode', verifyUser);

module.exports = authRouter;

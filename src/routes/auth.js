const express = require('express');
const { body } = require('express-validator');
const {
	login,
	logout,
	signup,
	verifyUser,
	refreshToken,
	requestPasswordReset,
	resetPassword,
	checkResetTokenValidity,
	updatePassword,

} = require('../controllers/auth');
const User = require('../models/user');
const { isAuth } = require('../middleware/token-check');

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
		body('phoneNumber')
			.trim()
			.matches(/^\+[1-9]\d{6,14}$/)
			.withMessage('Please enter a valid phone number, including country code.'),
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

authRouter.post('/api/auth/refresh-token', refreshToken);

authRouter.post('/api/auth/request-reset', requestPasswordReset);

authRouter.post('/api/auth/reset-password/:token', resetPassword);

authRouter.get('/api/auth/check-reset-token/:token', checkResetTokenValidity);

authRouter.patch('/api/auth/update-password', isAuth, updatePassword);



module.exports = authRouter;

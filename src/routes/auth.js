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
	resendActivation,

} = require('../controllers/auth');
const User = require('../models/user');
const { isAuth } = require('../middleware/token-check');
const {
	authLimiter,
	mailLimiter,
} = require('../middleware/rate-limit');

/**
 * Could contain news & other data from different resources (Event)
 */
const authRouter = express.Router();

// Creates a new User -- POST, not PUT: the client isn't naming the resource's
// final URI (which PUT's semantics require), the server is.
authRouter.post(
	'/api/auth/signup',
	authLimiter,
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

authRouter.post('/api/auth/login', authLimiter, login);

authRouter.post('/api/auth/logout', logout);

authRouter.get('/api/auth/activation/:confirmationCode', verifyUser);

// Sends mail on every accepted request.
authRouter.post('/api/auth/resend-activation', mailLimiter, resendActivation);

authRouter.post('/api/auth/refresh-token', authLimiter, refreshToken);

// Sends mail on every accepted request.
authRouter.post('/api/auth/request-reset', mailLimiter, requestPasswordReset);

authRouter.post('/api/auth/reset-password/:token', authLimiter, resetPassword);

authRouter.get('/api/auth/check-reset-token/:token', checkResetTokenValidity);

authRouter.patch('/api/auth/update-password', isAuth, updatePassword);



module.exports = authRouter;

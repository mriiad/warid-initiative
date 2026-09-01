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
const { VALIDATION } = require('../utils/constants');
const {
	authLimiter,
	mailLimiter,
} = require('../middleware/rate-limit');

/**
 * Could contain news & other data from different resources (Event)
 */
const authRouter = express.Router();

// The one place the password policy lives. It used to be enforced only in
// the signup chain below (a hardcoded `min: 5`), while resetPassword and
// updatePassword hashed whatever arrived -- so a user could reduce their
// password to a single character, or to '', through either of those flows.
// bcrypt hashes '' happily and the hash compares true against '', so such
// an account then logs in with no password at all. See issue #395.
//
// Trims like the signup chain always has, so a password set through reset
// or change is stored the same way one set at signup would be.
const PASSWORD_TOO_SHORT = `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`;

const passwordRule = (field) =>
	body(field)
		.isString()
		.withMessage(PASSWORD_TOO_SHORT)
		.trim()
		.isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH })
		.withMessage(PASSWORD_TOO_SHORT);

// Creates a new User -- POST, not PUT: the client isn't naming the resource's
// final URI (which PUT's semantics require), the server is.
authRouter.post(
	'/api/auth/signup',
	authLimiter,
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			// normalizeEmail runs before the uniqueness check, not after it.
			// The other way round, the check queried the raw input while a
			// different, normalized value was what got persisted -- so
			// 'Foo.Bar@Example.COM' sailed past the friendly "already exists"
			// message when 'foo.bar@example.com' was taken, and was stopped
			// only by the unique index as a generic conflict. See issue #396.
			.normalizeEmail()
			.custom((value) => {
				return User.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject('E-Mail address already exists!');
					}
				});
			}),
		passwordRule('password'),
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

authRouter.post(
	'/api/auth/reset-password/:token',
	authLimiter,
	passwordRule('password'),
	resetPassword
);

authRouter.get('/api/auth/check-reset-token/:token', checkResetTokenValidity);

authRouter.patch(
	'/api/auth/update-password',
	isAuth,
	passwordRule('newPassword'),
	updatePassword
);



module.exports = authRouter;

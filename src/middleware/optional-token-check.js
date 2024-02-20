const jwt = require('jsonwebtoken');
const config = require('../../config.json');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

/**
 * optionalAuth - Middleware to authenticate a user if a token is provided.
 * If no token is found, the request is still processed
 * (i.e., authentication is optional, request allowed for both authenticated and non-authenticated).
 * Adds userId to req if the user is authenticated.
 */
exports.optionalAuth = (req, res, next) => {
	const authHeader = req.headers['authorization'];

	if (!authHeader) {
		// Proceed without authentication if no token is found
		return next();
	}

	const token = authHeader.split(' ')[1];
	let decodedToken;

	try {
		decodedToken = jwt.verify(token, config.authConfig.SECRET_KEY);
	} catch (err) {
		const error = new Error(
			'Unauthorized user, please verify your credentials'
		);
		error.statusCode = STATUS_CODE.UNAUTHORIZED;
		throw error;
	}

	if (!decodedToken) {
		const error = new Error('Not authenticated.');
		error.statusCode = STATUS_CODE.UNAUTHORIZED;
		throw error;
	}

	// Add userId to the request object if authentication is successful
	req.userId = decodedToken.userId;
	next();
};

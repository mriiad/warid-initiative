const config = require('../../config.json');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const authHeader = req.headers['authorization']; // `Bearer ${token}` sent by the client side
	if (!authHeader) {
		const error = new Error('Not authenticated.');
		error.statusCode = STATUS_CODE.UNAUTHORIZED;
		throw error;
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
	req.userId = decodedToken.userId;
	next();
};

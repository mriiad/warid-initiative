const config = require('../../config.json');

const jwt = require('jsonwebtoken');

export const isAuth = async (req, res, next) => {
	const authHeader = req.headers.get('Authorization'); // `Bearer ${token}` sent by the client side
	if (!authHeader) {
		const error = new BaseError(401, 'Not authenticated.');
		throw error;
	}
	const token = authHeader.split(' ')[1];
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, config.authConfig.SECRET_KEY);
	} catch (err) {
		err.statusCode = 500;
		throw err;
	}
	if (!decodedToken) {
		const error = new BaseError(401, 'Not authenticated.');
		throw error;
	}
	req.userId = decodedToken.userId;
	next();
};

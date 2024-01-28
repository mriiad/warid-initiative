const config = require('../../config.json');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

const jwt = require('jsonwebtoken');

exports.isAuth = (req, res, next) => {
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

exports.refreshToken = (req, res, next) => {
	/*
	const { refreshToken, username } = req.body;

	if (!refreshToken) {
		const error = new Error('Refresh token not provided');
		error.statusCode = STATUS_CODE.BAD_REQUEST;
		return next(error);
	}

	// Validate the refresh token
	if (!isValidRefreshToken(refreshToken)) {
		const error = new Error('Invalid refresh token');
		error.statusCode = STATUS_CODE.UNAUTHORIZED;
		return next(error);
	}

	let loadedUser;
	User.findOne({ username: username }).then((user) => {
		if (!user) {
			const error = new Error('A user with this username could not be found.');
			error.statusCode = STATUS_CODE.UNAUTHORIZED;
			throw error;
		}
		loadedUser = user;
	});

	// Issue a new JWT token.
	const newToken = jwt.sign(
		{
			email: loadedUser.email,
			userId: loadedUser._id.toString(),
		},
		config.authConfig.SECRET_KEY,
		{ expiresIn: config.authConfig.JWT_EXPIRE }
	);

	res.status(200).json({ token: newToken });
	*/
};

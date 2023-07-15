import { NextFunction } from 'express';
import { BaseError } from '../utils/errors/baseError';
const config = require('../../config.json');

const jwt = require('jsonwebtoken');

export interface UserRequest extends Request {
	userId: String;
}

export const isAuth = async (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.get('Authorization'); // `Bearer ${token}` sent by the client side
	if (!authHeader) {
		const error = new BaseError(401, 'Not authenticated.');
		throw error;
	}
	const token = authHeader.split(' ')[1];
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, config.authConfig.SECRET_KEY);
	} catch (err: any) {
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

import { NextFunction } from 'express';
import { User } from '../models/user';
const config = require('../../config.json');

const jwt = require('jsonwebtoken');

export const isAuth = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { token } = req.cookies;
		if (!token) {
			return next('Please login to access the data');
		}
		const verify = await jwt.verify(token, config.authConfig.SECRET_KEY);
		req.user = await User.findById(verify.id);
		next();
	} catch (error) {
		return next(error);
	}
};

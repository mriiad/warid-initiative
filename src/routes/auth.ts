import { Router } from 'express';
import { body } from 'express-validator';
import { login, signup } from '../controllers/auth';
import { User } from '../models/user';
/**
 * Could contain news & other data from different resources (Event)
 */
const authRouter = Router();

authRouter.put(
	'/signup',
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
	// TODO: call controller to save other data in Donor's collection
);

authRouter.post('/login', login);

export default authRouter;

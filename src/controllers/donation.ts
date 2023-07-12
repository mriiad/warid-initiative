import { NextFunction, Request, Response } from 'express';
import { Donation } from '../models/donation';
import { User } from '../models/user';
import { DonationPayload } from '../payloads/donationPayload';

export const donate = (req: Request, res: Response, next: NextFunction) => {
	const body = req.body as DonationPayload;
	const username = body.username;

	console.log('HERE 10');
	User.findOne({ username: username })
		.then((user) => {
			if (!user) {
				return res.status(404).send({ message: 'User Not found.' });
			}
			console.log('HERE 15');
			const userId = user._id;
			Donation.findOne({ userId: userId })
				.then((donation: any) => {
					if (!donation) {
						return res
							.status(404)
							.send({ message: 'No donation data saved for this user.' });
					}
					console.log('HERE 24');
					const dt = todayDate();
					console.log('date today: ', dt);
					donation.lastDonationDate = dt;
					console.log('HERE 26');
					return donation.save();
				})
				.then((result) => {
					console.log('result: ', result);
					res.status(201).json({
						message: 'Donation saved!',
						userId: result._id,
					});
				})
				.catch((err) => {
					if (!err.statusCode) {
						err.statusCode = 500;
					}
					next(err);
				});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			console.log('error', err);
			next(err);
		});
};

const todayDate = () => {
	const date = new Date();
	return new Date(`${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`);
};

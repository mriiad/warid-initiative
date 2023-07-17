const Donation = require('../models/donation');
const User = require('../models/user');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

/**
 *
 * This method must be called by the admin to confirm the donation of a user
 */
exports.donate = (req, res, next) => {
	// Check if the user isAdmin
	User.findOne({ _id: req.userId }).then((user) => {
		// This case shouldn't happen be we have to handle it
		if (!user) {
			return res
				.status(STATUS_CODE.NOT_FOUND)
				.send({ message: 'User Not found.' });
		}
		if (!user.isAdmin) {
			return res
				.status(STATUS_CODE.FORBIDDEN)
				.send({ message: 'User must be an Admin to call this API.' });
		}
	});
	const body = req.body;
	const username = body.username;
	User.findOne({ username: username })
		.then((user) => {
			if (!user) {
				return res
					.status(STATUS_CODE.NOT_FOUND)
					.send({ message: 'User Not found.' });
			}
			const userId = user._id;

			Donation.findOne({ userId: userId })
				.then((donation) => {
					if (!donation) {
						return res
							.status(STATUS_CODE.NOT_FOUND)
							.send({ message: 'No donation data saved for this user.' });
					}
					const dt = todayDate();
					console.log('date today: ', dt);
					donation.lastDonationDate = dt;
					return donation.save();
				})
				.then((result) => {
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

// TODO: Fix the sysdate
const todayDate = () => {
	const date = new Date();
	return new Date(`${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`);
};

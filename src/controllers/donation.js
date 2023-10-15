const Donation = require('../models/donation');
const User = require('../models/user');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

/**
 *
 * This method must be called by the admin to confirm the donation of a user
 */
exports.donate = (req, res, next) => {
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
					donation.lastDonationDate = new Date();
					return donation.save();
				})
				.then((result) => {
					res.status(STATUS_CODE.CREATED).json({
						message: 'Donation saved!',
						donationId: result._id,
						userId: result.userId,
					});
				})
				.catch((err) => {
					if (!err.statusCode) {
						err.statusCode = STATUS_CODE.INTERNAL_SERVER;
					}
					next(err);
				});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			}
			console.log('error', err);
			next(err);
		});
};

exports.canDonate = (req, res, next) => {
	const userId = req.userId;
	let user;

	User.findById(userId)
		.then((foundUser) => {
			if (!foundUser) {
				const error = new Error('User not found.');
				error.statusCode = 404;
				throw error;
			}
			user = foundUser;
			return Donation.findOne({ userId: userId });
		})
		.then((donation) => {
			const currentDate = new Date();
			let donationAvailability = false;

			// If no donation record is found for the user
			if (!donation) {
				return res
					.status(200)
					.json({ canDonate: true, lastDonationDate: null });
			}

			const timeDifference = currentDate - new Date(donation.lastDonationDate);
			const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

			if (user.gender === 'male' && daysDifference >= 60) {
				donationAvailability = true;
			}

			if (user.gender === 'female' && daysDifference >= 90) {
				donationAvailability = true;
			}

			res.status(200).json({
				canDonate: donationAvailability,
				lastDonationDate: donation.lastDonationDate,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

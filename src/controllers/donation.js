const Donation = require('../models/donation');
const User = require('../models/user');

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
				return res.status(404).send({ message: 'User Not found.' });
			}
			const userId = user._id;
			Donation.findOne({ userId: userId })
				.then((donation) => {
					if (!donation) {
						return res
							.status(404)
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

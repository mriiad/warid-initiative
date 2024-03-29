const Donation = require('../models/donation');
const User = require('../models/user');
const Profile = require('../models/profile');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const ApiError = require('../utils/errors/ApiError');
const mongoose = require('mongoose');
const { addDays, formatDate } = require('../utils/utils');

/**
 * Utility function to check donation eligibility
 */
const checkDonationEligibility = (userId) => {
	let user;
	return User.findById(userId)
		.then((foundUser) => {
			if (!foundUser) {
				throw new ApiError('User not found.', STATUS_CODE.NOT_FOUND);
			}
			user = foundUser;
			return Donation.find({ userId: userId })
				.sort({ lastDonationDate: -1 })
				.limit(1);
		})
		.then((donations) => {
			const currentDate = new Date();
			let donationAvailability = false;
			const donation = donations[0];

			if (!donation) {
				return {
					canDonate: true,
					lastDonationDate: null,
					nextDonationDate: null,
				};
			}

			const donationDate = donation.reelDonationDate
				? donation.reelDonationDate
				: donation.lastDonationDate;
			const daysToAdd = user.gender === 'male' ? 60 : 90;
			const nextDonationDate = addDays(donationDate, daysToAdd);

			const timeDifference = currentDate - new Date(donationDate);
			const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

			if (
				(user.gender === 'male' && daysDifference >= 60) ||
				(user.gender === 'female' && daysDifference >= 90)
			) {
				donationAvailability = true;
			}

			return {
				canDonate: donationAvailability,
				lastDonationDate: formatDate(donationDate),
				nextDonationDate: formatDate(nextDonationDate),
			};
		});
};

exports.canDonate = (req, res, next) => {
	checkDonationEligibility(req.userId)
		.then(({ canDonate, lastDonationDate }) => {
			res.status(STATUS_CODE.OK).json({
				canDonate: canDonate,
				lastDonationDate: lastDonationDate,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			}
			next(err);
		});
};

exports.donate = async (req, res, next) => {
	try {
		const { bloodGroup, lastDonationDate, donationType, disease } = req.body;
		const {
			canDonate,
			lastDonationDate: lastDD,
			nextDonationDate,
		} = await checkDonationEligibility(req.userId);

		if (!canDonate) {
			throw new ApiError(
				`Based on your last donation date, you are not eligible to donate at this time. You can register for a new donation starting ${nextDonationDate}`,
				STATUS_CODE.FORBIDDEN,
				['lastDonationDate']
			);
		}

		await checkExistingDonation(req.userId, new Date(lastDonationDate));

		const donation = new Donation({
			bloodGroup,
			lastDonationDate,
			donationType,
			disease,
			userId: req.userId,
		});

		await donation.save();
		await User.findByIdAndUpdate(
			req.userId,
			{ $push: { donations: donation._id } },
			{ new: true }
		);

		res.status(STATUS_CODE.CREATED).json({ message: 'Donation saved!' });
	} catch (err) {
		const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER;
		res
			.status(statusCode)
			.json(
				err.getErrorResponse
					? err.getErrorResponse()
					: { errorMessage: err.message }
			);
	}
};

const checkExistingDonation = async (userId, userProvidedDate) => {
	try {
		const existingDonation = await Donation.findOne({
			userId: userId,
			lastDonationDate: { $ne: null },
			reelDonationDate: null,
		})
			.sort({ lastDonationDate: -1 })
			.limit(1);

		if (existingDonation) {
			throw new ApiError(
				'You have a previous donation that has not been completed yet.',
				STATUS_CODE.FORBIDDEN
			);
		}

		const [recentDonation] = await Donation.find({ userId: userId })
			.sort({ lastDonationDate: -1 })
			.limit(1)
			.exec(); // Using exec to ensure a Promise is returned

		if (recentDonation) {
			const recentDate =
				recentDonation.reelDonationDate || recentDonation.lastDonationDate;

			if (userProvidedDate < new Date(recentDate)) {
				throw new ApiError(
					'The provided last donation date is older than your most recent donation.',
					STATUS_CODE.BAD_REQUEST,
					['lastDonationDate']
				);
			}
		}

		// If all checks pass, return a resolved promise
		return Promise.resolve();
	} catch (err) {
		// If any check fails, propagate the error
		return Promise.reject(err);
	}
};

exports.getDonation = (req, res, next) => {
	const { userId } = req;

	Donation.find({ userId: new mongoose.Types.ObjectId(userId) })
		.sort({ lastDonationDate: -1 })
		.limit(1)
		.exec()
		.then((donations) => {
			const recentDonation = donations[0];
			if (!recentDonation) {
				throw new ApiError(
					'No donation found for this user.',
					STATUS_CODE.NOT_FOUND
				);
			}

			// Fetch the user's profile to get the bloodGroup
			return Profile.findOne({ user: new mongoose.Types.ObjectId(userId) })
				.select('bloodGroup')
				.then((profile) => {
					if (!profile) {
						throw new ApiError(
							'User profile not found.',
							STATUS_CODE.NOT_FOUND
						);
					}

					// Add bloodGroup to the recentDonation object
					const donationWithBloodGroup = {
						...recentDonation.toObject(),
						bloodGroup: profile.bloodGroup,
					};

					res.status(STATUS_CODE.OK).json(donationWithBloodGroup);
				});
		})
		.catch((err) => {
			const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER;
			res
				.status(statusCode)
				.json(
					err.getErrorResponse
						? err.getErrorResponse()
						: { errorMessage: err.message }
				);
		});
};

exports.getDonationsByUser = (req, res, next) => {
	const username = req.params.username;
	User.findOne({ username: username })
		.then((user) => {
			if (!user) {
				throw new ApiError('User not found.', STATUS_CODE.NOT_FOUND);
			}

			return Donation.find({ userId: user._id }).sort({ lastDonationDate: -1 });
		})
		.then((donations) => {
			if (donations.length === 0) {
				throw new ApiError(
					'No donations found for this user.',
					STATUS_CODE.NOT_FOUND
				);
			}

			res.status(STATUS_CODE.OK).json(donations);
		})
		.catch((err) => {
			const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER;
			res
				.status(statusCode)
				.json(
					err.getErrorResponse
						? err.getErrorResponse()
						: { errorMessage: err.message }
				);
		});
};

// TODO: markAsDonor
// Add a method to mark user as donor by setting his reelDonationDate
// This operation is limited to the admin

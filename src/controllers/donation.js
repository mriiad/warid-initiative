const Donation = require('../models/donation');
const User = require('../models/user');
const Profile = require('../models/profile');
const Event = require('../models/event');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const ApiError = require('../utils/errors/ApiError');
const mongoose = require('mongoose');
const { addDays, formatDate, startOfDay } = require('../utils/utils');
const { BLOOD_GROUP_VALUES } = require('../utils/constants');

/**
 * Utility function to check donation eligibility
 */
exports.checkDonationEligibility = async (userId) => {
	let user;
	const foundUser = await User.findById(userId);
	if (!foundUser) {
		throw new ApiError('User not found.', STATUS_CODE.NOT_FOUND);
	}
	user = foundUser;
	const donations = await Donation.find({ userId: userId })
		.sort({ donationDate: -1 })
		.limit(1);
	const currentDate = new Date();
	let donationAvailability = false;
	const donation = donations[0];
	if (!donation) {
		return {
			canDonate: true,
			lastDonationDate: null,
			nextDonationDate: null,
			nextDonationDateRaw: null,
		};
	}
	const donationDate = donation.donationDate;
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
		nextDonationDateRaw: nextDonationDate,
	};
};

exports.canDonate = (req, res, next) => {
	exports.checkDonationEligibility(req.userId)
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
		const { bloodGroup, donationDate, donationType, eventId } = req.body;
		const { canDonate, lastDonationDate, nextDonationDate } =
			await this.checkDonationEligibility(req.userId);

		console.log('canDonate', canDonate);
		console.log('lastDonationDate', lastDonationDate);
		console.log('nextDonationDate', nextDonationDate);

		if (!canDonate) {
			throw new ApiError(
				`Based on your last donation date, you are not eligible to donate at this time. You can register for a new donation starting ${nextDonationDate}`,
				STATUS_CODE.FORBIDDEN,
				['donationDate']
			);
		}

		await checkExistingDonation(req.userId, new Date(donationDate));

		// The donation form's blood-group field only exists to let a donor
		// whose profile doesn't have one yet declare it -- Profile.bloodGroup
		// is the single source of truth read everywhere else (emergency
		// matching, admin views, filters). If it's already set, a submitted
		// value here is ignored rather than silently overwriting it.
		if (bloodGroup && BLOOD_GROUP_VALUES.includes(bloodGroup)) {
			const profile = await Profile.findOne({ user: req.userId });
			if (profile && !profile.bloodGroup) {
				profile.bloodGroup = bloodGroup;
				await profile.save();
			}
		}

		// Get event or find a generic event if not provided
		let event;
		if (eventId) {
			event = await Event.findById(eventId);
			if (!event) {
				throw new ApiError('Event not found', STATUS_CODE.NOT_FOUND);
			}
		} else {
			// If no event provided, find a generic event
			event = await Event.findOne({ isGeneric: true });
			if (!event) {
				throw new ApiError(
					'No generic event found for free donation',
					STATUS_CODE.NOT_FOUND
				);
			}
		}

		const donation = new Donation({
			donationDate,
			donationType,
			userId: req.userId,
			eventId: event._id,
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
		const providedDay = startOfDay(userProvidedDate);

		if (providedDay > startOfDay(new Date())) {
			throw new ApiError(
				'The donation date cannot be in the future.',
				STATUS_CODE.BAD_REQUEST,
				['donationDate']
			);
		}

		// Validate the eligibility rest period against the date actually being
		// recorded, not against today -- a donor whose cooldown has expired as
		// of today could otherwise backdate a donation to fall inside the rest
		// period of their previous one.
		const { nextDonationDate, nextDonationDateRaw } =
			await exports.checkDonationEligibility(userId);

		if (nextDonationDateRaw && providedDay < startOfDay(nextDonationDateRaw)) {
			throw new ApiError(
				`The provided donation date falls within your mandatory rest period. You can register a donation starting ${nextDonationDate}`,
				STATUS_CODE.FORBIDDEN,
				['donationDate']
			);
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
		.sort({ donationDate: -1 })
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

					return Event.findById(recentDonation.eventId).then((event) => {
						// Add bloodGroup and event to the recentDonation object
						const donationWithDetails = {
							...recentDonation.toObject(),
							bloodGroup: profile.bloodGroup,
							event: event
								? {
										title: event.title,
										reference: event.reference,
										isGeneric: event.isGeneric,
								  }
								: null,
						};

						res.status(STATUS_CODE.OK).json(donationWithDetails);
					});
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

			return Donation.find({ userId: user._id }).sort({ donationDate: -1 });
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

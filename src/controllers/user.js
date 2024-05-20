const User = require('../models/user');
const ApiError = require('../utils/errors/ApiError');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const Profile = require('../models/profile');
const { calculateAge } = require('../utils/utils');

// Get all users
exports.getUsers = async (req, res, next) => {
	try {
		const currentPage = Number(req.query.page) || 1;
		const perPage = 10;

		const totalItems = await User.countDocuments();

		const users = await User.find(
			{},
			'username email phoneNumber gender isAdmin'
		)
			.skip((currentPage - 1) * perPage)
			.limit(perPage)
			.lean();

		res.status(STATUS_CODE.OK).json({
			message: 'Fetched users successfully.',
			users: users,
			totalItems: totalItems,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = STATUS_CODE.INTERNAL_SERVER;
		}
		next(err);
	}
};

// Get all users
exports.getUsers = async (req, res, next) => {
	try {
		const currentPage = Number(req.query.page) || 1;
		const perPage = 10;

		const totalItems = await User.countDocuments();

		const users = await User.find(
			{},
			'username email phoneNumber gender isAdmin'
		)
			.skip((currentPage - 1) * perPage)
			.limit(perPage);

		res.status(STATUS_CODE.OK).json({
			message: 'Fetched users successfully.',
			users: users,
			totalItems: totalItems,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = STATUS_CODE.INTERNAL_SERVER;
		}
		next(err);
	}
};

exports.updateUserInfo = (req, res, next) => {
	const userId = req.userId;
	const { firstname, lastname, birthdate, gender, bloodGroup } = req.body;

	let userFound;

	User.findById(userId)
		.then((user) => {
			if (!user) {
				const error = new Error('User not found.');
				error.statusCode = 404;
				throw error;
			}

			userFound = user;
			return Profile.findOne({ user: user._id });
		})
		.then((profile) => {
			if (profile) {
				// Update existing profile
				profile.firstname = firstname;
				profile.lastname = lastname;
				profile.birthdate = birthdate;
				profile.gender = gender;
				profile.bloodGroup = bloodGroup;
				return profile.save();
			} else {
				// Create a new profile and update the User model
				const newProfile = new Profile({
					user: userId,
					firstname,
					lastname,
					birthdate,
					gender,
					bloodGroup,
				});
				return newProfile.save().then((savedProfile) => {
					userFound.profile = savedProfile._id; // Update the User model with the new profile reference
					return userFound.save();
				});
			}
		})
		.then(() => {
			res.status(200).json({ message: 'User profile updated successfully!' });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.checkUserProfile = async (req, res, next) => {
	try {
		const userId = req.userId;

		const user = await User.findById(userId).populate('profile');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if the user's profile information is complete
		if (!user.profile) {
			return res.status(200).json({ isProfileComplete: false });
		}

		const { firstname, lastname, birthdate, gender, bloodGroup } = user.profile;
		const isProfileComplete =
			firstname && lastname && birthdate && gender && bloodGroup;

		res.status(200).json({ isProfileComplete });
	} catch (err) {
		console.error(err);
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getProfile = (req, res, next) => {
	const userId = req.userId;
	User.findById(userId)
		.populate('profile') // Populate the profile field in the found user document
		.then((user) => {
			if (!user) {
				const error = new Error('User not found.');
				error.statusCode = 404;
				throw error;
			}

			if (!user.profile) {
				// If the user has no profile, return an empty object
				return res.status(200).json({});
			}

			// If the user has a profile, return it
			res.status(200).json({
				firstname: user.profile.firstname,
				lastname: user.profile.lastname,
				birthdate: user.profile.birthdate,
				gender: user.profile.gender,
				bloodGroup: user.profile.bloodGroup,
			});
		})
		.catch((err) => {
			console.error(err);
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.searchUsers = async (req, res, next) => {
	try {
		const { username, firstname, lastname, ageRange, availableForDonation } =
			req.body;
		const query = {};

		if (username) {
			query.username = { $regex: new RegExp(username, 'i') };
		}

		if (firstname || lastname) {
			query.$and = [];
			if (firstname) {
				query.$and.push({
					'profile.firstname': { $regex: new RegExp(firstname, 'i') },
				});
			}
			if (lastname) {
				query.$and.push({
					'profile.lastname': { $regex: new RegExp(lastname, 'i') },
				});
			}
		}

		let users = await User.find(query)
			.populate('profile')
			.select('-password -confirmationCode');

		if (ageRange || availableForDonation !== undefined) {
			users = await Promise.all(
				users.map(async (user) => {
					const userAge =
						user.profile && user.profile.birthdate
							? calculateAge(user.profile.birthdate)
							: null;
					const donationEligibility = await checkDonationEligibility(user._id);

					let isAgeMatch = true;
					if (ageRange && ageRange.length === 2) {
						isAgeMatch = userAge >= ageRange[0] && userAge <= ageRange[1];
					}

					let isDonationEligible = true;
					if (availableForDonation !== undefined) {
						isDonationEligible = availableForDonation
							? donationEligibility.canDonate
							: !donationEligibility.canDonate;
					}

					return isAgeMatch && isDonationEligible ? user : null;
				})
			);
		}

		users = users.filter((user) => user !== null);

		if (users.length === 0) {
			return res
				.status(STATUS_CODE.NOT_FOUND)
				.json({ message: 'No users found.' });
		}

		res.status(STATUS_CODE.OK).json({ users });
	} catch (err) {
		next(err);
	}
};

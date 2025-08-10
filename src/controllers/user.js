const User = require('../models/user');
const ApiError = require('../utils/errors/ApiError');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const Profile = require('../models/profile');
const { calculateAge } = require('../utils/utils');
const { checkDonationEligibility } = require('./donation');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get all users
exports.getUsers = async (req, res, next) => {
	try {
		const currentPage = Number(req.query.page) || 1;
		const perPage = 10;

		const totalItems = await User.countDocuments();

		const users = await User.find(
			{},
			'username email phoneNumber isAdmin profile gender'
		)
			.populate('profile')
			.skip((currentPage - 1) * perPage)
			.limit(perPage);

		const projected = users.map((u) => {
			const obj = u.toObject();
			return {
				...obj,
				gender:
					obj.gender != null
						? obj.gender
						: u.profile
						? u.profile.gender
						: undefined,
			};
		});

		res.status(STATUS_CODE.OK).json({
			message: 'Fetched users successfully.',
			users: projected,
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
		const {
			username,
			firstname,
			lastname,
			age: ageRange,
			availableForDonation: availableForDonationRaw,
			minAge: minAgeRaw,
			maxAge: maxAgeRaw,
			page: pageRaw,
			perPage: perPageRaw,
			email,
			phoneNumber: phoneNumberRaw,
			gender: genderRaw,
			isAdmin: isAdminRaw,
		} = req.body;

		// Coerce pagination
		const currentPage = Math.max(1, parseInt(pageRaw, 10) || 1);
		const perPage = Math.max(1, parseInt(perPageRaw, 10) || 10);

		// Coerce donation filter which may arrive as string
		let availableForDonation = undefined;
		if (availableForDonationRaw !== undefined) {
			if (typeof availableForDonationRaw === 'string') {
				availableForDonation = availableForDonationRaw === 'true';
			} else {
				availableForDonation = Boolean(availableForDonationRaw);
			}
		}

		// Coerce admin filter
		let isAdmin = undefined;
		if (isAdminRaw !== undefined) {
			if (typeof isAdminRaw === 'string') {
				isAdmin = isAdminRaw === 'true';
			} else {
				isAdmin = Boolean(isAdminRaw);
			}
		}

		// Coerce age range coming either as array ageRange or minAge/maxAge
		let minAge = undefined;
		let maxAge = undefined;
		if (Array.isArray(ageRange) && ageRange.length === 2) {
			minAge = parseInt(ageRange[0], 10);
			maxAge = parseInt(ageRange[1], 10);
		} else {
			minAge = minAgeRaw !== undefined ? parseInt(minAgeRaw, 10) : undefined;
			maxAge = maxAgeRaw !== undefined ? parseInt(maxAgeRaw, 10) : undefined;
		}

		// Build base query for User
		const query = {};
		if (username) {
			query.username = { $regex: new RegExp(username, 'i') };
		}
		if (email) {
			query.email = { $regex: new RegExp(email, 'i') };
		}
		if (isAdmin !== undefined) {
			query.isAdmin = isAdmin;
		}
		// phoneNumber stored as Number; use $expr with $toString to allow partial string match
		if (phoneNumberRaw) {
			query.$expr = {
				$regexMatch: {
					input: { $toString: '$phoneNumber' },
					regex: phoneNumberRaw,
					options: 'i',
				},
			};
		}

		// If filtering on firstname/lastname, first fetch matching profiles and constrain user ids
		const profileQuery = {};
		if (firstname) {
			profileQuery.firstname = { $regex: new RegExp(firstname, 'i') };
		}
		if (lastname) {
			profileQuery.lastname = { $regex: new RegExp(lastname, 'i') };
		}
		if (Object.keys(profileQuery).length > 0) {
			const matchingProfiles = await Profile.find(profileQuery).select('user');
			const matchingUserIds = matchingProfiles.map((p) => p.user);
			if (matchingUserIds.length === 0) {
				return res
					.status(STATUS_CODE.NOT_FOUND)
					.json({ message: 'No users found.' });
			}
			query._id = { $in: matchingUserIds };
		}

		// Gender filter: match either on user.gender or profile.gender
		if (
			genderRaw !== undefined &&
			genderRaw !== null &&
			String(genderRaw).trim() !== ''
		) {
			const genderValue = String(genderRaw).trim();
			const genderRegex = new RegExp(
				`^\\s*${escapeRegex(genderValue)}\\s*$`,
				'i'
			);
			const genderProfiles = await Profile.find({
				gender: { $regex: genderRegex },
			}).select('user');
			const genderUserIds = genderProfiles.map((p) => p.user);
			const orConditions = [{ gender: { $regex: genderRegex } }];
			if (genderUserIds.length > 0) {
				orConditions.push({ _id: { $in: genderUserIds } });
			}
			query.$or = orConditions;
		}

		let users = await User.find(query)
			.populate('profile')
			.select('-password -confirmationCode');

		// Post-filtering on age and donation eligibility
		if (
			minAge !== undefined ||
			maxAge !== undefined ||
			availableForDonation !== undefined
		) {
			users = await Promise.all(
				users.map(async (user) => {
					const userAge =
						user.profile && user.profile.birthdate
							? calculateAge(user.profile.birthdate)
							: null;

					let isAgeMatch = true;
					if (userAge !== null) {
						if (minAge !== undefined) {
							isAgeMatch = isAgeMatch && userAge >= minAge;
						}
						if (maxAge !== undefined) {
							isAgeMatch = isAgeMatch && userAge <= maxAge;
						}
					} else if (minAge !== undefined || maxAge !== undefined) {
						// If age filter provided but user has no birthdate, exclude user
						isAgeMatch = false;
					}

					let isDonationEligible = true;
					if (availableForDonation !== undefined) {
						const donationEligibility = await checkDonationEligibility(
							user._id
						);
						isDonationEligible = availableForDonation
							? donationEligibility.canDonate
							: !donationEligibility.canDonate;
					}

					return isAgeMatch && isDonationEligible ? user : null;
				})
			);
		}

		// Remove nulls after post-filtering
		users = users.filter((user) => user !== null);

		if (users.length === 0) {
			return res
				.status(STATUS_CODE.NOT_FOUND)
				.json({ message: 'No users found.' });
		}

		// Pagination on the filtered list
		const totalItems = users.length;
		const startIndex = (currentPage - 1) * perPage;
		const paginatedUsers = users.slice(startIndex, startIndex + perPage);

		return res.status(STATUS_CODE.OK).json({
			users: paginatedUsers.map((u) => {
				const obj = u.toObject();
				return {
					...obj,
					gender:
						obj.gender != null
							? obj.gender
							: u.profile
							? u.profile.gender
							: undefined,
				};
			}),
			totalItems,
			page: currentPage,
			perPage,
		});
	} catch (err) {
		next(err);
	}
};

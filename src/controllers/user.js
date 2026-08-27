const User = require('../models/user');
const Donation = require('../models/donation')
const Event = require('../models/event');
const Emergency = require('../models/emergency');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const ApiError = require('../utils/errors/ApiError');
const Profile = require('../models/profile');
const { calculateAge } = require('../utils/utils');
const { checkDonationEligibility } = require('./donation');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const { ERROR_MESSAGES, MESSAGES } = require('../utils/constants');
const { addDays, formatDate } = require('../utils/utils');

// Get all users
exports.getUsers = async (req, res, next) => {
	try {
		const currentPage = Number(req.query.page) || 1;
		const perPage = 10;

		const totalItems = await User.countDocuments();

		const users = await User.find(
			{},
			'username email phoneNumber isAdmin role profile gender'
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
		next(err);
	}
};

exports.updateUserInfo = (req, res, next) => {
	const userId = req.userId;
	const { firstname, lastname, birthdate, bloodGroup, city } = req.body;

	let userFound;

	User.findById(userId)
		.then((user) => {
			if (!user) {
				const error = new ApiError('User not found.', STATUS_CODE.NOT_FOUND);
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
				profile.bloodGroup = bloodGroup;
				profile.city = city;
				return profile.save();
			} else {
				// Create a new profile and update the User model
				const newProfile = new Profile({
					user: userId,
					firstname,
					lastname,
					birthdate,
					bloodGroup,
					city,
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
			next(err);
		});
};

exports.updateUserProfile = async (req, res, next) => {
	try {
		const userId = req.userId;
		const {
			firstname,
			lastname,
			city,
			birthdate,
			bloodGroup,
			phoneNumber,
			email,
		} = req.body;

		const user = await User.findById(userId).populate('profile');
		if (!user) {
			const error = new ApiError('User not found.', STATUS_CODE.NOT_FOUND);
			throw error;
		}

		const profile = user.profile;
		if (!profile) {
			const error = new ApiError('User profile not found.', STATUS_CODE.NOT_FOUND);
			throw error;
		}

		// Update profile fields if provided
		if (firstname !== undefined) profile.firstname = firstname;
		if (lastname !== undefined) profile.lastname = lastname;
		if (city !== undefined) profile.city = city;
		if (birthdate !== undefined) profile.birthdate = birthdate;
		if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
		if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
		if (email !== undefined) user.email = email;

		await profile.save();
		await user.save();

		res.status(200).json({ message: 'Profile updated successfully!' });
	} catch (err) {
		next(err);
	}
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

		const { firstname, lastname, birthdate, bloodGroup, city } = user.profile;
		const isProfileComplete =
			firstname && lastname && birthdate && bloodGroup && city;

		res.status(200).json({ isProfileComplete });
	} catch (err) {
		next(err);
	}
};

exports.getProfile = (req, res, next) => {
	const userId = req.userId;
	User.findById(userId)
		.populate('profile') // Populate the profile field in the found user document
		.then((user) => {
			if (!user) {
				const error = new ApiError('User not found.', STATUS_CODE.NOT_FOUND);
				throw error;
			}

			if (!user.profile) {
				// If the user has no profile, return an empty object with just gender
				return res.status(200).json({
					gender: user.gender,
				});
			}

			// If the user has a profile, return it with gender from user model
			res.status(200).json({
				firstname: user.profile.firstname,
				lastname: user.profile.lastname,
				birthdate: user.profile.birthdate,
				gender: user.gender, // Gender from User model
				bloodGroup: user.profile.bloodGroup,
				city: user.profile.city,
				phoneNumber: user.phoneNumber,
				email: user.email,
			});
		})
		.catch((err) => {
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
			bloodGroup,
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

		const profileQuery = {};
		if (firstname) {
			profileQuery.firstname = { $regex: new RegExp(firstname, 'i') };
		}
		if (lastname) {
			profileQuery.lastname = { $regex: new RegExp(lastname, 'i') };
		}
		if (bloodGroup) {
			profileQuery.bloodGroup = bloodGroup;
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

exports.deleteUser = async (req, res, next) => {
	try {
		const { username } = req.params;
		if (!username) {
			return res
				.status(STATUS_CODE.BAD_REQUEST)
				.json({ message: 'Username is required' });
		}

		const user = await User.findOneAndDelete({ username: username });
		if (!user) {
			return res
				.status(STATUS_CODE.NOT_FOUND)
				.json({ message: 'User not found' });
		}

		res.status(STATUS_CODE.OK).json({ message: 'User deleted successfully' });
	} catch (err) {
		next(err);
	}
};

exports.getUserById = async (req, res, next) => {
	try {
		const { userId } = req.params;
		if (!userId) {
			return res
				.status(STATUS_CODE.BAD_REQUEST)
				.json({ message: 'User ID is required' });
		}

		const user = await User.findById(userId).populate('profile');
		if (!user) {
			return res
				.status(STATUS_CODE.NOT_FOUND)
				.json({ message: 'User not found' });
		}

		const { canDonate } = await checkDonationEligibility(userId);

		// Return user data with profile information
		const userData = {
			_id: user._id,
			username: user.username,
			email: user.email,
			phoneNumber: user.phoneNumber,
			isAdmin: user.isAdmin,
			role: user.role,
			gender: user.gender,
			canDonate,
			...(user.profile && {
				firstname: user.profile.firstname,
				lastname: user.profile.lastname,
				birthdate: user.profile.birthdate,
				bloodGroup: user.profile.bloodGroup,
				city: user.profile.city,
			}),
		};

		res.status(STATUS_CODE.OK).json(userData);
	} catch (err) {
		next(err);
	}
};

exports.updateUserById = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const {
			firstname,
			lastname,
			birthdate,
			bloodGroup,
			city,
			phoneNumber,
			email,
		} = req.body;

		if (!userId) {
			return res
				.status(STATUS_CODE.BAD_REQUEST)
				.json({ message: 'User ID is required' });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(STATUS_CODE.NOT_FOUND)
				.json({ message: 'User not found' });
		}

		// Update user fields
		if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
		if (email !== undefined) user.email = email;

		// Update or create profile
		let profile = await Profile.findOne({ user: userId });
		if (profile) {
			if (firstname !== undefined) profile.firstname = firstname;
			if (lastname !== undefined) profile.lastname = lastname;
			if (birthdate !== undefined) profile.birthdate = birthdate;
			if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
			if (city !== undefined) profile.city = city;
		} else if (firstname || lastname || birthdate || bloodGroup || city) {
			profile = new Profile({
				user: userId,
				firstname,
				lastname,
				birthdate,
				bloodGroup,
				city,
			});
		}

		await user.save();
		if (profile) await profile.save();

		res.status(STATUS_CODE.OK).json({ message: 'User updated successfully' });
	} catch (err) {
		next(err);
	}
};

// Role assignment (see issue #183): grants admin access if the target isn't
// already an admin, and either way sets which of the three roles they hold
// -- so this also covers a principal reassigning an existing admin from one
// role to another, not just a first-time promotion.
const ADMIN_ROLES = ['principal', 'emergency', 'event'];

exports.makeUserAdmin = async (req, res, next) => {
	try {
		const { userId } = req.params;
		// Optional and defaulted to 'principal', not required: the existing
		// frontend "make admin" action (UserDetailView.tsx) calls this route
		// with no body at all, and used to mean exactly that -- grant full
		// admin access. The role-picker UI that sends an explicit role is
		// issue #351; until it ships, an omitted role must keep doing what it
		// always did rather than 400 on every existing caller.
		const role = (req.body && req.body.role) || 'principal';
		if (!userId) {
			return res
				.status(STATUS_CODE.BAD_REQUEST)
				.json({ message: 'User ID is required' });
		}
		if (!ADMIN_ROLES.includes(role)) {
			return res.status(STATUS_CODE.BAD_REQUEST).json({
				message: `A valid role is required (one of: ${ADMIN_ROLES.join(', ')}).`,
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(STATUS_CODE.NOT_FOUND)
				.json({ message: 'User not found' });
		}

		user.isAdmin = true;
		user.role = role;
		await user.save();

		res
			.status(STATUS_CODE.OK)
			.json({ message: 'Admin role updated successfully', role: user.role });
	} catch (err) {
		next(err);
	}
};

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorMessage: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }

    // Fetch all donations of the user
    const donations = await Donation.find({ userId })
      .sort({ donationDate: -1 })
      .populate('eventId', 'title isGeneric');

    // Handle case: no donations found
    if (!donations || donations.length === 0) {
       return res.status(200).json({
         donations: donations || [],
       });
    }

    // Total donations
    const totalDonations = donations.length;

    // Last donation date
    const lastDonationDate = donations[0]?.donationDate || null;

    // Days until eligible again
    let eligibleInDays = 0;
    if (lastDonationDate) {
      const daysToAdd = user.gender === 'male' ? 60 : 90;
      const nextDonationDate = addDays(lastDonationDate, daysToAdd);
      const today = new Date();
      const diff = Math.ceil((nextDonationDate - today) / (1000 * 60 * 60 * 24));
      eligibleInDays = diff > 0 ? diff : 0;
    }

    // Prepare donation history for the dashboard
    const donationHistory = donations.map(d => ({
      id: d._id,
      date: formatDate(d.donationDate),
      type: d.donationType,
      event: d.eventId && !d.eventId.isGeneric
        ? d.eventId.title
        : MESSAGES.REGULAR_DONATION
    }));

    // Response
    res.status(STATUS_CODE.OK).json({
      stats: {
        total: totalDonations,
        lastDonation: lastDonationDate ? formatDate(lastDonationDate) : null,
        eligibleIn: `${eligibleInDays} days`,
      },
      donations: donationHistory
    });

  } catch (err) {
    const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER;
    res.status(statusCode).json(
      err.getErrorResponse
        ? err.getErrorResponse()
        : { errorMessage: err.message }
    );
  }
};

// Site-wide counts for the admin dashboard overview.
exports.getAdminStats = async (req, res, next) => {
	try {
		const [totalUsers, totalEvents, totalDonations, totalEmergencies] =
			await Promise.all([
				User.countDocuments(),
				Event.countDocuments(),
				Donation.countDocuments(),
				Emergency.countDocuments(),
			]);

		res.status(STATUS_CODE.OK).json({
			totalUsers,
			totalEvents,
			totalDonations,
			totalEmergencies,
		});
	} catch (err) {
		next(err);
	}
};

const User = require('../models/user');
const Profile = require('../models/profile');

exports.updateUserInfo = (req, res, next) => {
	//
	const userId = req.userId;
	console.log('userId', userId);
	const { firstname, lastname, birthdate, gender } = req.body;

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
				return profile.save();
			} else {
				// Create a new profile and update the User model
				const newProfile = new Profile({
					user: userId,
					firstname,
					lastname,
					birthdate,
					gender,
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
		console.log('userId', userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if the user's profile information is complete
		if (!user.profile) {
			return res.status(200).json({ isProfileComplete: false });
		}

		const { firstname, lastname, birthdate, gender } = user.profile;
		const isProfileComplete = firstname && lastname && birthdate && gender;
		console.log('profile', user.profile);
		console.log('isProfileComplete', isProfileComplete);

		res.status(200).json({ isProfileComplete });
	} catch (err) {
		console.error(err);
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

const User = require('../models/user');
const Profile = require('../models/profile');

exports.updateUserInfo = (req, res, next) => {
	const username = req.params.username;
	const { firstname, lastname, birthdate, gender } = req.body;

	let userFound;

	User.findOne({ username: username })
		.then((user) => {
			if (!user) {
				const error = new Error('User not found.');
				error.statusCode = 404;
				throw error;
			}

			userFound = user;
			// Check if the user already has a profile
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
				// Create a new profile
				const newProfile = new Profile({
					user: userFound._id,
					firstname,
					lastname,
					birthdate,
					gender,
				});
				return newProfile.save();
			}
		})
		.then((result) => {
			res.status(200).json({ message: 'User profile updated successfully!' });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

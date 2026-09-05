const express = require('express');
const { body } = require('express-validator');
const userRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');
const requireAdminRole = require('../utils/requireAdminRole');
const cities = require('../utils/cities');
const { BLOOD_GROUP_VALUES } = require('../utils/constants');

// User management is Principal-Admin-only (see issue #183) -- neither
// Emergency nor Event Admin gets any of these, so the allowed-roles list is
// empty. /api/admin/stats below stays on the plain checkIfAdmin gate: every
// admin role keeps the dashboard.
const requirePrincipalAdmin = requireAdminRole([]);

// Signup validates both of these carefully, but the endpoints that *change*
// them carried no validator chain at all and the schema declares email as a
// bare String -- so a logged-in user could set their email to
// 'not-an-email' and their phone to anything. Email is the only
// account-recovery channel, so a malformed address quietly makes the
// account unrecoverable. Same rules as the signup chain, optional because
// both fields are only applied when present. See issue #396.
//
// Duplicates are left to the unique index, which the shared error handler
// now reports as a friendly 409 (issue #368).
const profileContactValidators = [
	body('email')
		.optional()
		.isEmail()
		.withMessage('Please enter a valid email.')
		.normalizeEmail(),
	// Deliberately more permissive than signup's E.164 rule
	// (/^\+[1-9]\d{6,14}$/). Two things in the app produce local-format
	// numbers that rule would reject: the admin edit form (UpdateUser.tsx)
	// uses a plain TextField with no format rule, and records predating any
	// of this hold values like '0600000001'. Enforcing E.164 here would 400
	// an admin who opens such a user and saves without touching the phone.
	// This still rejects the actual problem -- letters and free text --
	// while accepting both shapes. Converging the two on E.164 needs the
	// admin form switched to PhoneNumberField plus a decision about existing
	// data, which is a bigger change than this fix. See issue #396.
	body('phoneNumber')
		.optional()
		.trim()
		.matches(/^\+?[0-9]{6,15}$/)
		.withMessage('Please enter a valid phone number.'),
];

// PUT /api/user/update overwrites all five profile fields unconditionally,
// and carried no validator chain -- so the complete-profile form's default
// state (bloodGroup left on its "None" option, i.e. '') reached
// `new Profile({ bloodGroup: '' })`, where Mongoose rejected it against the
// enum. That surfaced as a 400 reading "`` is not a valid enum value for
// path `bloodGroup`", which the client showed as a generic "update failed"
// with no hint which field was at fault. None of these are optional:
// checkUserProfile requires all five before it calls a profile complete.
// See issue #413.
const completeProfileValidators = [
	body('firstname').trim().notEmpty().withMessage('First name is required.'),
	body('lastname').trim().notEmpty().withMessage('Last name is required.'),
	body('birthdate')
		.notEmpty()
		.withMessage('Birthdate is required.')
		.bail()
		.isISO8601()
		.withMessage('The birthdate is not a valid date.'),
	body('bloodGroup')
		.isIn(BLOOD_GROUP_VALUES)
		.withMessage('A blood group is required.'),
	body('city').isIn(cities).withMessage('A city is required.'),
];

const {
	getUsers,
	updateUserInfo,
	checkUserProfile,
	getProfile,
	searchUsers,
	deleteUser,
	updateUserProfile,
	getUserById,
	updateUserById,
	makeUserAdmin,
	getDashboard,
	getAdminStats,
} = require('../controllers/user');

// Was unauthenticated entirely -- returned every user's email, phone
// number, isAdmin status and full profile (blood group, city, name) to
// any anonymous request. Every sibling route that returns user data
// (searchUsers, users/profile/:userId, admin/stats) is isAuth +
// checkIfAdmin; this one was simply missed. See issue #312. Now
// Principal-Admin-only rather than any admin -- see issue #183.
userRouter.get('/api/users', isAuth, requirePrincipalAdmin, getUsers);

userRouter.put(
	'/api/user/update',
	isAuth,
	completeProfileValidators,
	updateUserInfo
);

userRouter.get('/api/user/check-profile', isAuth, checkUserProfile);

userRouter.get('/api/user/profile', isAuth, getProfile);

userRouter.post('/api/searchUsers', isAuth, requirePrincipalAdmin, searchUsers);

userRouter.delete(
	'/api/deleteUser/:username',
	isAuth,
	requirePrincipalAdmin,
	deleteUser
);

userRouter.get('/cities', (req, res) => {
	res.json({ cities });
});

userRouter.patch(
	'/api/user/profile',
	isAuth,
	profileContactValidators,
	updateUserProfile
);

// Principal-Admin-only routes (see issue #183)
userRouter.get('/api/users/profile/:userId', isAuth, requirePrincipalAdmin, getUserById);
userRouter.put(
	'/api/users/:userId',
	isAuth,
	requirePrincipalAdmin,
	profileContactValidators,
	updateUserById
);
// Role assignment, not just admin promotion -- also lets a principal
// reassign an existing admin's role. See makeUserAdmin in controllers/user.js.
userRouter.patch(
	'/api/users/:userId/admin',
	isAuth,
	requirePrincipalAdmin,
	makeUserAdmin
);

userRouter.get('/api/users/:userId/dashboard', isAuth, getDashboard);
userRouter.get('/api/admin/stats', isAuth, checkIfAdmin, getAdminStats);
module.exports = userRouter;

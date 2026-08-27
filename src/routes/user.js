const express = require('express');
const userRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');
const requireAdminRole = require('../utils/requireAdminRole');
const cities = require('../utils/cities');

// User management is Principal-Admin-only (see issue #183) -- neither
// Emergency nor Event Admin gets any of these, so the allowed-roles list is
// empty. /api/admin/stats below stays on the plain checkIfAdmin gate: every
// admin role keeps the dashboard.
const requirePrincipalAdmin = requireAdminRole([]);

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

userRouter.put('/api/user/update', isAuth, updateUserInfo);

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

userRouter.patch('/api/user/profile', isAuth, updateUserProfile);

// Principal-Admin-only routes (see issue #183)
userRouter.get('/api/users/profile/:userId', isAuth, requirePrincipalAdmin, getUserById);
userRouter.put('/api/users/:userId', isAuth, requirePrincipalAdmin, updateUserById);
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

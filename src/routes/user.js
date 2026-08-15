const express = require('express');
const userRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');
const cities = require('../utils/cities');

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
// checkIfAdmin; this one was simply missed. See issue #312.
userRouter.get('/api/users', isAuth, checkIfAdmin, getUsers);

userRouter.put('/api/user/update', isAuth, updateUserInfo);

userRouter.get('/api/user/check-profile', isAuth, checkUserProfile);

userRouter.get('/api/user/profile', isAuth, getProfile);

userRouter.post('/api/searchUsers', isAuth, checkIfAdmin, searchUsers);

userRouter.delete(
	'/api/deleteUser/:username',
	isAuth,
	checkIfAdmin,
	deleteUser
);

userRouter.get('/cities', (req, res) => {
	res.json({ cities });
});

userRouter.patch('/api/user/profile', isAuth, updateUserProfile);

// Admin only routes
userRouter.get('/api/users/profile/:userId', isAuth, checkIfAdmin, getUserById);
userRouter.put('/api/users/:userId', isAuth, checkIfAdmin, updateUserById);
userRouter.patch(
	'/api/users/:userId/admin',
	isAuth,
	checkIfAdmin,
	makeUserAdmin
);

userRouter.get('/api/users/:userId/dashboard', isAuth, getDashboard);
userRouter.get('/api/admin/stats', isAuth, checkIfAdmin, getAdminStats);
module.exports = userRouter;

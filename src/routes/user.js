const express = require('express');
const userRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');
const {
	getUsers,
	updateUserInfo,
	checkUserProfile,
	getProfile,
	searchUserByUsername,
} = require('../controllers/user');

userRouter.get('/api/users', getUsers);

userRouter.put('/api/user/update', isAuth, updateUserInfo);

userRouter.get('/api/user/check-profile', isAuth, checkUserProfile);

userRouter.get('/api/user/profile', isAuth, getProfile);

userRouter.get(
	'/api/searchUsers/:username',
	isAuth,
	checkIfAdmin,
	searchUserByUsername
);

module.exports = userRouter;

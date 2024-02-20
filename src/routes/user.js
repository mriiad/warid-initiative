const express = require('express');
const userRouter = express.Router();
const { getUsers } = require('../controllers/user');
const { isAuth } = require('../middleware/token-check');

// Define a route to display users to admin
userRouter.get('/api/users', getUsers);
const {
	updateUserInfo,
	checkUserProfile,
	getProfile,
} = require('../controllers/user');

userRouter.put('/api/user/update', isAuth, updateUserInfo);

userRouter.get('/api/user/check-profile', isAuth, checkUserProfile);

userRouter.get('/api/user/profile', isAuth, getProfile);

module.exports = userRouter;

const express = require('express');
const {
	updateUserInfo,
	checkUserProfile,
	getProfile,
} = require('../controllers/user');
const { isAuth } = require('../middleware/token-check');
const userRouter = express.Router();

userRouter.put('/api/user/update', isAuth, updateUserInfo);

userRouter.get('/api/user/check-profile', isAuth, checkUserProfile);

userRouter.get('/api/user/profile', isAuth, getProfile);

module.exports = userRouter;

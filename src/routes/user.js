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
	updateUserProfile
} = require('../controllers/user');

userRouter.get('/api/users', getUsers);

userRouter.put('/api/user/update', isAuth, updateUserInfo);

userRouter.get('/api/user/check-profile', isAuth, checkUserProfile);

userRouter.get('/api/user/profile', isAuth, getProfile);

userRouter.post('/api/searchUsers', isAuth, checkIfAdmin, searchUsers);

userRouter.delete('/api/deleteUser/:username', isAuth , checkIfAdmin , deleteUser);

userRouter.get('/cities', (req, res) => {  res.json({ cities });});

userRouter.patch('/api/user/profile', isAuth, updateUserProfile);


module.exports = userRouter;

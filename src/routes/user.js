const express = require('express');
const { updateUserInfo, checkUserProfile } = require('../controllers/user');
const { isAuth } = require('../middleware/token-check');
const userRouter = express.Router();

userRouter.put('/api/user/update', isAuth, updateUserInfo);

userRouter.get('/api/user/check-profile', isAuth, checkUserProfile);

module.exports = userRouter;

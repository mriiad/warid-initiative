const express = require('express');
const { updateUserInfo, checkUserProfile } = require('../controllers/user');
const { isAuth } = require('../middleware/token-check');
const userRouter = express.Router();

userRouter.put('/api/user/update/:username', isAuth, updateUserInfo);

userRouter.put('/api/user/check-profile', checkUserProfile);

module.exports = userRouter;

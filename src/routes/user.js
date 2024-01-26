const express = require('express');
const { updateUserInfo } = require('../controllers/user');
const { isAuth } = require('../middleware/token-check');
const userRouter = express.Router();

userRouter.put('/api/user/update/:username', isAuth, updateUserInfo);

module.exports = userRouter;

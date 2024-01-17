const express = require('express');
const userRouter = express.Router();
const { getUsers } = require('../controllers/user');

// Define a route to display users to admin
userRouter.get('/api/users', getUsers);

module.exports = userRouter;

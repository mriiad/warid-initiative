const express = require('express');
const { donate } = require('../controllers/donation');

const donationRouter = express.Router();
const isAuth = require('../middleware/is-auth');

donationRouter.get('/', (req, res, next) => {});

donationRouter.put('/api/donate', isAuth, donate);

module.exports = donationRouter;

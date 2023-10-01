const express = require('express');
const { donate } = require('../controllers/donation');

const donationRouter = express.Router();

const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');

donationRouter.get('/', (req, res, next) => {});

donationRouter.put('/api/donate', isAuth, checkIfAdmin, donate);

module.exports = donationRouter;

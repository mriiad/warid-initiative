const express = require('express');
const {
	donate,
	canDonate,
	getDonation,
	getDonationsByUser,
} = require('../controllers/donation');

const donationRouter = express.Router();

const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');

donationRouter.get('/', (req, res, next) => {});

donationRouter.post('/api/donation', isAuth, donate);

donationRouter.get('/api/donation', isAuth, getDonation);

donationRouter.get('/api/donation/canDonate', isAuth, canDonate);

donationRouter.get(
	'/api/donation/:username',
	isAuth,
	checkIfAdmin,
	getDonationsByUser
);

module.exports = donationRouter;

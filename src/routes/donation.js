const express = require('express');
const { body } = require('express-validator');
const {
	donate,
	canDonate,
	getDonation,
	getDonationsByUser,
} = require('../controllers/donation');

const donationRouter = express.Router();

const { isAuth } = require('../middleware/token-check');
const requireAdminRole = require('../utils/requireAdminRole');

// donationDate must be present and parseable: a donation saved without a
// usable date makes every later eligibility comparison NaN, which silently
// locks the donor out of donating for good.
const donateValidators = [
	body('donationDate')
		.exists({ checkNull: true })
		.withMessage('A donation date is required.')
		.bail()
		.isISO8601()
		.withMessage('The donation date is not a valid date.'),
];

donationRouter.post('/api/donation', isAuth, donateValidators, donate);

donationRouter.get('/api/donation', isAuth, getDonation);

donationRouter.get('/api/donation/canDonate', isAuth, canDonate);

// Not emergency- or event-specific, so this stays Principal-Admin-only
// rather than opening it to either specialized role. See issue #183.
donationRouter.get(
	'/api/donation/:username',
	isAuth,
	requireAdminRole([]),
	getDonationsByUser
);

module.exports = donationRouter;

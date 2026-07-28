const express = require('express');
const { sendContactUs } = require('../controllers/contact');
const { optionalAuth } = require('../middleware/optional-token-check');
const { mailLimiter } = require('../middleware/rate-limit');

const contactRouter = express.Router();

// Sends mail on every accepted request.
contactRouter.post('/api/contact-us', mailLimiter, optionalAuth, sendContactUs);

module.exports = contactRouter;

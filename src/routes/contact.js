const express = require('express');
const { sendContactUs } = require('../controllers/contact');
const { optionalAuth } = require('../middleware/optional-token-check');

const contactRouter = express.Router();

contactRouter.post('/api/contact-us', optionalAuth, sendContactUs);

module.exports = contactRouter;

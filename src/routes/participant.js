const express = require('express');
const participantRouter = express.Router();
const { createParticipant,checkUserParticipation } = require('../controllers/participant');
const { isAuth } = require('../middleware/token-check');

participantRouter.post('/api/participate/:reference', isAuth, createParticipant);
participantRouter.get('/api/check/:reference', isAuth, checkUserParticipation);

module.exports = participantRouter;





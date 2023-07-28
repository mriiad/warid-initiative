const express = require('express');
const {
	getEvents,
	createEvent,
	confirmPresence,
} = require('../controllers/event');

const eventRouter = express.Router();
const isAuth = require('../middleware/is-auth');
const checkIfAdmin = require('../utils/checks');

eventRouter.get('/api/events', isAuth, getEvents);

eventRouter.post('/api/event', isAuth, checkIfAdmin, createEvent);

eventRouter.put('/api/event/confirmPresence', isAuth, confirmPresence);

module.exports = eventRouter;

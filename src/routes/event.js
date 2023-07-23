const express = require('express');
const { getEvents, createEvent } = require('../controllers/event');

const eventRouter = express.Router();
const isAuth = require('../middleware/is-auth');

eventRouter.get('/api/events', isAuth, getEvents);

eventRouter.post('/api/event', isAuth, createEvent);

module.exports = eventRouter;

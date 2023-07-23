const express = require('express');
const { getEvents } = require('../controllers/event');

const eventRouter = express.Router();
const isAuth = require('../middleware/is-auth');

eventRouter.get('/api/events', isAuth, getEvents);

module.exports = eventRouter;

const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

const errorHandler = require('../../../src/middleware/error-handler');
const authRouter = require('../../../src/routes/auth');
const userRouter = require('../../../src/routes/user');
const donationRouter = require('../../../src/routes/donation');
const eventRouter = require('../../../src/routes/event');
const contactRouter = require('../../../src/routes/contact');
const emergencyRouter = require('../../../src/routes/emergency');
const participantRouter = require('../../../src/routes/participant');
const swaggerRouter = require('../../../src/docs/swagger');

function buildApp() {
	const app = express();
	app.use(cors());
	app.use(bodyParser.json());
	app.use(swaggerRouter);
	app.use(authRouter);
	app.use(userRouter);
	app.use(donationRouter);
	app.use(emergencyRouter);
	app.use(eventRouter);
	app.use(contactRouter);
	app.use(participantRouter);
	app.use(errorHandler);
	return app;
}

module.exports = { buildApp };

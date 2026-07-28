const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load environment configuration
require('dotenv').config();

// Import custom modules
const errorHandler = require('./middleware/error-handler');
const { requestLogger } = require('./middleware/request-logger');
const { securityHeaders } = require('./middleware/security-headers');
const config = require('./utils/config');
const { logger } = require('./utils/logger');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const donationRouter = require('./routes/donation');
const eventRouter = require('./routes/event');
const contactRouter = require('./routes/contact');
const emergencyRouter = require('./routes/emergency');
const participantRouter = require('./routes/participant');
const swaggerRouter = require('./docs/swagger');

const app = express();

// Rate limiting keys off req.ip. Behind a reverse proxy that resolves to the
// proxy's address, so every client would share a single bucket and one
// abuser would lock out everyone -- set TRUST_PROXY_HOPS to the number of
// proxies in front of the app. Off by default on purpose: trusting
// X-Forwarded-For when nothing sets it lets a caller spoof their IP and
// bypass the limits.
if (config.server.trustProxy !== false) {
	app.set('trust proxy', config.server.trustProxy);
}

// First, so every request gets an id and a log line even when a later
// middleware rejects it.
app.use(requestLogger());

app.use(securityHeaders());

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

app.use(express.static(path.join(__dirname, '../extranet/build')));

// Express 5's path-to-regexp requires wildcard route params to be named
// (bare '*' throws at registration time); '/*splat' matches the same set
// of paths the bare '*' did under Express 4.
app.get('/*splat', (req, res) => {
	res.sendFile(path.join(__dirname, '../extranet/build', 'index.html'));
});

// Use the error-handling middleware
app.use(errorHandler);

// A rejected promise or a throw outside a request handler used to end the
// process with nothing but Node's own stack on stderr, and an unhandled
// rejection leaves the app running in an unknown state. Record both through
// the logger so they reach the same place as everything else.
process.on('unhandledRejection', (reason) => {
	logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
	logger.fatal({ err }, 'Uncaught exception, shutting down');
	// The process is in an undefined state after this point; let the
	// supervisor restart it rather than serving from a broken one.
	process.exit(1);
});

// Database connection with configuration
mongoose
	.connect(
		`${config.database.host}://${config.database.user}:${config.database.password}@${config.database.name}.${config.database.sample}.mongodb.net/${config.database.name}?retryWrites=true&w=majority`
	)
	.then(() => {
		logger.info('Connected successfully to MongoDB server');
		app.listen(config.server.port, () => {
			logger.info({ port: config.server.port }, 'Server listening');
		});
	})
	.catch((err) => {
		// Without a database the app can serve nothing, so this is fatal
		// rather than a warning to scroll past.
		logger.fatal({ err }, 'MongoDB connection failed');
		process.exit(1);
	});

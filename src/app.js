const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load environment configuration
require('dotenv').config();

// Import custom modules
const errorHandler = require('./middleware/error-handler');
const config = require('./utils/config');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const donationRouter = require('./routes/donation');
const eventRouter = require('./routes/event');
const contactRouter = require('./routes/contact');
const emergencyRouter = require('./routes/emergency');
const participantRouter = require('./routes/participant');
const swaggerRouter = require('./docs/swagger');

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

app.use(express.static(path.join(__dirname, '../extranet/build')));

// Express 5's path-to-regexp requires wildcard route params to be named
// (bare '*' throws at registration time); '/*splat' matches the same set
// of paths the bare '*' did under Express 4.
app.get('/*splat', (req, res) => {
	res.sendFile(path.join(__dirname, '../extranet/build', 'index.html'));
});

// Use the error-handling middleware
app.use(errorHandler);

// Database connection with configuration
mongoose
	.connect(
		`${config.database.host}://${config.database.user}:${config.database.password}@${config.database.name}.${config.database.sample}.mongodb.net/${config.database.name}?retryWrites=true&w=majority`
	)
	.then((result) => {
		console.log('Connected successfully to MongoDB server');
		app.listen(config.server.port, () => {
			console.log(`Server running on port ${config.server.port}`);
		});
	})
	.catch((err) => {
		console.log('MongoDB connection error:', err);
	});

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

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(authRouter);
app.use(userRouter);
app.use(donationRouter);
app.use(emergencyRouter);
app.use(eventRouter);
app.use(contactRouter);

app.use(express.static(path.join(__dirname, '../extranet/build')));

app.get('*', (req, res) => {
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

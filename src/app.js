const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/error-handler');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const donationRouter = require('./routes/donation');
const eventRouter = require('./routes/event');
const contactRouter = require('./routes/contact');
const path = require('path');

const config = require('../config.json');

const dbConfig = config.dbConfig;

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(authRouter);
app.use(userRouter);
app.use(donationRouter);
app.use(eventRouter);
app.use(contactRouter);

app.use(express.static(path.join(__dirname, '../extranet/build')));

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../extranet/build', 'index.html'));
});

// Use the error-handling middleware
app.use(errorHandler);

mongoose
	.connect(
		`${dbConfig.host}://${dbConfig.user}:${dbConfig.password}@${dbConfig.name}.${dbConfig.sample}.mongodb.net/${dbConfig.name}?retryWrites=true&w=majority`
	)
	.then((result) => {
		console.log('Connected successfully to MongoDB server');
		app.listen(config.port);
	})
	.catch((err) => {
		console.log(err);
	});

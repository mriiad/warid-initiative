const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');
const donationRouter = require('./routes/donation');

const config = require('../config.json');

const dbConfig = config.dbConfig;

const app = express();

app.use(bodyParser.json());

const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];

app.use(
	cors({
		origin: function (origin, callback) {
			if (allowedOrigins.includes(origin) || !origin) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
	})
);

app.use(authRouter);

app.use(donationRouter);

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

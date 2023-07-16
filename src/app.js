const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');

const config = require('../config.json');

const dbConfig = config.dbConfig;

const app = express();

app.use(bodyParser.json());

app.use(authRouter);

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

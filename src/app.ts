import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import donorRouter from './routes/donor';

const config = require('../config.json');

const dbConfig = config.dbConfig;

const app = express();

app.use(bodyParser.json());

app.use(donorRouter);

console.log('config', config.dbConfig);

mongoose
	.connect(
		`${dbConfig.host}://${dbConfig.user}:${dbConfig.user}@${dbConfig.name}.b1dcpqn.mongodb.net/?retryWrites=true&w=majority`
	)
	.then((result) => {
		console.log('Connected successfully to MongoDB server');
		app.listen(config.port);
	})
	.catch((err) => {
		console.log(err);
	});

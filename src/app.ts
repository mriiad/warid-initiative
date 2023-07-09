import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import authRouter from './routes/auth';

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

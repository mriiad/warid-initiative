import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';

import donorRouter from './routes/donor';

const app = express();

app.use(bodyParser.json());

app.use(donorRouter);

mongoose
	.connect(
		'mongodb+srv://mriad:QtKZVOu22a170Bhs@warid.b1dcpqn.mongodb.net/?retryWrites=true&w=majority'
	)
	.then((result) => {
		console.log('Connected successfully to MongoDB server');
		app.listen(3000);
	})
	.catch((err) => {
		console.log(err);
	});

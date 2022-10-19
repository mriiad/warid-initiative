import bodyParser from 'body-parser';
import express from 'express';

import donorRouter from './routes/person';

const app = express();

app.use(bodyParser.json());

app.use(donorRouter);

app.listen(3000);
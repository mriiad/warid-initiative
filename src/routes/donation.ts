import { Router } from 'express';
import { donate } from '../controllers/donation';

const donationRouter = Router();

donationRouter.get('/', (req, res, next) => {});

donationRouter.put('/api/donate', donate);

export default donationRouter;

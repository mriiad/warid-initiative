import { Router } from "express";
import { body } from 'express-validator';
import { User } from "../models/user";
/**
 * Could contain news & other data from different resources (Event)
 */
const router = Router();

const authController = require('../controllers/auth');

router.put(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-Mail address already exists!');
                    }
                });
            })
        .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 5 }),
        body('phoneNumber')
            .trim()
            .isLength({ min: 10 }),
        body('name')
            .trim()
            .not()
            .isEmpty()
    ],
    authController.signup
    // TODO: call controller to save other data in Donor's collection
    );
    
    router.post('/login', authController.login);

export default router;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../controllers/auth");
const user_1 = require("../models/user");
/**
 * Could contain news & other data from different resources (Event)
 */
const authRouter = (0, express_1.Router)();
authRouter.put('/api/auth/signup', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
        return user_1.User.findOne({ email: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject('E-Mail address already exists!');
            }
        });
    })
        .normalizeEmail(),
    (0, express_validator_1.body)('password').trim().isLength({ min: 5 }),
    (0, express_validator_1.body)('phoneNumber').trim().isLength({ min: 10 }),
    (0, express_validator_1.body)('username')
        .trim()
        .not()
        .isEmpty()
        .custom((value, { req }) => {
        return user_1.User.findOne({ username: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject('The CIN already exists!');
            }
        });
    }),
], auth_1.signup
// TODO: call controller to save other data in Donor's collection
);
authRouter.post('/api/auth/login', auth_1.login);
authRouter.get('/api/auth/activation/:confirmationCode', auth_1.verifyUser);
exports.default = authRouter;

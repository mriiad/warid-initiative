"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_1 = require("../models/user");
/**
 * Could contain news & other data from different resources (Event)
 */
const router = (0, express_1.Router)();
const authController = require('../controllers/auth');
router.get('/', (req, res, next) => {
});
router.put('/signup', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
        return user_1.User.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-Mail address already exists!');
            }
        });
    })
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .trim()
        .isLength({ min: 5 }),
    (0, express_validator_1.body)('name')
        .trim()
        .not()
        .isEmpty()
], authController.signup);
router.post('/login', authController.login);
exports.default = router;

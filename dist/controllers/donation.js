"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donate = void 0;
const donation_1 = require("../models/donation");
const user_1 = require("../models/user");
const donate = (req, res, next) => {
    const body = req.body;
    const username = body.username;
    console.log('HERE 10');
    user_1.User.findOne({ username: username })
        .then((user) => {
        if (!user) {
            return res.status(404).send({ message: 'User Not found.' });
        }
        console.log('HERE 15');
        const userId = user._id;
        donation_1.Donation.findOne({ userId: userId })
            .then((donation) => {
            if (!donation) {
                return res
                    .status(404)
                    .send({ message: 'No donation data saved for this user.' });
            }
            console.log('HERE 24');
            const dt = todayDate();
            console.log('date today: ', dt);
            donation.lastDonationDate = dt;
            console.log('HERE 26');
            return donation.save();
        })
            .then((result) => {
            console.log('result: ', result);
            res.status(201).json({
                message: 'Donation saved!',
                userId: result._id,
            });
        })
            .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
    })
        .catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        console.log('error', err);
        next(err);
    });
};
exports.donate = donate;
const todayDate = () => {
    const date = new Date();
    return new Date(`${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`);
};

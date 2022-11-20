"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Donation = void 0;
const enums_1 = require("../utils/enums");
const mongoose_1 = require("mongoose");
const DonationSchema = new mongoose_1.Schema({
    bloodGroup: {
        type: String,
        enum: enums_1.BloodGroup,
        required: true,
    },
    lastDonationDate: {
        type: Date,
        required: false,
    },
    donationType: {
        type: String,
        enum: enums_1.DonationType,
        required: false,
    },
    nextDonationDate: {
        type: Date,
        required: false,
    },
    disease: {
        type: String,
        required: false,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});
exports.Donation = (0, mongoose_1.model)('Donation', DonationSchema);

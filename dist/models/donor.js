"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../utils/enums");
const mongoose_1 = require("mongoose");
const DonorSchema = new mongoose_1.Schema({
    cin: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    bloodGroup: {
        type: String,
        enum: enums_1.BloodGroup,
        required: true
    },
    lastDonationDate: {
        type: Date,
        required: false
    },
    donationType: {
        type: String,
        enum: enums_1.DonationType,
        required: false
    },
    nextDonationDate: {
        type: Date,
        required: false
    },
    disease: {
        type: String,
        required: false
    }
});
module.exports = (0, mongoose_1.model)('Donor', DonorSchema);

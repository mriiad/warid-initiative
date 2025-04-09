const Emergency = require("../models/emergency");
const ApiError = require("../utils/errors/ApiError");
const { STATUS_CODE } = require("../utils/errors/httpStatusCode");


// Get none confirmed emergencies
exports.getNotConfirmedEmergencies = async (req, res, next) => {
    try {
     
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = STATUS_CODE.INTERNAL_SERVER;
        }
        next(err);
    }
};
// Get all emergencies
exports.getEmergencies = async (req, res, next) => {
    try {
     
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = STATUS_CODE.INTERNAL_SERVER;
        }
        next(err);
    }
};
// Create new emergency
exports.createEmergency = async (req, res, next) => {
    try {
     
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = STATUS_CODE.INTERNAL_SERVER;
        }
        next(err);
    }
};

// Confirm emergency by id
exports.confirmEmergency = async (req, res, next) => {
    try {
     
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = STATUS_CODE.INTERNAL_SERVER;
        }
        next(err);
    }
};

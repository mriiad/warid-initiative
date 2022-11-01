"use strict";
class BaseError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
module.exports = BaseError;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
class BaseError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.BaseError = BaseError;

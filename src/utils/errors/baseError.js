export class BaseError extends Error {
	statusCode;
	constructor(statusCode, message) {
		super(message);

		this.statusCode = statusCode;
		Error.captureStackTrace(this);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

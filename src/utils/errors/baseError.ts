export class BaseError extends Error {
	statusCode: Number;
	constructor(statusCode: Number, message: string) {
		super(message);

		this.statusCode = statusCode;
		Error.captureStackTrace(this);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

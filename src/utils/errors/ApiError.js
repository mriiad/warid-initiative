class ApiError extends Error {
	constructor(message, statusCode, errorKeys = []) {
		super(message);
		this.statusCode = statusCode;
		this.errorKeys = errorKeys;
		Error.captureStackTrace(this, this.constructor);
	}

	getErrorResponse() {
		return {
			errorMessage: this.message,
			errorKeys: this.errorKeys || [],
		};
	}
}

module.exports = ApiError;

class ApiError extends Error {
	constructor(message, statusCode, details = null, errorKeys = []) {
		super(message);
		this.statusCode = statusCode;
		this.details = details;
		this.errorKeys = errorKeys;
		Error.captureStackTrace(this, this.constructor);
	}

	getErrorResponse() {
		return {
			errorMessage: this.message,
			details: this.details || null,
			errorKeys: this.errorKeys || [],
		};
	}
}

module.exports = ApiError;

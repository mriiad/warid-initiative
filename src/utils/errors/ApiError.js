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
			error: this.message,
			detail: this.details || null,
			errorKeys: this.errorKeys || [],
		};
	}
}

module.exports = ApiError;

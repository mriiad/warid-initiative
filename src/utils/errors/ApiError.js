class ApiError extends Error {
	constructor(message, statusCode, errorKeys = []) {
		super(message);
		this.statusCode = statusCode;
		this.errorKeys = errorKeys;
		Error.captureStackTrace(this, this.constructor);
	}

	getErrorResponse() {
		// `message` + `statusCode`, matching what the error middleware sends
		// for everything else. This used to return `errorMessage` instead,
		// which meant the API had two different error shapes depending on
		// which controller you happened to hit -- and the frontend's shared
		// error toast only ever looked for `message`, so every ApiError
		// endpoint (donations, emergencies, events) silently degraded to a
		// generic "an error occurred" instead of the real reason.
		return {
			message: this.message,
			statusCode: this.statusCode,
			errorKeys: this.errorKeys || [],
		};
	}
}

module.exports = ApiError;

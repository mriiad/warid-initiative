class ApiError extends Error {
	/**
	 * `code` and `params` are optional and additive: a client that recognises
	 * the code renders its own translated copy, and anything else keeps
	 * reading `message` exactly as before. That's what lets endpoints be
	 * tagged one at a time instead of in a flag day. See issue #434.
	 */
	constructor(message, statusCode, errorKeys = [], code = null, params = null) {
		super(message);
		this.statusCode = statusCode;
		this.errorKeys = errorKeys;
		this.code = code;
		this.params = params;
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
			// Omitted entirely when absent, so an untagged error serialises to
			// byte-identical JSON and no existing client sees a change.
			...(this.code ? { code: this.code } : {}),
			...(this.params ? { params: this.params } : {}),
		};
	}
}

module.exports = ApiError;

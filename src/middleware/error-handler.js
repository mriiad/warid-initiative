const ApiError = require('../utils/errors/ApiError');
const { logger } = require('../utils/logger');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

const GENERIC_SERVER_ERROR = 'Something went wrong. Please try again later.';

const errorMiddleware = (error, req, res, next) => {
	if (!error.statusCode) {
		error.statusCode = STATUS_CODE.INTERNAL_SERVER;
	}

	const isServerError = error.statusCode >= STATUS_CODE.INTERNAL_SERVER;

	// Until now a 500 was answered and forgotten -- nothing recorded it, so a
	// failure in production left no trace to investigate. Server errors are
	// logged with the stack; client errors are ordinary traffic (a rejected
	// login, a stale reference) and are recorded at warn without one.
	const context = {
		statusCode: error.statusCode,
		method: req.method,
		url: req.originalUrl,
		// Set by request-logger, so a user's report can be traced to a request.
		requestId: req.id,
		// token-check attaches this; absent on public routes.
		userId: req.userId,
	};

	if (isServerError) {
		logger.error(
			{ ...context, err: error },
			`Unhandled error on ${req.method} ${req.originalUrl}`
		);
	} else {
		logger.warn(
			{ ...context, reason: error.message },
			`Request rejected on ${req.method} ${req.originalUrl}`
		);
	}

	if (error instanceof ApiError) {
		// Deliberate, user-facing messages -- returned as written.
		return res.status(error.statusCode).json(error.getErrorResponse());
	}

	res.status(error.statusCode).json({
		// Anything that isn't an ApiError is an internal failure that was never
		// written for a user to read. Returning error.message handed clients raw
		// driver output ("Cast to ObjectId failed for value ..."), describing the
		// schema to anyone probing. The detail is in the log above instead,
		// findable by requestId.
		message: isServerError ? GENERIC_SERVER_ERROR : error.message,
		statusCode: error.statusCode,
	});
};

module.exports = errorMiddleware;
module.exports.GENERIC_SERVER_ERROR = GENERIC_SERVER_ERROR;

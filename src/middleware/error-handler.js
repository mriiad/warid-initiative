const ApiError = require('../utils/errors/ApiError');
const { logger } = require('../utils/logger');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

const GENERIC_SERVER_ERROR = 'Something went wrong. Please try again later.';

// Mongoose's own errors never carry a statusCode or the ApiError shape, so
// without this they fall straight into the generic 500 branch below -- a
// missing/invalid field (createEmergency has no express-validator of its
// own; a duplicate email on updateUserById/updateUserProfile) produced
// "Something went wrong" instead of a message describing what was actually
// wrong. Translated once, centrally, here rather than patched into every
// controller that can hit one. See issue #368.
const translateMongooseError = (error) => {
	if (error.name === 'ValidationError') {
		// The first failing field's own message -- already human-written where
		// the schema defines one (e.g. Emergency's `required: [true, 'Blood
		// group is required']`), and a reasonable default otherwise (Mongoose's
		// own "`x` is not a valid enum value for path `y`." for a bad enum).
		const firstMessage =
			Object.values(error.errors || {})[0]?.message || error.message;
		return new ApiError(firstMessage, STATUS_CODE.BAD_REQUEST);
	}

	if (error.code === 11000) {
		// The raw driver message names the index/collection, not something a
		// user should see ("E11000 duplicate key error collection: ..."). The
		// field name from keyPattern/keyValue is enough to say what happened.
		const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
		const message = field
			? `That ${field} is already in use.`
			: 'This value is already in use.';
		return new ApiError(message, STATUS_CODE.CONFLICT);
	}

	return error;
};

const errorMiddleware = (error, req, res, next) => {
	error = translateMongooseError(error);

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

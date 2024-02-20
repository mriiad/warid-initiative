const ApiError = require('../utils/errors/ApiError');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

const errorMiddleware = (error, req, res, next) => {
	if (!error.statusCode) {
		error.statusCode = STATUS_CODE.INTERNAL_SERVER;
	}

	if (error instanceof ApiError) {
		// Send JSON response for ApiError instances
		return res.status(error.statusCode).json(error.getErrorResponse());
	}

	// Handle other types of errors
	res.status(error.statusCode).json({
		message: error.message,
		statusCode: error.statusCode,
	});
};

module.exports = errorMiddleware;

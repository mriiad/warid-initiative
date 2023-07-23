const Event = require('../models/event');
const User = require('../models/user');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

/**
 *
 * This is a method to retrieve all events
 */
exports.getEvents = (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 5;
	let totalItems;
	Event.find()
		.countDocuments()
		.then((count) => {
			totalItems = count;
			return Event.find()
				.skip((currentPage - 1) * perPage)
				.limit(perPage);
		})
		.then((events) => {
			res.status(STATUS_CODE.OK).json({
				message: 'Fetched posts successfully.',
				events: events,
				totalItems: totalItems,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			}
			next(err);
		});
};

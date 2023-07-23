const Event = require('../models/event');
const User = require('../models/user');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { validationResult } = require('express-validator');

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

exports.createEvent = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, entered data is incorrect.');
		error.statusCode = STATUS_CODE.UNPROCESSABLE_ENTITY;
		throw error;
	}
	// TODO: add a custom validator to check if the user isAdmin and call it in all the required requests
	User.findOne({ _id: req.userId }).then((user) => {
		if (!user) {
			return res
				.status(STATUS_CODE.NOT_FOUND)
				.send({ message: 'User Not found.' });
		}
		if (!user.isAdmin) {
			return res
				.status(STATUS_CODE.FORBIDDEN)
				.send({ message: 'User must be an Admin to call this API.' });
		}
	});
	const { title, subtitle, location, mapLink } = req.body;
	const event = new Event({
		title: title,
		subtitle: subtitle,
		location: location,
		mapLink: mapLink,
	});
	event
		.save()
		.then((result) => {
			return res.status(STATUS_CODE.CREATED).json({
				message: 'Event created successfully!',
				post: event,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			}
			next(err);
		});
};

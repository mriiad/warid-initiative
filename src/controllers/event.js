const Event = require('../models/event');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { validationResult } = require('express-validator');
const { checkIfAdmin } = require('../utils/checks');

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
	const { title, subtitle, location, date, mapLink } = req.body;
	const reference = `WEVENT${date.replaceAll('-', '')}`;
	Event.findOne({ reference: reference }).then((event) => {
		if (event) {
			return res.status(STATUS_CODE.FORBIDDEN).send({
				message: `An event with the same reference ${reference} is already created.`,
			});
		}
	});
	const event = new Event({
		reference: reference,
		title: title,
		subtitle: subtitle,
		location: location,
		date: date,
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

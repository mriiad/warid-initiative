const event = require('../models/event');
const Event = require('../models/event');
const User = require('../models/user');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');
const user = require('../models/user');

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
	const { title, subtitle, image, location, date, mapLink } = req.body;
	const { path } = req.file;

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
		image: fs.readFileSync(path),
		location: location,
		date: date,
		mapLink: mapLink,
	});
	event
		.save()
		.then((result) => {
			fs.unlink(path, function (err) {
				if (err) return console.log(err);
				console.log('file deleted successfully');
			});
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

exports.deleteEvent = (req, res, next) => {
	const { reference } = req.body;

	Event.findOneAndDelete({ reference: reference })
		.then((deletedEvent) => {
			if (!deletedEvent) {
				return res.status(STATUS_CODE.NOT_FOUND).json({
					message: `Event with reference ${reference} not found.`,
				});
			}

			deletedEvent.attendees.map((userId) =>
				User.findByIdAndUpdate(userId, { $pull: { events: deletedEvent._id } })
			);

			return res.status(STATUS_CODE.OK).json({
				message: 'Event deleted successfully!',
				deletedEvent: deletedEvent,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			}
			next(err);
		});
};

exports.confirmPresence = (req, res, next) => {
	const { reference } = req.body;
	console.log('reference', reference);
	User.findById(req.userId)
		.then((user) => {
			Event.findOne({ reference: reference })
				.then((event) => {
					if (!event) {
						return res.status(STATUS_CODE.NOT_FOUND).json({
							message: `Event with reference ${reference} not found.`,
						});
					}
					console.log('event', event);
					console.log('user', user);

					const eventExists = user.events.find(
						(ev) => ev.toString() == event.id
					);
					if (!eventExists) {
						user.events.push(event);
					}
					const userExists = event.attendees.find(
						(us) => us.toString() == user.id
					);
					if (!userExists) event.attendees.push(user);

					event.save();
					return user.save();
				})
				.then((result) => {
					res.status(STATUS_CODE.OK).json({
						message: 'Successfully added to attendees list!',
					});
				})
				.catch((err) => {
					if (!err.statusCode) {
						err.statusCode = STATUS_CODE.INTERNAL_SERVER;
					}
					next(err);
				});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			}
			console.log('error', err);
			next(err);
		});
};

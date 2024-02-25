const event = require('../models/event');
const Event = require('../models/event');
const User = require('../models/user');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/errors/ApiError');

/**
 *
 * This is a method to retrieve all events
 */
exports.getEvents = async (req, res, next) => {
	try {
		const currentPage = Number(req.query.page) || 1;
		const perPage = 5;

		const totalItems = await Event.countDocuments();

		const events = await Event.find()
			.skip((currentPage - 1) * perPage)
			.limit(perPage)
			.lean();

		events.forEach((event) => {
			if (event.image) {
				event.image = event.image.toString('base64');
			}
		});

		res.status(STATUS_CODE.OK).json({
			message: 'Fetched posts successfully.',
			events: events,
			totalItems: totalItems,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = STATUS_CODE.INTERNAL_SERVER;
		}
		next(err);
	}
};

exports.getEvent = async (req, res, next) => {
	const eventReference = req.params.reference;

	try {
		const event = await Event.findOne({ reference: eventReference }).lean();

		if (!event) {
			const error = new Error('Event not found.');
			error.statusCode = STATUS_CODE.NOT_FOUND;
			throw error;
		}

		if (event.image) {
			event.image = event.image.toString('base64');
		}

		res.status(STATUS_CODE.OK).json({
			message: 'Event fetched successfully.',
			event: event,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = STATUS_CODE.INTERNAL_SERVER;
		}
		next(err);
	}
};

exports.createEvent = async (req) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throw new ApiError(
				'Validation failed, entered data is incorrect.',
				STATUS_CODE.UNPROCESSABLE_ENTITY,
				errors.array().map((e) => e.param)
			);
		}

		if (req.fileValidationError) {
			throw new ApiError(
				'File too large. Please upload a file smaller than 5MB.',
				STATUS_CODE.PAYLOAD_TOO_LARGE
			);
		}

		const { title, subtitle, location, date, mapLink, description } = req.body;
		let eventImage = null;

		if (req.file && req.file.path) {
			eventImage = fs.readFileSync(req.file.path);
		}

		const reference = `WEVENT${date.replaceAll('-', '')}`;

		const existingEvent = await Event.findOne({ reference: reference });
		if (existingEvent) {
			throw new ApiError(
				`An event with the same reference ${reference} is already created.`,
				STATUS_CODE.FORBIDDEN
			);
		}

		const newEvent = new Event({
			reference: reference,
			title: title,
			subtitle: subtitle,
			image: eventImage,
			location: location,
			date: date,
			mapLink: mapLink,
			description: description,
		});

		const result = await newEvent.save();

		if (req.file && req.file.path) {
			const filePath = path.join(__dirname, '../..', req.file.path); // Adjust the path as needed
			fs.unlink(filePath, (err) => {
				if (err) {
					console.error('Failed to delete file:', err);
				}
			});
		}

		return result;
	} catch (err) {
		throw err;
	}
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

			// Collect all the promises in an array
			const updatePromises = deletedEvent.attendees.map((userId) =>
				User.updateOne(
					{ _id: mongoose.Types.ObjectId(userId) },
					{ $pull: { events: deletedEvent._id } }
				)
			);

			// Promise.all to wait for all updates to complete
			Promise.all(updatePromises)
				.then(() => {
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

	let fetchedEvent;
	Event.findOne({ reference: reference })
		.then((event) => {
			if (!event) {
				throw new ApiError(
					`Event with reference ${reference} not found.`,
					STATUS_CODE.NOT_FOUND,
					['reference']
				);
			}
			fetchedEvent = event;

			return User.findById(req.userId);
		})
		.then((user) => {
			// Check if user is already part of the event
			const isAlreadyParticipating = user.events.some(
				(eventId) => eventId.toString() === fetchedEvent._id.toString()
			);

			if (isAlreadyParticipating) {
				throw new ApiError("أنت بالفعل مشارك في هذه الفعالية!", 403);
			}

			// Fetch all events the user is participating in
			return Event.find({ _id: { $in: user.events } });
		})
		.then((events) => {
			// Check if the user is participating in any future events
			const futureEvent = events.find((event) => event.date > new Date());

			if (futureEvent) {
				const { title, reference, date } = futureEvent;
				throw new ApiError(
					`أنت بالفعل مشارك في فعالية مستقبلية أخرى: ${reference}`,
					403
				);
			}

			fetchedEvent.attendees.push(req.userId);

			return fetchedEvent.save();
		})
		.then(() => {
			res.status(STATUS_CODE.OK).json({
				message: '!تمت إضافتك بنجاح إلى قائمة المشاركين ',
			});
		})
		.catch((err) => {
			const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER;

			res.status(statusCode).json(err.getErrorResponse());
		});
};

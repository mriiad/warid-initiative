const event = require('../models/event');
const Event = require('../models/event');
const User = require('../models/user');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/errors/ApiError');
const QRCode = require('qrcode');
const Donation = require('../models/donation');

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

		const { title, subtitle, location, date, mapLink, description, isGeneric } =
			req.body;
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

		// Generate QR code for the event
		const eventUrl = `${process.env.FRONTEND_URL}/events/${reference}`;
		const qrCode = await generateQRCode(eventUrl);

		const newEvent = new Event({
			reference: reference,
			title: title,
			subtitle: subtitle,
			image: eventImage,
			location: location,
			date: date,
			mapLink: mapLink,
			description: description,
			isGeneric: isGeneric === 'true' || isGeneric === true,
			qrCode: qrCode,
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

			// Find and update all donations linked to this event
			return Donation.find({ eventId: deletedEvent._id }).then((donations) => {
				if (donations.length === 0) {
					return { deletedEvent };
				}

				// Find a generic event to link donations to
				return Event.findOne({ isGeneric: true }).then((genericEvent) => {
					if (!genericEvent) {
						throw new ApiError(
							'Cannot delete event: No generic event found to link existing donations',
							STATUS_CODE.CONFLICT
						);
					}

					// Update all donations to point to the generic event
					const updatePromises = donations.map((donation) =>
						Donation.updateOne(
							{ _id: donation._id },
							{ eventId: genericEvent._id }
						)
					);

					return Promise.all(updatePromises).then(() => ({ deletedEvent }));
				});
			});
		})
		.then(({ deletedEvent }) => {
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

			// Check if user already has a donation linked to this event
			return Donation.findOne({
				userId: req.userId,
				eventId: fetchedEvent._id,
			});
		})
		.then((existingDonation) => {
			if (existingDonation) {
				throw new ApiError("You're already participating in this event!", 403);
			}

			// Check if user is participating in a future event through any donations
			return Donation.aggregate([
				{
					$lookup: {
						from: 'events',
						localField: 'eventId',
						foreignField: '_id',
						as: 'event',
					},
				},
				{
					$match: {
						userId: mongoose.Types.ObjectId(req.userId),
						'event.date': { $gt: new Date() },
						'event.isGeneric': false,
					},
				},
			]);
		})
		.then((futureDonations) => {
			if (futureDonations.length > 0) {
				const event = futureDonations[0].event[0];
				throw new ApiError(
					`You're already participating in another future event: ${event.reference}`,
					403
				);
			}

			fetchedEvent.attendees.push(req.userId);
			return fetchedEvent.save();
		})
		.then(() => {
			res.status(STATUS_CODE.OK).json({
				message: 'Successfully added to attendees list!',
			});
		})
		.catch((err) => {
			const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER;
			res.status(statusCode).json(err.getErrorResponse());
		});
};

const generateQRCode = async (url) => {
	try {
		return await QRCode.toDataURL(url);
	} catch (error) {
		console.error('Error generating QR code:', error);
		throw new ApiError(
			'Failed to generate QR code for event',
			STATUS_CODE.INTERNAL_SERVER
		);
	}
};

exports.createEventHandler = async (req, res, next) => {
	try {
		const result = await exports.createEvent(req);
		res.status(STATUS_CODE.CREATED).json({
			message: 'Event created successfully!',
			event: {
				reference: result.reference,
				_id: result._id,
			},
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = STATUS_CODE.INTERNAL_SERVER;
		}
		next(err);
	}
};

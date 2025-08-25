const Event = require('../models/event');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/errors/ApiError');
const QRCode = require('qrcode');
const Donation = require('../models/donation');

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
			events,
			totalItems,
		});
	} catch (err) {
		if (!err.statusCode) err.statusCode = STATUS_CODE.INTERNAL_SERVER;
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
		if (event.image) event.image = event.image.toString('base64');
		res
			.status(STATUS_CODE.OK)
			.json({ message: 'Event fetched successfully.', event });
	} catch (err) {
		if (!err.statusCode) err.statusCode = STATUS_CODE.INTERNAL_SERVER;
		next(err);
	}
};

exports.createEvent = async (req) => {
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

	// Parse and validate date
	let eventDate = date instanceof Date ? date : new Date(date);

	if (isNaN(eventDate.getTime())) {
		throw new ApiError(
			`Invalid date format provided. Received: "${date}"`,
			STATUS_CODE.BAD_REQUEST,
			['date']
		);
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// Prevent creating events in the past
	if (eventDate < today) {
		throw new ApiError(
			'Cannot create events in the past. Please select a future date.',
			STATUS_CODE.BAD_REQUEST,
			['date']
		);
	}

	const dateStr = eventDate.toISOString().slice(0, 10).replace(/-/g, '');
	const reference = `WEVENT${dateStr}`;

	// Check if an event already exists for this date
	if (await Event.exists({ reference })) {
		throw new ApiError(
			'An event already exists for this date. Please choose a different date.',
			STATUS_CODE.CONFLICT,
			['date']
		);
	}

	const frontend = process.env.FRONTEND_URL || 'http://localhost:3001';
	const generic = isGeneric === 'true' || isGeneric === true;
	const eventUrl = generic
		? `${frontend}/donate?eventRef=${reference}`
		: `${frontend}/donate?eventRef=${reference}&eventDate=${encodeURIComponent(
				eventDate.toISOString().slice(0, 10)
		  )}`;

	const qrCode = await QRCode.toDataURL(eventUrl);

	const newEvent = new Event({
		reference,
		title,
		subtitle,
		image: eventImage,
		location,
		date: eventDate,
		mapLink,
		description,
		isGeneric: generic,
		qrCode,
	});

	const result = await newEvent.save();

	if (req.file && req.file.path) {
		const filePath = path.join(__dirname, '../..', req.file.path);
		fs.unlink(filePath, (err) => {
			if (err) console.error('Failed to delete file:', err);
		});
	}

	return result;
};

exports.createEventHandler = async (req, res, next) => {
	try {
		const result = await exports.createEvent(req);
		res.status(STATUS_CODE.CREATED).json({
			message: 'Event created successfully!',
			event: { reference: result.reference, _id: result._id },
		});
	} catch (err) {
		if (!err.statusCode) err.statusCode = STATUS_CODE.INTERNAL_SERVER;
		next(err);
	}
};

exports.updateEvent = async (req) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new ApiError(
			'Validation failed, entered data is incorrect.',
			STATUS_CODE.UNPROCESSABLE_ENTITY,
			errors.array().map((e) => e.param)
		);
	}

	const { reference } = req.params;
	const { title, subtitle, location, date, mapLink, description, isGeneric } =
		req.body;

	console.log('Request body:', req.body);
	console.log('Date field:', date, typeof date);

	let updateEventDate = date instanceof Date ? date : new Date(date);

	if (isNaN(updateEventDate.getTime())) {
		throw new ApiError(
			`Invalid date format provided. Received: "${date}", Parsed: ${updateEventDate}`,
			STATUS_CODE.BAD_REQUEST,
			['date']
		);
	}

	// Validate date is not in the past
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (updateEventDate < today) {
		throw new ApiError(
			'Cannot update event to a past date. Please select a future date.',
			STATUS_CODE.BAD_REQUEST,
			['date']
		);
	}

	// Check if event exists
	const existingEvent = await Event.findOne({ reference });
	if (!existingEvent) {
		throw new ApiError(
			`Event with reference ${reference} not found.`,
			STATUS_CODE.NOT_FOUND
		);
	}

	// Check if another event exists on the new date (if date is being changed)
	const existingDateStr = existingEvent.date.toISOString().split('T')[0];
	const newDateStr = updateEventDate.toISOString().split('T')[0];

	if (newDateStr !== existingDateStr) {
		const dateStr = newDateStr.replace(/-/g, '');
		const newReference = `WEVENT${dateStr}`;

		// Check if another event exists with the new reference
		const conflictingEvent = await Event.findOne({ reference: newReference });
		if (conflictingEvent) {
			throw new ApiError(
				'An event already exists for this date. Please choose a different date.',
				STATUS_CODE.CONFLICT,
				['date']
			);
		}
	}

	let eventImage = existingEvent.image;
	if (req.file && req.file.path) {
		eventImage = fs.readFileSync(req.file.path);
	}

	const generic = isGeneric === 'true' || isGeneric === true;
	const eventUrl = generic
		? `${
				process.env.FRONTEND_URL || 'http://localhost:3001'
		  }/donate?eventRef=${reference}`
		: `${
				process.env.FRONTEND_URL || 'http://localhost:3001'
		  }/donate?eventRef=${reference}&eventDate=${encodeURIComponent(
				updateEventDate.toISOString().slice(0, 10)
		  )}`;

	const qrCode = await QRCode.toDataURL(eventUrl);

	// Update the event
	console.log(
		'About to save date to DB:',
		updateEventDate,
		typeof updateEventDate
	);
	const updatedEvent = await Event.findOneAndUpdate(
		{ reference },
		{
			title,
			subtitle,
			image: eventImage,
			location,
			date: updateEventDate,
			mapLink,
			description,
			isGeneric: generic,
			qrCode,
		},
		{ new: true }
	);
	console.log(
		'Saved event date:',
		updatedEvent?.date,
		typeof updatedEvent?.date
	);

	// Clean up uploaded file if it was processed
	if (req.file && req.file.path) {
		const filePath = path.join(__dirname, '../..', req.file.path);
		fs.unlink(filePath, (err) => {
			if (err) console.error('Failed to delete file:', err);
		});
	}

	return updatedEvent;
};

exports.updateEventHandler = async (req, res, next) => {
	try {
		const result = await exports.updateEvent(req);
		res.status(STATUS_CODE.OK).json({
			message: 'Event updated successfully!',
			event: {
				reference: result.reference,
				_id: result._id,
				title: result.title,
				subtitle: result.subtitle,
				location: result.location,
				date: result.date,
				mapLink: result.mapLink,
				description: result.description,
				isGeneric: result.isGeneric,
			},
		});
	} catch (err) {
		if (!err.statusCode) err.statusCode = STATUS_CODE.INTERNAL_SERVER;
		next(err);
	}
};

exports.deleteEvent = (req, res, next) => {
	const { reference } = req.body;
	Event.findOneAndDelete({ reference })
		.then((deletedEvent) => {
			if (!deletedEvent) {
				return res.status(STATUS_CODE.NOT_FOUND).json({
					message: `Event with reference ${reference} not found.`,
				});
			}
			return Donation.find({ eventId: deletedEvent._id }).then((donations) => {
				if (donations.length === 0) {
					return { deletedEvent };
				}
				return Event.findOne({ isGeneric: true }).then((genericEvent) => {
					if (!genericEvent) {
						throw new ApiError(
							'Cannot delete event: No generic event found to link existing donations',
							STATUS_CODE.CONFLICT
						);
					}
					const updatePromises = donations.map((donation) =>
						Donation.findByIdAndUpdate(donation._id, {
							eventId: genericEvent._id,
						})
					);
					return Promise.all(updatePromises).then(() => ({ deletedEvent }));
				});
			});
		})
		.then(({ deletedEvent }) => {
			res.status(STATUS_CODE.OK).json({
				message: 'Event deleted successfully.',
				event: { reference: deletedEvent.reference, _id: deletedEvent._id },
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			next(err);
		});
};

exports.confirmPresence = (req, res, next) => {
	const { reference } = req.body;
	let fetchedEvent;
	Event.findOne({ reference })
		.then((event) => {
			if (!event) {
				throw new ApiError(
					`Event with reference ${reference} not found.`,
					STATUS_CODE.NOT_FOUND,
					['reference']
				);
			}
			fetchedEvent = event;
			return Donation.findOne({
				userId: req.userId,
				eventId: fetchedEvent._id,
			});
		})
		.then((existingDonation) => {
			if (existingDonation) {
				throw new ApiError(
					'User has already confirmed presence for this event.',
					STATUS_CODE.CONFLICT
				);
			}
			const donation = new Donation({
				userId: req.userId,
				eventId: fetchedEvent._id,
				type: 'PRESENCE',
				createdAt: new Date(),
			});
			return donation.save();
		})
		.then(() => {
			res
				.status(STATUS_CODE.OK)
				.json({ message: 'Presence confirmed successfully.' });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = STATUS_CODE.INTERNAL_SERVER;
			next(err);
		});
};

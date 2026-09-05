const Event = require('../models/event');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/errors/ApiError');
const QRCode = require('qrcode');
const Donation = require('../models/donation');
const Participant = require('../models/participant');
const { logger } = require('../utils/logger');

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
			events,
			totalItems,
		});
	} catch (err) {
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

		// Check if user is an Event Admin or Principal Admin to include the QR
		// code. This endpoint is public, so it can't sit behind requireAdminRole
		// as route middleware -- it decodes the token itself, inline, and used
		// to check only isAdmin, granting QR-code visibility to any admin role
		// (including Emergency Admin, who should have none). Reuses the same
		// role check requireAdminRole enforces everywhere else. See #371.
		let includeQRCode = false;
		const authHeader = req.headers['authorization'];

		if (authHeader) {
			const token = authHeader.split(' ')[1];
			if (token) {
				try {
					const jwt = require('jsonwebtoken');
					const config = require('../utils/config');
					const decodedToken = jwt.verify(token, config.auth.jwtSecretKey);
					if (decodedToken && decodedToken.userId) {
						const User = require('../models/user');
						const { hasAdminRole } = require('../utils/requireAdminRole');
						const user = await User.findById(decodedToken.userId).lean();
						if (hasAdminRole(user, ['event'])) {
							includeQRCode = true;
						}
					}
				} catch {
					// Token is invalid, continue without QR code
				}
			}
		}

		// Remove QR code from response if user is not admin
		if (!includeQRCode && event.qrCode) {
			delete event.qrCode;
		}

		res
			.status(STATUS_CODE.OK)
			.json({ message: 'Event fetched successfully.', event });
	} catch (err) {
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
			if (err) logger.error({ err }, 'Failed to delete uploaded file');
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

	// Prevent date changes to maintain reference consistency
	const existingDateStr = existingEvent.date.toISOString().split('T')[0];
	const newDateStr = updateEventDate.toISOString().split('T')[0];

	if (newDateStr !== existingDateStr) {
		throw new ApiError(
			'Cannot change event date as it would create inconsistency with the event reference. The date is fixed when the event is created.',
			STATUS_CODE.BAD_REQUEST,
			['date']
		);
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

	// Clean up uploaded file if it was processed
	if (req.file && req.file.path) {
		const filePath = path.join(__dirname, '../..', req.file.path);
		fs.unlink(filePath, (err) => {
			if (err) logger.error({ err }, 'Failed to delete uploaded file');
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
		// Donations are reassigned above so donation history/eligibility stays
		// intact, but nothing cleaned up Participant records for the deleted
		// event -- left dangling, referencing an eventId that no longer exists.
		// See #375.
		.then(({ deletedEvent }) =>
			Participant.deleteMany({ eventId: deletedEvent._id }).then(() => ({
				deletedEvent,
			}))
		)
		.then(({ deletedEvent }) => {
			res.status(STATUS_CODE.OK).json({
				message: 'Event deleted successfully.',
				event: { reference: deletedEvent.reference, _id: deletedEvent._id },
			});
		})
		.catch((err) => {
			next(err);
		});
};

// Records that a donor turned up at an event. This is deliberately a
// Participant and not a Donation: the rest of the app treats a Donation as
// "actually gave blood" (getEventParticipantDetails counts them as
// allDonaters, and checkDonationEligibility starts a 60/90-day rest period
// from one), whereas donors only reach this screen when they *can't* donate.
// Writing a Donation here would inflate donor counts and lock the donor out
// of a real donation later.
exports.confirmPresence = async (req, res, next) => {
	try {
		const { eventId } = req.body;
		if (!eventId) {
			throw new ApiError(
				'An event is required to confirm presence.',
				STATUS_CODE.BAD_REQUEST,
				['eventId']
			);
		}

		const event = await Event.findById(eventId);
		if (!event) {
			throw new ApiError(
				`Event with id ${eventId} not found.`,
				STATUS_CODE.NOT_FOUND,
				['eventId']
			);
		}

		const existing = await Participant.findOne({
			userId: req.userId,
			eventId: event._id,
		});
		if (existing) {
			throw new ApiError(
				'User has already confirmed presence for this event.',
				STATUS_CODE.CONFLICT
			);
		}

		const participant = new Participant({
			userId: req.userId,
			eventId: event._id,
		});
		await participant.save();

		res
			.status(STATUS_CODE.OK)
			.json({ message: 'Presence confirmed successfully.' });
	} catch (err) {
		next(err);
	}
};

exports.getEventParticipantDetails = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const event = await Event.findOne({ reference }).lean();
    if (!event) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        message: `Event with reference ${reference} not found.`,
      });
    }

    const eventId = event._id;

    // Handle generic event
    if (event.isGeneric) {
      // $ne: null excludes donations whose donor was deleted (issue #406).
      // distinct() folds every one of them into a single null, so counting
      // them here would report "1 donor" for any number of them. They are
      // deliberately not added back: for the generic event a donor can give
      // repeatedly over the years, so once the id is gone those rows can no
      // longer be attributed to distinct people. This counts identifiable
      // donors and never invents one. The donations themselves still count
      // toward getAdminStats.totalDonations.
      const allDonaters = await Donation.distinct('userId', {
        eventId,
        userId: { $ne: null },
      });

      return res.status(STATUS_CODE.OK).json({
        message: 'Generic event participant details fetched successfully.',
        eventReference: reference,
		isGeneric: true, 
        allDonaters: allDonaters.length,
      });
    }

    // Non-generic event stats
    // Same exclusion as the generic branch above -- see issue #406.
    const allDonaters = await Donation.distinct('userId', {
      eventId,
      userId: { $ne: null },
    });
    const registeredParticipants = await Participant.countDocuments({ eventId });
    const participantUserIds = await Participant.find({ eventId }).distinct('userId');

    const realDonaters = await Donation.distinct('userId', {
      eventId,
      userId: { $in: participantUserIds },
    });

    return res.status(STATUS_CODE.OK).json({
      message: 'Event participant details fetched successfully.',
      eventReference: reference,
	  isGeneric: false, 
      allDonaters: allDonaters.length,
      registeredParticipants,
      realDonaters: realDonaters.length,
    });
  } catch (err) {
    next(err);
  }
};

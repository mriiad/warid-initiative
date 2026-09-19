const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');

const {
	getEvents,
	getEvent,
	createEventHandler,
	updateEventHandler,
	confirmPresence,
	deleteEvent,
	getEventParticipantDetails
} = require('../controllers/event');
const { isAuth } = require('../middleware/token-check');
const requireAdminRole = require('../utils/requireAdminRole');
const ApiError = require('../utils/errors/ApiError');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

const eventRouter = express.Router();

// Event Admin or Principal Admin (see issue #183).
const requireEventAdmin = requireAdminRole(['event']);

// Events no longer carry an image (issue #461), so nothing is written to
// disk any more -- no storage engine, no 'uploads/' directory, and no
// fileFilter.
//
// multer stays because the create and update forms still post
// `multipart/form-data`, and express's JSON body parser cannot read that:
// without something to parse the body, every text field would arrive
// undefined and the validators would reject the whole request. `.none()` is
// exactly that -- it parses the text fields and accepts no files.
const parseFormFields = multer().none();

// multer's own errors run before createEventHandler/updateEventHandler ever
// see the request, so a raw error would reach the shared error handler
// unconverted and produce a generic "Something went wrong". Translate it
// here instead. The case that reaches this now is a client still attaching
// a file -- a browser tab left open across the deploy that removed the
// field -- which multer rejects as LIMIT_UNEXPECTED_FILE. See #370, #461.
const handleFormFields = (req, res, next) => {
	parseFormFields(req, res, (err) => {
		if (!err) return next();
		return next(
			new ApiError(
				'Events no longer accept an image. Please reload the page and try again.',
				STATUS_CODE.BAD_REQUEST
			)
		);
	});
};

const createEventValidators = [
	body('title').isString().trim().notEmpty(),
	body('location').isString().trim().notEmpty(),
	body('date').isISO8601().toDate(),
	body('subtitle').optional().isString(),
	body('mapLink').optional().isString(),
	body('description').optional().isString(),
	body('isGeneric').optional().isBoolean().toBoolean(),
];

const updateEventValidators = [
	body('title').optional().isString().trim().notEmpty(),
	body('location').optional().isString().trim().notEmpty(),
	body('date').optional().isISO8601().toDate(),
	body('subtitle').optional().isString(),
	body('mapLink').optional().isString(),
	body('description').optional().isString(),
	body('isGeneric').optional().isBoolean().toBoolean(),
];

eventRouter.get('/api/events', getEvents);
eventRouter.get('/api/events/:reference', getEvent);
eventRouter.post(
	'/api/event',
	isAuth,
	requireEventAdmin,
	handleFormFields,
	createEventValidators,
	async (req, res, next) => {
		try {
			await createEventHandler(req, res, next);
		} catch (err) {
			next(err);
		}
	}
);
eventRouter.put(
	'/api/event/:reference',
	isAuth,
	requireEventAdmin,
	handleFormFields,
	updateEventValidators,
	async (req, res, next) => {
		try {
			await updateEventHandler(req, res, next);
		} catch (err) {
			next(err);
		}
	}
);
eventRouter.delete('/api/event', isAuth, requireEventAdmin, deleteEvent);
// POST, matching what the frontend calls. It was registered as PUT, which
// both 404'd the frontend's POST and was itself unreachable: the earlier
// `PUT /api/event/:reference` matched first with reference="confirmPresence"
// and rejected donors via its checkIfAdmin guard.
eventRouter.post('/api/event/confirmPresence', isAuth, confirmPresence);
eventRouter.get('/api/event/:reference/participants/details', isAuth, requireEventAdmin, getEventParticipantDetails);


module.exports = eventRouter;

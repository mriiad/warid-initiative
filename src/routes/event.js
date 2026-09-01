const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// diskStorage never creates its destination folder -- on a fresh checkout
// (nothing else in the repo/Dockerfile creates 'uploads/' either) any image
// upload fails with a raw ENOENT before multer's own limit/fileFilter
// errors even get a chance to fire, which is how the oversized-file path
// below went untested. See #370.
fs.mkdirSync('uploads', { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, 'uploads/'),
	filename: (req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, unique + path.extname(file.originalname || ''));
	},
});
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if (!file || !file.mimetype) return cb(null, true);
		if (/^image\//.test(file.mimetype)) return cb(null, true);
		cb(new Error('Only image uploads are allowed'));
	},
});

// multer's own error handling runs before createEventHandler/updateEventHandler
// ever see the request -- an oversized file (LIMIT_FILE_SIZE) or a rejected
// mimetype (the fileFilter's plain Error above) both reach the shared error
// handler as a raw, non-ApiError error, producing a generic "Something went
// wrong" instead of a message describing what was actually wrong with the
// file. Translate both cases here, right after the upload runs. See #370.
const handleImageUpload = (req, res, next) => {
	upload.single('image')(req, res, (err) => {
		if (!err) return next();
		if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
			return next(
				new ApiError(
					'File too large. Please upload a file smaller than 5MB.',
					STATUS_CODE.PAYLOAD_TOO_LARGE
				)
			);
		}
		return next(
			new ApiError('Only image uploads are allowed.', STATUS_CODE.BAD_REQUEST)
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
	handleImageUpload,
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
	handleImageUpload,
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

const express = require('express');
const {
	getEvents,
	getEvent,
	createEvent,
	confirmPresence,
	deleteEvent,
} = require('../controllers/event');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const ApiError = require('../utils/errors/ApiError');

const multer = require('multer');

const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public');
	},
	filename: (req, file, cb) => {
		const ext = file.mimetype.split('/')[1];
		cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
	},
});

// Multer Filter
const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image/')) {
		cb(null, true);
	} else {
		cb(new Error('Only image files are allowed!'), false);
	}
};

//Calling the "multer" Function
const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

const eventRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');

eventRouter.get('/api/events', getEvents);

eventRouter.get('/api/events/:reference', getEvent);

eventRouter.post('/api/event', isAuth, checkIfAdmin, (req, res, next) => {
	upload.single('image')(req, res, async (err) => {
		try {
			// Handle Multer errors
			if (err instanceof multer.MulterError) {
				throw new ApiError(err.message, STATUS_CODE.PAYLOAD_TOO_LARGE);
			} else if (err) {
				throw new ApiError(err.message, STATUS_CODE.BAD_REQUEST);
			}

			// Additional checks
			if (req.fileValidationError) {
				throw new ApiError(req.fileValidationError, STATUS_CODE.BAD_REQUEST);
			} else if (!req.file) {
				throw new ApiError('No file provided', STATUS_CODE.BAD_REQUEST);
			}

			const eventData = await createEvent(req, res, req.file);

			// Send response
			res.status(STATUS_CODE.CREATED).json({
				message: 'Event created successfully!',
				event: eventData,
			});
		} catch (error) {
			next(error);
		}
	});
});

eventRouter.delete('/api/event', isAuth, checkIfAdmin, deleteEvent);

eventRouter.put('/api/event/confirmPresence', isAuth, confirmPresence);

module.exports = eventRouter;

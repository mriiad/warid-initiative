const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');

const {
	getEvents,
	getEvent,
	createEventHandler,
	updateEventHandler,
	confirmPresence,
	deleteEvent,
} = require('../controllers/event');
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');

const eventRouter = express.Router();

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
	checkIfAdmin,
	upload.single('image'),
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
	checkIfAdmin,
	upload.single('image'),
	updateEventValidators,
	async (req, res, next) => {
		try {
			await updateEventHandler(req, res, next);
		} catch (err) {
			next(err);
		}
	}
);
eventRouter.delete('/api/event', isAuth, checkIfAdmin, deleteEvent);
eventRouter.put('/api/event/confirmPresence', isAuth, confirmPresence);

module.exports = eventRouter;

const express = require('express');
const {
	getEvents,
	createEvent,
	confirmPresence,
	deleteEvent,
} = require('../controllers/event');

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
	if (file.mimetype.split('/')[1] === 'png') {
		cb(null, true);
	} else {
		cb(new Error('Not a PDF File!!'), false);
	}
};

//Calling the "multer" Function
const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

const eventRouter = express.Router();
const isAuth = require('../middleware/is-auth');
const checkIfAdmin = require('../utils/checks');

eventRouter.get('/api/events', isAuth, getEvents);

eventRouter.post(
	'/api/event',
	isAuth,
	checkIfAdmin,
	upload.single('image'),
	createEvent
);

eventRouter.delete('/api/event', isAuth, checkIfAdmin, deleteEvent);

eventRouter.put('/api/event/confirmPresence', isAuth, confirmPresence);

module.exports = eventRouter;

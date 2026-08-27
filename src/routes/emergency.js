const express = require('express');
const emergencyRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const requireAdminRole = require('../utils/requireAdminRole');
const { publicWriteLimiter } = require('../middleware/rate-limit');
const {
    getUnconfirmedEmergencies,
    getEmergencyMatchUsers,
    createEmergency,
    confirmEmergency ,
    confirmUserInEmergency
} = require('../controllers/emergency');

// Emergency Admin or Principal Admin (see issue #183).
const requireEmergencyAdmin = requireAdminRole(['emergency']);

emergencyRouter.get('/api/unconfirmedEmergencies', isAuth, requireEmergencyAdmin, getUnconfirmedEmergencies);
emergencyRouter.get('/api/emergencies/:id/matchingUsers', isAuth, requireEmergencyAdmin, getEmergencyMatchUsers);
emergencyRouter.post('/api/emergency', publicWriteLimiter, createEmergency);
emergencyRouter.patch('/api/emergencies/:id/confirm', isAuth, requireEmergencyAdmin, confirmEmergency);
emergencyRouter.patch('/api/emergencies/:emergencyId/matchedUsers/:userId/confirm', isAuth, requireEmergencyAdmin, confirmUserInEmergency);



module.exports = emergencyRouter;
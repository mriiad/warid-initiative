const express = require('express');
const emergencyRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');
const { 
    getUnconfirmedEmergencies, 
    getEmergencyMatchUsers,
    createEmergency, 
    confirmEmergency ,
    confirmUserInEmergency
} = require('../controllers/emergency');


emergencyRouter.get('/api/unconfirmedEmergencies', isAuth, checkIfAdmin, getUnconfirmedEmergencies);
emergencyRouter.get('/api/emergencies/:id/matchingUsers', isAuth, checkIfAdmin, getEmergencyMatchUsers);
emergencyRouter.post('/api/emergency', createEmergency);
emergencyRouter.patch('/api/emergencies/:id/confirm', isAuth, checkIfAdmin, confirmEmergency);
emergencyRouter.patch('/api/emergencies/:emergencyId/matchedUsers/:userId/confirm', isAuth, checkIfAdmin, confirmUserInEmergency);



module.exports = emergencyRouter;
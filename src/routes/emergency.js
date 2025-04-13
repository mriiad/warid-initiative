const express = require('express');
const emergencyRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');
const { 
    getUnconfirmedEmergencies, 
    createEmergency, 
    confirmEmergency ,
    confirmUserInEmergency
} = require('../controllers/emergency');


emergencyRouter.get('/api/UnconfirmedEmergencies', isAuth, checkIfAdmin, getUnconfirmedEmergencies);
emergencyRouter.post('/api/emergency', createEmergency);
emergencyRouter.patch('/api/emergencies/:id', isAuth, checkIfAdmin, confirmEmergency);
emergencyRouter.patch('/api/emergencies/:emergencyId/matchedUsers/:userId', isAuth, checkIfAdmin, confirmUserInEmergency);



module.exports = emergencyRouter;
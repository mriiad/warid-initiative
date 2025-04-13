const express = require('express');
const emergencyRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');
const { 
    getNotConfirmedEmergencies, 
    createEmergency, 
    confirmEmergency ,
    confirmUserInEmergency
} = require('../controllers/emergency');


emergencyRouter.get('/api/notConfirmedEmergencies', isAuth, checkIfAdmin, getNotConfirmedEmergencies);
emergencyRouter.post('/api/emergency', createEmergency);
emergencyRouter.patch('/api/emergencies/:id', isAuth, checkIfAdmin, confirmEmergency);
emergencyRouter.patch('/api/emergencies/:emergencyId/matchedUsers/:userId', isAuth, checkIfAdmin, confirmUserInEmergency);



module.exports = emergencyRouter;
const express = require('express');
const emergencyRouter = express.Router();
const { isAuth } = require('../middleware/token-check');
const checkIfAdmin = require('../utils/checks');
const { 
    getEmergencies, 
    getNotConfirmedEmergencies, 
    createEmergency, 
    confirmEmergency 
} = require('../controllers/emergency');


emergencyRouter.get('/api/allEmergencies', isAuth, checkIfAdmin, getEmergencies);
emergencyRouter.get('/api/notConfirmedEmergencies', isAuth, checkIfAdmin, getNotConfirmedEmergencies);
emergencyRouter.post('/api/emergency', isAuth, createEmergency);
emergencyRouter.patch('/api/emergencies/:id', isAuth, checkIfAdmin, confirmEmergency);


module.exports = emergencyRouter;
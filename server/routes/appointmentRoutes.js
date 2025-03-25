const express = require('express');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

// Get appointments by doctor
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);

// Get appointments by patient
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);

// Create new appointment
router.post('/', appointmentController.createAppointment);

// Update appointment
router.patch('/:id', appointmentController.updateAppointment);

module.exports = router;
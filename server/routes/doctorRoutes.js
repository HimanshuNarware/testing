const express = require('express');
const doctorController = require('../controllers/doctorController');

const router = express.Router();

// Get all doctors
router.get('/', doctorController.getAllDoctors);

// Get doctor by ID
router.get('/:id', doctorController.getDoctorById);

// Get doctor by user ID
router.get('/user/:userId', doctorController.getDoctorByUserId);

// Create new doctor profile
router.post('/', doctorController.createDoctor);

// Update doctor profile
router.patch('/:id', doctorController.updateDoctor);

module.exports = router;
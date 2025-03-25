const express = require('express');
const userRoutes = require('./userRoutes');
const doctorRoutes = require('./doctorRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const userController = require('../controllers/userController');

const router = express.Router();

// Mount route modules
router.use('/users', userRoutes);
router.post('/login', userController.login); // Special case for login endpoint
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);

module.exports = router;
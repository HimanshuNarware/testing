const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Get user by ID
router.get('/:id', userController.getUser);

// Create new user
router.post('/', userController.createUser);

// Update user
router.patch('/:id', userController.updateUser);

// Login
router.post('/login', userController.login);

module.exports = router;
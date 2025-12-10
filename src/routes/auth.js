const express = require('express');

const router = express.Router();
const userController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
} = require('../validation/userValidation');

// Public routes
router.post('/register', validateRegister, userController.register);
router.post('/login', validateLogin, userController.login);

// Protected routes
router.get('/profile', verifyToken, userController.getProfile);
router.put(
    '/profile',
    verifyToken,
    validateProfileUpdate,
    userController.updateProfile
);

module.exports = router;

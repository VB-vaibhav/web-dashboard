const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// // === REGISTER ===
// router.post('/register', authController.register);

// === LOGIN with email OR username ===
router.post('/login', authController.login);

// === REFRESH token (uses cookie) ===
router.post('/refresh', authController.refresh);

// === LOGOUT (clears refresh token) ===
router.post('/logout', authController.logout);

// === FORGOT PASSWORD ===
router.post('/forgot-password', authController.forgotPassword);

// === USER VERIFIES OTP ===
router.post('/verify-otp', authController.verifyOtp);

// === USER SETS NEW PASSWORD ===
router.post('/reset-password', authController.resetPassword);

module.exports = router;

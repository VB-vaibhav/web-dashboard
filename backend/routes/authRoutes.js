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

module.exports = router;

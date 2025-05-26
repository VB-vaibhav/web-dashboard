const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const db = require('../config/db');


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

// === GLOBAL REFRESH ===
router.get('/me', verifyToken, authController.getMe);

// Multer storage setup
const storage = multer.diskStorage({
  destination: 'uploads/avatars',
  filename: (req, file, cb) => {
    const uniqueName = `user_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Avatar upload endpoint
router.post('/upload-avatar', verifyToken, upload.single('avatar'), (req, res) => {
//   console.log("File received:", req.file); 
//   if (!req.file) {
//   return res.status(400).send("No file uploaded");
// }

  const fileUrl = `/uploads/avatars/${req.file.filename}`;
  const sql = "UPDATE users SET avatar_url = ? WHERE id = ?";
  db.query(sql, [fileUrl, req.user.id], (err) => {
    if (err) return res.status(500).send("Failed to update avatar");
    res.json({ avatarUrl: fileUrl });
  });
});



// update-profile
router.post('/update-profile', verifyToken, (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).send("Missing required fields");
  }

  db.query(
    'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
    [name, email, phone, req.user.id],
    (err) => {
      if (err) return res.status(500).send("Failed to update profile");
      res.send("Profile updated");
    }
  );
});


module.exports = router;

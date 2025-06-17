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
const upload = multer({ storage,
  limits: { fileSize: 20 * 1024 * 1024 } 
 });

// Avatar upload endpoint
router.post('/upload-avatar', verifyToken, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    console.log("⚠️ No file uploaded.");
    return res.status(400).send("No file uploaded");
  }

  console.log("✅ File received:", req.file.filename);

  const fileUrl = `/uploads/avatars/${req.file.filename}`;
  const sql = "UPDATE users SET avatar_url = ? WHERE id = ?";
  db.query(sql, [fileUrl, req.user.id], (err) => {
    if (err) {
      console.error("❌ DB error while saving avatar URL:", err);
      return res.status(500).send("Failed to update avatar");
    }
    res.json({ avatarUrl: fileUrl });
  });
});



// update-profile
// router.post('/update-profile', verifyToken, (req, res) => {
//   const { name, email, phone } = req.body;
//   if (!name || !email || !phone) {
//     return res.status(400).send("Missing required fields");
//   }

//   db.query(
//     'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
//     [name, email, phone, req.user.id],
//     (err) => {
//       if (err) return res.status(500).send("Failed to update profile");
//       res.send("Profile updated");
//     }
//   );
// });

router.post('/update-profile', verifyToken, (req, res) => {
  const { name, email, phone } = req.body;

  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (email) {
    updates.push('email = ?');
    values.push(email);
  }
  if (phone) {
    updates.push('phone = ?');
    values.push(phone);
  }

  if (updates.length === 0) {
    return res.status(400).send("No fields to update");
  }

  values.push(req.user.id);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  db.query(sql, values, (err) => {
    if (err) return res.status(500).send("Failed to update profile");
    res.send("Profile updated");
  });
});



module.exports = router;

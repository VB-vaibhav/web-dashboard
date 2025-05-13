const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Protected route
router.get('/admin/data', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
  res.send("Only admin or superadmin can access this.");
});

module.exports = router;

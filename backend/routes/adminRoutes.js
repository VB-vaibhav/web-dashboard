const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Protected route
router.get('/admin/data', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
  res.send("Only admin or superadmin can access this.");
});

router.get('/service-access-users', verifyToken, requireRole('superadmin'), (req, res) => {
  const sql = `
    SELECT id, name, role, is_vps, is_cerberus, is_proxy, is_storage, is_varys 
    FROM users 
    WHERE role = 'admin'
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
});

module.exports = router;

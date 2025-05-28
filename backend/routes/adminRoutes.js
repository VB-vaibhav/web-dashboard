const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const db = require('../config/db');

// Protected route
router.get('/admin/data', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
  res.send("Only admin or superadmin can access this.");
});

// GET /admin/service-access-users
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

// PATCH /admin/update-service-access/:id
router.patch('/update-service-access/:id', verifyToken, requireRole('superadmin'), (req, res) => {
  const { id } = req.params;
  const updates = req.body; // e.g., { is_proxy: 1 }

  if (!id || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map(field => `${field} = ?`).join(', ');

  const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
  db.query(sql, [...values, id], (err, result) => {
    if (err) {
      console.error('DB update error:', err);
      return res.status(500).json({ error: 'Failed to update user' });
    }
    res.json({ message: 'User access updated' });
  });
});

module.exports = router;

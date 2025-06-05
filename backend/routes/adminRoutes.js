const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const db = require('../config/db');
const { getUserFieldsForPage } = require('../utils/userFieldUtils');


// Protected route
router.get('/admin/data', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
  res.send("Only admin or superadmin can access this.");
});

// GET /admin/service-access-users
// router.get('/service-access-users', verifyToken, requireRole('superadmin'), (req, res) => {
//   // const sql = `
//   //   SELECT id, name, role, is_vps, is_cerberus, is_proxy, is_storage, is_varys 
//   //   FROM users 
//   //   WHERE role = 'admin'
//   // `;
//   const sql = `
//   SELECT * FROM users 
//   WHERE role = 'admin'
// `;

//   db.query(sql, (err, results) => {
//     if (err) return res.status(500).json({ error: 'DB error' });
//     res.json(results);
//   });
// });

router.get('/service-access-users', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const allColumns = await getUserFieldsForPage('serviceAccess');
    const query = `SELECT ${allColumns.map(col => `\`${col}\``).join(', ')} FROM users WHERE role = 'admin'`;

    const [rows] = await db.promise().query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error in service-access-users:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// add_column

router.post('/add-column', verifyToken, requireRole('superadmin'), (req, res) => {
  const { columnName } = req.body;

  // ✅ Basic validation (strict pattern for SQL safety)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
    return res.status(400).json({ error: 'Invalid column name' });
  }

  const sql = `ALTER TABLE users ADD COLUMN \`${columnName}\` VARCHAR(255) DEFAULT ''`;

  db.query(sql, (err) => {
    if (err) {
      console.error('Column add error:', err);
      return res.status(500).json({ error: 'Column creation failed' });
    }
    res.json({ message: `Column '${columnName}' added successfully.` });
  });
});

router.patch('/rename-column', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { oldColumn, newColumn } = req.body;
  if (!oldColumn || !newColumn) {
    return res.status(400).json({ error: 'Missing column name(s).' });
  }

  try {
    const alterQuery = `ALTER TABLE users CHANGE \`${oldColumn}\` \`${newColumn}\` VARCHAR(255)`;
    await db.promise().query(alterQuery);
    res.json({ message: 'Column renamed successfully' });
  } catch (err) {
    console.error('DB rename error:', err);
    res.status(500).json({ error: 'Failed to rename column' });
  }
});

router.delete('/delete-column', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { columnName } = req.body;
  if (!columnName || !columnName.startsWith('custom_')) {
    return res.status(400).json({ error: 'Invalid or non-deletable column' });
  }

  try {
    const sql = `ALTER TABLE users DROP COLUMN \`${columnName}\``;
    await db.promise().query(sql);
    res.json({ message: 'Column deleted successfully' });
  } catch (err) {
    console.error("Delete column error:", err);
    res.status(500).json({ error: 'Failed to delete column' });
  }
});


module.exports = router;

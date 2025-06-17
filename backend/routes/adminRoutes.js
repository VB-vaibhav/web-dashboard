// const express = require('express');
// const router = express.Router();
// const { verifyToken, requireRole } = require('../middleware/authMiddleware');
// const db = require('../config/db');

// // Protected route
// router.get('/admin/data', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
//   res.send("Only admin or superadmin can access this.");
// });

// // GET /admin/service-access-users
// router.get('/service-access-users', verifyToken, requireRole('superadmin'), (req, res) => {
//   const sql = `
//     SELECT id, name, role, is_vps, is_cerberus, is_proxy, is_storage, is_varys 
//     FROM users 
//     WHERE role = 'admin'
//   `;
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error('SQL error:', err);
//       return res.status(500).json({ error: 'DB error' });
//     }
//     res.json(results);
//   });
// });

// // PATCH /admin/update-service-access/:id
// router.patch('/update-service-access/:id', verifyToken, requireRole('superadmin'), (req, res) => {
//   const { id } = req.params;
//   const updates = req.body; // e.g., { is_proxy: 1 }

//   if (!id || Object.keys(updates).length === 0) {
//     return res.status(400).json({ error: 'Invalid request' });
//   }

//   const fields = Object.keys(updates);
//   const values = Object.values(updates);
//   const setClause = fields.map(field => `${field} = ?`).join(', ');

//   const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
//   db.query(sql, [...values, id], (err, result) => {
//     if (err) {
//       console.error('DB update error:', err);
//       return res.status(500).json({ error: 'Failed to update user' });
//     }
//     res.json({ message: 'User access updated' });
//   });
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const { verifyToken, requireRole, requireSettingsAccess } = require('../middleware/authMiddleware');
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

router.get('/service-access-users', verifyToken, requireSettingsAccess, async (req, res) => {
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
router.patch('/update-service-access/:id', verifyToken, requireSettingsAccess, (req, res) => {
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

router.post('/add-column', verifyToken, requireSettingsAccess, (req, res) => {
  const { columnName, pageKey, label } = req.body;

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName) || !pageKey) {
    return res.status(400).json({ error: 'Invalid column name or page' });
  }

  if (columnName.startsWith('custom_')) {
    return res.status(400).json({ error: 'Do not include "custom_" prefix' });
  }


  const fullColumn = `custom_${pageKey}_${columnName}`;
  const alterSQL = `ALTER TABLE users ADD COLUMN \`${fullColumn}\` VARCHAR(255) DEFAULT ''`;

  db.query(alterSQL, (err) => {
    if (err) return res.status(500).json({ error: 'Column creation failed' });

    const insertMeta = `INSERT INTO custom_user_fields (column_name, page_key, label) VALUES (?, ?, ?)`;
    db.query(insertMeta, [fullColumn, pageKey, label || columnName], (metaErr) => {
      if (metaErr) return res.status(500).json({ error: 'Metadata insert failed' });
      res.json({ message: `Column '${fullColumn}' added and tracked.` });
    });
  });

  // const { columnName } = req.body;

  // // ✅ Basic validation (strict pattern for SQL safety)
  // if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
  //   return res.status(400).json({ error: 'Invalid column name' });
  // }

  // const sql = `ALTER TABLE users ADD COLUMN \`${columnName}\` VARCHAR(255) DEFAULT ''`;

  // db.query(sql, (err) => {
  //   if (err) {
  //     console.error('Column add error:', err);
  //     return res.status(500).json({ error: 'Column creation failed' });
  //   }
  //   res.json({ message: `Column '${columnName}' added successfully.` });
  // });
});

// router.patch('/rename-column', verifyToken, requireSettingsAccess, async (req, res) => {
//   const { oldColumn, newColumn } = req.body;
//   if (!oldColumn || !newColumn) {
//     return res.status(400).json({ error: 'Missing column name(s).' });
//   }

//   try {
//     const alterQuery = `ALTER TABLE users CHANGE \`${oldColumn}\` \`${newColumn}\` VARCHAR(255)`;
//     await db.promise().query(alterQuery);

//     // 2. Update metadata table
//     const updateMeta = `UPDATE custom_user_fields SET column_name = ? WHERE column_name = ?`;
//     await db.promise().query(updateMeta, [newColumn, oldColumn]);

//     res.json({ message: 'Column renamed successfully' });
//   } catch (err) {
//     console.error('DB rename error:', err);
//     res.status(500).json({ error: 'Failed to rename column' });
//   }
// });

router.patch('/rename-column', verifyToken, requireSettingsAccess, async (req, res) => {
  const { oldColumn, newColumn, newLabel } = req.body;
  if (!oldColumn || !newColumn || !newLabel) {
    return res.status(400).json({ error: 'Missing parameters.' });
  }

  try {
    // 1. Rename the column in users table
    const alterQuery = `ALTER TABLE users CHANGE \`${oldColumn}\` \`${newColumn}\` VARCHAR(255)`;
    await db.promise().query(alterQuery);

    // 2. Update metadata (column name + label)
    const updateMeta = `
      UPDATE custom_user_fields 
      SET column_name = ?, label = ?
      WHERE column_name = ?
    `;
    await db.promise().query(updateMeta, [newColumn, newLabel, oldColumn]);

    res.json({ message: 'Column renamed and label updated successfully' });
  } catch (err) {
    console.error('Rename error:', err);
    res.status(500).json({ error: 'Failed to rename column' });
  }
});


// router.delete('/delete-column', verifyToken, requireSettingsAccess, async (req, res) => {
//   const { columnName } = req.body;
//   if (!columnName || !columnName.startsWith('custom_')) {
//     return res.status(400).json({ error: 'Invalid or non-deletable column' });
//   }

//   try {
//     const sql = `ALTER TABLE users DROP COLUMN \`${columnName}\``;
//     await db.promise().query(sql);
//     res.json({ message: 'Column deleted successfully' });
//   } catch (err) {
//     console.error("Delete column error:", err);
//     res.status(500).json({ error: 'Failed to delete column' });
//   }
// });

router.delete('/delete-column', verifyToken, requireSettingsAccess, async (req, res) => {
  const { columnName, pageKey } = req.body;
  if (!columnName || !pageKey) {
    return res.status(400).json({ error: 'Missing column name or page key' });
  }
  const sanitized = columnName.startsWith('custom_') ? columnName : `custom_${pageKey}_${columnName}`;

  try {
    // 🔥 1. Drop column from users table
    await db.promise().query(`ALTER TABLE users DROP COLUMN \`${sanitized}\``);

    // 🔥 2. Delete entry from custom_user_fields
    await db.promise().query(`DELETE FROM custom_user_fields WHERE column_name = ?  AND page_key = ?`, [sanitized, pageKey]);

    res.json({ success: true });
  } catch (err) {
    console.error('Delete column error:', err);
    res.status(500).json({ error: 'Failed to delete column' });
  }
});


router.get('/panel-access-users', verifyToken, requireSettingsAccess, async (req, res) => {
  try {
    const allColumns = await getUserFieldsForPage('panelAccess');
    const query = `SELECT ${allColumns.map(col => `\`${col}\``).join(', ')} FROM users WHERE role IN ('admin', 'middleman')`;

    const [rows] = await db.promise().query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error in panel-access-users:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET /admin/manage-role-users
router.get('/manage-role-users', verifyToken, requireSettingsAccess, async (req, res) => {
  try {
    const allColumns = await getUserFieldsForPage('manageRole');
    const query = `SELECT ${allColumns.map(col => `\`${col}\``).join(', ')} FROM users WHERE role != 'superadmin'`;

    const [rows] = await db.promise().query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error in manage-role-users:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /admin/update-user-role/:id
router.patch('/update-user-role/:id', verifyToken, requireSettingsAccess, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!id || !role || role === 'superadmin') {
    return res.status(400).json({ error: 'Invalid role change' });
  }

  try {
    await db.promise().query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.get('/custom-columns', verifyToken, requireSettingsAccess, async (req, res) => {
  const { pageKey } = req.query;
  try {
    const [rows] = await db.promise().query(
      `SELECT column_name, label FROM custom_user_fields WHERE page_key = ?`,
      [pageKey]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching column metadata:', err);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

module.exports = router;

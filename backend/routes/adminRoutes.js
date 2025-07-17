// // const express = require('express');
// // const router = express.Router();
// // const { verifyToken, requireRole } = require('../middleware/authMiddleware');
// // const db = require('../config/db');

// // // Protected route
// // router.get('/admin/data', verifyToken, requireRole('admin', 'superadmin'), (req, res) => {
// //   res.send("Only admin or superadmin can access this.");
// // });

// // // GET /admin/service-access-users
// // router.get('/service-access-users', verifyToken, requireRole('superadmin'), (req, res) => {
// //   const sql = `
// //     SELECT id, name, role, is_vps, is_cerberus, is_proxy, is_storage, is_varys 
// //     FROM users 
// //     WHERE role = 'admin'
// //   `;
// //   db.query(sql, (err, results) => {
// //     if (err) {
// //       console.error('SQL error:', err);
// //       return res.status(500).json({ error: 'DB error' });
// //     }
// //     res.json(results);
// //   });
// // });

// // // PATCH /admin/update-service-access/:id
// // router.patch('/update-service-access/:id', verifyToken, requireRole('superadmin'), (req, res) => {
// //   const { id } = req.params;
// //   const updates = req.body; // e.g., { is_proxy: 1 }

// //   if (!id || Object.keys(updates).length === 0) {
// //     return res.status(400).json({ error: 'Invalid request' });
// //   }

// //   const fields = Object.keys(updates);
// //   const values = Object.values(updates);
// //   const setClause = fields.map(field => `${field} = ?`).join(', ');

// //   const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
// //   db.query(sql, [...values, id], (err, result) => {
// //     if (err) {
// //       console.error('DB update error:', err);
// //       return res.status(500).json({ error: 'Failed to update user' });
// //     }
// //     res.json({ message: 'User access updated' });
// //   });
// // });

// // module.exports = router;




// const express = require('express');
// const router = express.Router();
// const { verifyToken, requireRole, requireSettingsAccess } = require('../middleware/authMiddleware');
// const db = require('../config/db');
// const { getUserFieldsForPage } = require('../utils/userFieldUtils');


// // Protected route
// router.get('/admin/data', verifyToken, requireSettingsAccess, (req, res) => {
//   res.send("Only admin or superadmin can access this.");
// });

// // GET /admin/service-access-users
// // router.get('/service-access-users', verifyToken, requireRole('superadmin'), (req, res) => {
// //   // const sql = `
// //   //   SELECT id, name, role, is_vps, is_cerberus, is_proxy, is_storage, is_varys 
// //   //   FROM users 
// //   //   WHERE role = 'admin'
// //   // `;
// //   const sql = `
// //   SELECT * FROM users 
// //   WHERE role = 'admin'
// // `;

// //   db.query(sql, (err, results) => {
// //     if (err) return res.status(500).json({ error: 'DB error' });
// //     res.json(results);
// //   });
// // });

// router.get('/service-access-users', verifyToken, requireSettingsAccess, async (req, res) => {
//   try {
//     const allColumns = await getUserFieldsForPage('serviceAccess');
//     const query = `SELECT ${allColumns.map(col => `\`${col}\``).join(', ')} FROM users WHERE role = 'admin'`;

//     const [rows] = await db.promise().query(query);
//     res.json(rows);
//   } catch (err) {
//     console.error("Error in service-access-users:", err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // PATCH /admin/update-service-access/:id
// router.patch('/update-service-access/:id', verifyToken, requireSettingsAccess, (req, res) => {
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

// // add_column

// router.post('/add-column', verifyToken, requireSettingsAccess, (req, res) => {


//   const { pageKey, label } = req.body;

//   if (!label || !pageKey) {
//     return res.status(400).json({ error: 'Missing label or pageKey' });
//   }

//   const safeLabel = label.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
//   if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safeLabel)) {
//     return res.status(400).json({ error: 'Invalid label for column name' });
//   }

//   // const columnName = `custom_${pageKey}_${safeLabel}`;

//   const fullColumn = `custom_${pageKey}_${safeLabel}`;
//   const alterSQL = `ALTER TABLE users ADD COLUMN \`${fullColumn}\` VARCHAR(255) DEFAULT ''`;

//   db.query(alterSQL, (err) => {
//     if (err) return res.status(500).json({ error: 'Column creation failed' });

//     const insertMeta = `INSERT INTO custom_user_fields (column_name, page_key, label) VALUES (?, ?, ?)`;
//     db.query(insertMeta, [fullColumn, pageKey, label || fullColumn], (metaErr) => {
//       if (metaErr) return res.status(500).json({ error: 'Metadata insert failed' });
//       res.json({ message: `Column '${fullColumn}' added and tracked.` });
//     });
//   });

//   // const { columnName } = req.body;

//   // // ✅ Basic validation (strict pattern for SQL safety)
//   // if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
//   //   return res.status(400).json({ error: 'Invalid column name' });
//   // }

//   // const sql = `ALTER TABLE users ADD COLUMN \`${columnName}\` VARCHAR(255) DEFAULT ''`;

//   // db.query(sql, (err) => {
//   //   if (err) {
//   //     console.error('Column add error:', err);
//   //     return res.status(500).json({ error: 'Column creation failed' });
//   //   }
//   //   res.json({ message: `Column '${columnName}' added successfully.` });
//   // });
// });

// // router.patch('/rename-column', verifyToken, requireSettingsAccess, async (req, res) => {
// //   const { oldColumn, newColumn } = req.body;
// //   if (!oldColumn || !newColumn) {
// //     return res.status(400).json({ error: 'Missing column name(s).' });
// //   }

// //   try {
// //     const alterQuery = `ALTER TABLE users CHANGE \`${oldColumn}\` \`${newColumn}\` VARCHAR(255)`;
// //     await db.promise().query(alterQuery);

// //     // 2. Update metadata table
// //     const updateMeta = `UPDATE custom_user_fields SET column_name = ? WHERE column_name = ?`;
// //     await db.promise().query(updateMeta, [newColumn, oldColumn]);

// //     res.json({ message: 'Column renamed successfully' });
// //   } catch (err) {
// //     console.error('DB rename error:', err);
// //     res.status(500).json({ error: 'Failed to rename column' });
// //   }
// // });

// router.patch('/rename-column', verifyToken, requireSettingsAccess, async (req, res) => {
//   const { oldColumn, newColumn, newLabel } = req.body;
//   if (!oldColumn || !newColumn || !newLabel) {
//     return res.status(400).json({ error: 'Missing parameters.' });
//   }

//   try {
//     // 1. Rename the column in users table
//     const alterQuery = `ALTER TABLE users CHANGE \`${oldColumn}\` \`${newColumn}\` VARCHAR(255)`;
//     await db.promise().query(alterQuery);

//     // 2. Update metadata (column name + label)
//     const updateMeta = `
//       UPDATE custom_user_fields 
//       SET column_name = ?, label = ?
//       WHERE column_name = ?
//     `;
//     await db.promise().query(updateMeta, [newColumn, newLabel, oldColumn]);

//     res.json({ message: 'Column renamed and label updated successfully' });
//   } catch (err) {
//     console.error('Rename error:', err);
//     res.status(500).json({ error: 'Failed to rename column' });
//   }
// });


// // router.delete('/delete-column', verifyToken, requireSettingsAccess, async (req, res) => {
// //   const { columnName } = req.body;
// //   if (!columnName || !columnName.startsWith('custom_')) {
// //     return res.status(400).json({ error: 'Invalid or non-deletable column' });
// //   }

// //   try {
// //     const sql = `ALTER TABLE users DROP COLUMN \`${columnName}\``;
// //     await db.promise().query(sql);
// //     res.json({ message: 'Column deleted successfully' });
// //   } catch (err) {
// //     console.error("Delete column error:", err);
// //     res.status(500).json({ error: 'Failed to delete column' });
// //   }
// // });

// router.delete('/delete-column', verifyToken, requireSettingsAccess, async (req, res) => {
//   const { columnName, pageKey } = req.body;
//   if (!columnName || !pageKey) {
//     return res.status(400).json({ error: 'Missing column name or page key' });
//   }
//   const sanitized = columnName.startsWith('custom_') ? columnName : `custom_${pageKey}_${columnName}`;

//   try {
//     // 🔥 1. Drop column from users table
//     await db.promise().query(`ALTER TABLE users DROP COLUMN \`${sanitized}\``);

//     // 🔥 2. Delete entry from custom_user_fields
//     await db.promise().query(`DELETE FROM custom_user_fields WHERE column_name = ?  AND page_key = ?`, [sanitized, pageKey]);

//     res.json({ success: true });
//   } catch (err) {
//     console.error('Delete column error:', err);
//     res.status(500).json({ error: 'Failed to delete column' });
//   }
// });


// router.get('/panel-access-users', verifyToken, requireSettingsAccess, async (req, res) => {
//   try {
//     const allColumns = await getUserFieldsForPage('panelAccess');
//     const query = `SELECT ${allColumns.map(col => `\`${col}\``).join(', ')} FROM users WHERE role IN ('admin', 'middleman')`;

//     const [rows] = await db.promise().query(query);
//     res.json(rows);
//   } catch (err) {
//     console.error("Error in panel-access-users:", err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// // GET /admin/manage-role-users
// router.get('/manage-role-users', verifyToken, requireSettingsAccess, async (req, res) => {
//   try {
//     const allColumns = await getUserFieldsForPage('manageRole');
//     const query = `SELECT ${allColumns.map(col => `\`${col}\``).join(', ')} FROM users WHERE role != 'superadmin'`;

//     const [rows] = await db.promise().query(query);
//     res.json(rows);
//   } catch (err) {
//     console.error("Error in manage-role-users:", err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // PATCH /admin/update-user-role/:id
// router.patch('/update-user-role/:id', verifyToken, requireSettingsAccess, async (req, res) => {
//   const { id } = req.params;
//   const { role } = req.body;

//   if (!id || !role || role === 'superadmin') {
//     return res.status(400).json({ error: 'Invalid role change' });
//   }

//   try {
//     await db.promise().query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
//     res.json({ message: 'Role updated successfully' });
//   } catch (err) {
//     console.error("Error updating role:", err);
//     res.status(500).json({ error: 'Failed to update role' });
//   }
// });

// router.get('/custom-columns', verifyToken, requireSettingsAccess, async (req, res) => {
//   const { pageKey } = req.query;
//   try {
//     const [rows] = await db.promise().query(
//       `SELECT column_name, label FROM custom_user_fields WHERE page_key = ?`,
//       [pageKey]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching column metadata:', err);
//     res.status(500).json({ error: 'Failed to fetch metadata' });
//   }
// });
// // PATCH /admin/update-multiple-roles
// router.patch('/update-multiple-roles', verifyToken, requireRole('superadmin'), async (req, res) => {
//   const { userIds, newRole } = req.body;

//   if (!Array.isArray(userIds) || !newRole || newRole === 'superadmin') {
//     return res.status(400).json({ error: 'Invalid request' });
//   }

//   const placeholders = userIds.map(() => '?').join(', ');
//   const query = `UPDATE users SET role = ? WHERE id IN (${placeholders})`;

//   try {
//     await db.promise().query(query, [newRole, ...userIds]);
//     res.json({ message: 'Roles updated successfully' });
//   } catch (err) {
//     console.error("Error in bulk role update:", err);
//     res.status(500).json({ error: 'Failed to update roles' });
//   }
// });

// const exclusionController = require('../controllers/exclusionController');

// router.get('/exclusion-settings', verifyToken, requireSettingsAccess, exclusionController.getExclusionSettings);
// router.get('/admin-users', verifyToken, requireSettingsAccess, exclusionController.getAdminUsers);
// router.patch('/exclusion-settings/:clientId', verifyToken, requireSettingsAccess, exclusionController.updateExclusion);
// // PATCH route to update custom client field (used for inline cell editing)
// router.patch('/admin/update-client-field/:clientId', exclusionController.updateClientField);

// module.exports = router;


































































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
const exclusionController = require('../controllers/exclusionController');


// Protected route
router.get('/admin/data', verifyToken, requireSettingsAccess, (req, res) => {
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

// router.post('/add-column', verifyToken, requireSettingsAccess, (req, res) => {
//   const { columnName } = req.body;

//   // ✅ Basic validation (strict pattern for SQL safety)
//   if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
//     return res.status(400).json({ error: 'Invalid column name' });
//   }

//   const sql = `ALTER TABLE users ADD COLUMN \`${columnName}\` VARCHAR(255) DEFAULT ''`;

//   db.query(sql, (err) => {
//     if (err) {
//       console.error('Column add error:', err);
//       return res.status(500).json({ error: 'Column creation failed' });
//     }
//     res.json({ message: `Column '${columnName}' added successfully.` });
//   });
// });







// router.post('/add-column', verifyToken, requireSettingsAccess, (req, res) => {


//   const { pageKey, label } = req.body;

//   if (!label || !pageKey) {
//     return res.status(400).json({ error: 'Missing label or pageKey' });
//   }

//   const safeLabel = label.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
//   if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safeLabel)) {
//     return res.status(400).json({ error: 'Invalid label for column name' });
//   }

//   // const columnName = `custom_${pageKey}_${safeLabel}`;

//   const fullColumn = `custom_${pageKey}_${safeLabel}`;
//   const alterSQL = `ALTER TABLE users ADD COLUMN \`${fullColumn}\` VARCHAR(255) DEFAULT ''`;

//   db.query(alterSQL, (err) => {
//     if (err) return res.status(500).json({ error: 'Column creation failed' });

//     const insertMeta = `INSERT INTO custom_user_fields (column_name, page_key, label) VALUES (?, ?, ?)`;
//     db.query(insertMeta, [fullColumn, pageKey, label || fullColumn], (metaErr) => {
//       if (metaErr) return res.status(500).json({ error: 'Metadata insert failed' });
//       res.json({ message: `Column '${fullColumn}' added and tracked.` });
//     });
//   });
// });

// Add this helper
const TABLE_MAP = {
  serviceAccess: 'users',
  panelAccess: 'users',
  manageRole: 'users',
  users: 'users',
  excludeClients: 'clients',  // ⬅️ This is the key fix
  clients: 'clients'
};

// router.post('/add-column', verifyToken, requireSettingsAccess, (req, res) => {
//   const { pageKey, label } = req.body;

//   if (!label || !pageKey) {
//     return res.status(400).json({ error: 'Missing label or pageKey' });
//   }

//   // const safeLabel = label.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
//   const safeLabel = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
//   if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safeLabel)) {
//     return res.status(400).json({ error: 'Invalid label for column name' });
//   }

//   const fullColumn = `custom_${pageKey}_${safeLabel}`;
//   const targetTable = TABLE_MAP[pageKey] || 'users'; // fallback to 'users'

//   const alterSQL = `ALTER TABLE \`${targetTable}\` ADD COLUMN \`${fullColumn}\` VARCHAR(255) DEFAULT ''`;

//   db.query(alterSQL, (err) => {
//     if (err) return res.status(500).json({ error: 'Column creation failed' });

//     // const insertMeta = `INSERT INTO custom_user_fields (column_name, page_key, label) VALUES (?, ?, ?)`;
//     // db.query(insertMeta, [fullColumn, pageKey, label || fullColumn], (metaErr) => {
//     const formattedLabel = label.trim().replace(/\s+/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
//     const insertMeta = `INSERT INTO custom_user_fields (column_name, page_key, label) VALUES (?, ?, ?)`;
//     db.query(insertMeta, [fullColumn, pageKey, formattedLabel], (metaErr) => {
//       if (metaErr) return res.status(500).json({ error: 'Metadata insert failed' });
//       res.json({ message: `Column '${fullColumn}' added and tracked.` });
//     });
//   });
// });

// Add Column (Global or Private)
router.post('/add-column', verifyToken, requireSettingsAccess, async (req, res) => {
  const { pageKey, label, isGlobal } = req.body;
  const userId = req.user.id;

  if (!label || !pageKey) {
    return res.status(400).json({ error: 'Missing label or pageKey' });
  }

  const safeLabel = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safeLabel)) {
    return res.status(400).json({ error: 'Invalid label for column name' });
  }

  const formattedLabel = label.trim().replace(/\s+/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  const columnName = `custom_${pageKey}_${safeLabel}`;
  const targetTable = TABLE_MAP[pageKey] || 'users';

  try {
    const [globalExist] = await db.promise().query(
      `SELECT * FROM custom_user_fields WHERE column_name = ? AND page_key = ?`,
      [columnName, pageKey]
    );

    const [privateExist] = await db.promise().query(
      `SELECT * FROM user_column_visibility WHERE column_name = ? AND page_key = ? AND user_id = ?`,
      [columnName, pageKey, userId]
    );

    if (globalExist.length > 0 || privateExist.length > 0) {
      return res.status(409).json({ error: 'Column already exists' });
    }

    await db.promise().query(
      `ALTER TABLE \`${targetTable}\` ADD COLUMN \`${columnName}\` VARCHAR(255) DEFAULT ''`
    );

    if (isGlobal) {
      await db.promise().query(
        `INSERT INTO custom_user_fields (column_name, page_key, label, created_by, is_global)
         VALUES (?, ?, ?, ?, 1)`,
        [columnName, pageKey, formattedLabel, userId]
      );
    } else {
      await db.promise().query(
        `INSERT INTO user_column_visibility (user_id, column_name, label, page_key)
         VALUES (?, ?, ?, ?)`,
        [userId, columnName, formattedLabel, pageKey]
      );
    }

    res.json({ success: true, column: columnName });
  } catch (err) {
    console.error('Add column error:', err);
    res.status(500).json({ error: 'Failed to add column' });
  }
});




// router.patch('/rename-column', verifyToken, requireSettingsAccess, async (req, res) => {
//   const { oldColumn, newColumn, newLabel } = req.body;
//   if (!oldColumn || !newColumn || !newLabel) {
//     return res.status(400).json({ error: 'Missing parameters.' });
//   }

//   try {
//     // 1. Rename the column in users table
//     const alterQuery = `ALTER TABLE users CHANGE \`${oldColumn}\` \`${newColumn}\` VARCHAR(255)`;
//     await db.promise().query(alterQuery);

//     // 2. Update metadata (column name + label)
//     const updateMeta = `
//       UPDATE custom_user_fields 
//       SET column_name = ?, label = ?
//       WHERE column_name = ?
//     `;
//     await db.promise().query(updateMeta, [newColumn, newLabel, oldColumn]);

//     res.json({ message: 'Column renamed and label updated successfully' });
//   } catch (err) {
//     console.error('Rename error:', err);
//     res.status(500).json({ error: 'Failed to rename column' });
//   }
// });

// router.delete('/delete-column', verifyToken,  requireSettingsAccess, async (req, res) => {
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

// router.delete('/delete-column', verifyToken, requireSettingsAccess, async (req, res) => {
//   const { columnName, pageKey } = req.body;
//   if (!columnName || !pageKey) {
//     return res.status(400).json({ error: 'Missing column name or page key' });
//   }
//   const sanitized = columnName.startsWith('custom_') ? columnName : `custom_${pageKey}_${columnName}`;

//   try {
//     // 🔥 1. Drop column from users table
//     await db.promise().query(`ALTER TABLE users DROP COLUMN \`${sanitized}\``);

//     // 🔥 2. Delete entry from custom_user_fields
//     await db.promise().query(`DELETE FROM custom_user_fields WHERE column_name = ?  AND page_key = ?`, [sanitized, pageKey]);

//     res.json({ success: true });
//   } catch (err) {
//     console.error('Delete column error:', err);
//     res.status(500).json({ error: 'Failed to delete column' });
//   }
// });

router.patch('/rename-column', verifyToken, requireSettingsAccess, async (req, res) => {
  const { oldColumn, newColumn, newLabel, pageKey } = req.body;

  if (!oldColumn || !newColumn || !newLabel || !pageKey) {
    return res.status(400).json({ error: 'Missing parameters.' });
  }

  const targetTable = TABLE_MAP[pageKey] || 'users';

  try {
    const alterQuery = `ALTER TABLE \`${targetTable}\` CHANGE \`${oldColumn}\` \`${newColumn}\` VARCHAR(255)`;
    await db.promise().query(alterQuery);

    const updateMeta = `
      UPDATE custom_user_fields 
      SET column_name = ?, label = ? 
      WHERE column_name = ? AND page_key = ?
    `;
    await db.promise().query(updateMeta, [newColumn, newLabel, oldColumn, pageKey]);

    res.json({ message: 'Column renamed successfully' });
  } catch (err) {
    console.error('Rename error:', err);
    res.status(500).json({ error: 'Failed to rename column' });
  }
});


router.delete('/delete-column', verifyToken, requireSettingsAccess, async (req, res) => {
  const { columnName, pageKey } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!columnName || !pageKey) {
    return res.status(400).json({ error: 'Missing column name or page key' });
  }

  const sanitized = columnName.startsWith('custom_') ? columnName : `custom_${pageKey}_${columnName}`;
  const targetTable = TABLE_MAP[pageKey] || 'users';

  try {
    // 🔍 Check if this is a global column
    const [globalMeta] = await db.promise().query(
      `SELECT * FROM custom_user_fields WHERE column_name = ? AND page_key = ?`,
      [sanitized, pageKey]
    );

    // 🔍 Check if this is a private column
    const [privateMeta] = await db.promise().query(
      `SELECT * FROM user_column_visibility WHERE column_name = ? AND page_key = ? AND user_id = ?`,
      [sanitized, pageKey, userId]
    );

    const isGlobal = globalMeta.length > 0;
    const isPrivate = privateMeta.length > 0;

    // 🔐 1. Global column: Only superadmin or creator can delete
    if (isGlobal) {
      const createdBy = globalMeta[0].created_by;
      if (userRole !== 'superadmin' && createdBy !== userId) {
        return res.status(403).json({ error: 'Only Superadmin or Creator can delete' });
      }

      // 🔧 Drop physical column and metadata
      await db.promise().query(`ALTER TABLE \`${targetTable}\` DROP COLUMN \`${sanitized}\``);
      await db.promise().query(`DELETE FROM custom_user_fields WHERE column_name = ? AND page_key = ?`, [sanitized, pageKey]);

      return res.json({ success: true, message: 'Global column deleted' });
    }

    // 🔐 2. Private column: Only creator (current user) can delete
    if (isPrivate) {
      // 🔧 Drop physical column and visibility record
      await db.promise().query(`ALTER TABLE \`${targetTable}\` DROP COLUMN \`${sanitized}\``);
      await db.promise().query(`DELETE FROM user_column_visibility WHERE column_name = ? AND page_key = ? AND user_id = ?`,
        [sanitized, pageKey, userId]);

      return res.json({ success: true, message: 'Private column deleted' });
    }

    return res.status(404).json({ error: 'Column not found or not allowed' });
  } catch (err) {
    console.error('Delete column error:', err);
    res.status(500).json({ error: 'Failed to delete column' });
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

// PATCH /admin/update-multiple-roles
router.patch('/update-multiple-roles', verifyToken, requireSettingsAccess, async (req, res) => {
  const { userIds, newRole } = req.body;

  if (!Array.isArray(userIds) || !newRole || newRole === 'superadmin') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const placeholders = userIds.map(() => '?').join(', ');
  const query = `UPDATE users SET role = ? WHERE id IN (${placeholders})`;

  try {
    await db.promise().query(query, [newRole, ...userIds]);
    res.json({ message: 'Roles updated successfully' });
  } catch (err) {
    console.error("Error in bulk role update:", err);
    res.status(500).json({ error: 'Failed to update roles' });
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
  }
});
router.get('/manage-users', verifyToken, requireSettingsAccess, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
      id, name, username, email, phone, role,
  is_cerberus, is_vps, is_proxy, is_storage, is_varys,
  is_notification, is_mail, is_reports, is_settings, 
  is_restricted 
      FROM users 
      WHERE role IN ('admin', 'middleman')
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// router.get('/custom-columns', verifyToken, requireSettingsAccess, async (req, res) => {
//   const { pageKey } = req.query;
//   try {
//     const [rows] = await db.promise().query(
//       `SELECT column_name, label FROM custom_user_fields WHERE page_key = ?`,
//       [pageKey]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching column metadata:', err);
//     res.status(500).json({ error: 'Failed to fetch metadata' });
//   }
// });


router.get('/custom-columns', verifyToken, requireSettingsAccess, async (req, res) => {
  const { pageKey } = req.query;
  const userId = req.user.id;

  try {
    const [globalCols] = await db.promise().query(
      `SELECT column_name, label FROM custom_user_fields WHERE page_key = ? AND is_global = 1`,
      [pageKey]
    );

    const [privateCols] = await db.promise().query(
      `SELECT column_name, label FROM user_column_visibility WHERE page_key = ? AND user_id = ?`,
      [pageKey, userId]
    );

    res.json([...globalCols, ...privateCols]);
  } catch (err) {
    console.error('Error fetching column metadata:', err);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});


router.delete('/delete-user/:id', verifyToken, requireSettingsAccess, async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

router.post('/delete-multiple-users', verifyToken, requireSettingsAccess, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No IDs provided' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    await db.promise().query(`DELETE FROM users WHERE id IN (${placeholders})`, ids);
    res.json({ message: 'Users deleted successfully' });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

router.patch('/restrict-user/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  const userId = req.params.id;
  try {
    await db.promise().query(
      "UPDATE users SET is_restricted = IF(is_restricted = 1, 0, 1), token_version = token_version + 1 WHERE id = ?",
      [userId]
    );
    res.json({ message: 'User restricted and logged out from all sessions' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to restrict user' });
  }
});

router.post('/restrict-users', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const sql = `
    UPDATE users 
    SET is_restricted = 1, token_version = token_version + 1 
    WHERE id IN (${placeholders})
  `;

  try {
    await db.promise().query(sql, ids);
    res.json({ message: 'Users restricted successfully.' });
  } catch (err) {
    console.error('Restrict user failed:', err);
    res.status(500).json({ error: 'Failed to restrict users' });
  }
});

// POST /admin/unrestrict-users
router.post('/unrestrict-users', verifyToken, requireRole('superadmin'), async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const sql = `
    UPDATE users 
    SET is_restricted = 0, token_version = token_version + 1 
    WHERE id IN (${placeholders})
  `;

  try {
    await db.promise().query(sql, ids);
    res.json({ message: 'Users unrestricted successfully.' });
  } catch (err) {
    console.error('Unrestrict user failed:', err);
    res.status(500).json({ error: 'Failed to unrestrict users' });
  }
});

// POST /admin/create-user
router.post('/create-user', verifyToken, requireSettingsAccess, async (req, res) => {
  const {
    name, username, email, phone, role, password,
    is_vps = 0, is_cerberus = 0, is_proxy = 0, is_storage = 0, is_varys = 0,
    is_notification_sender = 0, is_mail = 0, is_reports = 0, is_settings = 0
  } = req.body;

  if (!name || !username || !email || !phone || !role || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.promise().query(
      `INSERT INTO users 
      (name, username, email, phone, role, password,
       is_vps, is_cerberus, is_proxy, is_storage, is_varys,
       is_notification, is_mail, is_reports, is_settings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, username, email, phone, role, hashed,
        is_vps, is_cerberus, is_proxy, is_storage, is_varys,
        is_notification_sender, is_mail, is_reports, is_settings]
    );
    res.json({ message: 'User created successfully' });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /update-user/:id
router.patch('/update-user/:id', verifyToken, requireSettingsAccess, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  // ⛔️ Remove password if it's an empty string
  if (updatedData.password === '') {
    delete updatedData.password;
  }

  // ✅ Hash password if it's being updated
  if (updatedData.password) {
    const saltRounds = 10;
    try {
      updatedData.password = await bcrypt.hash(updatedData.password, saltRounds);
    } catch (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Password hashing failed' });
    }
  }

  const fields = Object.keys(updatedData);
  const values = Object.values(updatedData);

  if (!fields.length) return res.status(400).json({ error: 'No data provided' });

  const setClause = fields.map(field => `\`${field}\` = ?`).join(', ');

  try {
    await db.promise().query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Edit failed:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


router.get('/exclusion-settings', verifyToken, requireSettingsAccess, exclusionController.getExclusionSettings);
router.get('/admin-users', verifyToken, requireSettingsAccess, exclusionController.getAdminUsers);
router.patch('/exclusion-settings/:clientId', verifyToken, requireSettingsAccess, exclusionController.updateExclusion);
// PATCH route to update custom client field (used for inline cell editing)
router.patch('/admin/update-client-field/:clientId', exclusionController.updateClientField);


module.exports = router;

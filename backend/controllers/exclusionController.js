// const db = require('../config/db');

// // Fetch clients with excluded admins
// exports.getExclusionSettings = async (req, res) => {
//   const query = `
//     SELECT 
//       c.id AS client_id,
//       c.client_name AS client_name,
//       c.service,
//       c.expiry_date,
//       GROUP_CONCAT(u.name SEPARATOR ', ') AS excluded_admins
//     FROM clients c
//     LEFT JOIN client_admin_exclusions e ON c.id = e.client_id
//     LEFT JOIN users u ON e.admin_id = u.id
//     GROUP BY c.id
//   `;
//   db.query(query, (err, results) => {
//     if (err) return res.status(500).json({ error: 'DB error', details: err });
//     const enriched = results.map(row => ({
//       ...row,
//       excluded_admins: row.excluded_admins || 'None'
//     }));
//     res.json(enriched);
//   });
// };

// // Fetch all admins
// exports.getAdminUsers = async (req, res) => {
//   db.query("SELECT id, name FROM users WHERE role = 'admin'", (err, results) => {
//     if (err) return res.status(500).json({ error: 'Failed to fetch admins' });
//     res.json(results);
//   });
// };

// // Exclude or Include admin for client
// exports.updateExclusion = async (req, res) => {
//   const { clientId } = req.params;
//   const { action, adminId } = req.body;

//   if (!['exclude', 'include'].includes(action) || !clientId || !adminId) {
//     return res.status(400).json({ error: 'Invalid input' });
//   }

//   if (action === 'exclude') {
//     const sql = 'INSERT IGNORE INTO client_admin_exclusions (client_id, admin_id) VALUES (?, ?)';
//     db.query(sql, [clientId, adminId], (err) => {
//       if (err) return res.status(500).json({ error: 'Exclude failed' });
//       res.json({ message: 'Admin excluded for client' });
//     });
//   } else {
//     const sql = 'DELETE FROM client_admin_exclusions WHERE client_id = ? AND admin_id = ?';
//     db.query(sql, [clientId, adminId], (err) => {
//       if (err) return res.status(500).json({ error: 'Include failed' });
//       res.json({ message: 'Admin included (restored) for client' });
//     });
//   }
// };

// // PATCH /admin/update-client-field/:clientId
// exports.updateClientField = async (req, res) => {
//   const { clientId } = req.params;
//   const { key, value } = req.body;

//   if (!key.startsWith('custom_')) {
//     return res.status(400).json({ error: 'Only custom fields can be updated' });
//   }

//   const sql = `UPDATE clients SET \`${key}\` = ? WHERE id = ?`;
//   db.query(sql, [value, clientId], (err) => {
//     if (err) return res.status(500).json({ error: 'Update failed' });
//     res.json({ message: 'Field updated' });
//   });
// };


// // const db = require('../config/db');
// // const { getUserFieldsForPage } = require('../utils/userFieldUtils');

// // // GET /admin/exclusion-settings
// // exports.getExclusionSettings = async (req, res) => {
// //   try {
// //     const fields = await getUserFieldsForPage('excludeClients');
// //     const baseFields = fields.map(col => `c.${col}`).join(', ');

// //     const query = `
// //       SELECT 
// //         c.id AS client_id,
// //         ${baseFields},
// //         GROUP_CONCAT(u.name SEPARATOR ', ') AS excluded_admins
// //       FROM clients c
// //       LEFT JOIN client_admin_exclusions e ON c.id = e.client_id
// //       LEFT JOIN users u ON e.admin_id = u.id
// //       GROUP BY c.id
// //     `;

// //     db.query(query, (err, results) => {
// //       if (err) return res.status(500).json({ error: 'DB error', details: err });
// //       const enriched = results.map(row => ({
// //         ...row,
// //         excluded_admins: row.excluded_admins || 'None'
// //       }));
// //       res.json(enriched);
// //     });
// //   } catch (error) {
// //     console.error('Exclusion fetch error:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // };

// // // GET /admin/admin-users
// // exports.getAdminUsers = async (req, res) => {
// //   db.query("SELECT id, name FROM users WHERE role = 'admin'", (err, results) => {
// //     if (err) return res.status(500).json({ error: 'Failed to fetch admins' });
// //     res.json(results);
// //   });
// // };

// // // PATCH /admin/exclusion-settings/:clientId
// // exports.updateExclusion = async (req, res) => {
// //   const { clientId } = req.params;
// //   const { action, adminId } = req.body;

// //   if (!['exclude', 'include'].includes(action) || !clientId || !adminId) {
// //     return res.status(400).json({ error: 'Invalid input' });
// //   }

// //   const query = action === 'exclude'
// //     ? 'INSERT IGNORE INTO client_admin_exclusions (client_id, admin_id) VALUES (?, ?)'
// //     : 'DELETE FROM client_admin_exclusions WHERE client_id = ? AND admin_id = ?';

// //   db.query(query, [clientId, adminId], (err) => {
// //     if (err) return res.status(500).json({ error: 'Action failed' });
// //     res.json({ message: `Admin ${action}d for client` });
// //   });
// // };

// // // PATCH /admin/update-client-field/:clientId
// // exports.updateClientField = async (req, res) => {
// //   const { clientId } = req.params;
// //   const { key, value } = req.body;

// //   if (!key.startsWith('custom_')) {
// //     return res.status(400).json({ error: 'Only custom fields can be updated' });
// //   }

// //   const sql = `UPDATE clients SET \`${key}\` = ? WHERE id = ?`;
// //   db.query(sql, [value, clientId], (err) => {
// //     if (err) return res.status(500).json({ error: 'Update failed' });
// //     res.json({ message: 'Field updated' });
// //   });
// // };


const db = require('../config/db');
const { getUserFieldsForPage } = require('../utils/userFieldUtils');

exports.getExclusionSettings = async (req, res) => {
    try {
        const fields = await getUserFieldsForPage('excludeClients');

        const [dbCols] = await db.promise().query(`SHOW COLUMNS FROM clients`);
        const dbColumnNames = dbCols.map(col => col.Field);
        const validFields = fields.filter(f => dbColumnNames.includes(f));
        //   const baseFields = validFields.map(col => `c.${col}`).join(', ');
        const baseFields = validFields.map(col =>
            col === 'expiry_date' ? "DATE_FORMAT(c.expiry_date, '%d-%m-%Y') AS expiry_date" : `c.${col}`
        ).join(', ');


        const query = `
        SELECT 
          c.id AS client_id
          ${baseFields ? ', ' + baseFields : ''}
          , GROUP_CONCAT(u.name SEPARATOR ', ') AS excluded_admins
        FROM clients c
        LEFT JOIN client_admin_exclusions e ON c.id = e.client_id
        LEFT JOIN users u ON e.admin_id = u.id
        GROUP BY c.id
      `;

        console.log('🟡 Final Query Executing:\n', query); // Log actual SQL

        db.query(query, (err, results) => {
            if (err) {
                console.error('❌ DB error:', err); // Log DB error
                return res.status(500).json({ error: 'DB error', details: err });
            }

            const enriched = results.map(row => ({
                ...row,
                excluded_admins: row.excluded_admins || 'None'
            }));
            res.json(enriched);
        });
    } catch (error) {
        console.error('❌ Exclusion fetch failed:', error); // Log JS error
        res.status(500).json({ error: 'Internal server error' });
    }
};


// GET /admin/admin-users
exports.getAdminUsers = async (req, res) => {
    db.query("SELECT id, name FROM users WHERE role = 'admin'", (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch admins' });
        res.json(results);
    });
};

// PATCH /admin/exclusion-settings/:clientId
exports.updateExclusion = async (req, res) => {
    const { clientId } = req.params;
    const { action, adminId } = req.body;

    if (!['exclude', 'include'].includes(action) || !clientId || !adminId) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const query = action === 'exclude'
        ? 'INSERT IGNORE INTO client_admin_exclusions (client_id, admin_id) VALUES (?, ?)'
        : 'DELETE FROM client_admin_exclusions WHERE client_id = ? AND admin_id = ?';

    db.query(query, [clientId, adminId], (err) => {
        if (err) return res.status(500).json({ error: 'Action failed' });
        res.json({ message: `Admin ${action}d for client` });
    });
};

// PATCH /admin/update-client-field/:clientId
exports.updateClientField = async (req, res) => {
    const { clientId } = req.params;
    const { key, value } = req.body;

    if (!key.startsWith('custom_')) {
        return res.status(400).json({ error: 'Only custom fields can be updated' });
    }

    const sql = `UPDATE clients SET \`${key}\` = ? WHERE id = ?`;
    db.query(sql, [value, clientId], (err) => {
        if (err) return res.status(500).json({ error: 'Update failed' });
        res.json({ message: 'Field updated' });
    });
};

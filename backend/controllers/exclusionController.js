const db = require('../config/db');

// Fetch clients with excluded admins
exports.getExclusionSettings = async (req, res) => {
  const query = `
    SELECT 
      c.id AS client_id,
      c.client_name AS client_name,
      c.service,
      c.expiry_date,
      GROUP_CONCAT(u.name SEPARATOR ', ') AS excluded_admins
    FROM clients c
    LEFT JOIN client_admin_exclusions e ON c.id = e.client_id
    LEFT JOIN users u ON e.admin_id = u.id
    GROUP BY c.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err });
    const enriched = results.map(row => ({
      ...row,
      excluded_admins: row.excluded_admins || 'None'
    }));
    res.json(enriched);
  });
};

// Fetch all admins
exports.getAdminUsers = async (req, res) => {
  db.query("SELECT id, name FROM users WHERE role = 'admin'", (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch admins' });
    res.json(results);
  });
};

// Exclude or Include admin for client
exports.updateExclusion = async (req, res) => {
  const { clientId } = req.params;
  const { action, adminId } = req.body;

  if (!['exclude', 'include'].includes(action) || !clientId || !adminId) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (action === 'exclude') {
    const sql = 'INSERT IGNORE INTO client_admin_exclusions (client_id, admin_id) VALUES (?, ?)';
    db.query(sql, [clientId, adminId], (err) => {
      if (err) return res.status(500).json({ error: 'Exclude failed' });
      res.json({ message: 'Admin excluded for client' });
    });
  } else {
    const sql = 'DELETE FROM client_admin_exclusions WHERE client_id = ? AND admin_id = ?';
    db.query(sql, [clientId, adminId], (err) => {
      if (err) return res.status(500).json({ error: 'Include failed' });
      res.json({ message: 'Admin included (restored) for client' });
    });
  }
};

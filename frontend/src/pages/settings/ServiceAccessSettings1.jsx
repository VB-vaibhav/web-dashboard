const db = require('../config/db');
const { getDateRangeForFilter } = require('../utils/dateUtils'); // You need to create this helper

exports.getClients = (req, res) => {
  const { role, id: userId } = req.user;
  const { service, dateFilter, from, to } = req.query;

  let sql = ``;
  const params = [];

  if (role === 'superadmin') {
    // 🔓 Superadmin sees all, ignore exclusions
    sql = `SELECT * FROM clients WHERE is_cancelled = FALSE`;

    if (service && service !== 'all') {
      sql += ` AND service = ?`;
      params.push(service);
    }

    if (from && to) {
      sql += ` AND DATE(start_date) BETWEEN ? AND ?`;
      params.push(from, to);
    }

  } else {
    // 🔐 Admin & Middleman — Respect exclusions
    sql = `
      SELECT c.* FROM clients c
      LEFT JOIN client_admin_exclusions e 
      ON c.logical_client_id = e.logical_client_id AND e.admin_id = ?
      WHERE c.is_cancelled = FALSE AND e.id IS NULL
    `;
    params.push(userId);

    if (service && service !== 'all') {
      sql += ` AND c.service = ?`;
      params.push(service);
    }

    if (from && to) {
      sql += ` AND DATE(c.start_date) BETWEEN ? AND ?`;
      params.push(from, to);
    }

    if (role === 'middleman') {
      sql += ` AND c.middleman_name = (SELECT username FROM users WHERE id = ?)`;
      params.push(userId);
    }
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Client fetch error', details: err });
    res.json(results);
  });
};


exports.addClient = (req, res) => {
  const client = req.body;
  const fields = Object.keys(client).join(", ");
  const values = Object.values(client);
  const placeholders = values.map(() => "?").join(", ");

  const sql = `INSERT INTO clients (${fields}) VALUES (${placeholders})`;

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Insert failed", details: err });

    if (client.middleman_name) {
      updateMiddlemanServiceFlags(client.middleman_name);
    }

    res.status(201).json({ id: result.insertId });
  });
};

// ✅ PUT /clients/:id
exports.updateClient = (req, res) => {
  const { id } = req.params;
  const client = req.body;

  // Fetch old middleman/service to compare later
  db.query("SELECT middleman_name FROM clients WHERE id = ?", [id], (err, oldResult) => {
    if (err || oldResult.length === 0) return res.status(404).json({ error: "Client not found" });

    const oldMiddleman = oldResult[0].middleman_name;

    const updates = Object.keys(client).map(field => `${field} = ?`).join(", ");
    const values = [...Object.values(client), id];
    const sql = `UPDATE clients SET ${updates} WHERE id = ?`;

    db.query(sql, values, (err2) => {
      if (err2) return res.status(500).json({ error: "Update failed", details: err2 });

      if (client.middleman_name) {
        updateMiddlemanServiceFlags(client.middleman_name);
        if (client.middleman_name !== oldMiddleman) {
          updateMiddlemanServiceFlags(oldMiddleman);
        }
      }

      res.json({ message: "Client updated" });
    });
  });
};

// ✅ DELETE /clients/:id
exports.deleteClient = (req, res) => {
  const { id } = req.params;

  db.query("SELECT middleman_name FROM clients WHERE id = ?", [id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ error: "Client not found" });

    const middlemanName = result[0].middleman_name;

    const sql = "UPDATE clients SET is_cancelled = TRUE WHERE id = ?";
    db.query(sql, [id], (err2) => {
      if (err2) return res.status(500).json({ error: "Delete failed" });

      updateMiddlemanServiceFlags(middlemanName);
      res.json({ message: "Client cancelled" });
    });
  });
};



// Utility to dynamically update middleman service flags
function updateMiddlemanServiceFlags(middlemanName) {
  const services = ['vps', 'cerberus', 'proxy', 'storage', 'varys'];

  services.forEach(service => {
    const checkSql = `
      SELECT COUNT(*) AS count FROM clients
      WHERE service = ? AND middleman_name = ? AND is_cancelled = FALSE
    `;

    db.query(checkSql, [service, middlemanName], (err, results) => {
      if (!err) {
        const flagValue = results[0].count > 0 ? 1 : 0;
        const updateSql = `UPDATE users SET is_${service} = ? WHERE username = ?`;
        db.query(updateSql, [flagValue, middlemanName]);
      }
    });
  });
}
const db = require('../config/db');
const { getDateRangeForFilter } = require('../utils/dateUtils'); // You need to create this helper

// ✅ GET /clients (with role-based filtering)
// exports.getClients = (req, res) => {
//   const { role, id: userId } = req.user;

//   let sql = "SELECT * FROM clients WHERE is_cancelled = FALSE";
//   const params = [];

//   if (role === 'admin') {
//     const serviceFields = ['is_vps', 'is_cerberus', 'is_proxy', 'is_storage', 'is_varys'];
//     db.query("SELECT ?? FROM users WHERE id = ?", [serviceFields, userId], (err, rows) => {
//       if (err || rows.length === 0) return res.status(500).json({ error: 'Service access error' });

//       const allowedServices = serviceFields
//         .filter(service => rows[0][service] === 1)
//         .map(service => service.replace('is_', ''));

//       if (allowedServices.length === 0) return res.json([]);

//       sql += ` AND service IN (${allowedServices.map(() => '?').join(',')})`;
//       db.query(sql, allowedServices, (err2, results) => {
//         if (err2) return res.status(500).json({ error: 'Client fetch error' });
//         res.json(results);
//       });
//     });

//   } else if (role === 'middleman') {
//     sql += " AND middleman_name = (SELECT username FROM users WHERE id = ?)";
//     params.push(userId);
//     db.query(sql, params, (err, results) => {
//       if (err) return res.status(500).json({ error: 'Client fetch error' });
//       res.json(results);
//     });

//   } else {
//     db.query(sql, (err, results) => {
//       if (err) return res.status(500).json({ error: 'Client fetch error' });
//       res.json(results);
//     });
//   }
// };

// ✅ POST /clients

// ✅ GET /clients/:ser
// vice (dynamic, secure, smart)


// exports.getClients = (req, res) => {
//   const { role, id: userId } = req.user;
//   const { service } = req.params;

//   const validServices = ['cerberus', 'vps', 'proxy', 'storage', 'varys'];

//   // If it's a general GET /clients call (not /:service), no filter needed
//   const isServiceSpecific = !!service;
//   if (isServiceSpecific && !validServices.includes(service)) {
//     return res.status(400).json({ error: 'Invalid service name' });
//   }

//   let sql = `SELECT * FROM clients WHERE is_cancelled = FALSE`;
//   const params = [];

//   if (isServiceSpecific) {
//     sql += ` AND service = ?`;
//     params.push(service);
//   }

//   if (role === 'middleman') {
//     sql += ` AND middleman_name = (SELECT username FROM users WHERE id = ?)`;
//     params.push(userId);
//   }
//   else if (role === 'admin') {
//     // Admins should only see clients not excluded for them
//     db.query(sql, params, (err, results) => {
//       if (err) return res.status(500).json({ error: "Client fetch error", details: err });

//       const filtered = results.filter(client => {
//         if (!client.excluded_admins) return true;
//         const excludedList = client.excluded_admins.split(',').map(id => id.trim());
//         return !excludedList.includes(String(userId));
//       });

//       res.json(filtered);
//     });

//   } else {

//     db.query(sql, params, (err, results) => {
//       if (err) return res.status(500).json({ error: "Client fetch error", details: err });
//       res.json(results);
//     });
//   }
// };

exports.getClients = (req, res) => {
  const { role, id: userId } = req.user;
  const { service } = req.params;
  const { dateFilter, from, to } = req.query;

  const validServices = ['cerberus', 'vps', 'proxy', 'storage', 'varys'];
  const isServiceSpecific = !!service;

  if (isServiceSpecific && !validServices.includes(service)) {
    return res.status(400).json({ error: 'Invalid service name' });
  }

  let baseSQL = `
    SELECT c.* FROM clients c
    LEFT JOIN client_admin_exclusions e ON c.logical_client_id = e.logical_client_id AND e.admin_id = ?
    WHERE c.is_cancelled = FALSE AND (e.id IS NULL OR ? != ?)
  `;
  const params = [userId, userId, userId];


  if (isServiceSpecific) {
    baseSQL += ` AND c.service = ?`;
    params.push(service);
  }

  if (role === 'middleman') {
    baseSQL += ` AND c.middleman_name = (SELECT username FROM users WHERE id = ?)`;
    params.push(userId);
  } 
  
  // Apply Date Filter on start_date
  if (dateFilter && dateFilter !== 'all') {
    if (dateFilter === 'custom' && from && to) {
      baseSQL += ` AND DATE(c.start_date) BETWEEN ? AND ?`;
      params.push(from, to);
    } else {
      const { start, end } = getDateRangeForFilter(dateFilter);
      if (start && end) {
        baseSQL += ` AND DATE(c.start_date) BETWEEN ? AND ?`;
        params.push(start, end);
      }
    }
  } else {
    // Default: past 30 days
    baseSQL += ` AND c.start_date >= CURDATE() - INTERVAL 30 DAY`;
  }

  if (role !== 'admin' && role !== 'middleman') {
    // If superadmin, remove exclusion join and filter entirely
    baseSQL = `SELECT * FROM clients WHERE is_cancelled = FALSE`;
    if (isServiceSpecific) {
      baseSQL += ` AND service = ?`;
      params.shift(); // remove userId from param if not used
      params.length = 0;
      params.push(service);
    }
    if (dateFilter && dateFilter !== 'all') {
      if (dateFilter === 'custom' && from && to) {
        baseSQL += ` AND DATE(start_date) BETWEEN ? AND ?`;
        params.push(from, to);
      } else {
        const { start, end } = getDateRangeForFilter(dateFilter);
        if (start && end) {
          baseSQL += ` AND DATE(start_date) BETWEEN ? AND ?`;
          params.push(start, end);
        }
      }
    } else {
      baseSQL += ` AND start_date >= CURDATE() - INTERVAL 30 DAY`;
    }
  }

  db.query(baseSQL, params, (err, results) => {
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

// ✅ Update middleman's visibility flags based on current clients
// function updateMiddlemanServiceFlags(middlemanName) {
//   const flagValue = results[0].count > 0 ? 1 : 0;
//   const updateSql = `UPDATE users SET is_${service} = ? WHERE username = ?`;

//   const services = ['vps', 'cerberus', 'proxy', 'storage', 'varys'];

//   services.forEach(service => {
//     const checkSql = `
//           SELECT COUNT(*) AS count FROM clients
//           WHERE service = ? AND middleman_name = ? AND is_cancelled = FALSE
//         `;

//     db.query(checkSql, [service, middlemanName], (err, results) => {
//       if (!err) {
//         const flagValue = results[0].count > 0 ? 1 : 0;
//         const updateSql = `UPDATE users SET is_${service} = ? WHERE username = ?`;
//         db.query(updateSql, [flagValue, middlemanName]);
//       }
//     });
//   });
// }

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



// clientController.js
exports.getClientNames = (req, res) => {
  db.query("SELECT DISTINCT client_name FROM clients", (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed' });
    const names = results.map(r => r.client_name).filter(Boolean);
    res.json(names);
  });
};

exports.getServicePlans = (req, res) => {
  const { serviceId } = req.params;
  db.query("SELECT name FROM plans WHERE service_id = ?", [serviceId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch plans' });
    res.json(rows);
  });
};

exports.addClient = (req, res) => {
  const client = req.body;
  const fields = Object.keys(client).join(", ");
  const placeholders = Object.keys(client).map(() => "?").join(", ");
  const values = Object.values(client);

  db.query(`INSERT INTO clients (${fields}) VALUES (${placeholders})`, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'Insert failed' });
    res.status(201).json({ message: 'Client added', id: result.insertId });
  });
};

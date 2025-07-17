const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ✅ Middleware to verify access token
// exports.verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer '))
//     return res.status(403).send("Authorization token missing");

//   const token = authHeader.split(' ')[1];

//   jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
//     if (err) return res.status(403).send("Invalid or expired access token");

//     req.user = decoded; // decoded = { id, role }
//     next();
//   });
// };

// ✅ Secure access token validation with restriction + token_version check
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // decoded = { id, role, token_version }

    // 🔎 Fetch token version + restriction from DB
    const [rows] = await db.promise().query(
      "SELECT token_version, is_restricted FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!rows.length) return res.status(403).json({ error: 'User not found' });

    const { token_version, is_restricted } = rows[0];

    // ❌ Reject restricted users
    if (is_restricted === 1) {
      return res.status(403).json({ error: 'restricted_user' }); // Important keyword for frontend to detect
    }

    // 🔐 Session mismatch = force logout
    if (token_version !== decoded.token_version) {
      return res.status(403).json({ error: 'session_expired' });
    }

    req.user = decoded; // Attach decoded JWT info
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// ✅ Middleware to allow only specific roles
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).send("Unauthorized role");
    }
    next();
  };
};



exports.requireSettingsAccess = (req, res, next) => {
  if (req.user.role === 'superadmin') return next();

  const sql = `SELECT is_settings FROM users WHERE id = ?`;
  db.query(sql, [req.user.id], (err, rows) => {
    if (err || rows.length === 0) return res.status(403).send("Access check failed");

    if (rows[0].is_settings !== 1) {
      return res.status(403).send("Not authorized to access settings");
    }

    next();
  });
};

exports.checkServiceAccess = (serviceKey) => {
  return (req, res, next) => {
    if (req.user.role === 'superadmin') return next();

    const sql = `SELECT ?? FROM users WHERE id = ?`;
    db.query(sql, [serviceKey, req.user.id], (err, rows) => {
      if (err || rows.length === 0) return res.status(403).send("Access error");

      if (rows[0][serviceKey] !== 1) {
        return res.status(403).send("Not authorized for this service");
      }
      next();
    });
  };
};





// exports.verifyToken = async (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'Token missing' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

//     // Get user's latest token version and restriction status
//     const [rows] = await db.promise().query("SELECT token_version, is_restricted FROM users WHERE id = ?", [decoded.id]);

//     if (!rows.length) return res.status(403).json({ message: 'User not found' });
//     const user = rows[0];

//     if (user.is_restricted === 1) {
//       return res.status(403).json({ message: 'You are restricted' });
//     }

//     if (user.token_version !== decoded.token_version) {
//       return res.status(403).json({ message: 'Session expired. Please log in again.' });
//     }

//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: 'Invalid or expired token' });
//   }
// };

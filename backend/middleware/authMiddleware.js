const jwt = require('jsonwebtoken');

// ✅ Middleware to verify access token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(403).send("Authorization token missing");

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(403).send("Invalid or expired access token");

    req.user = decoded; // decoded = { id, role }
    next();
  });
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

const db = require('../config/db');

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

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

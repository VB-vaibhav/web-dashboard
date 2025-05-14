const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' }
  );
};

// // =================== REGISTER ===================
// exports.register = async (req, res) => {
//   const { username, email, password, role } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     db.query(
//       "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
//       [username, email, hashedPassword, role],
//       (err, result) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).send("Registration failed");
//         }
//         res.status(201).send("User registered");
//       }
//     );
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// =================== LOGIN ===================
exports.login = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? OR username = ?",
    [emailOrUsername, emailOrUsername],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(401).send("Invalid credentials");

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // console.log("❌ Password mismatch for:", user.username);
        return res.status(401).send("Invalid credentials");
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Send refresh token via secure HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Send access token in response
      res.json({
        accessToken,
        role: user.role,
        username: user.username
      });
    }
  );
};

// =================== REFRESH ACCESS TOKEN ===================
exports.refresh = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(403).send("Refresh token missing");

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid refresh token");

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
};

// =================== LOGOUT ===================
exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.send("Logged out");
};

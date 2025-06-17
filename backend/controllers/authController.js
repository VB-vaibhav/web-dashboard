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
      // console.log('Login payload received:', req.body);
      // console.log('Query results:', results);
      
      if (err) {
        console.error("DB error:", err);
        return res.status(401).send("Server Error");
      }
      
      if (results.length === 0) {
        console.log("No matching user found");
        return res.status(401).send("Invalid credentials");
      }
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      // console.log('Password match:', isMatch);
      if (!isMatch) {
        console.log("Password mismatch");
        return res.status(401).send("Invalid credentials");
      }
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);


      // Send refresh token via secure HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.json({
        accessToken,
        role: user.role,
        username: user.username,
        permissions: {
          is_cerberus: user.is_cerberus,
          is_vps: user.is_vps,
          is_proxy: user.is_proxy,
          is_storage: user.is_storage,
          is_varys: user.is_varys,
          is_notification: user.is_notification,
          is_mail: user.is_mail,
          is_reports: user.is_reports,
          is_settings: user.is_settings
        }
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


// =================== FORGOT PASSWORD ===================
const nodemailer = require('nodemailer');

exports.forgotPassword = async (req, res) => {
  const { emailOrUsername } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? OR username = ?",
    [emailOrUsername, emailOrUsername],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      // Save OTP
      db.query(
        "INSERT INTO password_resets (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
        [user.id, otp, expiresAt],
        (insertErr) => {
          if (insertErr) return res.status(500).send("Error saving OTP");

          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: true,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          });

          const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: "Password Reset OTP",
            html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
          };

          transporter.sendMail(mailOptions, (emailErr) => {
            if (emailErr) {
              return res.status(500).json({ message: "Error sending email" });
            }
            return res.json({ message: "OTP sent successfully to your email." });
          });
        }
      );
    }
  );
};

// =================== USER VERIFIES OTP ===================
exports.verifyOtp = (req, res) => {
  const { emailOrUsername, otp } = req.body;

  db.query(
    "SELECT id FROM users WHERE email = ? OR username = ?",
    [emailOrUsername, emailOrUsername],
    (err, users) => {
      if (err || users.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userId = users[0].id;

      db.query(
        "SELECT * FROM password_resets WHERE user_id = ? ORDER BY id DESC LIMIT 1",
        [userId],
        (err, results) => {
          if (err || results.length === 0) {
            return res.status(400).json({ message: "OTP not found" });
          }

          const record = results[0];
          const isExpired = new Date(record.expires_at) < new Date();
          const isMatch = record.otp_code === otp;

          if (!isMatch || isExpired) {
            return res.status(401).json({ message: "Invalid or expired OTP" });
          }

          res.json({ message: "OTP verified" });
        }
      );
    }
  );
};

// =================== USER SETS NEW PASSWORD ===================

exports.resetPassword = async (req, res) => {
  const { emailOrUsername, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  db.query(
    "SELECT id FROM users WHERE email = ? OR username = ?",
    [emailOrUsername, emailOrUsername],
    (err, users) => {
      if (err || users.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userId = users[0].id;

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ message: "Error updating password" });
          }

          // Optional: remove used OTP
          db.query("DELETE FROM password_resets WHERE user_id = ?", [userId]);

          res.json({ message: "Password has been reset successfully" });
        }
      );
    }
  );
};



// =================== GLOBAL REFRESH ===================
exports.getMe = (req, res) => {
  const userId = req.user.id;
  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = results[0];
    return res.json({
      role: user.role,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      join_date: user.created_at,
      user_id: user.id,
      avatar: user.avatar_url,
      permissions: {
        is_cerberus: user.is_cerberus,
        is_vps: user.is_vps,
        is_proxy: user.is_proxy,
        is_storage: user.is_storage,
        is_varys: user.is_varys,
        is_notification: user.is_notification,
        is_mail: user.is_mail,
        is_reports: user.is_reports,
        is_settings: user.is_settings

      }
    });
  });
};

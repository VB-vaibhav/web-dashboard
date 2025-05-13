const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.query("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
    [username, email, hashedPassword, role],
    (err, result) => {
      if (err) return res.status(500).send("Registration failed");
      res.status(201).send("User registered");
    });
};

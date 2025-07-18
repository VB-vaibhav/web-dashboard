// backend/config/db.js
require('dotenv').config();
const mysql = require('mysql2');
console.log('DB_HOST from env:', process.env.DB_HOST);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: ['DATE']
});

module.exports = pool;

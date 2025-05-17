const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clients', clientRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT);
});

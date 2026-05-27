const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('ZenTek Exchange API is running...');
});

// Import and use API routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

module.exports = app;

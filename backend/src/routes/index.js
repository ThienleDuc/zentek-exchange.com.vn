const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const uploadRoutes = require('./upload/upload.routes');

// Đăng ký nhánh định tuyến /auth
router.use('/auth', authRoutes);

// Đăng ký nhánh định tuyến /upload
router.use('/upload', uploadRoutes);

module.exports = router;

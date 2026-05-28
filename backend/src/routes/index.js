const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const uploadRoutes = require('./upload/upload.routes');
const categoryRoutes = require('./category/category.routes');

// Đăng ký nhánh định tuyến /auth
router.use('/auth', authRoutes);

// Đăng ký nhánh định tuyến /upload
router.use('/upload', uploadRoutes);

// Đăng ký nhánh định tuyến /categories
router.use('/categories', categoryRoutes);

module.exports = router;

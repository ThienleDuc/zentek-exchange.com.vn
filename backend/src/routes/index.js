const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const uploadRoutes = require('./upload/upload.routes');
const categoryRoutes = require('./category/category.routes');
const userRoutes = require('./user/user.routes');

// Đăng ký nhánh định tuyến /auth
router.use('/auth', authRoutes);

// Đăng ký nhánh định tuyến /upload
router.use('/upload', uploadRoutes);

// Đăng ký nhánh định tuyến /categories
router.use('/categories', categoryRoutes);

// Đăng ký nhánh định tuyến /users (Quản lý người dùng)
router.use('/users', userRoutes);

module.exports = router;

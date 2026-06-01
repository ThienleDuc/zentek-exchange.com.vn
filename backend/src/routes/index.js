const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const uploadRoutes = require('./upload/upload.routes');
const categoryRoutes = require('./category/category.routes');
const userRoutes = require('./user/user.routes');
const shopRoutes = require('./shop/shop.routes');

// Đăng ký nhánh định tuyến /auth
router.use('/auth', authRoutes);

// Đăng ký nhánh định tuyến /upload
router.use('/upload', uploadRoutes);

// Đăng ký nhánh định tuyến /categories
router.use('/categories', categoryRoutes);

// Đăng ký nhánh định tuyến /users (Quản lý người dùng)
router.use('/users', userRoutes);

// Đăng ký nhánh định tuyến /shops (Quản lý cửa hàng)
router.use('/shops', shopRoutes);

// Đăng ký nhánh định tuyến /admin/products (Quản lý sản phẩm cho Admin)
const productAdminRoutes = require('./product/productAdmin.routes');
router.use('/admin/products', productAdminRoutes);

// Đăng ký nhánh định tuyến /admin/chats (Quản lý tin nhắn cho Admin)
const chatAdminRoutes = require('./admin/chatAdmin.routes');
router.use('/admin/chats', chatAdminRoutes);

// Đăng ký nhánh định tuyến /chats (Quản lý tin nhắn cho User)
const chatRoutes = require('./chat/chat.routes');
router.use('/chats', chatRoutes);

module.exports = router;

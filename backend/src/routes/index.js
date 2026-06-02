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

// Đăng ký nhánh định tuyến /user và /nguoidung (Profile & Thay đổi thông tin cá nhân)
const userProfileRoutes = require('./user/userProfile.routes');
router.use('/user', userProfileRoutes);
router.use('/nguoidung', userProfileRoutes);

// Đăng ký nhánh định tuyến /seller (Hồ sơ người bán)
const sellerRoutes = require('./user/seller.routes');
router.use('/seller', sellerRoutes);

// Đăng ký nhánh định tuyến /otp (Mã xác thực OTP)
const otpRoutes = require('./auth/otp.routes');
router.use('/otp', otpRoutes);


// Đăng ký nhánh định tuyến /admin/products (Quản lý sản phẩm cho Admin)
const productAdminRoutes = require('./product/productAdmin.routes');
router.use('/admin/products', productAdminRoutes);

// Đăng ký nhánh định tuyến /admin/chats (Quản lý tin nhắn cho Admin)
const chatAdminRoutes = require('./admin/chatAdmin.routes');
router.use('/admin/chats', chatAdminRoutes);

// Đăng ký nhánh định tuyến /chats (Quản lý tin nhắn cho User)
const chatRoutes = require('./chat/chat.routes');
router.use('/chats', chatRoutes);

// Đăng ký nhánh định tuyến /products (Public API)
const productRoutes = require('./product/product.routes');
router.use('/products', productRoutes);

// Đăng ký nhánh định tuyến /stores (Public API)
const storeRoutes = require('./store/store.routes');
router.use('/stores', storeRoutes);

// Đăng ký nhánh định tuyến /cart (Giỏ hàng)
const cartRoutes = require('./cart/cart.routes');
router.use('/cart', cartRoutes);

// Đăng ký nhánh định tuyến /temp-order (Đơn hàng tạm)
const tempOrderRoutes = require('./temp-order/tempOrder.routes');
router.use('/temp-order', tempOrderRoutes);

// Đăng ký nhánh định tuyến /orders (Đặt hàng)
const orderRoutes = require('./order/order.routes');
router.use('/orders', orderRoutes);

module.exports = router;

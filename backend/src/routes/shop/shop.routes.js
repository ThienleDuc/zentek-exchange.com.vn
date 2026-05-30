const express = require('express');
const router = express.Router();
const shopController = require('../../controllers/shop/shop.controller');
const { authenticateToken: authMiddleware, authorizeRoles: checkRole } = require('../../middlewares/auth/auth.middleware.js');

// Các API này dành cho Admin, nên có thể bọc qua authMiddleware và checkRole('Admin')
// Tạm thời để mở (hoặc chỉ authMiddleware) theo setup dự án hiện tại

// Thống kê (Nên đặt trước /:id để tránh bị nhầm param)
router.get('/stats', authMiddleware, checkRole('Admin'), shopController.getStats);

// Các thao tác CRUD
router.get('/', authMiddleware, checkRole('Admin'), shopController.getShops);
router.post('/', authMiddleware, checkRole('Admin'), shopController.createShop);
router.put('/:id', authMiddleware, checkRole('Admin'), shopController.updateShop);

// Đổi trạng thái & Phê duyệt
router.put('/:id/status', authMiddleware, checkRole('Admin'), shopController.toggleStatus);
router.put('/:id/approval', authMiddleware, checkRole('Admin'), shopController.approveShop);

module.exports = router;

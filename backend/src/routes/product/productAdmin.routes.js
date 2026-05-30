const express = require('express');
const router = express.Router();
const productAdminController = require('../../controllers/productAdmin.controller');
const { authenticateToken, authorizeRoles } = require('../../middlewares/auth/auth.middleware');

// Áp dụng middleware xác thực và kiểm tra quyền Admin cho tất cả các route trong file này
router.use(authenticateToken);
router.use(authorizeRoles('Admin', 'Moderator'));

// Thống kê sản phẩm
router.get('/stats', productAdminController.getStats);

// Danh sách sản phẩm (có phân trang, filter)
router.get('/', productAdminController.getProducts);

// Chi tiết sản phẩm
router.get('/:id', productAdminController.getProductDetail);

// Thay đổi trạng thái duyệt của sản phẩm
router.put('/:id/status', productAdminController.updateStatus);

module.exports = router;

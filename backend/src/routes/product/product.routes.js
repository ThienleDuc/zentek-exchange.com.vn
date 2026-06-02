// Product routes definition
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const { authenticateToken, authorizeRoles } = require('../../middlewares/auth/auth.middleware');

const validateUuidParam = (paramName) => {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!uuidRegex.test(value)) {
      return res.status(400).json({ success: false, message: `Mã ${paramName === 'id' ? 'sản phẩm' : 'đánh giá'} không hợp lệ.` });
    }
    next();
  };
};

// API Endpoints: /api/products
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);

// Seller-only endpoints (must be defined before /:id)
router.get('/seller', authenticateToken, authorizeRoles('Seller'), productController.getSellerProducts);
router.get('/seller/stats', authenticateToken, authorizeRoles('Seller'), productController.getSellerStats);
router.get('/seller/:id', authenticateToken, authorizeRoles('Seller'), validateUuidParam('id'), productController.getSellerProductDetail);
router.post('/', authenticateToken, authorizeRoles('Seller'), productController.createProduct);
router.put('/:id', authenticateToken, authorizeRoles('Seller'), validateUuidParam('id'), productController.updateProduct);
router.put('/:id/out-of-stock', authenticateToken, authorizeRoles('Seller'), validateUuidParam('id'), productController.setOutOfStock);
router.put('/:id/in-stock', authenticateToken, authorizeRoles('Seller'), validateUuidParam('id'), productController.setInStock);
router.get('/:id/reviews', productController.getProductReviews); // Public but accepts star filtering, or seller can use it
router.post('/reviews/:reviewId/reply', authenticateToken, authorizeRoles('Seller'), validateUuidParam('reviewId'), productController.replyReview);

// Public detail route
router.get('/:id', productController.getProductDetail);

module.exports = router;

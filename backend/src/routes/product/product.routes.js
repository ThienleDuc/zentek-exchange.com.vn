const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller');

// API Endpoints: /api/products
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductDetail);

module.exports = router;

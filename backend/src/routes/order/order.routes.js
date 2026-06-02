const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order.controller');
const { authenticateToken } = require('../../middlewares/auth/auth.middleware');

// Place order route requires authentication
router.post('/', authenticateToken, orderController.placeOrder);

// Fetch orders (buyer or seller)
router.get('/', authenticateToken, orderController.getOrders);

// Fetch detailed order invoice by ID
router.get('/:id', authenticateToken, orderController.getOrderDetails);

// Submit reviews for items in an order
router.post('/:id/danh-gia', authenticateToken, orderController.submitOrderReviews);

// Seller confirms shipment
router.put('/:id/xac-nhan-giao', authenticateToken, orderController.confirmShipment);

// Cancel order (buyer or seller)
router.put('/:id/huy', authenticateToken, orderController.cancelOrder);

// Buyer confirms receipt
router.put('/:id/da-nhan', authenticateToken, orderController.confirmReceived);

module.exports = router;

const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const { authenticateToken } = require('../../middlewares/auth/auth.middleware');

// All cart routes require user authentication
router.post('/add', authenticateToken, cartController.addToCart);
router.get('/', authenticateToken, cartController.getCart);
router.put('/update', authenticateToken, cartController.updateQuantity);
router.delete('/remove/:itemId', authenticateToken, cartController.removeItem);

module.exports = router;

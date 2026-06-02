const express = require('express');
const router = express.Router();
const tempOrderController = require('../../controllers/tempOrder.controller');
const { authenticateToken } = require('../../middlewares/auth/auth.middleware');

// All temporary order routes require authentication
router.post('/create', authenticateToken, tempOrderController.createTempOrder);
router.get('/:tempOrderId', authenticateToken, tempOrderController.getTempOrder);

module.exports = router;

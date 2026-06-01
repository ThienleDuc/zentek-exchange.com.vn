const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chat.controller');
const { authenticateToken } = require('../../middlewares/auth/auth.middleware');

// Các API dành cho User thông thường
router.use(authenticateToken);

// Tham gia nhóm cộng đồng
router.post('/join-community', chatController.joinCommunity);

// Tham gia nhóm bằng link
router.post('/join-group', chatController.joinGroup);

module.exports = router;

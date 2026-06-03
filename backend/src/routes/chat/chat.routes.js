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

// Kiểm tra chat tồn tại
router.get('/private-exists/:otherUserId', chatController.checkPrivateChatExists);

// Tạo chat riêng tư
router.post('/private-create', chatController.createPrivateChat);

// Tìm hoặc tạo cuộc trò chuyện riêng tư giữa 2 người (nếu đã có trả về id)
router.post('/private-find-or-create', chatController.findOrCreatePrivateChat);

// Thu hồi tin nhắn (chủ tin nhắn có thể thu hồi trong giới hạn thời gian)
router.put('/messages/:msgId/recall', chatController.recallMessage);

module.exports = router;

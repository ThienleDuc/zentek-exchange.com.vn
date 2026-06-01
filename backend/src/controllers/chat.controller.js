const chatService = require('../services/chat.service');

class ChatController {
  async joinCommunity(req, res) {
    try {
      const userId = req.user.userId;
      const role = req.user.role; // Lấy role từ JWT token
      
      if (!role) {
        return res.status(403).json({ success: false, message: 'Không thể xác định vai trò người dùng' });
      }

      const result = await chatService.joinCommunityGroup(userId, role);
      res.json({ success: true, message: result.message, data: { groupId: result.groupId } });
    } catch (error) {
      console.error('Lỗi khi tham gia cộng đồng:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async joinGroup(req, res) {
    try {
      const userId = req.user.userId;
      const { groupId } = req.body;

      if (!groupId) {
        return res.status(400).json({ success: false, message: 'Thiếu ID nhóm' });
      }

      const result = await chatService.joinGroup(userId, groupId);
      res.json({ success: true, message: result.message, data: { groupId: result.groupId } });
    } catch (error) {
      console.error('Lỗi khi tham gia nhóm:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }
}

module.exports = new ChatController();

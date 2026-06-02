const chatService = require('../services/chat.service');

class ChatController {
  async joinCommunity(req, res) {
    try {
      const userId = req.user.userId;
      const role = req.user.roleName || req.user.role; // Lấy role từ JWT token
      
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

  async checkPrivateChatExists(req, res) {
    try {
      const userId = req.user.userId;
      const { otherUserId } = req.params;

      if (!otherUserId) {
        return res.status(400).json({ success: false, message: 'Thiếu ID đối tác chat (otherUserId).' });
      }

      const result = await chatService.checkPrivateChatExists(userId, otherUserId);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Lỗi khi kiểm tra chat tồn tại:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra chat', error: error.message });
    }
  }

  async createPrivateChat(req, res) {
    try {
      const userId = req.user.userId;
      const { otherUserId } = req.body;

      if (!otherUserId) {
        return res.status(400).json({ success: false, message: 'Thiếu ID đối tác chat (otherUserId).' });
      }

      const conversationId = await chatService.createPrivateChat(userId, otherUserId);
      res.status(201).json({ success: true, message: 'Tạo cuộc trò chuyện thành công', data: { conversationId } });
    } catch (error) {
      console.error('Lỗi khi tạo chat riêng tư:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi tạo chat riêng tư', error: error.message });
    }
  }
}

module.exports = new ChatController();

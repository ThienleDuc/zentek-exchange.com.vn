const chatAdminService = require('../services/chatAdmin.service');

class ChatAdminController {
  async getConversations(req, res) {
    try {
      const adminId = req.user.userId;
      const { filter } = req.query;
      const conversations = await chatAdminService.getConversations(adminId, filter);
      res.json({ success: true, data: conversations });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cuộc trò chuyện:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  async getMessages(req, res) {
    try {
      const adminId = req.user.userId;
      const { id } = req.params;
      const messages = await chatAdminService.getMessages(id, adminId);
      res.json({ success: true, data: messages });
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn:', error);
      res.status(403).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async sendMessage(req, res) {
    try {
      const adminId = req.user.userId;
      const { id } = req.params;
      const { content } = req.body;
      const files = req.files;
      
      if ((!content || !content.trim()) && (!files || files.length === 0)) {
        return res.status(400).json({ success: false, message: 'Nội dung tin nhắn và file đính kèm không được cùng trống' });
      }

      const message = await chatAdminService.sendMessage(id, adminId, content, files);
      res.json({ success: true, data: message });
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async recallMessage(req, res) {
    try {
      const adminId = req.user.userId;
      const { msgId } = req.params;
      
      await chatAdminService.recallMessage(msgId, adminId);
      res.json({ success: true, message: 'Thu hồi tin nhắn thành công' });
    } catch (error) {
      console.error('Lỗi khi thu hồi tin nhắn:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async deleteMessage(req, res) {
    try {
      const adminId = req.user.userId;
      const { msgId } = req.params;
      
      await chatAdminService.deleteMessagePermanently(msgId, adminId);
      res.json({ success: true, message: 'Xóa tin nhắn vĩnh viễn thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa tin nhắn vĩnh viễn:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async createGroup(req, res) {
    try {
      const adminId = req.user.userId;
      const { name, memberIds } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Tên nhóm không được để trống' });
      }
      if (!Array.isArray(memberIds)) {
        return res.status(400).json({ success: false, message: 'Danh sách thành viên không hợp lệ' });
      }

      const newGroup = await chatAdminService.createGroup(adminId, name, memberIds);
      res.status(201).json({ success: true, data: newGroup, message: 'Tạo nhóm thành công' });
    } catch (error) {
      console.error('Lỗi khi tạo nhóm:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async deleteGroup(req, res) {
    try {
      const { groupId } = req.params;
      await chatAdminService.deleteGroup(groupId);
      res.json({ success: true, message: 'Xóa nhóm thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa nhóm:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }

  async addMembers(req, res) {
    try {
      const { groupId } = req.params;
      const { memberIds } = req.body;

      if (!Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Danh sách thành viên không hợp lệ' });
      }

      await chatAdminService.addMembersToGroup(groupId, memberIds);
      res.json({ success: true, message: 'Thêm thành viên thành công' });
    } catch (error) {
      console.error('Lỗi khi thêm thành viên:', error);
      res.status(400).json({ success: false, message: error.message || 'Lỗi server' });
    }
  }
}

module.exports = new ChatAdminController();

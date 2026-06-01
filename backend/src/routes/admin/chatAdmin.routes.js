const express = require('express');
const router = express.Router();
const chatAdminController = require('../../controllers/chatAdmin.controller');
const { authenticateToken, authorizeRoles } = require('../../middlewares/auth/auth.middleware');

// Áp dụng middleware xác thực và kiểm tra quyền chung cho tất cả các vai trò
router.use(authenticateToken);
router.use(authorizeRoles('Admin', 'Moderator', 'Seller', 'Buyer'));

// Lấy danh sách các cuộc trò chuyện
router.get('/', chatAdminController.getConversations);

// Tạo nhóm mới - Chỉ cho phép Admin, Moderator, Seller
router.post('/group', authorizeRoles('Admin', 'Moderator', 'Seller'), chatAdminController.createGroup);

// Lấy danh sách tin nhắn của một cuộc trò chuyện
router.get('/:id/messages', chatAdminController.getMessages);

const { uploadMediaMiddleware } = require('../../utils/file.utils');

// Gửi tin nhắn mới vào cuộc trò chuyện (hỗ trợ đính kèm tối đa 5 files)
router.post('/:id/messages', uploadMediaMiddleware.array('files', 5), chatAdminController.sendMessage);

// Thu hồi tin nhắn
router.put('/:id/messages/:msgId/recall', chatAdminController.recallMessage);

// Xóa tin nhắn vĩnh viễn (Hard Delete)
router.delete('/:id/messages/:msgId', chatAdminController.deleteMessage);

// Xóa nhóm - Chỉ cho phép Admin, Moderator, Seller
router.delete('/groups/:groupId', authorizeRoles('Admin', 'Moderator', 'Seller'), chatAdminController.deleteGroup);

// Thêm thành viên vào nhóm - Chỉ cho phép Admin, Moderator, Seller
router.post('/groups/:groupId/members', authorizeRoles('Admin', 'Moderator', 'Seller'), chatAdminController.addMembers);

module.exports = router;

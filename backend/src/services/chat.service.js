const chatRepository = require('../repositories/chat/chat.repository');

class ChatService {
  async joinCommunityGroup(userId, role) {
    let groupName = '';

    if (role === 'Buyer') {
      groupName = 'Cộng đồng người mua';
    } else if (role === 'Seller') {
      groupName = 'Cộng đồng người bán';
    } else {
      throw new Error('Vai trò không hợp lệ để tham gia nhóm cộng đồng');
    }

    // 1. Tìm nhóm chat
    const group = await chatRepository.findGroupByName(groupName);
    if (!group) {
      throw new Error('Không tìm thấy nhóm cộng đồng. Vui lòng liên hệ Admin.');
    }

    const groupId = group.MaCuocTroChuyen;

    // 2. Kiểm tra xem user đã tham gia chưa
    const isAlreadyMember = await chatRepository.isMember(groupId, userId);
    if (isAlreadyMember) {
      return { message: 'Bạn đã tham gia nhóm này rồi', groupId };
    }

    // 3. Thêm user vào nhóm
    await chatRepository.addMember(groupId, userId, 'thanh_vien');

    return { message: 'Tham gia cộng đồng thành công', groupId };
  }

  async joinGroup(userId, groupId) {
    // 1. Kiểm tra xem nhóm chat có tồn tại không
    const group = await chatRepository.findGroupById(groupId);
    if (!group) {
      throw new Error('Nhóm trò chuyện không tồn tại hoặc không hợp lệ');
    }

    // 2. Kiểm tra xem user đã tham gia chưa
    const isAlreadyMember = await chatRepository.isMember(groupId, userId);
    if (isAlreadyMember) {
      return { message: 'Bạn đã tham gia nhóm này rồi', groupId };
    }

    // 3. Thêm user vào nhóm
    await chatRepository.addMember(groupId, userId, 'thanh_vien');

    return { message: 'Tham gia nhóm thành công', groupId };
  }

  async checkPrivateChatExists(userId, otherUserId) {
    const conversationId = await chatRepository.findPrivateChat(userId, otherUserId);
    if (conversationId) {
      return { exists: true, conversationId };
    }
    return { exists: false, conversationId: null };
  }

  async createPrivateChat(userId, otherUserId) {
    const { poolPromise: pool, sql } = require('../config/db');
    const db = await pool;
    const transaction = new sql.Transaction(db);
    await transaction.begin();

    try {
      // 1. Tạo cuộc trò chuyện
      const convRequest = new sql.Request(transaction);
      const chatResult = await convRequest.query(`
        INSERT INTO CuocTroChuyen (Loai, NgayTao, NgayCapNhat)
        OUTPUT INSERTED.MaCuocTroChuyen
        VALUES ('ca_nhan', GETDATE(), GETDATE())
      `);
      const conversationId = chatResult.recordset[0].MaCuocTroChuyen;

      // 2. Thêm userId
      const member1Request = new sql.Request(transaction);
      await member1Request
        .input('conversationId', sql.UniqueIdentifier, conversationId)
        .input('userId', sql.UniqueIdentifier, userId)
        .query(`
          INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
          VALUES (@conversationId, @userId, 'thanh_vien')
        `);

      // 3. Thêm otherUserId
      const member2Request = new sql.Request(transaction);
      await member2Request
        .input('conversationId', sql.UniqueIdentifier, conversationId)
        .input('otherUserId', sql.UniqueIdentifier, otherUserId)
        .query(`
          INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
          VALUES (@conversationId, @otherUserId, 'thanh_vien')
        `);

      await transaction.commit();
      return conversationId;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = new ChatService();

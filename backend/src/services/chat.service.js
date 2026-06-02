const { sql, poolPromise } = require('../config/db');

class ChatService {
  async joinCommunityGroup(userId, role) {
    const pool = await poolPromise;
    let groupName = '';

    if (role === 'Buyer') {
      groupName = 'Cộng đồng người mua';
    } else if (role === 'Seller') {
      groupName = 'Cộng đồng người bán';
    } else {
      throw new Error('Vai trò không hợp lệ để tham gia nhóm cộng đồng');
    }

    // 1. Tìm nhóm chat
    const findGroup = await pool.request()
      .input('groupName', sql.NVarChar(255), groupName)
      .query(`SELECT MaCuocTroChuyen FROM CuocTroChuyen WHERE TenCuocTroChuyen = @groupName AND Loai = 'nhom'`);

    if (findGroup.recordset.length === 0) {
      throw new Error('Không tìm thấy nhóm cộng đồng. Vui lòng liên hệ Admin.');
    }

    const groupId = findGroup.recordset[0].MaCuocTroChuyen;

    // 2. Kiểm tra xem user đã tham gia chưa
    const checkMembership = await pool.request()
      .input('groupId', sql.UniqueIdentifier, groupId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`SELECT 1 FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @groupId AND NguoiDungId = @userId`);

    if (checkMembership.recordset.length > 0) {
      return { message: 'Bạn đã tham gia nhóm này rồi', groupId };
    }

    // 3. Thêm user vào nhóm
    await pool.request()
      .input('groupId', sql.UniqueIdentifier, groupId)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('role', sql.VarChar(50), 'thanh_vien')
      .query(`
        INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
        VALUES (@groupId, @userId, @role)
      `);

    return { message: 'Tham gia cộng đồng thành công', groupId };
  }

  async joinGroup(userId, groupId) {
    const pool = await poolPromise;

    // 1. Kiểm tra xem nhóm chat có tồn tại không và có phải là Loai = 'nhom' không
    const findGroup = await pool.request()
      .input('groupId', sql.UniqueIdentifier, groupId)
      .query(`SELECT TenCuocTroChuyen FROM CuocTroChuyen WHERE MaCuocTroChuyen = @groupId AND Loai = 'nhom'`);

    if (findGroup.recordset.length === 0) {
      throw new Error('Nhóm trò chuyện không tồn tại hoặc không hợp lệ');
    }

    // 2. Kiểm tra xem user đã tham gia chưa
    const checkMembership = await pool.request()
      .input('groupId', sql.UniqueIdentifier, groupId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`SELECT 1 FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @groupId AND NguoiDungId = @userId`);

    if (checkMembership.recordset.length > 0) {
      return { message: 'Bạn đã tham gia nhóm này rồi', groupId };
    }

    // 3. Thêm user vào nhóm
    await pool.request()
      .input('groupId', sql.UniqueIdentifier, groupId)
      .input('userId', sql.UniqueIdentifier, userId)
      .input('role', sql.VarChar(50), 'thanh_vien')
      .query(`
        INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
        VALUES (@groupId, @userId, @role)
      `);

    return { message: 'Tham gia nhóm thành công', groupId };
  }

  async checkPrivateChatExists(userId, otherUserId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('otherUserId', sql.UniqueIdentifier, otherUserId)
      .query(`
        SELECT tv1.CuocTroChuyenId AS conversationId
        FROM ThanhVienCuocTroChuyen tv1
        JOIN ThanhVienCuocTroChuyen tv2 ON tv1.CuocTroChuyenId = tv2.CuocTroChuyenId
        JOIN CuocTroChuyen c ON tv1.CuocTroChuyenId = c.MaCuocTroChuyen
        WHERE c.Loai = 'ca_nhan'
          AND tv1.NguoiDungId = @userId
          AND tv2.NguoiDungId = @otherUserId
      `);

    if (result.recordset.length > 0) {
      return { exists: true, conversationId: result.recordset[0].conversationId };
    }
    return { exists: false, conversationId: null };
  }

  async createPrivateChat(userId, otherUserId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Insert CuocTroChuyen
      const chatRequest = new sql.Request(transaction);
      const chatResult = await chatRequest
        .query(`
          INSERT INTO CuocTroChuyen (Loai, NgayTao, NgayCapNhat)
          OUTPUT INSERTED.MaCuocTroChuyen
          VALUES ('ca_nhan', GETDATE(), GETDATE())
        `);

      const conversationId = chatResult.recordset[0].MaCuocTroChuyen;

      // 2. Add userId member
      const member1Request = new sql.Request(transaction);
      await member1Request
        .input('conversationId', sql.UniqueIdentifier, conversationId)
        .input('userId', sql.UniqueIdentifier, userId)
        .query(`
          INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
          VALUES (@conversationId, @userId, 'thanh_vien')
        `);

      // 3. Add otherUserId member
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

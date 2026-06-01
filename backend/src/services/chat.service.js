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
}

module.exports = new ChatService();

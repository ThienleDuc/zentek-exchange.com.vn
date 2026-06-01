const { sql, poolPromise } = require('../config/db');

class ChatAdminService {
  async getConversations(adminId, filter = 'all') {
    const pool = await poolPromise;
    let query = `
      SELECT 
        c.MaCuocTroChuyen, 
        c.TenCuocTroChuyen, 
        c.Loai, 
        c.NgayCapNhat,
        -- Lấy tin nhắn cuối cùng
        (SELECT TOP 1 NoiDung FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen ORDER BY t.NgayGui DESC) AS LastMessage,
        (SELECT TOP 1 NgayGui FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen ORDER BY t.NgayGui DESC) AS LastMessageTime,
        -- Lấy người dùng kia nếu là chat 1-1 (để lấy avatar/tên)
        (
          SELECT TOP 1 n.HoTen 
          FROM ThanhVienCuocTroChuyen tv 
          JOIN NguoiDung n ON tv.NguoiDungId = n.MaNguoiDung 
          WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId != @adminId
        ) AS OtherUserName,
        (
          SELECT TOP 1 v.TenVaiTro
          FROM ThanhVienCuocTroChuyen tv 
          JOIN NguoiDung n ON tv.NguoiDungId = n.MaNguoiDung 
          JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
          WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId != @adminId
        ) AS OtherUserRole
      FROM CuocTroChuyen c
      JOIN ThanhVienCuocTroChuyen my_tv ON c.MaCuocTroChuyen = my_tv.CuocTroChuyenId
      WHERE my_tv.NguoiDungId = @adminId
    `;

    // Filter logic
    if (filter === 'group') {
      query += ` AND c.Loai = 'nhom'`;
    } else if (filter === 'individual') {
      query += ` AND c.Loai = 'ca_nhan' AND EXISTS (
        SELECT 1 FROM ThanhVienCuocTroChuyen tv2 
        JOIN NguoiDung n2 ON tv2.NguoiDungId = n2.MaNguoiDung
        JOIN VaiTro v2 ON n2.VaiTroId = v2.MaVaiTro
        WHERE tv2.CuocTroChuyenId = c.MaCuocTroChuyen AND tv2.NguoiDungId != @adminId AND v2.TenVaiTro = 'Buyer'
      )`;
    } else if (filter === 'store') {
      query += ` AND c.Loai = 'ca_nhan' AND EXISTS (
        SELECT 1 FROM ThanhVienCuocTroChuyen tv2 
        JOIN NguoiDung n2 ON tv2.NguoiDungId = n2.MaNguoiDung
        JOIN VaiTro v2 ON n2.VaiTroId = v2.MaVaiTro
        WHERE tv2.CuocTroChuyenId = c.MaCuocTroChuyen AND tv2.NguoiDungId != @adminId AND v2.TenVaiTro = 'Seller'
      )`;
    }

    query += ` ORDER BY COALESCE((SELECT TOP 1 NgayGui FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen ORDER BY t.NgayGui DESC), c.NgayCapNhat) DESC`;

    const request = pool.request();
    request.input('adminId', sql.UniqueIdentifier, adminId);
    
    const result = await request.query(query);
    
    // Xử lý dữ liệu trả về cho frontend
    const conversations = result.recordset.map(row => {
      let name = row.TenCuocTroChuyen;
      let avatar = null;
      let type = row.Loai;
      
      if (row.Loai === 'ca_nhan') {
        name = row.OtherUserName || 'Người dùng';
        if (row.OtherUserRole === 'Seller') type = 'store';
        else type = 'individual';
      } else if (row.Loai === 'nhom') {
        type = 'group';
      }

      return {
        id: row.MaCuocTroChuyen,
        name: name,
        type: type,
        avatar: avatar,
        lastMessage: row.LastMessage,
        lastMessageTime: row.LastMessageTime || row.NgayCapNhat,
        unreadCount: 0 // TODO: Tính số tin nhắn chưa đọc
      };
    });

    return conversations;
  }

  async getMessages(conversationId, adminId) {
    const pool = await poolPromise;
    
    // Kiểm tra quyền
    const checkRole = await pool.request()
      .input('convId', sql.UniqueIdentifier, conversationId)
      .input('userId', sql.UniqueIdentifier, adminId)
      .query(`SELECT 1 FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @convId AND NguoiDungId = @userId`);
      
    if (checkRole.recordset.length === 0) {
      throw new Error('Bạn không có quyền xem cuộc trò chuyện này');
    }

    const result = await pool.request()
      .input('convId', sql.UniqueIdentifier, conversationId)
      .query(`
        SELECT 
          t.MaTinNhan,
          t.NoiDung,
          t.NgayGui,
          t.NguoiGuiId,
          t.DaDoc,
          t.DaThuHoi,
          n.HoTen as SenderName,
          tv.VaiTro as SenderRole,
          (
             SELECT LoaiMedia, DuongDanMedia 
             FROM PhanHoiMedia 
             WHERE TinNhanId = t.MaTinNhan 
             FOR JSON PATH
          ) as MediaFiles
        FROM TinNhan t
        JOIN NguoiDung n ON t.NguoiGuiId = n.MaNguoiDung
        LEFT JOIN ThanhVienCuocTroChuyen tv ON t.NguoiGuiId = tv.NguoiDungId AND t.CuocTroChuyenId = tv.CuocTroChuyenId
        WHERE t.CuocTroChuyenId = @convId
        ORDER BY t.NgayGui ASC
      `);
      
    return result.recordset.map(row => {
      let mediaList = [];
      if (row.MediaFiles) {
        try {
          const parsed = JSON.parse(row.MediaFiles);
          mediaList = parsed.map(m => ({
            type: m.LoaiMedia === 'anh' ? 'image' : 'video',
            url: m.DuongDanMedia
          }));
        } catch (e) {
          console.error('Error parsing MediaFiles:', e);
        }
      }
      
      return {
        id: row.MaTinNhan,
        content: row.NoiDung,
        timestamp: row.NgayGui,
        senderId: row.NguoiGuiId,
        senderName: row.SenderName,
        senderRole: row.SenderRole,
        isMe: row.NguoiGuiId === adminId,
        isRead: row.DaDoc,
        isRecalled: row.DaThuHoi,
        media: mediaList
      };
    });
  }

  async recallMessage(messageId, adminId) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('msgId', sql.UniqueIdentifier, messageId);
    
    // Check if the message belongs to the user and is within 24h
    const msgResult = await request.query(`
      SELECT NguoiGuiId, NgayGui FROM TinNhan 
      WHERE MaTinNhan = @msgId
    `);

    if (msgResult.recordset.length === 0) {
      throw new Error('Tin nhắn không tồn tại');
    }

    const msg = msgResult.recordset[0];
    if (msg.NguoiGuiId !== adminId) {
      throw new Error('Bạn không có quyền thu hồi tin nhắn của người khác');
    }

    const hoursDiff = (new Date() - new Date(msg.NgayGui)) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      throw new Error('Chỉ có thể thu hồi tin nhắn trong vòng 24 giờ');
    }

    await request.query(`
      UPDATE TinNhan SET DaThuHoi = 1 WHERE MaTinNhan = @msgId
    `);

    // HIDE MEDIA
    const { hideFile } = require('../utils/file.utils');
    const mediaResult = await request.query(`SELECT MaPhanHoi, DuongDanMedia FROM PhanHoiMedia WHERE TinNhanId = @msgId`);
    for (const media of mediaResult.recordset) {
      let currentUrl = media.DuongDanMedia;
      if (!currentUrl.startsWith('/')) currentUrl = '/uploads/media/' + currentUrl;
      const newUrl = hideFile(currentUrl);
      if (newUrl) {
        await pool.request()
          .input('maPhanHoi', sql.UniqueIdentifier, media.MaPhanHoi)
          .input('newUrl', sql.VarChar(500), newUrl)
          .query(`UPDATE PhanHoiMedia SET DuongDanMedia = @newUrl WHERE MaPhanHoi = @maPhanHoi`);
      }
    }

    return true;
  }

  async deleteMessagePermanently(messageId, adminId) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('msgId', sql.UniqueIdentifier, messageId);

    const msgResult = await request.query(`
      SELECT CuocTroChuyenId FROM TinNhan WHERE MaTinNhan = @msgId
    `);
    
    if (msgResult.recordset.length === 0) {
      throw new Error('Tin nhắn không tồn tại');
    }
    const convId = msgResult.recordset[0].CuocTroChuyenId;
    
    // Check role in conversation
    const checkRole = await pool.request()
      .input('convId', sql.UniqueIdentifier, convId)
      .input('userId', sql.UniqueIdentifier, adminId)
      .query(`SELECT 1 FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @convId AND NguoiDungId = @userId`);
      
    if (checkRole.recordset.length === 0) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    const { deleteFile } = require('../utils/file.utils');
    const mediaResult = await request.query(`SELECT DuongDanMedia FROM PhanHoiMedia WHERE TinNhanId = @msgId`);
    
    for (const media of mediaResult.recordset) {
      let currentUrl = media.DuongDanMedia;
      if (!currentUrl.startsWith('/')) currentUrl = '/uploads/media/' + currentUrl;
      deleteFile(currentUrl);
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const txRequest = new sql.Request(transaction);
      txRequest.input('msgId', sql.UniqueIdentifier, messageId);
      txRequest.input('convId', sql.UniqueIdentifier, convId);

      // Nullify TinNhanCuoiId temporarily if it is the one being deleted
      await txRequest.query(`
        UPDATE CuocTroChuyen 
        SET TinNhanCuoiId = NULL 
        WHERE MaCuocTroChuyen = @convId AND TinNhanCuoiId = @msgId
      `);

      // Delete Media
      await txRequest.query(`DELETE FROM PhanHoiMedia WHERE TinNhanId = @msgId`);

      // Delete Message
      await txRequest.query(`DELETE FROM TinNhan WHERE MaTinNhan = @msgId`);

      // Restore TinNhanCuoiId
      await txRequest.query(`
        UPDATE CuocTroChuyen
        SET TinNhanCuoiId = (
          SELECT TOP 1 MaTinNhan FROM TinNhan 
          WHERE CuocTroChuyenId = @convId 
          ORDER BY NgayGui DESC
        )
        WHERE MaCuocTroChuyen = @convId AND TinNhanCuoiId IS NULL
      `);

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async sendMessage(conversationId, adminId, content, files) {
    const pool = await poolPromise;
    
    // Kiểm tra quyền
    const checkRole = await pool.request()
      .input('convId', sql.UniqueIdentifier, conversationId)
      .input('userId', sql.UniqueIdentifier, adminId)
      .query(`SELECT 1 FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @convId AND NguoiDungId = @userId`);
      
    if (checkRole.recordset.length === 0) {
      throw new Error('Bạn không có quyền gửi tin nhắn vào cuộc trò chuyện này');
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      const request = new sql.Request(transaction);
      const insertResult = await request
        .input('convId', sql.UniqueIdentifier, conversationId)
        .input('senderId', sql.UniqueIdentifier, adminId)
        .input('content', sql.NVarChar, content || '')
        .query(`
          INSERT INTO TinNhan (CuocTroChuyenId, NguoiGuiId, NoiDung)
          OUTPUT INSERTED.MaTinNhan, INSERTED.NgayGui
          VALUES (@convId, @senderId, @content)
        `);
        
      const newMessage = insertResult.recordset[0];
      
      // Update NgayCapNhat
      await request.query(`
        UPDATE CuocTroChuyen 
        SET NgayCapNhat = GETDATE(), TinNhanCuoiId = '${newMessage.MaTinNhan}'
        WHERE MaCuocTroChuyen = @convId
      `);
      
      const mediaList = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const isImage = file.mimetype.startsWith('image/');
          const loaiMedia = isImage ? 'anh' : 'video';
          const duongDanMedia = `/uploads/media/${file.filename}`;
          
          const mediaReq = new sql.Request(transaction);
          await mediaReq
            .input('tinNhanId', sql.UniqueIdentifier, newMessage.MaTinNhan)
            .input('loaiPhanHoi', sql.NVarChar(20), 'tin_nhan')
            .input('loaiMedia', sql.NVarChar(10), loaiMedia)
            .input('duongDanMedia', sql.VarChar(500), duongDanMedia)
            .query(`
              INSERT INTO PhanHoiMedia (TinNhanId, LoaiPhanHoi, LoaiMedia, DuongDanMedia)
              VALUES (@tinNhanId, @loaiPhanHoi, @loaiMedia, @duongDanMedia)
            `);
          
          mediaList.push({
            type: loaiMedia === 'anh' ? 'image' : 'video',
            url: duongDanMedia
          });
        }
      }

      await transaction.commit();
      
      const userResult = await pool.request()
        .input('userId', sql.UniqueIdentifier, adminId)
        .query(`SELECT HoTen FROM NguoiDung WHERE MaNguoiDung = @userId`);
        
      return {
        id: newMessage.MaTinNhan,
        content: content || '',
        timestamp: newMessage.NgayGui,
        senderId: adminId,
        senderName: userResult.recordset[0].HoTen,
        isMe: true,
        media: mediaList
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async createGroup(adminId, name, memberIds) {
    if (!name || name.trim() === '') {
      throw new Error('Tên nhóm không được để trống');
    }
    if (!memberIds) {
      throw new Error('Danh sách thành viên không hợp lệ');
    }

    // Lọc trùng lặp và loại bỏ chính Admin khỏi danh sách thành viên thêm mới
    const uniqueMemberIds = [...new Set(memberIds)].filter(id => id !== adminId);

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);

      // Tạo cuộc trò chuyện
      const insertConvResult = await request
        .input('name', sql.NVarChar(255), name.trim())
        .input('type', sql.VarChar(50), 'nhom')
        .query(`
          INSERT INTO CuocTroChuyen (TenCuocTroChuyen, Loai, NgayCapNhat)
          OUTPUT INSERTED.MaCuocTroChuyen
          VALUES (@name, @type, GETDATE())
        `);
      
      const convId = insertConvResult.recordset[0].MaCuocTroChuyen;

      // Thêm Admin vào nhóm (chu_nhom)
      await request
        .input('convId', sql.UniqueIdentifier, convId)
        .input('adminId', sql.UniqueIdentifier, adminId)
        .input('roleAdmin', sql.VarChar(50), 'chu_nhom')
        .query(`
          INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
          VALUES (@convId, @adminId, @roleAdmin)
        `);

      // Thêm các thành viên khác
      for (const memberId of uniqueMemberIds) {
        // Cần truyền biến cho mỗi thành viên. Tốt nhất là tạo request mới hoặc clear param.
        // Nhưng thay vì vòng lặp với cùng request object, chúng ta tạo request mới cho an toàn
        const memberReq = new sql.Request(transaction);
        await memberReq
          .input('convId', sql.UniqueIdentifier, convId)
          .input('memberId', sql.UniqueIdentifier, memberId)
          .input('roleMember', sql.VarChar(50), 'thanh_vien')
          .query(`
            INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
            VALUES (@convId, @memberId, @roleMember)
          `);
      }

      // Thêm tin nhắn chào mừng
      const welcomeReq = new sql.Request(transaction);
      await welcomeReq
        .input('convId', sql.UniqueIdentifier, convId)
        .input('adminId', sql.UniqueIdentifier, adminId)
        .input('content', sql.NVarChar(sql.MAX), 'Nhóm đã được tạo. Chào mừng các thành viên!')
        .query(`
          INSERT INTO TinNhan (CuocTroChuyenId, NguoiGuiId, NoiDung, NgayGui, DaDoc, DaThuHoi)
          VALUES (@convId, @adminId, @content, GETDATE(), 0, 0)
        `);

      // Cập nhật TinNhanCuoiId cho CuocTroChuyen
      await welcomeReq.query(`
        UPDATE CuocTroChuyen
        SET TinNhanCuoiId = (SELECT TOP 1 MaTinNhan FROM TinNhan WHERE CuocTroChuyenId = @convId ORDER BY NgayGui DESC),
            NgayCapNhat = GETDATE()
        WHERE MaCuocTroChuyen = @convId
      `);

      await transaction.commit();

      return {
        id: convId,
        name: name,
        type: 'group',
        avatar: null,
        lastMessage: 'Nhóm vừa được tạo',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async deleteGroup(groupId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);

      // 1. Cập nhật TinNhanCuoiId thành NULL để tránh khóa ngoại vòng
      await request
        .input('groupId_upd', sql.UniqueIdentifier, groupId)
        .query(`
          UPDATE CuocTroChuyen
          SET TinNhanCuoiId = NULL
          WHERE MaCuocTroChuyen = @groupId_upd
        `);

      // 2. Xóa file đính kèm (PhanHoiMedia)
      await request
        .input('groupId_fdk', sql.UniqueIdentifier, groupId)
        .query(`
          DELETE FROM PhanHoiMedia
          WHERE TinNhanId IN (SELECT MaTinNhan FROM TinNhan WHERE CuocTroChuyenId = @groupId_fdk)
        `);

      // 3. Xóa tin nhắn
      await request
        .input('groupId_tn', sql.UniqueIdentifier, groupId)
        .query(`
          DELETE FROM TinNhan
          WHERE CuocTroChuyenId = @groupId_tn
        `);

      // 4. Xóa thành viên
      await request
        .input('groupId_tv', sql.UniqueIdentifier, groupId)
        .query(`
          DELETE FROM ThanhVienCuocTroChuyen
          WHERE CuocTroChuyenId = @groupId_tv
        `);

      // 5. Xóa cuộc trò chuyện
      await request
        .input('groupId_ctc', sql.UniqueIdentifier, groupId)
        .query(`
          DELETE FROM CuocTroChuyen
          WHERE MaCuocTroChuyen = @groupId_ctc
        `);

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async addMembersToGroup(groupId, memberIds) {
    if (!memberIds || memberIds.length === 0) {
      throw new Error('Danh sách thành viên không hợp lệ');
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      for (const memberId of memberIds) {
        const memberReq = new sql.Request(transaction);
        // Kiểm tra xem đã tham gia chưa
        const check = await memberReq
          .input('groupId', sql.UniqueIdentifier, groupId)
          .input('memberId', sql.UniqueIdentifier, memberId)
          .query(`SELECT 1 FROM ThanhVienCuocTroChuyen WHERE CuocTroChuyenId = @groupId AND NguoiDungId = @memberId`);
        
        if (check.recordset.length === 0) {
          const insertReq = new sql.Request(transaction);
          await insertReq
            .input('groupId', sql.UniqueIdentifier, groupId)
            .input('memberId', sql.UniqueIdentifier, memberId)
            .input('role', sql.VarChar(50), 'thanh_vien')
            .query(`
              INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
              VALUES (@groupId, @memberId, @role)
            `);
        }
      }

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = new ChatAdminService();

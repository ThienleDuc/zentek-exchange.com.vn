const { sql, poolPromise } = require('../config/db');
const tempOrderCache = require('../utils/tempOrderCache');
const { getFilenameOnly } = require('../utils/file.utils');

class OrderController {
  // Place a new order
  async placeOrder(req, res) {
    try {
      const NguoiMuaId = req.user.userId;
      const { tempOrderId, hoTenNguoiNhan, soDienThoaiNguoiNhan, diaChiNhan, ghiChu, items: clientItems } = req.body;

      if (!tempOrderId || !hoTenNguoiNhan || !soDienThoaiNguoiNhan || !diaChiNhan) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin đặt hàng bắt buộc (tempOrderId, hoTenNguoiNhan, soDienThoaiNguoiNhan, diaChiNhan).' });
      }

      // 1. Get and validate temp order from cache
      const tempOrderData = tempOrderCache.get(tempOrderId);
      if (!tempOrderData) {
        return res.status(410).json({ success: false, message: 'Đơn hàng tạm không tồn tại hoặc đã hết hạn.' });
      }

      if (tempOrderData.nguoiMuaId !== NguoiMuaId) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền đặt hàng cho đơn tạm này.' });
      }

      // Determine items list (use client adjusted items if provided, fallback to original temp order items)
      let itemsToOrder = tempOrderData.items;
      if (clientItems && Array.isArray(clientItems) && clientItems.length > 0) {
        // Map quantity adjustments if user changed them on checkout screen
        itemsToOrder = tempOrderData.items.map(origItem => {
          const clientItem = clientItems.find(ci => ci.sanPhamId === origItem.sanPhamId && ci.phanLoaiId === origItem.phanLoaiId);
          if (clientItem) {
            return {
              ...origItem,
              soLuong: clientItem.soLuong
            };
          }
          return origItem;
        });
      }

      const pool = await poolPromise;
      const transaction = new sql.Transaction(pool);

      await transaction.begin();

      try {
        // 2. Lock & verify stock and fetch CuaHangId for each item
        const itemsWithShop = [];
        for (const item of itemsToOrder) {
          const lockRequest = new sql.Request(transaction);
          const stockResult = await lockRequest
            .input('SanPhamId', sql.UniqueIdentifier, item.sanPhamId)
            .query('SELECT SoLuong AS TonKho, TieuDe, DaHetHang, CuaHangId FROM SanPham WITH (UPDLOCK, HOLDLOCK) WHERE MaSanPham = @SanPhamId');

          if (stockResult.recordset.length === 0) {
            throw new Error(`Sản phẩm '${item.tenSanPham}' không còn tồn tại trên hệ thống.`);
          }

          const dbProduct = stockResult.recordset[0];
          if (dbProduct.DaHetHang || dbProduct.TonKho <= 0) {
            throw new Error(`Sản phẩm '${dbProduct.TieuDe}' đã hết hàng.`);
          }

          if (dbProduct.TonKho < item.soLuong) {
            throw new Error(`Sản phẩm '${dbProduct.TieuDe}' không đủ số lượng tồn kho (Còn lại: ${dbProduct.TonKho}, Yêu cầu: ${item.soLuong}).`);
          }

          itemsWithShop.push({
            ...item,
            cuaHangId: dbProduct.CuaHangId,
            tenSanPham: dbProduct.TieuDe
          });
        }

        // Group items by CuaHangId
        const shopGroups = {};
        for (const item of itemsWithShop) {
          const shopId = item.cuaHangId;
          if (!shopGroups[shopId]) {
            shopGroups[shopId] = [];
          }
          shopGroups[shopId].push(item);
        }

        const createdOrderIds = [];
        const cuaHangOrderMap = {};

        // 3. Create DonHang per shop & details & deduct stock
        for (const shopId of Object.keys(shopGroups)) {
          const groupItems = shopGroups[shopId];

          const orderRequest = new sql.Request(transaction);
          const orderResult = await orderRequest
            .input('NguoiMuaId', sql.UniqueIdentifier, NguoiMuaId)
            .input('HoTenNguoiNhan', sql.NVarChar, hoTenNguoiNhan)
            .input('SoDienThoaiNguoiNhan', sql.Char, soDienThoaiNguoiNhan)
            .input('DiaChiNhan', sql.NVarChar, diaChiNhan)
            .query(`
              INSERT INTO DonHang (NguoiMuaId, HoTenNguoiNhan, SoDienThoaiNguoiNhan, DiaChiNhan, TrangThaiDon, NgayTao, NgayCapNhat)
              OUTPUT INSERTED.MaDonHang
              VALUES (@NguoiMuaId, @HoTenNguoiNhan, @SoDienThoaiNguoiNhan, @DiaChiNhan, N'Chờ xử lý', GETDATE(), GETDATE())
            `);

          const DonHangId = orderResult.recordset[0].MaDonHang;
          createdOrderIds.push(DonHangId);
          cuaHangOrderMap[shopId] = DonHangId;

          for (const item of groupItems) {
            // Insert ChiTietDonHang
            const detailRequest = new sql.Request(transaction);
            await detailRequest
              .input('DonHangId', sql.UniqueIdentifier, DonHangId)
              .input('SanPhamId', sql.UniqueIdentifier, item.sanPhamId)
              .input('PhanLoaiId', sql.UniqueIdentifier, item.phanLoaiId || null)
              .input('SoLuong', sql.Int, item.soLuong)
              .input('DonGia', sql.Decimal, item.donGia)
              .input('GhiChu', sql.NVarChar, ghiChu || null)
              .query(`
                INSERT INTO ChiTietDonHang (DonHangId, SanPhamId, PhanLoaiId, SoLuong, DonGia, GhiChu)
                VALUES (@DonHangId, @SanPhamId, @PhanLoaiId, @SoLuong, @DonGia, @GhiChu)
              `);

            // Update inventory of SanPham
            const updateRequest = new sql.Request(transaction);
            await updateRequest
              .input('SanPhamId', sql.UniqueIdentifier, item.sanPhamId)
              .input('SoLuong', sql.Int, item.soLuong)
              .query(`
                UPDATE SanPham
                SET SoLuong = SoLuong - @SoLuong,
                    SoLuongDaBan = SoLuongDaBan + @SoLuong,
                    DaHetHang = CASE WHEN SoLuong - @SoLuong <= 0 THEN 1 ELSE DaHetHang END
                WHERE MaSanPham = @SanPhamId
              `);
          }
        }

        // 5. Delete items from ChiTietGioHang if checkout from Cart
        if (tempOrderData.cartItemIds && tempOrderData.cartItemIds.length > 0) {
          const deleteRequest = new sql.Request(transaction);
          tempOrderData.cartItemIds.forEach((id, index) => {
            deleteRequest.input(`del_id_${index}`, sql.UniqueIdentifier, id);
          });
          const deleteParamNames = tempOrderData.cartItemIds.map((_, index) => `@del_id_${index}`).join(',');

          await deleteRequest.query(`
            DELETE FROM ChiTietGioHang 
            WHERE MaChiTietGioHang IN (${deleteParamNames})
          `);
        }

        // Commit all changes
        await transaction.commit();

        // 6. Remove temp order from cache
        tempOrderCache.remove(tempOrderId);

        // 7. Send purchase notification message in chat with the seller
        try {
          const chatService = require('../services/chat.service');
          
          for (const shopId of Object.keys(shopGroups)) {
            const groupItems = shopGroups[shopId];
            const matchingOrderId = cuaHangOrderMap[shopId];
            
            const sellerRes = await pool.request()
              .input('CuaHangId', sql.UniqueIdentifier, shopId)
              .query('SELECT NguoiBanId FROM CuaHang WHERE MaCuaHang = @CuaHangId');
            
            if (sellerRes.recordset.length > 0) {
              const sellerId = sellerRes.recordset[0].NguoiBanId;
              
              let chatCheck = await chatService.checkPrivateChatExists(NguoiMuaId, sellerId);
              let conversationId = chatCheck.conversationId;
              
              if (!chatCheck.exists || !conversationId) {
                conversationId = await chatService.createPrivateChat(NguoiMuaId, sellerId);
              }
              
              if (conversationId) {
                // Construct message
                let msgContent = `Đã mua đơn hàng #${matchingOrderId}:\n`;
                groupItems.forEach((item, idx) => {
                  msgContent += `${idx + 1}. ${item.tenSanPham} (Mã SP: ${item.sanPhamId})\n`;
                  msgContent += `   Số lượng: ${item.soLuong}\n`;
                  msgContent += `   Đơn giá: ${Number(item.donGia).toLocaleString('vi-VN')}đ\n`;
                });
                
                const totalOrderPrice = groupItems.reduce((sum, item) => sum + (item.soLuong * item.donGia), 0);
                msgContent += `Tổng giá trị: ${totalOrderPrice.toLocaleString('vi-VN')}đ`;

                // Insert TinNhan
                const msgInsertResult = await pool.request()
                  .input('convId', sql.UniqueIdentifier, conversationId)
                  .input('senderId', sql.UniqueIdentifier, NguoiMuaId)
                  .input('content', sql.NVarChar, msgContent)
                  .query(`
                    INSERT INTO TinNhan (CuocTroChuyenId, NguoiGuiId, NoiDung)
                    OUTPUT INSERTED.MaTinNhan
                    VALUES (@convId, @senderId, @content)
                  `);
                
                const newMsgId = msgInsertResult.recordset[0].MaTinNhan;
                
                // Update CuocTroChuyen
                await pool.request()
                  .input('convId', sql.UniqueIdentifier, conversationId)
                  .input('lastMsgId', sql.UniqueIdentifier, newMsgId)
                  .query(`
                    UPDATE CuocTroChuyen 
                    SET NgayCapNhat = GETDATE(), TinNhanCuoiId = @lastMsgId
                    WHERE MaCuocTroChuyen = @convId
                  `);
              }
            }
          }
        } catch (chatErr) {
          console.error('Error sending auto purchase message:', chatErr);
        }

        return res.status(201).json({
          success: true,
          message: 'Đặt hàng thành công.',
          data: {
            MaDonHang: createdOrderIds[0],
            maDonHangs: createdOrderIds
          }
        });

      } catch (err) {
        // Rollback on any failure
        await transaction.rollback();
        console.error('Transaction rollback due to error:', err.message);
        return res.status(400).json({ success: false, message: err.message });
      }

    } catch (error) {
      console.error('Error in OrderController.placeOrder:', error);
      return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi xử lý đơn hàng.', error: error.message });
    }
  }

  // Get list of orders for buyer or seller
  async getOrders(req, res) {
    try {
      const userId = req.user.userId;
      const { role, status, search } = req.query; // 'buyer' or 'seller'
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const offset = (page - 1) * limit;

      const trangThai = (status && status !== 'Tất cả' && status !== '') ? status : null;
      const searchKeyword = (search && search.trim() !== '') ? search.trim() : null;

      if (!role) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin role.' });
      }

      const pool = await poolPromise;
      let orders = [];
      let totalCount = 0;

      if (role === 'buyer') {
        const countResult = await pool.request()
          .input('NguoiMuaId', sql.UniqueIdentifier, userId)
          .input('TrangThai', sql.NVarChar, trangThai)
          .input('Search', sql.NVarChar, searchKeyword)
          .query(`
            SELECT COUNT(*) AS total
            FROM DonHang dh
            WHERE dh.NguoiMuaId = @NguoiMuaId
              AND (@TrangThai IS NULL OR dh.TrangThaiDon = @TrangThai)
              AND (@Search IS NULL OR (
                   dh.MaDonHang LIKE '%' + @Search + '%' OR
                   EXISTS (
                     SELECT 1 FROM ChiTietDonHang ct2
                     JOIN SanPham sp2 ON ct2.SanPhamId = sp2.MaSanPham
                     WHERE ct2.DonHangId = dh.MaDonHang AND sp2.TieuDe LIKE '%' + @Search + '%'
                   )
              ))
          `);
        totalCount = countResult.recordset[0].total;

        const ordersResult = await pool.request()
          .input('NguoiMuaId', sql.UniqueIdentifier, userId)
          .input('TrangThai', sql.NVarChar, trangThai)
          .input('Search', sql.NVarChar, searchKeyword)
          .input('Offset', sql.Int, offset)
          .input('Limit', sql.Int, limit)
          .query(`
            SELECT dh.MaDonHang, dh.NguoiMuaId, dh.HoTenNguoiNhan, dh.SoDienThoaiNguoiNhan, dh.DiaChiNhan, dh.TrangThaiDon, dh.LyDoHuy, dh.NgayTao, dh.NgayCapNhat
            FROM DonHang dh
            WHERE dh.NguoiMuaId = @NguoiMuaId
              AND (@TrangThai IS NULL OR dh.TrangThaiDon = @TrangThai)
              AND (@Search IS NULL OR (
                   dh.MaDonHang LIKE '%' + @Search + '%' OR
                   EXISTS (
                     SELECT 1 FROM ChiTietDonHang ct2
                     JOIN SanPham sp2 ON ct2.SanPhamId = sp2.MaSanPham
                     WHERE ct2.DonHangId = dh.MaDonHang AND sp2.TieuDe LIKE '%' + @Search + '%'
                   )
              ))
            ORDER BY dh.NgayTao DESC
            OFFSET @Offset ROWS
            FETCH NEXT @Limit ROWS ONLY
          `);

        for (const order of ordersResult.recordset) {
          const itemsResult = await pool.request()
            .input('DonHangId', sql.UniqueIdentifier, order.MaDonHang)
            .query(`
              SELECT 
                ct.MaChiTietDonHang, ct.SanPhamId AS maSanPham, ct.PhanLoaiId AS phanLoaiId, ct.SoLuong AS soLuong, ct.DonGia AS donGia, 
                (ct.SoLuong * ct.DonGia) AS thanhTien,
                sp.TieuDe AS tenSanPham,
                pl.TenPhanLoai AS phanLoai,
                ch.TenCuaHang AS tenCuaHang,
                ch.NguoiBanId AS sellerId,
                ch.MaCuaHang AS shopId,
                (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS anh
              FROM ChiTietDonHang ct
              JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
              LEFT JOIN PhanLoai pl ON ct.PhanLoaiId = pl.MaPhanLoai
              JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
              WHERE ct.DonHangId = @DonHangId
            `);

          const tongTien = itemsResult.recordset.reduce((sum, item) => sum + Number(item.thanhTien), 0);

          // Check if rated
          const checkRating = await pool.request()
            .input('DonHangId', sql.UniqueIdentifier, order.MaDonHang)
            .input('NguoiMuaId', sql.UniqueIdentifier, userId)
            .query('SELECT 1 FROM DanhGiaSanPham WHERE DonHangId = @DonHangId AND NguoiMuaId = @NguoiMuaId');

          orders.push({
            maDonHang: order.MaDonHang,
            ngayTao: order.NgayTao,
            trangThai: order.TrangThaiDon,
            tongTien,
            buyerId: order.NguoiMuaId,
            shopId: itemsResult.recordset[0]?.shopId || '',
            daDanhGia: checkRating.recordset.length > 0,
            items: itemsResult.recordset
          });
        }
      } else if (role === 'seller') {
        // 1. Get seller's shop
        const shopResult = await pool.request()
          .input('NguoiBanId', sql.UniqueIdentifier, userId)
          .query('SELECT MaCuaHang FROM CuaHang WHERE NguoiBanId = @NguoiBanId');

        if (shopResult.recordset.length === 0) {
          return res.status(200).json({ 
            success: true, 
            data: [], 
            pagination: { totalPages: 0, currentPage: page, totalItems: 0, limit } 
          });
        }
        const shopId = shopResult.recordset[0].MaCuaHang;

        // 2. Get count of distinct orders that contain the shop's products
        const countResult = await pool.request()
          .input('ShopId', sql.UniqueIdentifier, shopId)
          .input('TrangThai', sql.NVarChar, trangThai)
          .input('Search', sql.NVarChar, searchKeyword)
          .query(`
            SELECT COUNT(DISTINCT dh.MaDonHang) AS total
            FROM DonHang dh
            JOIN ChiTietDonHang ct ON dh.MaDonHang = ct.DonHangId
            JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
            WHERE sp.CuaHangId = @ShopId
              AND (@TrangThai IS NULL OR dh.TrangThaiDon = @TrangThai)
              AND (@Search IS NULL OR (
                   dh.MaDonHang LIKE '%' + @Search + '%' OR
                   EXISTS (
                     SELECT 1 FROM ChiTietDonHang ct2
                     JOIN SanPham sp2 ON ct2.SanPhamId = sp2.MaSanPham
                     WHERE ct2.DonHangId = dh.MaDonHang AND sp2.TieuDe LIKE '%' + @Search + '%'
                   )
              ))
          `);
        totalCount = countResult.recordset[0].total;

        // 3. Get distinct orders that contain the shop's products
        const ordersResult = await pool.request()
          .input('ShopId', sql.UniqueIdentifier, shopId)
          .input('TrangThai', sql.NVarChar, trangThai)
          .input('Search', sql.NVarChar, searchKeyword)
          .input('Offset', sql.Int, offset)
          .input('Limit', sql.Int, limit)
          .query(`
            SELECT DISTINCT dh.MaDonHang, dh.NguoiMuaId, dh.HoTenNguoiNhan, dh.SoDienThoaiNguoiNhan, dh.DiaChiNhan, dh.TrangThaiDon, dh.LyDoHuy, dh.NgayTao, dh.NgayCapNhat
            FROM DonHang dh
            JOIN ChiTietDonHang ct ON dh.MaDonHang = ct.DonHangId
            JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
            WHERE sp.CuaHangId = @ShopId
              AND (@TrangThai IS NULL OR dh.TrangThaiDon = @TrangThai)
              AND (@Search IS NULL OR (
                   dh.MaDonHang LIKE '%' + @Search + '%' OR
                   EXISTS (
                     SELECT 1 FROM ChiTietDonHang ct2
                     JOIN SanPham sp2 ON ct2.SanPhamId = sp2.MaSanPham
                     WHERE ct2.DonHangId = dh.MaDonHang AND sp2.TieuDe LIKE '%' + @Search + '%'
                   )
              ))
            ORDER BY dh.NgayTao DESC
            OFFSET @Offset ROWS
            FETCH NEXT @Limit ROWS ONLY
          `);

        for (const order of ordersResult.recordset) {
          const itemsResult = await pool.request()
            .input('DonHangId', sql.UniqueIdentifier, order.MaDonHang)
            .input('ShopId', sql.UniqueIdentifier, shopId)
            .query(`
              SELECT 
                ct.MaChiTietDonHang, ct.SanPhamId AS maSanPham, ct.PhanLoaiId AS phanLoaiId, ct.SoLuong AS soLuong, ct.DonGia AS donGia, 
                (ct.SoLuong * ct.DonGia) AS thanhTien,
                sp.TieuDe AS tenSanPham,
                pl.TenPhanLoai AS phanLoai,
                ch.TenCuaHang AS tenCuaHang,
                ch.NguoiBanId AS sellerId,
                ch.MaCuaHang AS shopId,
                (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS anh
              FROM ChiTietDonHang ct
              JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
              LEFT JOIN PhanLoai pl ON ct.PhanLoaiId = pl.MaPhanLoai
              JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
              WHERE ct.DonHangId = @DonHangId AND sp.CuaHangId = @ShopId
            `);

          const tongTien = itemsResult.recordset.reduce((sum, item) => sum + Number(item.thanhTien), 0);

          orders.push({
            maDonHang: order.MaDonHang,
            ngayTao: order.NgayTao,
            trangThai: order.TrangThaiDon,
            tongTien,
            buyerId: order.NguoiMuaId,
            shopId: shopId,
            items: itemsResult.recordset
          });
        }
      }

      const totalPages = Math.ceil(totalCount / limit);
      return res.status(200).json({ 
        success: true, 
        data: orders,
        pagination: {
          totalPages,
          currentPage: page,
          totalItems: totalCount,
          limit
        }
      });
    } catch (error) {
      console.error('Error in OrderController.getOrders:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách đơn hàng.', error: error.message });
    }
  }

  // Seller confirms shipment
  async confirmShipment(req, res) {
    try {
      const sellerId = req.user.userId;
      const { id: orderId } = req.params;

      const pool = await poolPromise;

      // 1. Get shop
      const shopResult = await pool.request()
        .input('NguoiBanId', sql.UniqueIdentifier, sellerId)
        .query('SELECT MaCuaHang FROM CuaHang WHERE NguoiBanId = @NguoiBanId');

      if (shopResult.recordset.length === 0) {
        return res.status(403).json({ success: false, message: 'Bạn không sở hữu cửa hàng nào để xác nhận giao hàng.' });
      }
      const shopId = shopResult.recordset[0].MaCuaHang;

      // 2. Check order exists, contains shop's products, and is pending
      const orderCheck = await pool.request()
        .input('OrderId', sql.UniqueIdentifier, orderId)
        .input('ShopId', sql.UniqueIdentifier, shopId)
        .query(`
          SELECT DISTINCT dh.MaDonHang, dh.TrangThaiDon
          FROM DonHang dh
          JOIN ChiTietDonHang ct ON dh.MaDonHang = ct.DonHangId
          JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
          WHERE dh.MaDonHang = @OrderId AND sp.CuaHangId = @ShopId
        `);

      if (orderCheck.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng chứa sản phẩm của shop.' });
      }

      const order = orderCheck.recordset[0];
      if (order.TrangThaiDon !== 'Chờ xử lý') {
        return res.status(400).json({ success: false, message: `Trạng thái đơn hàng không hợp lệ (Hiện tại: ${order.TrangThaiDon}). Chỉ có thể giao đơn ở trạng thái 'Chờ xử lý'.` });
      }

      // 3. Update status
      await pool.request()
        .input('OrderId', sql.UniqueIdentifier, orderId)
        .query("UPDATE DonHang SET TrangThaiDon = N'Đang giao', NgayCapNhat = GETDATE() WHERE MaDonHang = @OrderId");

      return res.status(200).json({ success: true, message: 'Xác nhận giao hàng thành công.' });
    } catch (error) {
      console.error('Error in OrderController.confirmShipment:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác nhận giao hàng.', error: error.message });
    }
  }

  // Cancel order (both Seller and Buyer)
  async cancelOrder(req, res) {
    try {
      const userId = req.user.userId;
      const { id: orderId } = req.params;
      const { lyDoHuy } = req.body;

      if (!lyDoHuy || !lyDoHuy.trim()) {
        return res.status(400).json({ success: false, message: 'Lý do hủy đơn hàng là bắt buộc.' });
      }

      const pool = await poolPromise;

      // 1. Fetch order to verify identity & status
      const orderResult = await pool.request()
        .input('OrderId', sql.UniqueIdentifier, orderId)
        .query('SELECT MaDonHang, NguoiMuaId, TrangThaiDon FROM DonHang WHERE MaDonHang = @OrderId');

      if (orderResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
      }

      const order = orderResult.recordset[0];
      if (order.TrangThaiDon !== 'Chờ xử lý') {
        return res.status(400).json({ success: false, message: `Không thể hủy đơn hàng ở trạng thái này (Hiện tại: ${order.TrangThaiDon}). Chỉ có thể hủy đơn 'Chờ xử lý'.` });
      }

      // Check if user is the buyer or the seller
      let isAllowed = false;
      if (order.NguoiMuaId === userId) {
        isAllowed = true;
      } else {
        // Check if seller owns a shop with a product in this order
        const shopCheck = await pool.request()
          .input('NguoiBanId', sql.UniqueIdentifier, userId)
          .input('OrderId', sql.UniqueIdentifier, orderId)
          .query(`
            SELECT 1 
            FROM CuaHang ch
            JOIN SanPham sp ON ch.MaCuaHang = sp.CuaHangId
            JOIN ChiTietDonHang ct ON sp.MaSanPham = ct.SanPhamId
            WHERE ch.NguoiBanId = @NguoiBanId AND ct.DonHangId = @OrderId
          `);
        if (shopCheck.recordset.length > 0) {
          isAllowed = true;
        }
      }

      if (!isAllowed) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này.' });
      }

      // 2. Perform cancellation inside transaction (to restore stock)
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        // Update order status
        const updateRequest = new sql.Request(transaction);
        await updateRequest
          .input('OrderId', sql.UniqueIdentifier, orderId)
          .input('LyDoHuy', sql.NVarChar, lyDoHuy)
          .query("UPDATE DonHang SET TrangThaiDon = N'Đã hủy', LyDoHuy = @LyDoHuy, NgayCapNhat = GETDATE() WHERE MaDonHang = @OrderId");

        // Fetch ordered items to restore stock
        const itemsRequest = new sql.Request(transaction);
        const items = await itemsRequest
          .input('OrderId', sql.UniqueIdentifier, orderId)
          .query('SELECT SanPhamId, SoLuong FROM ChiTietDonHang WHERE DonHangId = @OrderId');

        // Restore stock
        for (const item of items.recordset) {
          const restoreRequest = new sql.Request(transaction);
          await restoreRequest
            .input('SanPhamId', sql.UniqueIdentifier, item.SanPhamId)
            .input('SoLuong', sql.Int, item.SoLuong)
            .query(`
              UPDATE SanPham 
              SET SoLuong = SoLuong + @SoLuong,
                  SoLuongDaBan = SoLuongDaBan - @SoLuong,
                  DaHetHang = 0
              WHERE MaSanPham = @SanPhamId
            `);
        }

        await transaction.commit();
        return res.status(200).json({ success: true, message: 'Hủy đơn hàng thành công.' });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Error in OrderController.cancelOrder:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi hủy đơn hàng.', error: error.message });
    }
  }

  // Buyer confirms receipt
  async confirmReceived(req, res) {
    try {
      const buyerId = req.user.userId;
      const { id: orderId } = req.params;

      const pool = await poolPromise;

      // 1. Check order
      const orderResult = await pool.request()
        .input('OrderId', sql.UniqueIdentifier, orderId)
        .query('SELECT MaDonHang, NguoiMuaId, TrangThaiDon FROM DonHang WHERE MaDonHang = @OrderId');

      if (orderResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
      }

      const order = orderResult.recordset[0];
      if (order.NguoiMuaId !== buyerId) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác trên đơn hàng này.' });
      }

      if (order.TrangThaiDon !== 'Đang giao') {
        return res.status(400).json({ success: false, message: `Trạng thái đơn hàng không hợp lệ (Hiện tại: ${order.TrangThaiDon}). Chỉ có thể nhận đơn ở trạng thái 'Đang giao'.` });
      }

      // 2. Update status
      await pool.request()
        .input('OrderId', sql.UniqueIdentifier, orderId)
        .query("UPDATE DonHang SET TrangThaiDon = N'Đã nhận', NgayCapNhat = GETDATE() WHERE MaDonHang = @OrderId");

      return res.status(200).json({ success: true, message: 'Xác nhận đã nhận hàng thành công.' });
    } catch (error) {
      console.error('Error in OrderController.confirmReceived:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác nhận đã nhận hàng.', error: error.message });
    }
  }

  // Get detailed order invoice by ID
  async getOrderDetails(req, res) {
    try {
      const userId = req.user.userId;
      const { id: orderId } = req.params;

      const pool = await poolPromise;

      // 1. Fetch order details
      const orderResult = await pool.request()
        .input('OrderId', sql.UniqueIdentifier, orderId)
        .query('SELECT MaDonHang, NguoiMuaId, HoTenNguoiNhan, SoDienThoaiNguoiNhan, DiaChiNhan, TrangThaiDon, LyDoHuy, NgayTao FROM DonHang WHERE MaDonHang = @OrderId');

      if (orderResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
      }

      const order = orderResult.recordset[0];

      // 2. Validate permission (Buyer, Seller or Admin)
      let isAllowed = false;
      if (order.NguoiMuaId === userId) {
        isAllowed = true;
      } else {
        // Check if Seller has any product in this order
        const shopCheck = await pool.request()
          .input('NguoiBanId', sql.UniqueIdentifier, userId)
          .input('OrderId', sql.UniqueIdentifier, orderId)
          .query(`
            SELECT 1 
            FROM CuaHang ch
            JOIN SanPham sp ON ch.MaCuaHang = sp.CuaHangId
            JOIN ChiTietDonHang ct ON sp.MaSanPham = ct.SanPhamId
            WHERE ch.NguoiBanId = @NguoiBanId AND ct.DonHangId = @OrderId
          `);
        
        // Also check if admin
        const adminCheck = await pool.request()
          .input('UserId', sql.UniqueIdentifier, userId)
          .query(`
            SELECT v.TenVaiTro 
            FROM NguoiDung n
            JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
            WHERE n.MaNguoiDung = @UserId
          `);

        const role = adminCheck.recordset[0]?.TenVaiTro;
        if (shopCheck.recordset.length > 0 || role === 'Admin' || role === 'Moderator') {
          isAllowed = true;
        }
      }

      if (!isAllowed) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xem thông tin đơn hàng này.' });
      }

      // 3. Fetch items in order details
      const itemsResult = await pool.request()
        .input('OrderId', sql.UniqueIdentifier, orderId)
        .input('BuyerId', sql.UniqueIdentifier, order.NguoiMuaId)
        .query(`
          SELECT 
            ct.MaChiTietDonHang, ct.SanPhamId AS maSanPham, ct.PhanLoaiId AS phanLoaiId, ct.SoLuong AS soLuong, ct.DonGia AS donGia, 
            (ct.SoLuong * ct.DonGia) AS thanhTien,
            sp.TieuDe AS tenSanPham,
            pl.TenPhanLoai AS phanLoai,
            ch.TenCuaHang AS tenCuaHang,
            ch.NguoiBanId AS sellerId,
            ch.MaCuaHang AS shopId,
            (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS anh,
            (SELECT CASE WHEN EXISTS (
               SELECT 1 FROM DanhGiaSanPham 
               WHERE DonHangId = ct.DonHangId AND SanPhamId = ct.SanPhamId AND NguoiMuaId = @BuyerId
             ) THEN 1 ELSE 0 END) AS daDanhGia
          FROM ChiTietDonHang ct
          JOIN SanPham sp ON ct.SanPhamId = sp.MaSanPham
          LEFT JOIN PhanLoai pl ON ct.PhanLoaiId = pl.MaPhanLoai
          JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
          WHERE ct.DonHangId = @OrderId
        `);

      // Map check rated SQL to boolean
      const items = itemsResult.recordset.map(item => ({
        ...item,
        daDanhGia: item.daDanhGia === 1
      }));

      const total = items.reduce((sum, item) => sum + Number(item.thanhTien), 0);

      return res.status(200).json({
        success: true,
        data: {
          maDonHang: order.MaDonHang,
          ngayTao: order.NgayTao,
          trangThai: order.TrangThaiDon,
          hoTenNguoiNhan: order.HoTenNguoiNhan,
          soDienThoaiNguoiNhan: order.SoDienThoaiNguoiNhan,
          diaChiNhan: order.DiaChiNhan,
          lyDoHuy: order.LyDoHuy,
          tongTien: total,
          buyerId: order.NguoiMuaId,
          items
        }
      });

    } catch (error) {
      console.error('Error in OrderController.getOrderDetails:', error);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết hóa đơn.', error: error.message });
    }
  }

  // Submit reviews for products in an order
  async submitOrderReviews(req, res) {
    try {
      const buyerId = req.user.userId;
      const { id: orderId } = req.params;
      const { reviews } = req.body; // Array of { sanPhamId, soSao, noiDung }

      if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({ success: false, message: 'Danh sách đánh giá trống.' });
      }

      const pool = await poolPromise;

      // 1. Fetch order details to verify identity & status
      const orderResult = await pool.request()
        .input('OrderId', sql.UniqueIdentifier, orderId)
        .query('SELECT MaDonHang, NguoiMuaId, TrangThaiDon FROM DonHang WHERE MaDonHang = @OrderId');

      if (orderResult.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
      }

      const order = orderResult.recordset[0];
      if (order.NguoiMuaId !== buyerId) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện đánh giá cho đơn hàng này.' });
      }

      if (order.TrangThaiDon !== 'Đã nhận') {
        return res.status(400).json({ success: false, message: 'Chỉ có thể đánh giá đơn hàng ở trạng thái Đã nhận.' });
      }

      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        for (const review of reviews) {
          const { sanPhamId, soSao, noiDung, duongDanVideo, images } = review;
          
          if (!sanPhamId || !soSao || soSao < 1 || soSao > 5) {
            throw new Error('Thông tin đánh giá không hợp lệ (yêu cầu sanPhamId và số sao từ 1 đến 5).');
          }

          // Verify product belongs to the order details
          const checkItem = new sql.Request(transaction);
          const itemRes = await checkItem
            .input('OrderId', sql.UniqueIdentifier, orderId)
            .input('SanPhamId', sql.UniqueIdentifier, sanPhamId)
            .query('SELECT 1 FROM ChiTietDonHang WHERE DonHangId = @OrderId AND SanPhamId = @SanPhamId');

          if (itemRes.recordset.length === 0) {
            throw new Error(`Sản phẩm không thuộc đơn hàng này.`);
          }

          // Check if already reviewed
          const checkReview = new sql.Request(transaction);
          const reviewRes = await checkReview
            .input('OrderId', sql.UniqueIdentifier, orderId)
            .input('SanPhamId', sql.UniqueIdentifier, sanPhamId)
            .input('NguoiMuaId', sql.UniqueIdentifier, buyerId)
            .query('SELECT 1 FROM DanhGiaSanPham WHERE DonHangId = @OrderId AND SanPhamId = @SanPhamId AND NguoiMuaId = @NguoiMuaId');

          if (reviewRes.recordset.length > 0) {
            throw new Error('Sản phẩm đã được đánh giá trước đó.');
          }

          // Insert review with optional DuongDanVideo
          const insertReview = new sql.Request(transaction);
          const reviewResult = await insertReview
            .input('SanPhamId', sql.UniqueIdentifier, sanPhamId)
            .input('NguoiMuaId', sql.UniqueIdentifier, buyerId)
            .input('OrderId', sql.UniqueIdentifier, orderId)
            .input('SoSao', sql.TinyInt, soSao)
            .input('NoiDung', sql.NVarChar, noiDung || null)
            .input('DuongDanVideo', sql.VarChar, getFilenameOnly(duongDanVideo) || null)
            .query(`
              DECLARE @OutputTable TABLE (MaDanhGia UNIQUEIDENTIFIER);
              INSERT INTO DanhGiaSanPham (SanPhamId, NguoiMuaId, DonHangId, SoSao, NoiDung, DuongDanVideo, NgayTao, NgayCapNhat)
              OUTPUT INSERTED.MaDanhGia INTO @OutputTable
              VALUES (@SanPhamId, @NguoiMuaId, @OrderId, @SoSao, @NoiDung, @DuongDanVideo, GETDATE(), GETDATE());
              SELECT MaDanhGia FROM @OutputTable;
            `);

          const newReviewId = reviewResult.recordset[0].MaDanhGia;

          // Insert up to 5 images into PhanHoiMedia
          if (images && Array.isArray(images) && images.length > 0) {
            const imagesToInsert = images.slice(0, 5);
            for (const imgUrl of imagesToInsert) {
              if (imgUrl) {
                const insertImg = new sql.Request(transaction);
                await insertImg
                  .input('DanhGiaId', sql.UniqueIdentifier, newReviewId)
                  .input('DuongDanMedia', sql.VarChar, getFilenameOnly(imgUrl))
                  .query(`
                    INSERT INTO PhanHoiMedia (MaPhanHoi, DanhGiaId, LoaiPhanHoi, LoaiMedia, DuongDanMedia, NgayTao)
                    VALUES (NEWID(), @DanhGiaId, N'danh_gia', N'anh', @DuongDanMedia, GETDATE())
                  `);
              }
            }
          }
        }

        await transaction.commit();
        return res.status(201).json({ success: true, message: 'Gửi đánh giá thành công.' });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }

    } catch (error) {
      console.error('Error in OrderController.submitOrderReviews:', error);
      return res.status(500).json({ success: false, message: error.message || 'Lỗi máy chủ khi gửi đánh giá.', error: error.message });
    }
  }
}

module.exports = new OrderController();

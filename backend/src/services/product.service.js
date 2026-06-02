const { sql, poolPromise } = require('../config/db');

class ProductService {
  async getProducts({ sortBy = 'best_seller', offset = 0, limit = 20 }) {
    const pool = await poolPromise;
    const request = pool.request();

    // Query total count first
    const countResult = await pool.request()
      .query(`
        SELECT COUNT(*) as total 
        FROM SanPham sp
        WHERE sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1
      `);
    const total = countResult.recordset[0].total;

    let orderBy = 'sp.SoLuongDaBan DESC, sp.NgayDang DESC';
    if (sortBy === 'newest') {
      orderBy = 'sp.NgayDang DESC';
    }

    const query = `
      SELECT sp.MaSanPham, sp.TieuDe, sp.Gia, sp.SoLuongDaBan, sp.TinhTrang, sp.DaHetHang,
             (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS HinhAnh
      FROM SanPham sp
      WHERE sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1
      ORDER BY ${orderBy}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
    `;

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);
    const data = result.recordset;

    return {
      success: true,
      data,
      hasMore: offset + limit < total,
      total
    };
  }

  async searchProducts({ q = '', category = '', priceMin = '', priceMax = '', rating = 0, condition = '', store = '', province = '', district = '', ward = '', sort = 'relevance', page = 1, limit = 12 }) {
    const pool = await poolPromise;
    const request = pool.request();
    const offset = (page - 1) * limit;

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    let whereClause = `WHERE sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1`;

    if (province) {
      const normProvince = province.replace(/^Thành phố\s+/i, '').replace(/^Tỉnh\s+/i, '').replace(/^TP\.\s+/i, '').trim();
      whereClause += ` AND (ch.TinhThanh = @province OR REPLACE(REPLACE(REPLACE(ch.TinhThanh, N'Thành phố ', ''), N'Tỉnh ', ''), N'TP. ', '') = @normProvince)`;
      request.input('province', sql.NVarChar, province);
      request.input('normProvince', sql.NVarChar, normProvince);
    }

    if (district) {
      const normDistrict = district.replace(/^Quận\s+/i, '').replace(/^Huyện\s+/i, '').replace(/^Thành phố\s+/i, '').replace(/^Thị xã\s+/i, '').trim();
      whereClause += ` AND (ch.QuanHuyen = @district OR REPLACE(REPLACE(REPLACE(REPLACE(ch.QuanHuyen, N'Quận ', ''), N'Huyện ', ''), N'Thành phố ', ''), N'Thị xã ', '') = @normDistrict)`;
      request.input('district', sql.NVarChar, district);
      request.input('normDistrict', sql.NVarChar, normDistrict);
    }

    if (ward) {
      const normWard = ward.replace(/^Phường\s+/i, '').replace(/^Xã\s+/i, '').replace(/^Thị trấn\s+/i, '').trim();
      whereClause += ` AND (ch.PhuongXa = @ward OR REPLACE(REPLACE(REPLACE(ch.PhuongXa, N'Phường ', ''), N'Xã ', ''), N'Thị trấn ', '') = @normWard)`;
      request.input('ward', sql.NVarChar, ward);
      request.input('normWard', sql.NVarChar, normWard);
    }

    if (q) {
      whereClause += ` AND sp.TieuDe LIKE @q`;
      request.input('q', sql.NVarChar, `%${q}%`);
    }

    if (category) {
      whereClause += ` AND sp.DanhMucId IN (
        WITH CategoryCTE AS (
          SELECT MaDanhMuc FROM DanhMuc 
          WHERE MaDanhMuc = @category OR TenDanhMuc = @category
          UNION ALL
          SELECT dm.MaDanhMuc FROM DanhMuc dm
          INNER JOIN CategoryCTE c ON dm.DanhMucChaId = c.MaDanhMuc
        )
        SELECT MaDanhMuc FROM CategoryCTE
      )`;
      // Check if category is a UUID or string
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      request.input('category', isUuid ? sql.UniqueIdentifier : sql.NVarChar, category);
    }

    if (priceMin !== '' && priceMin != null) {
      whereClause += ` AND sp.Gia >= @priceMin`;
      request.input('priceMin', sql.Decimal, Number(priceMin));
    }

    if (priceMax !== '' && priceMax != null) {
      whereClause += ` AND sp.Gia <= @priceMax`;
      request.input('priceMax', sql.Decimal, Number(priceMax));
    }

    if (rating > 0) {
      whereClause += ` AND sp.DiemDanhGia >= @rating`;
      request.input('rating', sql.Float, Number(rating));
    }

    if (condition) {
      whereClause += ` AND sp.TinhTrang = @condition`;
      request.input('condition', sql.NVarChar, condition);
    }

    if (store) {
      whereClause += ` AND (ch.TenCuaHang = @store OR ch.MaCuaHang = @store)`;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(store);
      request.input('store', isUuid ? sql.UniqueIdentifier : sql.NVarChar, store);
    }

    let orderBy = 'sp.NgayDang DESC';
    switch (sort) {
      case 'newest':
        orderBy = 'sp.NgayDang DESC';
        break;
      case 'price_asc':
        orderBy = 'sp.Gia ASC';
        break;
      case 'price_desc':
        orderBy = 'sp.Gia DESC';
        break;
      case 'best_seller':
        orderBy = 'sp.SoLuongDaBan DESC';
        break;
      case 'top_rated':
        orderBy = 'sp.DiemDanhGia DESC';
        break;
      default:
        break;
    }

    const countQuery = `
      SELECT COUNT(DISTINCT sp.MaSanPham) as total
      FROM SanPham sp
      JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
      ${whereClause}
    `;

    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    const dataQuery = `
      SELECT 
        sp.MaSanPham, sp.TieuDe, sp.Gia, sp.SoLuongDaBan, sp.DiemDanhGia, sp.TinhTrang, sp.DaHetHang, sp.NgayDang, sp.DanhMucId as MaDanhMuc, sp.CuaHangId as MaCuaHang,
        ch.TenCuaHang,
        dm.TenDanhMuc,
        (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS HinhAnh
      FROM SanPham sp
      JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
      JOIN DanhMuc dm ON sp.DanhMucId = dm.MaDanhMuc
      ${whereClause}
      ORDER BY ${orderBy}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    const dataResult = await request.query(dataQuery);

    return {
      success: true,
      data: dataResult.recordset,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProductDetail(id) {
    const pool = await poolPromise;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const isUuid = uuidRegex.test(id);

    let queryText = '';
    let request = pool.request();

    if (isUuid) {
      request.input('id', sql.UniqueIdentifier, id);
      queryText = `
        SELECT 
          sp.*,
          ch.TenCuaHang, ch.Logo, ch.DiaChi as CuaHangDiaChi, ch.LoaiHinhCuaHang,
          dm.TenDanhMuc,
          dmCha.TenDanhMuc as TenDanhMucCha,
          (SELECT COUNT(*) FROM ChiTietGioHang ct WHERE ct.SanPhamId = sp.MaSanPham) as SoLuongGioHangThucTe
        FROM SanPham sp
        JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
        JOIN DanhMuc dm ON sp.DanhMucId = dm.MaDanhMuc
        LEFT JOIN DanhMuc dmCha ON dm.DanhMucChaId = dmCha.MaDanhMuc
        WHERE sp.MaSanPham = @id AND sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1
      `;
    } else {
      request.input('linkCode', sql.VarChar, id);
      queryText = `
        SELECT 
          sp.*,
          ch.TenCuaHang, ch.Logo, ch.DiaChi as CuaHangDiaChi, ch.LoaiHinhCuaHang,
          dm.TenDanhMuc,
          dmCha.TenDanhMuc as TenDanhMucCha,
          (SELECT COUNT(*) FROM ChiTietGioHang ct WHERE ct.SanPhamId = sp.MaSanPham) as SoLuongGioHangThucTe
        FROM SanPham sp
        JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
        JOIN DanhMuc dm ON sp.DanhMucId = dm.MaDanhMuc
        LEFT JOIN DanhMuc dmCha ON dm.DanhMucChaId = dmCha.MaDanhMuc
        WHERE sp.LinkSanPham = @linkCode AND sp.TrangThaiDuyet = N'Đã duyệt' AND sp.TrangThaiHienThi = 1
      `;
    }

    const basicInfoResult = await request.query(queryText);
      
    if (basicInfoResult.recordset.length === 0) {
      throw new Error('Không tìm thấy sản phẩm hoặc sản phẩm chưa được duyệt');
    }
    
    const product = basicInfoResult.recordset[0];
    const actualProductId = product.MaSanPham; // Use the actual product GUID to query images/variations

    // Get images
    const imagesResult = await pool.request()
      .input('id', sql.UniqueIdentifier, actualProductId)
      .query(`SELECT * FROM AnhSanPham WHERE SanPhamId = @id ORDER BY LaAnhChinh DESC, NgayTao ASC`);
    product.images = imagesResult.recordset;

    // Get variations with image links
    const variationsResult = await pool.request()
      .input('id', sql.UniqueIdentifier, actualProductId)
      .query(`
        SELECT pl.*, a.DuongDanAnh 
        FROM PhanLoai pl
        LEFT JOIN AnhSanPham a ON pl.HinhAnhId = a.MaHinhAnh
        WHERE pl.SanPhamId = @id
      `);
    product.variations = variationsResult.recordset;

    // Get reviews
    const reviewsResult = await pool.request()
      .input('id', sql.UniqueIdentifier, actualProductId)
      .query(`
        SELECT 
          dg.*,
          nd.HoTen as TenNguoiMua, nd.AnhDaiDien
        FROM DanhGiaSanPham dg
        JOIN NguoiDung nd ON dg.NguoiMuaId = nd.MaNguoiDung
        WHERE dg.SanPhamId = @id
        ORDER BY dg.NgayTao DESC
      `);
      
    const reviews = reviewsResult.recordset;
    
    // Get media for each review
    for (let review of reviews) {
      const mediaResult = await pool.request()
        .input('reviewId', sql.UniqueIdentifier, review.MaDanhGia)
        .query(`SELECT * FROM PhanHoiMedia WHERE DanhGiaId = @reviewId`);
      review.media = mediaResult.recordset;
    }
    
    product.reviews = reviews;

    return product;
  }

  async getSellerStore(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('SELECT MaCuaHang FROM CuaHang WHERE NguoiBanId = @userId');
    if (result.recordset.length === 0) {
      throw new Error('Bạn không có cửa hàng đăng ký bán hàng.');
    }
    return result.recordset[0].MaCuaHang;
  }

  async getSellerProducts(sellerId) {
    const storeId = await this.getSellerStore(sellerId);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('storeId', sql.UniqueIdentifier, storeId)
      .query(`
        SELECT 
          sp.MaSanPham, sp.TieuDe, sp.Gia, sp.SoLuong, sp.SoLuongDaBan, 
          sp.TrangThaiDuyet, sp.NgayDang, sp.TinhTrang, sp.LuotXem, sp.DiemDanhGia,
          sp.DaHetHang,
          (SELECT TOP 1 DuongDanAnh FROM AnhSanPham WHERE SanPhamId = sp.MaSanPham AND LaAnhChinh = 1) AS HinhAnh
        FROM SanPham sp
        WHERE sp.CuaHangId = @storeId
        ORDER BY sp.NgayDang DESC
      `);
    return result.recordset;
  }

  async getSellerProductDetail(productId, sellerId) {
    const storeId = await this.getSellerStore(sellerId);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, productId)
      .input('storeId', sql.UniqueIdentifier, storeId)
      .query(`
        SELECT 
          sp.*,
          ch.TenCuaHang, ch.Logo, ch.DiaChi as CuaHangDiaChi, ch.LoaiHinhCuaHang,
          dm.TenDanhMuc,
          dmCha.TenDanhMuc as TenDanhMucCha
        FROM SanPham sp
        JOIN CuaHang ch ON sp.CuaHangId = ch.MaCuaHang
        JOIN DanhMuc dm ON sp.DanhMucId = dm.MaDanhMuc
        LEFT JOIN DanhMuc dmCha ON dm.DanhMucChaId = dmCha.MaDanhMuc
        WHERE sp.MaSanPham = @id AND sp.CuaHangId = @storeId
      `);

    if (result.recordset.length === 0) {
      throw new Error('Không tìm thấy sản phẩm hoặc bạn không có quyền xem sản phẩm này.');
    }

    const product = result.recordset[0];

    // Lấy danh sách ảnh
    const imagesResult = await pool.request()
      .input('id', sql.UniqueIdentifier, productId)
      .query(`SELECT * FROM AnhSanPham WHERE SanPhamId = @id ORDER BY LaAnhChinh DESC, NgayTao ASC`);
    product.images = imagesResult.recordset;

    // Lấy phân loại kèm theo link hình ảnh
    const variationsResult = await pool.request()
      .input('id', sql.UniqueIdentifier, productId)
      .query(`
        SELECT pl.*, a.DuongDanAnh 
         FROM PhanLoai pl
         LEFT JOIN AnhSanPham a ON pl.HinhAnhId = a.MaHinhAnh
         WHERE pl.SanPhamId = @id
      `);
    product.variations = variationsResult.recordset;

    // Lấy đánh giá
    const reviewsResult = await pool.request()
      .input('id', sql.UniqueIdentifier, productId)
      .query(`
        SELECT 
          dg.*,
          nd.HoTen as TenNguoiMua, nd.AnhDaiDien
        FROM DanhGiaSanPham dg
        JOIN NguoiDung nd ON dg.NguoiMuaId = nd.MaNguoiDung
        WHERE dg.SanPhamId = @id
        ORDER BY dg.NgayTao DESC
      `);
      
    const reviews = reviewsResult.recordset;
    
    // Lấy media cho từng đánh giá
    for (let review of reviews) {
      const mediaResult = await pool.request()
        .input('reviewId', sql.UniqueIdentifier, review.MaDanhGia)
        .query(`SELECT * FROM PhanHoiMedia WHERE DanhGiaId = @reviewId`);
      review.media = mediaResult.recordset;
    }
    
    product.reviews = reviews;

    return product;
  }

  async getSellerStats(sellerId, tuNgay = '', denNgay = '') {
    const storeId = await this.getSellerStore(sellerId);
    const pool = await poolPromise;
    const request = pool.request();
    request.input('storeId', sql.UniqueIdentifier, storeId);

    let dateFilter = '';
    if (tuNgay && tuNgay !== 'undefined' && tuNgay !== 'null' && tuNgay !== '') {
      dateFilter += ` AND NgayDang >= @tuNgay`;
      request.input('tuNgay', sql.DateTime, tuNgay);
    }
    if (denNgay && denNgay !== 'undefined' && denNgay !== 'null' && denNgay !== '') {
      dateFilter += ` AND NgayDang <= @denNgay`;
      request.input('denNgay', sql.DateTime, denNgay);
    }

    // Thống kê tổng quan và phân bổ trạng thái của riêng Cửa hàng đó
    const statsQuery = `
      SELECT 
        COUNT(MaSanPham) as TotalProducts,
        SUM(CASE WHEN TrangThaiDuyet = N'Chờ phê duyệt' THEN 1 ELSE 0 END) as PendingProducts,
        SUM(CASE WHEN TrangThaiDuyet = N'Đã duyệt' THEN 1 ELSE 0 END) as ApprovedProducts,
        SUM(CASE WHEN TrangThaiDuyet = N'Đã từ chối' THEN 1 ELSE 0 END) as RejectedProducts,
        SUM(CASE WHEN TrangThaiDuyet = N'Đã gỡ' THEN 1 ELSE 0 END) as RemovedProducts
      FROM SanPham
      WHERE CuaHangId = @storeId ${dateFilter}
    `;
    const statsResult = await request.query(statsQuery);

    // Thống kê tăng trưởng (7 ngày gần nhất hoặc trong khoảng thời gian lọc) của riêng Cửa hàng đó
    let growthQuery = '';
    if (tuNgay && denNgay) {
      growthQuery = `
        SELECT CAST(NgayDang AS DATE) as date, COUNT(*) as count
        FROM SanPham
        WHERE CuaHangId = @storeId ${dateFilter}
        GROUP BY CAST(NgayDang AS DATE)
        ORDER BY date
      `;
    } else {
      growthQuery = `
        WITH Dates AS (
          SELECT CAST(DATEADD(day, -6, GETDATE()) AS DATE) as Date
          UNION ALL
          SELECT DATEADD(day, 1, Date)
          FROM Dates
          WHERE Date < CAST(GETDATE() AS DATE)
        )
        SELECT 
          FORMAT(d.Date, 'dd/MM') as date,
          COUNT(sp.MaSanPham) as count
        FROM Dates d
        LEFT JOIN SanPham sp ON CAST(sp.NgayDang AS DATE) = d.Date AND sp.CuaHangId = @storeId
        GROUP BY d.Date
        ORDER BY d.Date
      `;
    }
    const growthResult = await request.query(growthQuery);

    // Top 5 sản phẩm có lượt xem cao nhất của cửa hàng
    const topViewsQuery = `
      SELECT TOP 5 TieuDe as name, LuotXem as value
      FROM SanPham
      WHERE CuaHangId = @storeId ${dateFilter}
      ORDER BY LuotXem DESC
    `;
    const topViewsResult = await request.query(topViewsQuery);

    // Top 5 sản phẩm bán chạy nhất của cửa hàng
    const topSalesQuery = `
      SELECT TOP 5 TieuDe as name, SoLuongDaBan as value
      FROM SanPham
      WHERE CuaHangId = @storeId ${dateFilter}
      ORDER BY SoLuongDaBan DESC
    `;
    const topSalesResult = await request.query(topSalesQuery);

    return {
      overview: statsResult.recordset[0] || {
        TotalProducts: 0,
        PendingProducts: 0,
        ApprovedProducts: 0,
        RejectedProducts: 0,
        RemovedProducts: 0
      },
      growth: growthResult.recordset,
      topViews: topViewsResult.recordset,
      topSales: topSalesResult.recordset
    };
  }

  async createProduct(sellerId, productData) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!productData.DanhMucId || !uuidRegex.test(productData.DanhMucId)) {
      throw new Error('Vui lòng chọn danh mục hợp lệ.');
    }

    const storeId = await this.getSellerStore(sellerId);
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Auto-generate a unique short code for product link
      let linkCode = '';
      let isUnique = false;
      const maxAttempts = 10;
      let attempts = 0;

      while (!isUnique && attempts < maxAttempts) {
        linkCode = '';
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < 6; i++) {
          linkCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const checkRes = await new sql.Request(transaction)
          .input('code', sql.VarChar, linkCode)
          .query(`SELECT COUNT(*) as count FROM SanPham WHERE LinkSanPham = @code`);
        
        if (checkRes.recordset[0].count === 0) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        linkCode = Math.random().toString(36).substring(2, 8);
      }

      const qty = productData.SoLuong !== undefined ? Number(productData.SoLuong) : 1;
      const daHetHang = qty <= 0 ? 1 : 0;

      const insertProduct = new sql.Request(transaction);
      const productResult = await insertProduct
        .input('storeId', sql.UniqueIdentifier, storeId)
        .input('danhMucId', sql.UniqueIdentifier, productData.DanhMucId)
        .input('tieuDe', sql.NVarChar, productData.TieuDe)
        .input('fileMoTa', sql.NVarChar, productData.FileMoTa || null)
        .input('gia', sql.Decimal(12,2), productData.Gia)
        .input('tinhTrang', sql.NVarChar, productData.TinhTrang)
        .input('soLuong', sql.Int, qty)
        .input('linkSanPham', sql.VarChar, linkCode)
        .input('daHetHang', sql.Bit, daHetHang)
        .query(`
          INSERT INTO SanPham (
            MaSanPham, CuaHangId, DanhMucId, TieuDe, FileMoTa, Gia, TinhTrang, 
            SoLuong, SoLuongDaBan, LuotXem, DiemDanhGia, LinkSanPham, 
            TrangThaiDuyet, TrangThaiHienThi, NgayDang, DaHetHang
          )
          OUTPUT INSERTED.MaSanPham
          VALUES (
            NEWID(), @storeId, @danhMucId, @tieuDe, @fileMoTa, @gia, @tinhTrang, 
            @soLuong, 0, 0, 0.0, @linkSanPham, 
            N'Chờ phê duyệt', 1, GETDATE(), @daHetHang
          )
        `);

      const productId = productResult.recordset[0].MaSanPham;

      // Map of temp image IDs to DB Image IDs
      const imageIdMap = {};

      // Insert images
      if (productData.images && Array.isArray(productData.images)) {
        for (const img of productData.images) {
          const insertImg = new sql.Request(transaction);
          const imgResult = await insertImg
            .input('productId', sql.UniqueIdentifier, productId)
            .input('url', sql.VarChar, img.url)
            .input('isMain', sql.Bit, img.isMain ? 1 : 0)
            .query(`
              INSERT INTO AnhSanPham (MaHinhAnh, SanPhamId, DuongDanAnh, LaAnhChinh, NgayTao)
              OUTPUT INSERTED.MaHinhAnh
              VALUES (NEWID(), @productId, @url, @isMain, GETDATE())
            `);
          
          const dbImageId = imgResult.recordset[0].MaHinhAnh;
          if (img.tempId) {
            imageIdMap[img.tempId] = dbImageId;
          }
        }
      }

      // Insert variations
      if (productData.variations && Array.isArray(productData.variations)) {
        for (const variant of productData.variations) {
          const imageDbId = imageIdMap[variant.imageTempId];
          if (!imageDbId) {
            throw new Error(`Hình ảnh phân loại '${variant.name}' không tồn tại.`);
          }

          const insertVariant = new sql.Request(transaction);
          await insertVariant
            .input('tenPhanLoai', sql.NVarChar, variant.name)
            .input('productId', sql.UniqueIdentifier, productId)
            .input('imageId', sql.UniqueIdentifier, imageDbId)
            .query(`
              INSERT INTO PhanLoai (MaPhanLoai, TenPhanLoai, SanPhamId, HinhAnhId)
              VALUES (NEWID(), @tenPhanLoai, @productId, @imageId)
            `);
        }
      }

      await transaction.commit();
      return { MaSanPham: productId };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateProduct(productId, sellerId, productData) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!productData.DanhMucId || !uuidRegex.test(productData.DanhMucId)) {
      throw new Error('Vui lòng chọn danh mục hợp lệ.');
    }

    const storeId = await this.getSellerStore(sellerId);
    const pool = await poolPromise;
    
    // First check ownership
    const checkOwnership = await pool.request()
      .input('id', sql.UniqueIdentifier, productId)
      .input('storeId', sql.UniqueIdentifier, storeId)
      .query('SELECT 1 FROM SanPham WHERE MaSanPham = @id AND CuaHangId = @storeId');
       
    if (checkOwnership.recordset.length === 0) {
      throw new Error('Không tìm thấy sản phẩm hoặc bạn không có quyền chỉnh sửa.');
    }

    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      const qty = productData.SoLuong !== undefined ? Number(productData.SoLuong) : 1;
      const daHetHang = qty <= 0 ? 1 : 0;

      // 1. Update basic info on SanPham
      const updateBasic = new sql.Request(transaction);
      await updateBasic
        .input('id', sql.UniqueIdentifier, productId)
        .input('danhMucId', sql.UniqueIdentifier, productData.DanhMucId)
        .input('tieuDe', sql.NVarChar, productData.TieuDe)
        .input('fileMoTa', sql.NVarChar, productData.FileMoTa || null)
        .input('gia', sql.Decimal(12,2), productData.Gia)
        .input('tinhTrang', sql.NVarChar, productData.TinhTrang)
        .input('soLuong', sql.Int, qty)
        .input('daHetHang', sql.Bit, daHetHang)
        .input('linkSanPham', sql.VarChar, productData.LinkSanPham || null)
        .query(`
          UPDATE SanPham
          SET 
            DanhMucId = @danhMucId,
            TieuDe = @tieuDe,
            FileMoTa = @fileMoTa,
            Gia = @gia,
            TinhTrang = @tinhTrang,
            SoLuong = @soLuong,
            DaHetHang = @daHetHang,
            LinkSanPham = @linkSanPham,
            NgaySua = GETDATE()
          WHERE MaSanPham = @id
        `);

      // 2. Synchronize images if images array is provided
      if (productData.images && Array.isArray(productData.images)) {
        // Fetch current database images
        const currentImgsRes = await new sql.Request(transaction)
          .input('id', sql.UniqueIdentifier, productId)
          .query('SELECT MaHinhAnh, DuongDanAnh, LaAnhChinh FROM AnhSanPham WHERE SanPhamId = @id');
        const currentImgs = currentImgsRes.recordset;

        const incomingImages = productData.images;
        const imageIdMap = {}; // tempId -> dbId

        // A. Identify which incoming images are existing (their tempId is one of the current DB MaHinhAnh)
        const dbImageIdsInRequest = incomingImages
          .map(img => img.tempId)
          .filter(tempId => currentImgs.some(c => c.MaHinhAnh === tempId));

        // B. Delete images from DB that are no longer in the request
        const imagesToDelete = currentImgs.filter(c => !dbImageIdsInRequest.includes(c.MaHinhAnh));
        for (const imgToDelete of imagesToDelete) {
          // Delete associated variations first (if any) to prevent FK errors
          await new sql.Request(transaction)
            .input('imgId', sql.UniqueIdentifier, imgToDelete.MaHinhAnh)
            .query('DELETE FROM PhanLoai WHERE HinhAnhId = @imgId');

          // Delete the image
          await new sql.Request(transaction)
            .input('imgId', sql.UniqueIdentifier, imgToDelete.MaHinhAnh)
            .query('DELETE FROM AnhSanPham WHERE MaHinhAnh = @imgId');
        }

        // C. Update existing images (e.g. LaAnhChinh flag) or insert new ones
        for (const img of incomingImages) {
          const isExisting = currentImgs.some(c => c.MaHinhAnh === img.tempId);
          if (isExisting) {
            // Update LaAnhChinh
            await new sql.Request(transaction)
              .input('imgId', sql.UniqueIdentifier, img.tempId)
              .input('isMain', sql.Bit, img.isMain ? 1 : 0)
              .query('UPDATE AnhSanPham SET LaAnhChinh = @isMain WHERE MaHinhAnh = @imgId');
            
            imageIdMap[img.tempId] = img.tempId;
          } else {
            // Insert new image
            const imgResult = await new sql.Request(transaction)
              .input('productId', sql.UniqueIdentifier, productId)
              .input('url', sql.VarChar, img.url)
              .input('isMain', sql.Bit, img.isMain ? 1 : 0)
              .query(`
                INSERT INTO AnhSanPham (MaHinhAnh, SanPhamId, DuongDanAnh, LaAnhChinh, NgayTao)
                OUTPUT INSERTED.MaHinhAnh
                VALUES (NEWID(), @productId, @url, @isMain, GETDATE())
              `);
            const dbImageId = imgResult.recordset[0].MaHinhAnh;
            imageIdMap[img.tempId] = dbImageId;
          }
        }

        // D. Synchronize variations if variations array is provided
        if (productData.variations && Array.isArray(productData.variations)) {
          // Fetch current database variations
          const currentVarsRes = await new sql.Request(transaction)
            .input('id', sql.UniqueIdentifier, productId)
            .query('SELECT MaPhanLoai, TenPhanLoai, HinhAnhId FROM PhanLoai WHERE SanPhamId = @id');
          const currentVars = currentVarsRes.recordset;

          const incomingVars = productData.variations;

          // A variation is matched if its TenPhanLoai and associated HinhAnhId match.
          // Let's map incoming variations to their DB HinhAnhId first
          const mappedIncomingVars = incomingVars.map(v => {
            const dbImageId = imageIdMap[v.imageTempId];
            return {
              name: v.name,
              dbImageId: dbImageId
            };
          }).filter(v => !!v.dbImageId); // must have a valid db image id

          // Determine which current variations are NOT in the incoming list and delete them
          for (const curVar of currentVars) {
            const stillExists = mappedIncomingVars.some(
              inc => inc.name === curVar.TenPhanLoai && inc.dbImageId === curVar.HinhAnhId
            );
            if (!stillExists) {
              await new sql.Request(transaction)
                .input('varId', sql.UniqueIdentifier, curVar.MaPhanLoai)
                .query('DELETE FROM PhanLoai WHERE MaPhanLoai = @varId');
            }
          }

          // Insert new variations (those that don't exist in the current DB vars)
          for (const incVar of mappedIncomingVars) {
            const alreadyExists = currentVars.some(
              cur => cur.TenPhanLoai === incVar.name && cur.HinhAnhId === incVar.dbImageId
            );
            if (!alreadyExists) {
              await new sql.Request(transaction)
                .input('name', sql.NVarChar, incVar.name)
                .input('productId', sql.UniqueIdentifier, productId)
                .input('imageId', sql.UniqueIdentifier, incVar.dbImageId)
                .query(`
                  INSERT INTO PhanLoai (MaPhanLoai, TenPhanLoai, SanPhamId, HinhAnhId)
                  VALUES (NEWID(), @name, @productId, @imageId)
                `);
            }
          }
        }
      }

      await transaction.commit();
      
      // Return updated product basic details
      const getUpdated = await pool.request()
        .input('id', sql.UniqueIdentifier, productId)
        .query('SELECT * FROM SanPham WHERE MaSanPham = @id');
      return getUpdated.recordset[0];
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async setOutOfStock(productId, sellerId) {
    const storeId = await this.getSellerStore(sellerId);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, productId)
      .input('storeId', sql.UniqueIdentifier, storeId)
      .query(`
        UPDATE SanPham
        SET 
          DaHetHang = 1,
          SoLuong = 0,
          NgaySua = GETDATE()
        OUTPUT INSERTED.*
        WHERE MaSanPham = @id AND CuaHangId = @storeId
      `);
    if (result.recordset.length === 0) {
      throw new Error('Không tìm thấy sản phẩm hoặc bạn không có quyền cập nhật.');
    }
    return result.recordset[0];
  }

  async setInStock(productId, sellerId, quantity = 1) {
    const storeId = await this.getSellerStore(sellerId);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, productId)
      .input('storeId', sql.UniqueIdentifier, storeId)
      .input('soLuong', sql.Int, quantity)
      .query(`
        UPDATE SanPham
        SET 
          DaHetHang = 0,
          SoLuong = @soLuong,
          NgaySua = GETDATE()
        OUTPUT INSERTED.*
        WHERE MaSanPham = @id AND CuaHangId = @storeId
      `);
    if (result.recordset.length === 0) {
      throw new Error('Không tìm thấy sản phẩm hoặc bạn không có quyền cập nhật.');
    }
    return result.recordset[0];
  }

  async getProductReviews(productId, sosao) {
    const pool = await poolPromise;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const isUuid = uuidRegex.test(productId);
    
    let actualProductId = productId;
    
    if (!isUuid) {
      // Look up actual product GUID by LinkSanPham
      const lookupResult = await pool.request()
        .input('code', sql.VarChar, productId)
        .query('SELECT MaSanPham FROM SanPham WHERE LinkSanPham = @code');
      
      if (lookupResult.recordset.length === 0) {
        return []; // Product not found, return empty reviews list
      }
      actualProductId = lookupResult.recordset[0].MaSanPham;
    }

    const request = pool.request();
    request.input('productId', sql.UniqueIdentifier, actualProductId);
    
    let query = `
      SELECT 
        dg.*,
        nd.HoTen as TenNguoiMua, nd.AnhDaiDien
      FROM DanhGiaSanPham dg
      JOIN NguoiDung nd ON dg.NguoiMuaId = nd.MaNguoiDung
      WHERE dg.SanPhamId = @productId
    `;
    
    if (sosao > 0) {
      query += ` AND dg.SoSao = @sosao`;
      request.input('sosao', sql.TinyInt, sosao);
    }
    
    query += ` ORDER BY dg.NgayTao DESC`;
    
    const result = await request.query(query);
    const reviews = result.recordset;
    
    // Fetch media for reviews
    for (let review of reviews) {
      const mediaResult = await pool.request()
        .input('reviewId', sql.UniqueIdentifier, review.MaDanhGia)
        .query(`SELECT * FROM PhanHoiMedia WHERE DanhGiaId = @reviewId`);
      review.media = mediaResult.recordset;
    }
    
    return reviews;
  }

  async replyReview(reviewId, sellerId, noiDung) {
    const storeId = await this.getSellerStore(sellerId);
    const pool = await poolPromise;
    
    // Verify ownership: review -> product -> store matches seller store
    const verifyOwnership = await pool.request()
      .input('reviewId', sql.UniqueIdentifier, reviewId)
      .input('storeId', sql.UniqueIdentifier, storeId)
      .query(`
        SELECT 1 
        FROM DanhGiaSanPham dg
        JOIN SanPham sp ON dg.SanPhamId = sp.MaSanPham
        WHERE dg.MaDanhGia = @reviewId AND sp.CuaHangId = @storeId
      `);
       
    if (verifyOwnership.recordset.length === 0) {
      throw new Error('Bạn không có quyền trả lời đánh giá này.');
    }

    await pool.request()
      .input('reviewId', sql.UniqueIdentifier, reviewId)
      .input('noiDung', sql.NVarChar, noiDung)
      .query(`
        UPDATE DanhGiaSanPham
        SET 
          TraLoiNoiDung = @noiDung,
          TraLoiNgayTao = ISNULL(TraLoiNgayTao, GETDATE()),
          TraLoiNgayCapNhat = GETDATE()
        WHERE MaDanhGia = @reviewId
      `);

    const getUpdated = await pool.request()
      .input('reviewId', sql.UniqueIdentifier, reviewId)
      .query('SELECT * FROM DanhGiaSanPham WHERE MaDanhGia = @reviewId');

    return getUpdated.recordset[0];
  }
}

module.exports = new ProductService();

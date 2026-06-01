USE ZenTekExchange;
GO

-- Epic 7: Chat System (Khởi tạo dữ liệu phòng chat cộng đồng, tin nhắn 1-1)

-- 1. Tạo 2 cuộc trò chuyện nhóm
INSERT INTO CuocTroChuyen (TenCuocTroChuyen, Loai)
SELECT src.Ten, 'nhom'
FROM (VALUES 
    (N'Cộng đồng người mua'),
    (N'Cộng đồng người bán')
) AS src(Ten)
WHERE NOT EXISTS (SELECT 1 FROM CuocTroChuyen c WHERE c.TenCuocTroChuyen = src.Ten);
GO

-- 2. Thêm admin vào cả 2 nhóm với tư cách là chủ nhóm
INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
SELECT c.MaCuocTroChuyen, n.MaNguoiDung, 'chu_nhom'
FROM CuocTroChuyen c
CROSS JOIN NguoiDung n
WHERE c.TenCuocTroChuyen IN (N'Cộng đồng người mua', N'Cộng đồng người bán')
  AND n.TenDangNhap = 'admin'
  AND NOT EXISTS (
      SELECT 1 FROM ThanhVienCuocTroChuyen tv 
      WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId = n.MaNguoiDung
  );
GO

-- 3. Thêm Người mua vào nhóm Cộng đồng người mua
INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
SELECT c.MaCuocTroChuyen, n.MaNguoiDung, 'thanh_vien'
FROM CuocTroChuyen c
CROSS JOIN NguoiDung n
JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
WHERE c.TenCuocTroChuyen = N'Cộng đồng người mua'
  AND v.TenVaiTro = 'Buyer'
  AND NOT EXISTS (
      SELECT 1 FROM ThanhVienCuocTroChuyen tv 
      WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId = n.MaNguoiDung
  );
GO

-- 4. Thêm Người bán vào nhóm Cộng đồng người bán
INSERT INTO ThanhVienCuocTroChuyen (CuocTroChuyenId, NguoiDungId, VaiTro)
SELECT c.MaCuocTroChuyen, n.MaNguoiDung, 'thanh_vien'
FROM CuocTroChuyen c
CROSS JOIN NguoiDung n
JOIN VaiTro v ON n.VaiTroId = v.MaVaiTro
WHERE c.TenCuocTroChuyen = N'Cộng đồng người bán'
  AND v.TenVaiTro = 'Seller'
  AND NOT EXISTS (
      SELECT 1 FROM ThanhVienCuocTroChuyen tv 
      WHERE tv.CuocTroChuyenId = c.MaCuocTroChuyen AND tv.NguoiDungId = n.MaNguoiDung
  );
GO

-- 5. Thêm một vài tin nhắn mẫu vào các nhóm
INSERT INTO TinNhan (CuocTroChuyenId, NguoiGuiId, NoiDung)
SELECT c.MaCuocTroChuyen, n.MaNguoiDung, N'Chào mừng các bạn đến với Cộng đồng người mua! Hãy chia sẻ trải nghiệm mua sắm của bạn tại đây nhé.'
FROM CuocTroChuyen c
CROSS JOIN NguoiDung n
WHERE c.TenCuocTroChuyen = N'Cộng đồng người mua'
  AND n.TenDangNhap = 'admin'
  AND NOT EXISTS (SELECT 1 FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen);

INSERT INTO TinNhan (CuocTroChuyenId, NguoiGuiId, NoiDung)
SELECT c.MaCuocTroChuyen, n.MaNguoiDung, N'Chào mừng các nhà bán hàng. Nhóm này là nơi để mọi người trao đổi kinh nghiệm kinh doanh trên sàn.'
FROM CuocTroChuyen c
CROSS JOIN NguoiDung n
WHERE c.TenCuocTroChuyen = N'Cộng đồng người bán'
  AND n.TenDangNhap = 'admin'
  AND NOT EXISTS (SELECT 1 FROM TinNhan t WHERE t.CuocTroChuyenId = c.MaCuocTroChuyen);
GO

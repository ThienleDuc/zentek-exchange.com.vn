-- D:\225TMDT\TMDT-Website\database\02-alter-tables.sql
USE ZenTekExchange;
GO

-- NguoiDung
ALTER TABLE NguoiDung ADD CONSTRAINT FK_NguoiDung_VaiTro FOREIGN KEY (VaiTroId) REFERENCES VaiTro(MaVaiTro);

-- CuaHang
ALTER TABLE CuaHang ADD CONSTRAINT FK_CuaHang_NguoiDung FOREIGN KEY (NguoiBanId) REFERENCES NguoiDung(MaNguoiDung);
ALTER TABLE CuaHang ADD CONSTRAINT CK_CuaHang_LoaiHinh CHECK (LoaiHinhCuaHang IN (1, 2, 3)); -- 1: Cá nhân 2: Hộ kinh doanh 3: Doanh nghiệp nhỏ
-- DanhMuc
ALTER TABLE DanhMuc ADD CONSTRAINT FK_DanhMuc_DanhMucCha FOREIGN KEY (DanhMucChaId) REFERENCES DanhMuc(MaDanhMuc);

-- SanPham
ALTER TABLE SanPham ADD CONSTRAINT FK_SanPham_CuaHang FOREIGN KEY (CuaHangId) REFERENCES CuaHang(MaCuaHang);
ALTER TABLE SanPham ADD CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (DanhMucId) REFERENCES DanhMuc(MaDanhMuc);
ALTER TABLE SanPham ADD CONSTRAINT FK_SanPham_NguoiDung_Duyet FOREIGN KEY (NguoiDuyetId) REFERENCES NguoiDung(MaNguoiDung);
ALTER TABLE SanPham ADD CONSTRAINT CK_SanPham_TinhTrang CHECK (TinhTrang IN (N'Mới', N'Cũ'));
ALTER TABLE SanPham ADD CONSTRAINT CK_SanPham_TrangThaiDuyet CHECK (TrangThaiDuyet IN (N'Chờ phê duyệt', N'Đã duyệt', N'Đã từ chối', N'Đã gỡ'));

-- AnhSanPham
ALTER TABLE AnhSanPham ADD CONSTRAINT FK_AnhSanPham_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(MaSanPham);

-- PhanLoai
ALTER TABLE PhanLoai ADD CONSTRAINT FK_PhanLoai_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(MaSanPham);
ALTER TABLE PhanLoai ADD CONSTRAINT FK_PhanLoai_AnhSanPham FOREIGN KEY (HinhAnhId) REFERENCES AnhSanPham(MaHinhAnh);

-- GioHang
ALTER TABLE GioHang ADD CONSTRAINT FK_GioHang_NguoiDung FOREIGN KEY (NguoiMuaId) REFERENCES NguoiDung(MaNguoiDung);

-- ChiTietGioHang
ALTER TABLE ChiTietGioHang ADD CONSTRAINT FK_ChiTietGioHang_GioHang FOREIGN KEY (GioHangId) REFERENCES GioHang(MaGioHang);
ALTER TABLE ChiTietGioHang ADD CONSTRAINT FK_ChiTietGioHang_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(MaSanPham);
ALTER TABLE ChiTietGioHang ADD CONSTRAINT FK_ChiTietGioHang_PhanLoai FOREIGN KEY (PhanLoaiId) REFERENCES PhanLoai(MaPhanLoai);

-- DonHang
ALTER TABLE DonHang ADD CONSTRAINT FK_DonHang_NguoiDung FOREIGN KEY (NguoiMuaId) REFERENCES NguoiDung(MaNguoiDung);
ALTER TABLE DonHang ADD CONSTRAINT CK_DonHang_TrangThaiDon CHECK (TrangThaiDon IN (N'Chờ xử lý', N'Đã hủy', N'Đang giao', N'Đã nhận'));

-- ChiTietDonHang
ALTER TABLE ChiTietDonHang ADD CONSTRAINT FK_ChiTietDonHang_DonHang FOREIGN KEY (DonHangId) REFERENCES DonHang(MaDonHang);
ALTER TABLE ChiTietDonHang ADD CONSTRAINT FK_ChiTietDonHang_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(MaSanPham);
ALTER TABLE ChiTietDonHang ADD CONSTRAINT FK_ChiTietDonHang_PhanLoai FOREIGN KEY (PhanLoaiId) REFERENCES PhanLoai(MaPhanLoai);

-- DanhGiaSanPham
ALTER TABLE DanhGiaSanPham ADD CONSTRAINT FK_DanhGiaSanPham_SanPham FOREIGN KEY (SanPhamId) REFERENCES SanPham(MaSanPham);
ALTER TABLE DanhGiaSanPham ADD CONSTRAINT FK_DanhGiaSanPham_NguoiDung FOREIGN KEY (NguoiMuaId) REFERENCES NguoiDung(MaNguoiDung);
ALTER TABLE DanhGiaSanPham ADD CONSTRAINT FK_DanhGiaSanPham_DonHang FOREIGN KEY (DonHangId) REFERENCES DonHang(MaDonHang);
ALTER TABLE DanhGiaSanPham ADD CONSTRAINT CK_DanhGiaSanPham_SoSao CHECK (SoSao BETWEEN 1 AND 5);

-- PhanHoiMedia
ALTER TABLE PhanHoiMedia ADD CONSTRAINT FK_PhanHoiMedia_DanhGia FOREIGN KEY (DanhGiaId) REFERENCES DanhGiaSanPham(MaDanhGia);
ALTER TABLE PhanHoiMedia ADD CONSTRAINT FK_PhanHoiMedia_TinNhan FOREIGN KEY (TinNhanId) REFERENCES TinNhan(MaTinNhan);
ALTER TABLE PhanHoiMedia ADD CONSTRAINT CK_PhanHoiMedia_LoaiPhanHoi CHECK (LoaiPhanHoi IN ('danh_gia', 'tin_nhan'));
ALTER TABLE PhanHoiMedia ADD CONSTRAINT CK_PhanHoiMedia_LoaiMedia CHECK (LoaiMedia IN ('anh', 'video'));

-- CuocTroChuyen
ALTER TABLE CuocTroChuyen ADD CONSTRAINT FK_CuocTroChuyen_TinNhanCuoi FOREIGN KEY (TinNhanCuoiId) REFERENCES TinNhan(MaTinNhan);
ALTER TABLE CuocTroChuyen ADD CONSTRAINT CK_CuocTroChuyen_Loai CHECK (Loai IN ('ca_nhan', 'nhom'));

-- ThanhVienCuocTroChuyen
ALTER TABLE ThanhVienCuocTroChuyen ADD CONSTRAINT FK_ThanhVienCuocTroChuyen_CuocTroChuyen FOREIGN KEY (CuocTroChuyenId) REFERENCES CuocTroChuyen(MaCuocTroChuyen);
ALTER TABLE ThanhVienCuocTroChuyen ADD CONSTRAINT FK_ThanhVienCuocTroChuyen_NguoiDung FOREIGN KEY (NguoiDungId) REFERENCES NguoiDung(MaNguoiDung);
ALTER TABLE ThanhVienCuocTroChuyen ADD CONSTRAINT CK_ThanhVienCuocTroChuyen_VaiTro CHECK (VaiTro IN ('chu_nhom', 'thanh_vien'));

-- TinNhan
ALTER TABLE TinNhan ADD CONSTRAINT FK_TinNhan_CuocTroChuyen FOREIGN KEY (CuocTroChuyenId) REFERENCES CuocTroChuyen(MaCuocTroChuyen);
ALTER TABLE TinNhan ADD CONSTRAINT FK_TinNhan_NguoiDung FOREIGN KEY (NguoiGuiId) REFERENCES NguoiDung(MaNguoiDung);

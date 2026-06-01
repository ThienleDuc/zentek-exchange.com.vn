import React, { useState, useEffect } from 'react';

// ==================== MOCK DATA & API GIẢ LẬP ====================
// Dữ liệu mặc định
const defaultUser = {
  maNguoiDung: 'seller-001',
  tenDangNhap: 'shopmaster',
  hoTen: 'Nguyễn Văn A',
  email: 'shop@example.com',
  soDienThoai: '0912345678',
  anhDaiDien: '/avatars/default.jpg',
  ngayTao: '2024-01-15T00:00:00Z',
};

const defaultShop = {
  maCuaHang: 'shop-001',
  tenCuaHang: 'Cửa hàng thời trang ABC',
  moTa: 'Chuyên cung cấp quần áo thời trang cao cấp.',
  logo: '/logos/shop-logo.jpg',
  diaChi: '123 Đường Láng',        // địa chỉ chi tiết (số nhà, đường)
  phuongXa: 'Láng Thượng',         // sẽ dùng dropdown
  quanHuyen: 'Đống Đa',            // dropdown
  tinhThanh: 'Hà Nội',             // dropdown
  soDienThoai: '0241234567',
  loaiHinhCuaHang: 2,
  maSoThue: '0123456789',
  pdfGiayPhep: '/licenses/shop-license.pdf',
  daXacThucPhapLy: true,
  ngayTao: '2024-02-01T00:00:00Z',
};

// Mock danh sách tỉnh/thành
const mockTinhThanh = [
  { code: 'HN', name: 'Hà Nội' },
  { code: 'HCM', name: 'Hồ Chí Minh' },
  { code: 'DN', name: 'Đà Nẵng' },
];

// Mock quận/huyện theo tỉnh
const mockQuanHuyen: Record<string, { code: string; name: string }[]> = {
  HN: [
    { code: 'DD', name: 'Đống Đa' },
    { code: 'CG', name: 'Cầu Giấy' },
    { code: 'HB', name: 'Hai Bà Trưng' },
  ],
  HCM: [
    { code: 'Q1', name: 'Quận 1' },
    { code: 'Q3', name: 'Quận 3' },
    { code: 'TB', name: 'Tân Bình' },
  ],
  DN: [
    { code: 'HC', name: 'Hải Châu' },
    { code: 'TN', name: 'Thanh Khê' },
  ],
};

// Mock phường/xã theo quận/huyện
const mockPhuongXa: Record<string, { code: string; name: string }[]> = {
  DD: [
    { code: 'LT', name: 'Láng Thượng' },
    { code: 'QTG', name: 'Quang Trung' },
  ],
  CG: [{ code: 'DQ', name: 'Dịch Vọng' }],
  Q1: [{ code: 'BT', name: 'Bến Thành' }],
  // ... thêm nếu cần
};

const fetchProfile = (): Promise<{ user: any; shop: any }> => {
  console.log('[Mock API] GET /api/seller/profile');
  return new Promise((resolve) => {
    setTimeout(() => resolve({ user: { ...defaultUser }, shop: { ...defaultShop } }), 500);
  });
};

const mockUploadImage = (file: File, type: 'avatar' | 'logo'): Promise<string> => {
  console.log(`[Mock API] Upload ${type}:`, file.name);
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      resolve(fakeUrl);
    }, 500);
  });
};

const updateProfile = (userData: any, shopData: any): Promise<{ user: any; shop: any }> => {
  console.log('[Mock API] PUT /api/seller/profile', { userData, shopData });
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.assign(defaultUser, userData);
      Object.assign(defaultShop, shopData);
      resolve({ user: { ...defaultUser }, shop: { ...defaultShop } });
    }, 800);
  });
};

// Hàm gửi mã OTP (mock)
const sendOtp = (phone: string): Promise<{ success: boolean; message: string }> => {
  console.log(`[Mock API] Gửi mã OTP tới số ${phone}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Mã OTP đã được gửi đến số điện thoại' });
    }, 1000);
  });
};

// ==================== COMPONENT CHÍNH ====================
const SellerProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');

  // State cho dropdown địa chỉ
  const [listTinh, setListTinh] = useState(mockTinhThanh);
  const [listQuan, setListQuan] = useState<{ code: string; name: string }[]>([]);
  const [listPhuong, setListPhuong] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    fetchProfile().then(({ user, shop }) => {
      setUser(user);
      setShop(shop);
      setAvatarPreview(user.anhDaiDien);
      setLogoPreview(shop.logo);
      // Cập nhật danh sách quận/huyện, phường/xã theo dữ liệu có sẵn
      const tinhCode = Object.keys(mockQuanHuyen).find(
        (code) => mockQuanHuyen[code].some((q) => q.name === shop.quanHuyen)
      );
      if (tinhCode) {
        setListQuan(mockQuanHuyen[tinhCode] || []);
        const quanCode = mockQuanHuyen[tinhCode]?.find((q) => q.name === shop.quanHuyen)?.code;
        if (quanCode && mockPhuongXa[quanCode]) {
          setListPhuong(mockPhuongXa[quanCode]);
        }
      }
      setLoading(false);
    });
  }, []);

  // Xử lý đổi avatar/logo
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUserChange = (field: string, value: any) => {
    setUser({ ...user, [field]: value });
  };

  const handleShopChange = (field: string, value: any) => {
    setShop({ ...shop, [field]: value });
  };

  // Khi thay đổi tỉnh/thành
  const handleTinhChange = (tinhName: string) => {
    const tinhCode = listTinh.find((t) => t.name === tinhName)?.code;
    if (tinhCode) {
      const quanList = mockQuanHuyen[tinhCode] || [];
      setListQuan(quanList);
      setListPhuong([]);
      handleShopChange('tinhThanh', tinhName);
      handleShopChange('quanHuyen', '');
      handleShopChange('phuongXa', '');
    } else {
      handleShopChange('tinhThanh', tinhName);
    }
  };

  // Khi thay đổi quận/huyện
  const handleQuanChange = (quanName: string) => {
    let quanCode = '';
    for (const q of listQuan) {
      if (q.name === quanName) {
        quanCode = q.code;
        break;
      }
    }
    const phuongList = mockPhuongXa[quanCode] || [];
    setListPhuong(phuongList);
    handleShopChange('quanHuyen', quanName);
    handleShopChange('phuongXa', '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let newAvatarUrl = user.anhDaiDien;
      let newLogoUrl = shop.logo;
      if (avatarFile) newAvatarUrl = await mockUploadImage(avatarFile, 'avatar');
      if (logoFile) newLogoUrl = await mockUploadImage(logoFile, 'logo');
      const updatedUser = { ...user, anhDaiDien: newAvatarUrl };
      const updatedShop = { ...shop, logo: newLogoUrl };
      await updateProfile(updatedUser, updatedShop);
      setUser(updatedUser);
      setShop(updatedShop);
      setAvatarFile(null);
      setLogoFile(null);
      alert('Cập nhật thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    if (!user?.soDienThoai) {
      alert('Vui lòng nhập số điện thoại trước khi gửi mã OTP');
      return;
    }
    const result = await sendOtp(user.soDienThoai);
    if (result.success) {
      setOtpSent(true);
      alert(result.message);
    } else {
      alert('Gửi mã thất bại, vui lòng thử lại');
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');
  const getLoaiHinhText = (type: number) => {
    switch (type) {
      case 1: return 'Cá nhân';
      case 2: return 'Hộ kinh doanh';
      case 3: return 'Doanh nghiệp nhỏ';
      default: return 'Không xác định';
    }
  };

  if (loading) return <div className="seller-profile-page loading">Đang tải...</div>;
  if (!user || !shop) return <div className="seller-profile-page error">Không có dữ liệu</div>;

  return (
    <div className="seller-profile-page">
      <div className="profile-header">
        <div className="title-with-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" fill="currentColor"/>
          </svg>
          <h1>Hồ sơ cửa hàng</h1>
        </div>
      </div>

      <div className="profile-single-block">
        {/* Ảnh đại diện và logo */}
        <div className="image-row">
          <div className="image-upload">
            <label>Ảnh đại diện</label>
            <div className="image-preview">
              <img src={avatarPreview || '/default-avatar.png'} alt="Avatar" />
            </div>
            <div className="upload-button-wrapper">
              <label className="btn-upload">
                Đổi ảnh
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>
            </div>
            <span className="file-note">Hỗ trợ JPG, PNG</span>
          </div>
          <div className="image-upload">
            <label>Logo cửa hàng</label>
            <div className="image-preview">
              <img src={logoPreview || '/default-shop.png'} alt="Logo" />
            </div>
            <div className="upload-button-wrapper">
              <label className="btn-upload">
                Đổi ảnh
                <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
              </label>
            </div>
            <span className="file-note">Logo vuông đẹp nhất</span>
          </div>
        </div>

        {/* Thông tin tài khoản */}
        <div className="info-section">
          <h3>Thông tin tài khoản</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" value={user.hoTen} onChange={(e) => handleUserChange('hoTen', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input type="text" value={user.tenDangNhap} disabled />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user.email} onChange={(e) => handleUserChange('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="text" value={user.soDienThoai} onChange={(e) => handleUserChange('soDienThoai', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày tham gia</label>
              <input type="text" value={formatDate(user.ngayTao)} disabled />
            </div>
          </div>
        </div>

        {/* Thông tin cửa hàng */}
        <div className="info-section">
          <h3>Thông tin cửa hàng</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Tên cửa hàng</label>
              <input type="text" value={shop.tenCuaHang} onChange={(e) => handleShopChange('tenCuaHang', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Số điện thoại cửa hàng</label>
              <input type="text" value={shop.soDienThoai} onChange={(e) => handleShopChange('soDienThoai', e.target.value)} />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Mô tả cửa hàng</label>
            <textarea value={shop.moTa || ''} onChange={(e) => handleShopChange('moTa', e.target.value)} rows={3} />
          </div>

          {/* Địa chỉ: dropdown và địa chỉ chi tiết */}
          <div className="form-group full-width">
            <label>Địa chỉ</label>
            <div className="address-group">
              <select value={shop.tinhThanh} onChange={(e) => handleTinhChange(e.target.value)}>
                <option value="">Chọn tỉnh/thành</option>
                {listTinh.map((t) => (
                  <option key={t.code} value={t.name}>{t.name}</option>
                ))}
              </select>
              <select value={shop.quanHuyen} onChange={(e) => handleQuanChange(e.target.value)} disabled={!listQuan.length}>
                <option value="">Chọn quận/huyện</option>
                {listQuan.map((q) => (
                  <option key={q.code} value={q.name}>{q.name}</option>
                ))}
              </select>
              <select value={shop.phuongXa} onChange={(e) => handleShopChange('phuongXa', e.target.value)} disabled={!listPhuong.length}>
                <option value="">Chọn phường/xã</option>
                {listPhuong.map((p) => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Số nhà, đường"
                value={shop.diaChi}
                onChange={(e) => handleShopChange('diaChi', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Loại hình cửa hàng</label>
              <select value={shop.loaiHinhCuaHang} onChange={(e) => handleShopChange('loaiHinhCuaHang', parseInt(e.target.value))}>
                <option value={1}>Cá nhân</option>
                <option value={2}>Hộ kinh doanh</option>
                <option value={3}>Doanh nghiệp nhỏ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Mã số thuế</label>
              <input type="text" value={shop.maSoThue} onChange={(e) => handleShopChange('maSoThue', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Trạng thái xác thực</label>
              <input type="text" value={shop.daXacThucPhapLy ? 'Đã xác thực' : 'Chưa xác thực'} disabled />
            </div>
            <div className="form-group">
              <label>Ngày tạo cửa hàng</label>
              <input type="text" value={formatDate(shop.ngayTao)} disabled />
            </div>
          </div>
        </div>

        {/* Hàng OTP và nút lưu */}
        <div className="action-row">
          <div className="otp-group">
            <input
              type="text"
              maxLength={6}
              placeholder="Nhập mã OTP 6 số"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button className="btn-send-otp" onClick={handleSendOtp} disabled={!user?.soDienThoai}>
              Gửi mã
            </button>
          </div>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <div className="dev-note">[Mock API] Dữ liệu giả lập, kiểm tra console log.</div>
    </div>
  );
};

export default SellerProfile;
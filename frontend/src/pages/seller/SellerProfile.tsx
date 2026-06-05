import React, { useState, useEffect } from 'react';
import { getProvinces, getProvinceTree } from '../../services/location.service';
import SearchableDropdown from '../../components/SearchableDropdown';
import { getStoreLogoUrl } from '../../utils/image.utils';
import { getSellerProfile, updateSellerProfile, sendOtp as sendOtpApi } from '../../services/profile.service';
import { uploadImage } from '../../services/upload.service';
import { storage } from '../../utils/storage.utils';

// ==================== MOCK DATA & API GIẢ LẬP ====================




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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // State cho dropdown địa chỉ
  const [listTinh, setListTinh] = useState<any[]>([]);
  const [listQuan, setListQuan] = useState<any[]>([]);
  const [listPhuong, setListPhuong] = useState<any[]>([]);
  const [allDistrictsOfProvince, setAllDistrictsOfProvince] = useState<any[]>([]);

  useEffect(() => {
    getSellerProfile().then(async (response) => {
      if (response.success && response.data) {
        const { user, shop } = response.data;
        setUser(user);
        setShop(shop);
        setAvatarPreview(user.anhDaiDien ? getStoreLogoUrl(user.anhDaiDien) : '/default-avatar.svg');
        setLogoPreview(shop?.logo ? getStoreLogoUrl(shop.logo) : '/default-shop.svg');
        
        const provs = await getProvinces();
        setListTinh(provs);
        
        if (shop && shop.tinhThanh) {
          const selectedProv = provs.find(p => p.name === shop.tinhThanh);
          if (selectedProv) {
            const tree = await getProvinceTree(selectedProv.code);
            if (tree) {
              setAllDistrictsOfProvince(tree.districts || []);
              setListQuan(tree.districts || []);
              
              if (shop.quanHuyen) {
                const matchingDist = (tree.districts || []).find(d => d.name === shop.quanHuyen);
                if (matchingDist) {
                  setListPhuong(matchingDist.wards || []);
                }
              }
            }
          }
        }
      }
      setLoading(false);
    }).catch(() => {
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

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const res = await uploadImage(avatarFile);
      if (res.success && res.url) {
        const updatedUser = { ...user, anhDaiDien: res.url };
        const response = await updateSellerProfile({
          user: updatedUser,
          shop: shop
        });
        if (response.success) {
          setUser(updatedUser);
          setAvatarFile(null);
          const currentUser = storage.getUser();
          if (currentUser) {
            storage.setUser({
              ...currentUser,
              avatar: res.url || undefined
            });
            window.dispatchEvent(new CustomEvent('user-updated'));
          }
          if (response.data?.shop) {
            setShop(response.data.shop);
          }
          alert('Cập nhật ảnh đại diện thành công!');
        } else {
          alert(response.message || 'Cập nhật ảnh đại diện thất bại.');
        }
      } else {
        alert(res.message || 'Tải ảnh đại diện lên thất bại.');
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.anhDaiDien ? getStoreLogoUrl(user.anhDaiDien) : '/default-avatar.svg');
  };

  const handleSaveLogo = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    try {
      const res = await uploadImage(logoFile);
      if (res.success && res.url) {
        const updatedShop = { ...shop, logo: res.url };
        const response = await updateSellerProfile({
          user: user,
          shop: updatedShop
        });
        if (response.success) {
          if (response.data?.shop) {
            setShop(response.data.shop);
          } else {
            setShop(updatedShop);
          }
          setLogoFile(null);
          alert('Cập nhật logo cửa hàng thành công!');
        } else {
          alert(response.message || 'Cập nhật logo cửa hàng thất bại.');
        }
      } else {
        alert(res.message || 'Tải logo cửa hàng lên thất bại.');
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCancelLogo = () => {
    setLogoFile(null);
    setLogoPreview(shop?.logo ? getStoreLogoUrl(shop.logo) : '/default-shop.svg');
  };

  const handleUserChange = (field: string, value: any) => {
    setUser({ ...user, [field]: value });
  };

  const handleShopChange = (field: string, value: any) => {
    setShop({ ...shop, [field]: value });
  };

  // Khi thay đổi tỉnh/thành
  const handleTinhChange = async (tinhName: string) => {
    handleShopChange('tinhThanh', tinhName);
    handleShopChange('quanHuyen', '');
    handleShopChange('phuongXa', '');
    setListQuan([]);
    setListPhuong([]);
    setAllDistrictsOfProvince([]);
    const selectedProv = listTinh.find(p => p.name === tinhName);
    if (selectedProv) {
      const tree = await getProvinceTree(selectedProv.code);
      if (tree) {
        setAllDistrictsOfProvince(tree.districts || []);
        setListQuan(tree.districts || []);
      }
    }
  };

  // Khi thay đổi quận/huyện
  const handleQuanChange = (quanName: string) => {
    handleShopChange('quanHuyen', quanName);
    handleShopChange('phuongXa', '');
    setListPhuong([]);
    
    const matchingDist = allDistrictsOfProvince.find(d => d.name === quanName);
    if (matchingDist) {
      setListPhuong(matchingDist.wards || []);
    }
  };

  // Khi thay đổi phường/xã
  const handlePhuongChange = (phuongName: string) => {
    handleShopChange('phuongXa', phuongName);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateSellerProfile({
        user: user,
        shop: shop,
        otp: otp || undefined
      });

      if (response.success) {
        setOtp('');
        // Cập nhật storage để hiển thị tên và avatar mới ngay trên thanh điều hướng
        const currentUser = storage.getUser();
        if (currentUser) {
          storage.setUser({
            ...currentUser,
            fullName: user.hoTen,
            email: user.email,
            avatar: user.anhDaiDien || undefined
          });
          window.dispatchEvent(new CustomEvent('user-updated'));
        }
        if (response.data?.shop) {
          setShop(response.data.shop);
        }
        alert('Cập nhật thành công!');
      } else {
        alert(response.message || 'Cập nhật thất bại. Vui lòng thử lại.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    if (!user?.soDienThoai) {
      alert('Vui lòng nhập số điện thoại trước khi gửi mã OTP');
      return;
    }
    try {
      const result = await sendOtpApi({ phone: user.soDienThoai });
      if (result.success) {
        setOtpSent(true);
        alert(result.message || 'Mã OTP đã được gửi đến số điện thoại');
      } else {
        alert(result.message || 'Gửi mã thất bại, vui lòng thử lại');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Gửi mã thất bại, vui lòng thử lại');
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN');

  if (loading) return <div className="seller-profile-page loading">Đang tải...</div>;
  if (!user || !shop) return <div className="seller-profile-page error">Không có dữ liệu</div>;

  return (
    <div className="seller-profile-page">
      {/* Banner hồ sơ */}
      <div className="seller-profile-banner">
        <div className="seller-profile-banner-overlay"></div>
        <div className="seller-profile-banner-content">
          <h2>Hồ sơ cửa hàng: {shop.tenCuaHang}</h2>
          <p>Quản lý thông tin tài khoản người bán, cấu hình địa chỉ lấy hàng và loại hình pháp lý kinh doanh của bạn.</p>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Cột trái: Avatar & Logo, Trạng thái pháp lý */}
        <div className="profile-sidebar-column">
          {/* Card upload hình ảnh */}
          <div className="profile-card profile-card--images">
            <h3>Hình ảnh thương hiệu</h3>
            
            <div className="image-upload-wrapper">
              <div className="image-upload-item">
                <label>Ảnh đại diện người bán</label>
                <div className="image-preview-circle">
                  <img src={avatarPreview || '/default-avatar.svg'} alt="Avatar" />
                </div>
                {!avatarFile ? (
                  <label className="btn-upload">
                    Đổi ảnh
                    <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                  </label>
                ) : (
                  <div className="btn-group-mini">
                    <button type="button" className="btn-save-image" onClick={handleSaveAvatar} disabled={uploadingAvatar}>
                      {uploadingAvatar ? '...' : 'Lưu'}
                    </button>
                    <button type="button" className="btn-cancel-image" onClick={handleCancelAvatar} disabled={uploadingAvatar}>
                      Hủy
                    </button>
                  </div>
                )}
                <span className="file-note">JPG, PNG</span>
              </div>

              <div className="image-upload-item">
                <label>Logo cửa hàng</label>
                <div className="image-preview-circle">
                  <img src={logoPreview || '/default-shop.svg'} alt="Logo" />
                </div>
                {!logoFile ? (
                  <label className="btn-upload">
                    Đổi ảnh
                    <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                  </label>
                ) : (
                  <div className="btn-group-mini">
                    <button type="button" className="btn-save-image" onClick={handleSaveLogo} disabled={uploadingLogo}>
                      {uploadingLogo ? '...' : 'Lưu'}
                    </button>
                    <button type="button" className="btn-cancel-image" onClick={handleCancelLogo} disabled={uploadingLogo}>
                      Hủy
                    </button>
                  </div>
                )}
                <span className="file-note">Tỉ lệ 1:1</span>
              </div>
            </div>
          </div>

          {/* Card trạng thái xác thực */}
          <div className="profile-card profile-card--status">
            <h3>Xác thực pháp lý</h3>
            <div className={`status-badge-large ${shop.daXacThucPhapLy ? 'verified' : 'unverified'}`}>
              <div className="status-dot"></div>
              <span>{shop.daXacThucPhapLy ? 'Đã xác thực pháp lý' : 'Chưa xác thực pháp lý'}</span>
            </div>
            <p className="status-desc">
              {shop.daXacThucPhapLy 
                ? 'Cửa hàng của bạn đã hoàn tất xác thực thông tin pháp lý và có thể tham gia đầy đủ các tính năng kinh doanh trên hệ thống.'
                : 'Vui lòng liên hệ quản trị viên và cung cấp giấy phép kinh doanh / MST để hoàn tất quy trình xác thực.'}
            </p>
          </div>
        </div>

        {/* Cột phải: Form thông tin chi tiết */}
        <div className="profile-main-column">
          {/* Card thông tin tài khoản */}
          <div className="profile-card">
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
                <label>Ngày tham gia hệ thống</label>
                <input type="text" value={formatDate(user.ngayTao)} disabled />
              </div>
            </div>
          </div>

          {/* Card thông tin cửa hàng */}
          <div className="profile-card">
            <h3>Thông tin kinh doanh</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Tên cửa hàng <span className="required-star">*</span></label>
                <input type="text" value={shop.tenCuaHang} onChange={(e) => handleShopChange('tenCuaHang', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Số điện thoại cửa hàng <span className="required-star">*</span></label>
                <input type="text" value={shop.soDienThoai} onChange={(e) => handleShopChange('soDienThoai', e.target.value)} />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Mô tả cửa hàng</label>
              <textarea value={shop.moTa || ''} onChange={(e) => handleShopChange('moTa', e.target.value)} rows={3} placeholder="Giới thiệu ngắn gọn về cửa hàng của bạn..." />
            </div>

            <div className="form-group full-width AddressSection">
              <label>Địa chỉ lấy hàng</label>
              <div className="address-dropdown-grid">
                <SearchableDropdown
                  theme="admin"
                  options={listTinh.map((t) => ({ value: t.name, label: t.name }))}
                  value={shop.tinhThanh}
                  onChange={(val) => handleTinhChange(val as string)}
                  placeholder="Chọn Tỉnh/Thành"
                />
                <SearchableDropdown
                  theme="admin"
                  options={listQuan.map((q) => ({ value: q.name, label: q.name }))}
                  value={shop.quanHuyen}
                  onChange={(val) => handleQuanChange(val as string)}
                  placeholder="Chọn Quận/Huyện"
                  disabled={!shop.tinhThanh}
                />
                <SearchableDropdown
                  theme="admin"
                  options={listPhuong.map((p) => ({ value: p.name, label: p.name }))}
                  value={shop.phuongXa}
                  onChange={(val) => handlePhuongChange(val as string)}
                  placeholder="Chọn Phường/Xã"
                  disabled={!shop.quanHuyen}
                />
              </div>
              <input
                type="text"
                placeholder="Địa chỉ cụ thể (Số nhà, ngõ, đường...)"
                value={shop.diaChi}
                className="address-detail-input"
                onChange={(e) => handleShopChange('diaChi', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loại hình kinh doanh</label>
                <select value={shop.loaiHinhCuaHang} onChange={(e) => handleShopChange('loaiHinhCuaHang', parseInt(e.target.value))}>
                  <option value={1}>Cá nhân tự do</option>
                  <option value={2}>Hộ kinh doanh gia đình</option>
                  <option value={3}>Doanh nghiệp / Công ty</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mã số thuế</label>
                <input type="text" value={shop.maSoThue} placeholder="MST đăng ký kinh doanh" onChange={(e) => handleShopChange('maSoThue', e.target.value)} />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Ngày thành lập cửa hàng</label>
                <input type="text" value={formatDate(shop.ngayTao)} disabled />
              </div>
            </div>
          </div>

          {/* Card OTP & Save */}
          <div className="profile-card profile-card--actions">
            <div className="action-flex-wrapper">
              <div className="otp-verification-box">
                <label>Xác thực số điện thoại</label>
                <div className="otp-input-row">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Mã OTP 6 số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <button className="btn-send-otp" onClick={handleSendOtp} disabled={!user?.soDienThoai}>
                    {otpSent ? 'Gửi lại OTP' : 'Nhận OTP'}
                  </button>
                </div>
                <span className="otp-hint">OTP được gửi đến số điện thoại tài khoản của người bán</span>
              </div>
              <button className="btn-save-profile" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ cửa hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="dev-note">[API Hệ thống] Dữ liệu thực tế được đồng bộ hóa.</div>
    </div>
  );
};

export default SellerProfile;
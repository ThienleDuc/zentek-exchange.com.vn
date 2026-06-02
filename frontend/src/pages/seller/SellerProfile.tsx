import React, { useState, useEffect } from 'react';
import { getProvinces, getProvinceTree } from '../../services/location.service';
import SearchableDropdown from '../../components/SearchableDropdown';
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
        setAvatarPreview(user.anhDaiDien || '/default-avatar.png');
        setLogoPreview(shop?.logo || '/default-shop.png');
        
        const provs = await getProvinces();
        setListTinh(provs);
        
        if (shop && shop.tinhThanh) {
          const selectedProv = provs.find(p => p.name === shop.tinhThanh);
          if (selectedProv) {
            const tree = await getProvinceTree(selectedProv.code);
            if (tree) {
              setAllDistrictsOfProvince(tree.districts || []);
              const flatWards = (tree.districts || []).flatMap(d => (d.wards || []).map(w => ({
                ...w,
                district_code: d.code
              })));
              setListPhuong(flatWards);
              const matchingDist = (tree.districts || []).find(d => d.name === shop.quanHuyen);
              if (matchingDist) {
                setListQuan([matchingDist]);
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
    setAvatarPreview(user?.anhDaiDien || '/default-avatar.png');
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
          setShop(updatedShop);
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
    setLogoPreview(shop?.logo || '/default-shop.png');
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
        const flatWards = (tree.districts || []).flatMap(d => (d.wards || []).map(w => ({
          ...w,
          district_code: d.code
        })));
        setListPhuong(flatWards);
      }
    }
  };

  // Khi thay đổi phường/xã
  const handlePhuongChange = (phuongName: string) => {
    handleShopChange('phuongXa', phuongName);
    handleShopChange('quanHuyen', '');
    setListQuan([]);
    const ward = listPhuong.find(w => w.name === phuongName);
    if (ward) {
      const distCode = ward.district_code;
      const matchingDist = allDistrictsOfProvince.find(d => d.code === distCode);
      if (matchingDist) {
        setListQuan([matchingDist]);
        handleShopChange('quanHuyen', matchingDist.name);
      }
    }
  };

  // Khi thay đổi quận/huyện
  const handleQuanChange = (quanName: string) => {
    handleShopChange('quanHuyen', quanName);
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
              {!avatarFile ? (
                <label className="btn-upload">
                  Đổi ảnh
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                </label>
              ) : (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button type="button" className="btn-save-image" onClick={handleSaveAvatar} disabled={uploadingAvatar}>
                    {uploadingAvatar ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button type="button" className="btn-cancel-image" onClick={handleCancelAvatar} disabled={uploadingAvatar}>
                    Hủy
                  </button>
                </div>
              )}
            </div>
            <span className="file-note">Hỗ trợ JPG, PNG</span>
          </div>
          <div className="image-upload">
            <label>Logo cửa hàng</label>
            <div className="image-preview">
              <img src={logoPreview || '/default-shop.png'} alt="Logo" />
            </div>
            <div className="upload-button-wrapper">
              {!logoFile ? (
                <label className="btn-upload">
                  Đổi ảnh
                  <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                </label>
              ) : (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button type="button" className="btn-save-image" onClick={handleSaveLogo} disabled={uploadingLogo}>
                    {uploadingLogo ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button type="button" className="btn-cancel-image" onClick={handleCancelLogo} disabled={uploadingLogo}>
                    Hủy
                  </button>
                </div>
              )}
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
              <SearchableDropdown
                theme="admin"
                options={listTinh.map((t) => ({ value: t.name, label: t.name }))}
                value={shop.tinhThanh}
                onChange={(val) => handleTinhChange(val as string)}
                placeholder="Chọn Tỉnh/Thành"
              />
              <SearchableDropdown
                theme="admin"
                options={listPhuong.map((p) => ({ value: p.name, label: p.name }))}
                value={shop.phuongXa}
                onChange={(val) => handlePhuongChange(val as string)}
                placeholder="Chọn Phường/Xã"
                disabled={!shop.tinhThanh}
              />
              <SearchableDropdown
                theme="admin"
                options={listQuan.map((q) => ({ value: q.name, label: q.name }))}
                value={shop.quanHuyen}
                onChange={(val) => handleQuanChange(val as string)}
                placeholder="Chọn Quận/Huyện"
                disabled={!shop.phuongXa}
              />
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
              {otpSent ? 'Gửi lại mã' : 'Gửi mã'}
            </button>
          </div>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <div className="dev-note">[API Hệ thống] Dữ liệu thực tế được đồng bộ hóa.</div>
    </div>
  );
};

export default SellerProfile;
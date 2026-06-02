// frontend/src/pages/TaiKhoanCaNhan.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Trash2, ArrowLeft, Send } from 'lucide-react';
import { storage } from '../../utils/storage.utils';
import { PATHS } from '../../utils/path.utils';
import { getUserProfile, updateUserProfile, sendOtp, verifyOtp as verifyOtpApi } from '../../services/profile.service';
import { uploadImage } from '../../services/upload.service';

interface UserProfile {
  HoTen: string;
  TenDangNhap: string;
  Email: string;
  SoDienThoai: string | null;
  AnhDaiDien: string | null;
}

const TaiKhoanCaNhan: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserProfile>({
    HoTen: '',
    TenDangNhap: '',
    Email: '',
    SoDienThoai: '',
    AnhDaiDien: null,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP state – chỉ có ô nhập và nút gửi, không có nút xác nhận riêng
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  const userId = storage.getUser()?.MaNguoiDung || 'edit_demo_id';

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await getUserProfile();
        if (response.success && response.data) {
          const profileData: UserProfile = {
            HoTen: response.data.HoTen || '',
            TenDangNhap: response.data.TenDangNhap || '',
            Email: response.data.Email || '',
            SoDienThoai: response.data.SoDienThoai || '',
            AnhDaiDien: response.data.AnhDaiDien || null,
          };
          setFormData(profileData);
          setAvatarPreview(response.data.AnhDaiDien);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Không thể tải thông tin. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Ảnh không được vượt quá 2MB' }));
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, avatar: 'Chỉ chấp nhận file JPG, PNG, GIF' }));
      return;
    }
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setErrors(prev => ({ ...prev, avatar: '' }));
  };

  const handleRemoveAvatar = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        HoTen: formData.HoTen,
        Email: formData.Email,
        SoDienThoai: formData.SoDienThoai || null,
        AnhDaiDien: null,
      };
      const updateRes = await updateUserProfile(payload);
      if (updateRes.success) {
        setFormData(prev => ({ ...prev, AnhDaiDien: null }));
        setAvatarFile(null);
        setAvatarPreview(null);
        // Cập nhật local storage
        const currentUser = storage.getUser();
        if (currentUser) {
          storage.setUser({
            ...currentUser,
            avatar: undefined
          });
        }
        setSuccessMsg('Xóa ảnh đại diện thành công!');
      } else {
        setErrorMsg(updateRes.message || 'Lỗi cập nhật profile.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra.');
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const uploadRes = await uploadImage(avatarFile);
      if (uploadRes.success && uploadRes.url) {
        const newAvatarUrl = uploadRes.url;
        const payload = {
          HoTen: formData.HoTen,
          Email: formData.Email,
          SoDienThoai: formData.SoDienThoai || null,
          AnhDaiDien: newAvatarUrl,
        };
        const updateRes = await updateUserProfile(payload);
        if (updateRes.success) {
          setFormData(prev => ({ ...prev, AnhDaiDien: newAvatarUrl }));
          setAvatarFile(null);
          // Cập nhật local storage
          const currentUser = storage.getUser();
          if (currentUser) {
            storage.setUser({
              ...currentUser,
              avatar: newAvatarUrl
            });
          }
          setSuccessMsg('Lưu ảnh đại diện thành công!');
        } else {
          setErrorMsg(updateRes.message || 'Lỗi cập nhật profile.');
        }
      } else {
        setErrorMsg(uploadRes.message || 'Tải ảnh lên thất bại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(formData.AnhDaiDien);
  };

  // Gửi OTP
  const handleSendOtp = async () => {
    if (!formData.Email || !/\S+@\S+\.\S+/.test(formData.Email)) {
      setErrors(prev => ({ ...prev, otp: 'Email không hợp lệ, không thể gửi OTP' }));
      return;
    }
    setSendingOtp(true);
    setErrors(prev => ({ ...prev, otp: '' }));
    try {
      const response = await sendOtp({ email: formData.Email });
      if (response.success) {
        setSuccessMsg(response.message || 'Mã OTP đã được gửi đến email của bạn.');
      } else {
        setErrorMsg(response.message || 'Gửi OTP thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gửi OTP thất bại. Vui lòng thử lại.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Hàm xác thực OTP (được gọi khi lưu)
  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await verifyOtpApi({ email, otp });
      return response.success;
    } catch (err) {
      return false;
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.HoTen.trim()) newErrors.HoTen = 'Họ và tên không được để trống';
    if (!formData.Email.trim()) newErrors.Email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(formData.Email)) newErrors.Email = 'Email không hợp lệ';
    if (formData.SoDienThoai && !/^\d{10}$/.test(formData.SoDienThoai)) {
      newErrors.SoDienThoai = 'Số điện thoại phải gồm 10 chữ số';
    }
    if (!otpCode || otpCode.length !== 6) {
      newErrors.otp = 'Vui lòng nhập mã OTP 6 số';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // 1. Xác thực OTP với email hiện tại trong form
      const isOtpValid = await verifyOtp(formData.Email, otpCode);
      if (!isOtpValid) {
        setErrors(prev => ({ ...prev, otp: 'Mã OTP không chính xác hoặc hết hạn.' }));
        setSubmitting(false);
        return;
      }

      // 3. Cập nhật thông tin người dùng
      const payload = {
        HoTen: formData.HoTen,
        Email: formData.Email,
        SoDienThoai: formData.SoDienThoai || null,
        AnhDaiDien: formData.AnhDaiDien,
        otp: otpCode,
      };

      const updateRes = await updateUserProfile(payload);
      if (updateRes.success) {
        setSuccessMsg('Cập nhật thông tin thành công!');
        // Cập nhật storage để hiển thị tên và avatar mới ngay trên thanh điều hướng
        const currentUser = storage.getUser();
        if (currentUser) {
          storage.setUser({
            ...currentUser,
            fullName: formData.HoTen,
            email: formData.Email,
            avatar: formData.AnhDaiDien || undefined
          });
        }
        setTimeout(() => navigate(PATHS.Buyer.DASHBOARD), 2000);
      } else {
        setErrorMsg(updateRes.message || 'Cập nhật thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-edit-profile">
        <div className="edit-profile-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-content">
            <div className="skeleton-form"></div>
            <div className="skeleton-avatar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="page-edit-profile">
      <div className="edit-profile-container">
        <button className="back-btn" onClick={() => navigate(PATHS.Buyer.DASHBOARD)}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <h1 className="page-title">Thay đổi thông tin</h1>

        <div className="edit-profile-content">
          {/* Cột trái - Biểu mẫu */}
          <div className="edit-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Họ và tên <span className="required">*</span></label>
                <input
                  type="text"
                  name="HoTen"
                  value={formData.HoTen}
                  onChange={handleChange}
                  className={`form-input ${errors.HoTen ? 'error' : ''}`}
                  disabled={submitting}
                />
                {errors.HoTen && <div className="field-error">{errors.HoTen}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Tên đăng nhập</label>
                <input
                  type="text"
                  name="TenDangNhap"
                  value={formData.TenDangNhap}
                  disabled
                  className="form-input disabled"
                />
                <div className="field-note">Tên đăng nhập không thể thay đổi</div>
              </div>

              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  className={`form-input ${errors.Email ? 'error' : ''}`}
                  disabled={submitting}
                />
                {errors.Email && <div className="field-error">{errors.Email}</div>}
              </div>

              {/* OTP – không có nút xác nhận riêng */}
              <div className="form-group otp-group">
                <label className="form-label">Mã OTP (xác thực email)</label>
                <div className="otp-input-wrapper">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Nhập mã 6 số"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className={`form-input ${errors.otp ? 'error' : ''}`}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="send-otp-btn"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !formData.Email}
                  >
                    {sendingOtp ? 'Đang gửi...' : <Send size={16} />} Gửi mã
                  </button>
                </div>
                {errors.otp && <div className="field-error">{errors.otp}</div>}
                <div className="otp-note">Nhập mã OTP đã nhận được, sau đó nhấn "Lưu thay đổi".</div>
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  name="SoDienThoai"
                  value={formData.SoDienThoai || ''}
                  onChange={handleChange}
                  className={`form-input ${errors.SoDienThoai ? 'error' : ''}`}
                  placeholder="10 chữ số"
                  disabled={submitting}
                />
                {errors.SoDienThoai && <div className="field-error">{errors.SoDienThoai}</div>}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => navigate(PATHS.Buyer.DASHBOARD)} disabled={submitting}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>

          {/* Cột phải - Ảnh đại diện */}
          <div className="edit-avatar">
            <div className="avatar-section">
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="avatar-actions">
                {!avatarFile ? (
                  <>
                    <label className="avatar-btn upload">
                      <Camera size={16} /> Chọn ảnh
                      <input type="file" accept="image/jpeg,image/png,image/gif" onChange={handleAvatarChange} hidden />
                    </label>
                    {avatarPreview && (
                      <button type="button" className="avatar-btn remove" onClick={handleRemoveAvatar}>
                        <Trash2 size={16} /> Xóa ảnh
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button type="button" className="avatar-btn save" onClick={handleSaveAvatar} disabled={uploadingAvatar}>
                      {uploadingAvatar ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button type="button" className="avatar-btn cancel" onClick={handleCancelAvatar} disabled={uploadingAvatar}>
                      Hủy
                    </button>
                  </>
                )}
              </div>
              {errors.avatar && <div className="field-error center">{errors.avatar}</div>}
              <p className="avatar-note">Chấp nhận JPG, PNG, GIF. Tối đa 2MB.</p>
            </div>
          </div>
        </div>

        {successMsg && <div className="toast-success">{successMsg}</div>}
        {errorMsg && <div className="toast-error">{errorMsg}</div>}
      </div>
    </main>
  );
};

export default TaiKhoanCaNhan;
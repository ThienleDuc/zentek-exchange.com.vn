import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Edit, Key, Camera } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';
import { getUserProfile } from '../../services/profile.service';
import { getUserAvatarUrl } from '../../utils/image.utils';

interface UserProfile {
  HoTen: string;
  TenDangNhap: string;
  Email: string;
  SoDienThoai: string | null;
  AnhDaiDien: string | null;
  NgayTao: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

// Skeleton loading components
const AvatarSkeleton: React.FC = () => (
  <div className="buyer-dashboard__avatar-skeleton"></div>
);

const InfoSkeleton: React.FC = () => (
  <div className="buyer-dashboard__info-skeleton">
    <div className="buyer-dashboard__skeleton-line"></div>
    <div className="buyer-dashboard__skeleton-line"></div>
    <div className="buyer-dashboard__skeleton-line"></div>
    <div className="buyer-dashboard__skeleton-line"></div>
    <div className="buyer-dashboard__skeleton-line--short"></div>
  </div>
);

const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserProfile();
        if (response.success && response.data) {
          setProfile({
            HoTen: response.data.HoTen || '',
            TenDangNhap: response.data.TenDangNhap || '',
            Email: response.data.Email || '',
            SoDienThoai: response.data.SoDienThoai || '',
            AnhDaiDien: response.data.AnhDaiDien || null,
            NgayTao: response.data.NgayTao || '',
          });
        } else {
          setError('Không thể tải thông tin tài khoản.');
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin tài khoản. Vui lòng thử lại.');
        console.error('Lỗi khi gọi API getUserProfile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleChangeAvatar = () => {
    navigate(PATHS.Buyer.TAI_KHOAN_CA_NHAN);
  };

  const handleEditProfile = () => {
    navigate(PATHS.Buyer.TAI_KHOAN_CA_NHAN);
  };

  const handleChangePassword = () => {
    navigate(PATHS.Buyer.DOI_MAT_KHAU);
  };

  return (
    <main className="buyer-dashboard">
      <div className="buyer-dashboard__container">
        {/* Banner chào mừng */}
        <div className="buyer-dashboard__banner">
          <div className="buyer-dashboard__banner-overlay"></div>
          <div className="buyer-dashboard__banner-content">
            <h2>Chào mừng quay trở lại, {profile?.HoTen || 'Bạn'}!</h2>
            <p>Quản lý thông tin cá nhân, cập nhật tài khoản và bảo mật mật khẩu của bạn tại ZenTek.</p>
          </div>
        </div>

        <h1 className="buyer-dashboard__title">Tài khoản của tôi</h1>

        {loading ? (
          <div className="buyer-dashboard__content buyer-dashboard__content--loading">
            <div className="buyer-dashboard__sidebar">
              <AvatarSkeleton />
              <div className="buyer-dashboard__action-skeleton">
                <div className="buyer-dashboard__skeleton-btn"></div>
                <div className="buyer-dashboard__skeleton-btn"></div>
              </div>
            </div>
            <div className="buyer-dashboard__main">
              <InfoSkeleton />
            </div>
          </div>
        ) : error ? (
          <div className="buyer-dashboard__error">
            <p>{error}</p>
            <button onClick={handleRetry} className="buyer-dashboard__retry-btn">
              Thử lại
            </button>
          </div>
        ) : profile ? (
          <div className="buyer-dashboard__content">
            {/* Cột trái - Sidebar */}
            <div className="buyer-dashboard__sidebar">
              <div className="buyer-dashboard__avatar-wrapper">
                {profile.AnhDaiDien ? (
                  <img
                    src={getUserAvatarUrl(profile.AnhDaiDien)}
                    alt="Avatar"
                    className="buyer-dashboard__avatar"
                  />
                ) : (
                  <div className="buyer-dashboard__avatar-placeholder">
                    <User size={64} />
                  </div>
                )}
                <button
                  className="buyer-dashboard__change-avatar-btn"
                  onClick={handleChangeAvatar}
                >
                  <Camera size={16} /> Đổi ảnh
                </button>
              </div>
              <div className="buyer-dashboard__action-buttons">
                <button
                  className="buyer-dashboard__action-btn buyer-dashboard__action-btn--edit"
                  onClick={handleEditProfile}
                >
                  <Edit size={18} /> Chỉnh sửa thông tin
                </button>
                <button
                  className="buyer-dashboard__action-btn buyer-dashboard__action-btn--password"
                  onClick={handleChangePassword}
                >
                  <Key size={18} /> Đổi mật khẩu
                </button>
              </div>
            </div>

            {/* Cột phải - Main Info */}
            <div className="buyer-dashboard__main">
              <div className="buyer-dashboard__info-group">
                <div className="buyer-dashboard__info-row">
                  <div className="buyer-dashboard__info-label">
                    <User size={18} /> Họ và tên
                  </div>
                  <div className="buyer-dashboard__info-value">{profile.HoTen}</div>
                </div>
                <div className="buyer-dashboard__info-row">
                  <div className="buyer-dashboard__info-label">
                    <User size={18} /> Tên đăng nhập
                  </div>
                  <div className="buyer-dashboard__info-value">{profile.TenDangNhap}</div>
                </div>
                <div className="buyer-dashboard__info-row">
                  <div className="buyer-dashboard__info-label">
                    <Mail size={18} /> Email
                  </div>
                  <div className="buyer-dashboard__info-value">{profile.Email}</div>
                </div>
                <div className="buyer-dashboard__info-row">
                  <div className="buyer-dashboard__info-label">
                    <Phone size={18} /> Số điện thoại
                  </div>
                  <div className="buyer-dashboard__info-value">
                    {profile.SoDienThoai || 'Chưa cập nhật'}
                  </div>
                </div>
                <div className="buyer-dashboard__info-row">
                  <div className="buyer-dashboard__info-label">
                    <Calendar size={18} /> Ngày tham gia
                  </div>
                  <div className="buyer-dashboard__info-value">
                    {formatDate(profile.NgayTao)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default BuyerDashboard;
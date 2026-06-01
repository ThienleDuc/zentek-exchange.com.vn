import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Edit, Key, Camera } from 'lucide-react';
import { storage } from '../../utils/storage.utils';
import { PATHS } from '../../utils/path.utils';

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

  // Lấy userId từ storage (giả định)
  const userId = storage.getUser()?.MaNguoiDung || 'buyer_demo_id';

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // API giả định: GET /api/user/profile
        console.log(`[API giả định] Gọi GET /api/user/profile?userId=${userId}`);
        await new Promise(resolve => setTimeout(resolve, 800));

        // Dữ liệu giả - có thể có ảnh đại diện thật để test méo
        const mockProfile: UserProfile = {
          HoTen: 'Trần Thị Bích',
          TenDangNhap: 'buyer01',
          Email: 'buyer01@gmail.com',
          SoDienThoai: '0911111111',
          // Thử dùng ảnh không vuông để kiểm tra object-fit
          AnhDaiDien: 'https://picsum.photos/id/100/300/400', // ảnh 300x400 (không vuông)
          NgayTao: '2024-01-10T00:00:00Z',
        };
        setProfile(mockProfile);
      } catch (err) {
        setError('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
        console.error('[Tương tác] Lỗi khi gọi API giả lập:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleRetry = () => {
    console.log('[Tương tác] Người dùng nhấn "Thử lại"');
    window.location.reload();
  };

  const handleChangeAvatar = () => {
    console.log('[Tương tác] Mở hộp thoại đổi ảnh đại diện (chức năng đang phát triển)');
    alert('Chức năng đổi ảnh đang được phát triển.');
  };

  const handleEditProfile = () => {
    console.log('[Tương tác] Chuyển đến trang chỉnh sửa thông tin');
    navigate(PATHS.Buyer.TAI_KHOAN_CA_NHAN);
  };

  const handleChangePassword = () => {
    console.log('[Tương tác] Chuyển đến trang đổi mật khẩu');
    navigate(PATHS.Buyer.DOI_MAT_KHAU);
  };

  return (
    <main className="buyer-dashboard">
      <div className="buyer-dashboard__container">
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
                    src={profile.AnhDaiDien}
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
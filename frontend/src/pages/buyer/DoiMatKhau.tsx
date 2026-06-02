import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../utils/path.utils';
import { changePassword } from '../../services/auth.service';




const DoiMatKhau: React.FC = () => {
  const navigate = useNavigate();
  // State quản lý form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Hàm hiển thị toast (ghi chú tương tác)
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
    // Ghi chú tương tác ra console
    console.log(`[Tương tác] ${type.toUpperCase()}: ${message}`);
  };

  // Validation client-side
  const validate = (): boolean => {
    let valid = true;
    const newErrors = { oldPassword: '', newPassword: '', confirmPassword: '' };

    // Mật khẩu cũ
    if (!oldPassword.trim()) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
      valid = false;
    }

    // Mật khẩu mới
    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      valid = false;
    } else if (newPassword.length < 6 || newPassword.length > 12) {
      newErrors.newPassword = 'Mật khẩu phải từ 6 đến 12 ký tự';
      valid = false;
    }

    // Xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    console.log('[Tương tác] Người dùng gửi form đổi mật khẩu');

    try {
      const result = await changePassword({ oldPassword, newPassword });
      setIsLoading(false);

      if (result.success) {
        showToast(result.message || 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.', 'success');
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          console.log('[Tương tác] Chuyển về trang đăng nhập');
          navigate(PATHS.AUTH.LOGIN);
        }, 2000);
      } else {
        showToast(result.message || 'Mật khẩu cũ không chính xác', 'error');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err.message || 'Mật khẩu cũ không chính xác hoặc có lỗi xảy ra', 'error');
    }
  };

  const handleCancel = () => {
    console.log('[Tương tác] Người dùng hủy, quay lại trang tài khoản');
    navigate(PATHS.Buyer.DASHBOARD);
  };

  const toggleShowPassword = (field: 'old' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    // Div phân biệt CSS: class "doi-mat-khau-page"
    <div className="doi-mat-khau-page">
      <div className="change-password-container">
        <div className="change-password-card">
          <h1 className="page-title">Đổi mật khẩu</h1>
          
          <form onSubmit={handleSubmit} noValidate>
            {/* Mật khẩu cũ */}
            <div className="form-group">
              <label htmlFor="oldPassword">Mật khẩu cũ *</label>
              <div className="password-wrapper">
                <input
                  type={showPassword.old ? 'text' : 'password'}
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  onBlur={() => validate()}
                  placeholder="Nhập mật khẩu hiện tại"
                  autoComplete="current-password"
                />
                <button type="button" className="toggle-password" onClick={() => toggleShowPassword('old')}>
                  {showPassword.old ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.oldPassword && <span className="error-message">{errors.oldPassword}</span>}
            </div>

            {/* Mật khẩu mới */}
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới *</label>
              <div className="password-wrapper">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => validate()}
                  placeholder="Từ 6 đến 12 ký tự"
                />
                <button type="button" className="toggle-password" onClick={() => toggleShowPassword('new')}>
                  {showPassword.new ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
              <div className="password-hint">Yêu cầu: từ 6 đến 12 ký tự</div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</label>
              <div className="password-wrapper">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => validate()}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button type="button" className="toggle-password" onClick={() => toggleShowPassword('confirm')}>
                  {showPassword.confirm ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast thông báo */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default DoiMatKhau;
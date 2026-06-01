import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../utils/path.utils';

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
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      valid = false;
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 số và 1 ký tự đặc biệt';
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

  // API giả lập đổi mật khẩu
  const fakeChangePasswordAPI = (oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    // Ghi chú: Giả lập kiểm tra mật khẩu cũ đúng là "oldPass123"
    console.log('[API Giả lập] Gửi yêu cầu đổi mật khẩu', { oldPass, newPass });
    return new Promise((resolve) => {
      setTimeout(() => {
        if (oldPass === 'oldPass123') {
          resolve({ success: true, message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
        } else {
          resolve({ success: false, message: 'Mật khẩu cũ không chính xác' });
        }
      }, 1500);
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Ghi chú tương tác: người dùng click nút Đổi mật khẩu
    console.log('[Tương tác] Người dùng gửi form đổi mật khẩu');

    const result = await fakeChangePasswordAPI(oldPassword, newPassword);
    setIsLoading(false);

    if (result.success) {
      showToast(result.message, 'success');
      // Mô phỏng đăng xuất và chuyển hướng sau 2 giây
      setTimeout(() => {
        console.log('[Tương tác] Chuyển về trang đăng nhập');
        navigate(PATHS.AUTH.LOGIN);
      }, 2000);
    } else {
      showToast(result.message, 'error');
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
                  placeholder="Ít nhất 8 ký tự, chữ hoa, số, ký tự đặc biệt"
                />
                <button type="button" className="toggle-password" onClick={() => toggleShowPassword('new')}>
                  {showPassword.new ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
              <div className="password-hint">Yêu cầu: tối thiểu 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt</div>
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
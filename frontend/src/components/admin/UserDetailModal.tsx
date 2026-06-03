import React, { useState } from 'react';
import { X, KeyRound, Loader2, CheckCircle2, User } from 'lucide-react';
import api from '../../services/api';
import { getUserAvatarUrl } from '../../utils/image.utils';

// Extract API base URL to construct image paths
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_BASE_URL.replace('/api', '');

interface User {
  MaNguoiDung: string;
  TenDangNhap: string;
  MatKhauHash?: string;
  Email: string;
  HoTen: string;
  SoDienThoai: string;
  VaiTroId?: string;
  roleName: string;
  AnhDaiDien: string | null;
  NgayTao: string;
  NgayCapNhat?: string;
  DaXoa?: boolean;
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [manualPassword, setManualPassword] = useState('');

  if (!isOpen || !user) return null;

  const handleResetPassword = async (customPassword?: string) => {
    try {
      setResetting(true);
      setError('');
      // Dùng mật khẩu người dùng nhập, nếu không có thì tạo ngẫu nhiên
      const generatedPassword = customPassword || Math.random().toString(36).slice(-8);
      
      const response = await api.put(`/users/${user.MaNguoiDung}/reset-password`, {
        newPassword: generatedPassword
      });

      if (response.data.success) {
        setNewPassword(generatedPassword);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cấp lại mật khẩu.');
    } finally {
      setResetting(false);
    }
  };

  const avatarUrl = getUserAvatarUrl(user.AnhDaiDien) || `${SERVER_URL}/uploads/avatar-default.svg`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border-default rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-border-default">
          <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Chi tiết người dùng
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8 text-text-body">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-border-default shadow-lg bg-surface-muted mb-6">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            
            {/* Đường line ngang */}
            <div className="w-full h-px bg-border-default mb-6 shadow-sm"></div>

            <h4 className="text-xl font-bold text-text-main text-center">{user.HoTen}</h4>
            <span className={`mt-3 px-3 py-1 text-sm font-medium rounded-full border ${
              user.roleName === 'Admin' 
                ? 'bg-danger/10 text-danger border-danger/20' 
                : user.roleName === 'Seller'
                ? 'bg-secondary/10 text-secondary border-secondary/20'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}>
              {user.roleName}
            </span>
          </div>

          {/* Details Section */}
          <div className="md:w-2/3 space-y-4">
            <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-sm">
              <div className="col-span-1 font-medium text-text-muted">ID:</div>
              <div className="col-span-2 text-text-main break-all">{user.MaNguoiDung}</div>
              
              <div className="col-span-1 font-medium text-text-muted">Tên đăng nhập:</div>
              <div className="col-span-2 text-text-main">@{user.TenDangNhap}</div>

              <div className="col-span-1 font-medium text-text-muted">Email:</div>
              <div className="col-span-2 text-text-main break-all">{user.Email}</div>

              <div className="col-span-1 font-medium text-text-muted">Số điện thoại:</div>
              <div className="col-span-2 text-text-main">{user.SoDienThoai || 'Chưa cập nhật'}</div>

              <div className="col-span-1 font-medium text-text-muted">Vai trò ID:</div>
              <div className="col-span-2 text-text-main text-xs flex items-center">{user.VaiTroId || 'N/A'}</div>

              <div className="col-span-1 font-medium text-text-muted">Ngày tạo:</div>
              <div className="col-span-2 text-text-main">{new Date(user.NgayTao).toLocaleString('vi-VN')}</div>
              
              <div className="col-span-1 font-medium text-text-muted">Cập nhật lần cuối:</div>
              <div className="col-span-2 text-text-main">
                {user.NgayCapNhat ? new Date(user.NgayCapNhat).toLocaleString('vi-VN') : 'Chưa cập nhật'}
              </div>

              <div className="col-span-1 font-medium text-text-muted">Đã Xoá:</div>
              <div className="col-span-2 text-text-main">
                {user.DaXoa ? <span className="text-danger font-medium">Có</span> : 'Không'}
              </div>
            </div>

            <div className="mt-4 pt-5 border-t border-border-default">
              <h4 className="text-sm font-medium text-text-muted mb-3">Cấp lại mật khẩu</h4>
              {newPassword ? (
                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-secondary font-medium text-sm">Cấp lại mật khẩu thành công!</p>
                    <p className="text-text-main mt-1">Mật khẩu mới: <span className="font-mono bg-black/30 px-2 py-1 rounded text-secondary ml-1">{newPassword}</span></p>
                    <p className="text-xs text-text-muted mt-2">Vui lòng copy mật khẩu này gửi cho người dùng.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Nhập mật khẩu mới..."
                      value={manualPassword}
                      onChange={(e) => setManualPassword(e.target.value)}
                      className="flex-1 px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted text-sm"
                    />
                    <button
                      onClick={() => handleResetPassword(manualPassword)}
                      disabled={resetting || !manualPassword.trim()}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex-shrink-0"
                    >
                      Xác nhận đổi
                    </button>
                  </div>
                  
                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-border-default"></div>
                    <span className="flex-shrink-0 mx-4 text-text-muted text-xs">hoặc</span>
                    <div className="flex-grow border-t border-border-default"></div>
                  </div>
                  
                  <button
                    onClick={() => handleResetPassword()}
                    disabled={resetting}
                    className="flex justify-center items-center space-x-2 px-4 py-2 bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20 rounded-lg transition-colors text-sm font-medium w-full"
                  >
                    {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    <span>Cấp lại mật khẩu ngẫu nhiên</span>
                  </button>
                </div>
              )}
              {error && <p className="text-danger text-sm mt-2">{error}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-border-default bg-surface-muted/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-sm border border-border-default hover:bg-surface-muted text-text-body transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;

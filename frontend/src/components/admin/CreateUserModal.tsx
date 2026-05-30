import React, { useState, useEffect } from 'react';
import { X, Loader2, Info, Eye, EyeOff, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Role {
  MaVaiTro: string;
  TenVaiTro: string;
  MoTa: string;
}

interface User {
  MaNguoiDung: string;
  TenDangNhap: string;
  Email: string;
  HoTen: string;
  SoDienThoai: string;
  VaiTroId?: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const isEditMode = !!user;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    phone: '',
    roleId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (user) {
        setFormData({
          username: user.TenDangNhap,
          password: '',
          confirmPassword: '',
          email: user.Email,
          fullName: user.HoTen,
          phone: user.SoDienThoai || '',
          roleId: user.VaiTroId || ''
        });
      } else {
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
          fullName: '',
          phone: '',
          roleId: ''
        });
      }
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError('');
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/users/roles');
      if (response.data.success) {
        if (isEditMode) {
          setRoles(response.data.data);
          // If editing and roleId not set in formData yet (just in case)
          if (user && !user.VaiTroId && response.data.data.length > 0) {
             setFormData(prev => ({ ...prev, roleId: response.data.data[0].MaVaiTro }));
          }
        } else {
          const filteredRoles = response.data.data.filter((r: Role) => r.TenVaiTro === 'Buyer' || r.TenVaiTro === 'Người mua');
          setRoles(filteredRoles);
          if (filteredRoles.length > 0) {
            setFormData(prev => ({ ...prev, roleId: filteredRoles[0].MaVaiTro }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode && formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      if (isEditMode && user) {
        const response = await api.put(`/users/${user.MaNguoiDung}`, {
          fullName: formData.fullName,
          phone: formData.phone
        });
        if (response.data.success) {
          onSuccess();
          onClose();
        }
      } else {
        const response = await api.post('/users', formData);
        if (response.data.success) {
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'tạo'} người dùng.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border-default rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-border-default">
          <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm mới người dùng (Người mua)'}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-text-body flex flex-col gap-4">
          {!isEditMode && (
            <div className="bg-info/10 text-info p-3 rounded-lg text-sm flex items-start gap-2 border border-info/20 mb-2">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Lưu ý: Nếu bạn muốn tạo tài khoản cho người bán, vui lòng chuyển đến <Link to="/admin/shops" className="font-bold underline hover:text-info/80">Trang quản lý cửa hàng</Link> để tạo tài khoản đồng thời cấp phép cửa hàng.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-text-muted mb-1">Tên đăng nhập *</label>
              <input
                type="text"
                name="username"
                required
                maxLength={12}
                disabled={isEditMode}
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Ví dụ: buyer123"
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-text-muted mb-1">Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted"
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>

            {!isEditMode && (
              <>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Mật khẩu *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted pr-10"
                      placeholder="Ít nhất 6 ký tự"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Xác nhận mật khẩu *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted pr-10"
                      placeholder="Nhập lại mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-text-muted mb-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                disabled={isEditMode}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="email@example.com"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-text-muted mb-1">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted"
                placeholder="0912345678"
              />
            </div>
          </div>

          {error && <p className="text-danger text-sm mt-2">{error}</p>}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-default">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium text-sm border border-border-default hover:bg-surface-muted text-text-body transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center min-w-[100px]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditMode ? 'Lưu thay đổi' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;

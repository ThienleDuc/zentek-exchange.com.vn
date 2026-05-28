import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';
import { login } from '../../services/auth.service';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({ identifier: '', password: '', form: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    if (name === 'identifier') {
      if (!value.trim()) {
        errorMsg = 'Tên đăng nhập hoặc email không được để trống.';
      }
    } else if (name === 'password') {
      if (!value) {
        errorMsg = 'Mật khẩu không được để trống.';
      } else if (value.length < 6) {
        errorMsg = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
      }
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg, form: '' }));
    return errorMsg;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      // Xóa lỗi tương ứng khi người dùng nhập liệu
      setErrors(prev => ({ ...prev, [name]: '', form: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ identifier: '', password: '', form: '' });

    const identifierError = validateField('identifier', formData.identifier);
    const passwordError = validateField('password', formData.password);

    if (identifierError || passwordError) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await login(formData);
      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Use getDashboardPath to navigate dynamically based on role
        const { getDashboardPath } = await import('../../utils/role.utils');
        const userRole = response.user.roleName;
        navigate(getDashboardPath(userRole as any));
      } else {
        setErrors(prev => ({ ...prev, form: response.message || 'Đăng nhập thất bại. Vui lòng thử lại.' }));
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, form: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-container">
      <section className="login-card">
        <header>
          <h2 className="login-title">ZenTek Exchange</h2>
          <p className="login-subtitle">Đăng nhập tài khoản chuyên biệt đồ điện tử</p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <fieldset className="border-none p-0 m-0 mb-4">
            <label className="login-label">Tên đăng nhập hoặc Email *</label>
            <div className="input-with-icon">
              <Mail className="input-icon-left" size={18} />
              <input 
                type="text" 
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập tên đăng nhập hoặc email..."
                className={`login-input ${errors.identifier ? 'login-input-error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.identifier && (
              <p className="login-error-msg">
                <AlertCircle size={14} />
                {errors.identifier}
              </p>
            )}
          </fieldset>

          <fieldset className="border-none p-0 m-0 mb-4">
            <label className="login-label">Mật khẩu *</label>
            <div className="input-with-icon">
              <Lock className="input-icon-left" size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập mật khẩu..."
                className={`login-input ${errors.password ? 'login-input-error' : ''}`}
                disabled={isLoading}
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="login-error-msg">
                <AlertCircle size={14} />
                {errors.password}
              </p>
            )}
          </fieldset>

          {errors.form && (
            <p className="login-error-msg">
              <AlertCircle size={14} />
              {errors.form}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-300 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="mr-2 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" 
              />
              Ghi nhớ đăng nhập
            </label>
            <Link to="/forgot-password" className="login-link text-sm">Quên mật khẩu?</Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="login-btn-primary mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                ĐANG XỬ LÝ...
              </>
            ) : (
              'ĐĂNG NHẬP'
            )}
          </button>
        </form>

        <footer className="mt-6 text-center text-sm login-footer-text">
          <p>
            Chưa có tài khoản?{' '}
            <Link to={PATHS.AUTH.REGISTER} className="login-link">Đăng ký ngay</Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default Login;

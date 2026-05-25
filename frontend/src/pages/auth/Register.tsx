import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc (*).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setIsLoading(true);
    
    // Giả lập gọi API đăng ký
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1000);
  };

  return (
    <main className="register-container">
      <section className="register-card lg:w-6/12 md:w-8/12">
        <header>
          <h2 className="register-title">ĐĂNG KÝ TÀI KHOẢN</h2>
        </header>
        
        <form onSubmit={handleSubmit} className="register-grid">
          
          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Họ tên *</label>
            <input 
              type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              placeholder="Nhập họ tên..." className="register-input"
            />
          </fieldset>

          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Số điện thoại</label>
            <input 
              type="text" name="phone" value={formData.phone} onChange={handleChange}
              placeholder="Nhập số điện thoại..." className="register-input"
            />
          </fieldset>

          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Tên đăng nhập *</label>
            <input 
              type="text" name="username" value={formData.username} onChange={handleChange}
              placeholder="Nhập tên đăng nhập..." className="register-input"
            />
          </fieldset>

          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Email *</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="Nhập địa chỉ email..." className="register-input"
            />
          </fieldset>

          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Mật khẩu *</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                placeholder="Nhập mật khẩu..." className="register-input"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </fieldset>

          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Xác nhận mật khẩu *</label>
            <input 
              type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              placeholder="Nhập lại mật khẩu..." className="register-input"
            />
          </fieldset>

          {error && (
            <div className="register-field-full">
              <p className="register-error-msg">{error}</p>
            </div>
          )}

          <div className="register-field-full">
            <button 
              type="submit" 
              disabled={isLoading}
              className="register-btn-primary"
            >
              {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
            </button>
          </div>
        </form>

        <footer className="mt-6 text-center text-sm text-gray-600">
          <p>
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Đăng nhập</Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default Register;

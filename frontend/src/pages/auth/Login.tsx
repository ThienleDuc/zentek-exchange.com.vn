import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
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
    
    if (!formData.identifier || !formData.password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);
    
    // Giả lập gọi API đăng nhập
    setTimeout(() => {
      setIsLoading(false);
      // Giả sử đăng nhập thành công
      navigate('/');
    }, 1000);
  };

  return (
    <main className="login-container">
      <section className="login-card lg:w-4/12 md:w-8/12">
        <header>
          <h2 className="login-title">ĐĂNG NHẬP TÀI KHOẢN</h2>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <fieldset className="border-none p-0 m-0">
            <label className="login-label">Tên đăng nhập hoặc Email *</label>
            <input 
              type="text" 
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập hoặc email..."
              className={`login-input ${error && !formData.identifier ? 'login-input-error' : ''}`}
            />
          </fieldset>

          <fieldset className="border-none p-0 m-0">
            <label className="login-label">Mật khẩu *</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu..."
                className={`login-input ${error && !formData.password ? 'login-input-error' : ''}`}
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

          {error && <p className="login-error-msg">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded text-blue-600 focus:ring-blue-500" />
              Ghi nhớ đăng nhập
            </label>
            <Link to="/forgot-password" className="text-blue-600 hover:underline">Quên mật khẩu?</Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="login-btn-primary mt-2"
          >
            {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <footer className="mt-6 text-center text-sm text-gray-600">
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Đăng ký ngay</Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ShieldCheck, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';
import { register, sendOTP } from '../../services/auth.service';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  
  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    form: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // 5 phút
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (otpSent && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const validateField = (name: string, value: string) => {
    let errorMsg = '';
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          errorMsg = 'Họ tên là bắt buộc.';
        } else {
          const nameRegex = /^[\p{L}\s]{3,100}$/u;
          if (!nameRegex.test(value.trim())) {
            errorMsg = 'Họ tên phải từ 3-100 ký tự và không chứa ký tự đặc biệt.';
          }
        }
        break;
      case 'username':
        if (!value.trim()) {
          errorMsg = 'Tên đăng nhập là bắt buộc.';
        } else {
          const usernameRegex = /^[a-zA-Z0-9_]{6,12}$/;
          if (!usernameRegex.test(value.trim())) {
            errorMsg = 'Tên đăng nhập phải từ 6-12 ký tự, không dấu, không khoảng trắng, chỉ dùng chữ, số và gạch dưới.';
          }
        }
        break;
      case 'email':
        if (!value.trim()) {
          errorMsg = 'Email là bắt buộc.';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            errorMsg = 'Địa chỉ email không đúng định dạng.';
          }
        }
        break;
      case 'password':
        if (!value) {
          errorMsg = 'Mật khẩu là bắt buộc.';
        } else if (value.length < 6) {
          errorMsg = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errorMsg = 'Vui lòng xác nhận mật khẩu.';
        } else if (value !== formData.password) {
          errorMsg = 'Xác nhận mật khẩu không khớp.';
        }
        break;
      case 'otp':
        if (otpSent) {
          if (!value || value.trim().length !== 6 || !/^\d+$/.test(value.trim())) {
            errorMsg = 'Mã OTP phải gồm đúng 6 chữ số.';
          }
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg, form: '' }));
    return errorMsg;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // OTP chỉ cho phép nhập số
    if (name === 'otp' && value && !/^\d*$/.test(value)) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '', form: '' }));
    }
  };

  const handleSendOTP = async () => {
    const emailErr = validateField('email', formData.email);
    if (emailErr) return;

    setIsSendingOTP(true);
    setErrors(prev => ({ ...prev, form: '', email: '', otp: '' }));

    try {
      const response = await sendOTP(formData.email.trim());
      if (response.success) {
        setOtpSent(true);
        setTimeLeft(300); // 5 phút
      } else {
        setErrors(prev => ({ ...prev, form: response.message || 'Không thể gửi OTP.' }));
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, form: err.message }));
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
      form: ''
    });

    const fullNameErr = validateField('fullName', formData.fullName);
    const usernameErr = validateField('username', formData.username);
    const emailErr = validateField('email', formData.email);
    const passwordErr = validateField('password', formData.password);
    const confirmPasswordErr = validateField('confirmPassword', formData.confirmPassword);
    
    if (!otpSent) {
      setErrors(prev => ({ ...prev, form: 'Vui lòng nhấn Gửi mã OTP và xác thực trước khi đăng ký.' }));
      return;
    }
    const otpErr = validateField('otp', formData.otp);

    if (fullNameErr || usernameErr || emailErr || passwordErr || confirmPasswordErr || otpErr) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        roleName: 'Buyer',
        otp: formData.otp.trim()
      });

      if (response.success) {
        navigate(PATHS.AUTH.LOGIN);
      } else {
        setErrors(prev => ({ ...prev, form: response.message || 'Đăng ký thất bại. Vui lòng thử lại.' }));
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, form: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="register-container">
      <section className="register-card" style={{ maxWidth: '600px' }}>
        <header>
          <h2 className="register-title">ZenTek Exchange</h2>
          <p className="register-subtitle">Đăng ký tài khoản mua bán đồ điện tử</p>
        </header>
        
        <form onSubmit={handleRegisterSubmit} className="register-grid">
          
          <fieldset className="register-field-full border-none p-0 m-0">
            <label className="register-label">Họ tên *</label>
            <div className="input-with-icon">
              <User className="input-icon-left" size={18} />
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập họ tên..." 
                className={`register-input ${errors.fullName ? 'register-input-error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.fullName && (
              <p className="register-error-msg">
                <AlertCircle size={14} />
                {errors.fullName}
              </p>
            )}
          </fieldset>

          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Tên đăng nhập *</label>
            <div className="input-with-icon">
              <User className="input-icon-left" size={18} />
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="6-12 ký tự..." 
                className={`register-input ${errors.username ? 'register-input-error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="register-error-msg">
                <AlertCircle size={14} />
                {errors.username}
              </p>
            )}
          </fieldset>

          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Email *</label>
            <div className="input-with-icon">
              <Mail className="input-icon-left" size={18} />
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập email..." 
                className={`register-input ${errors.email ? 'register-input-error' : ''}`}
                disabled={isLoading || otpSent} // Disable email when OTP is sent to prevent mismatch
              />
            </div>
            {errors.email && (
              <p className="register-error-msg">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
            {otpSent && !errors.email && (
              <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                <ShieldCheck size={12} />
                Email đã được khóa để xác thực.
              </p>
            )}
          </fieldset>

          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Mật khẩu *</label>
            <div className="input-with-icon relative">
              <Lock className="input-icon-left" size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập mật khẩu..." 
                className={`register-input pr-10 ${errors.password ? 'register-input-error' : ''}`}
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
              <p className="register-error-msg">
                <AlertCircle size={14} />
                {errors.password}
              </p>
            )}
          </fieldset>

          <fieldset className="register-field border-none p-0 m-0">
            <label className="register-label">Xác nhận mật khẩu *</label>
            <div className="input-with-icon relative">
              <ShieldCheck className="input-icon-left" size={18} />
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập lại mật khẩu..." 
                className={`register-input pr-10 ${errors.confirmPassword ? 'register-input-error' : ''}`}
                disabled={isLoading}
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="register-error-msg">
                <AlertCircle size={14} />
                {errors.confirmPassword}
              </p>
            )}
          </fieldset>

          <fieldset className="register-field-full border-none p-0 m-0">
            <label className="register-label">Xác thực Email *</label>
            <div className="flex gap-2">
              <div className="input-with-icon flex-1">
                <ShieldCheck className="input-icon-left" size={18} />
                <input 
                  type="text" 
                  maxLength={6}
                  name="otp"
                  value={formData.otp} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Mã OTP 6 số" 
                  className={`register-input ${errors.otp ? 'register-input-error' : ''}`}
                  disabled={isLoading || !otpSent}
                  style={{ letterSpacing: '2px', textAlign: 'center', fontWeight: '600' }}
                />
              </div>
              <button 
                type="button" 
                onClick={handleSendOTP} 
                disabled={isSendingOTP || (otpSent && timeLeft > 0)}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center"
                style={{ height: '42px', minWidth: '130px' }}
              >
                {isSendingOTP ? <Loader2 size={18} className="animate-spin mx-auto" /> : 
                 (otpSent && timeLeft > 0) ? `Gửi lại (${formatTime(timeLeft)})` : 'Gửi mã OTP'}
              </button>
            </div>
            {errors.otp && (
              <p className="register-error-msg">
                <AlertCircle size={14} />
                {errors.otp}
              </p>
            )}
            {otpSent && !errors.otp && (
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  Mã OTP đã được gửi tới email của bạn (Hiệu lực: {formatTime(timeLeft)}). {timeLeft === 0 && 'Mã đã hết hạn, vui lòng gửi lại.'}
                </p>
            )}
          </fieldset>

          {errors.form && (
            <div className="register-field-full mt-2">
              <p className="register-error-msg">
                <AlertCircle size={14} />
                {errors.form}
              </p>
            </div>
          )}

          <div className="register-field-full mt-4">
            <button 
              type="submit" 
              disabled={isLoading || isSendingOTP}
              className="register-btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  ĐANG XỬ LÝ...
                </>
              ) : (
                'ĐĂNG KÝ TÀI KHOẢN'
              )}
            </button>
          </div>
        </form>

        <footer className="mt-6 text-center text-sm register-footer-text">
          <p>
            Đã có tài khoản?{' '}
            <Link to={PATHS.AUTH.LOGIN} className="register-link">Đăng nhập</Link>
          </p>
          <p className="mt-2">
            Trở thành đối tác?{' '}
            <Link to={PATHS.AUTH.REGISTER_SELLER} className="register-link text-orange-400 hover:text-orange-300">Đăng ký bán hàng</Link>
          </p>
        </footer>
      </section>
    </main>
  );
};

export default Register;

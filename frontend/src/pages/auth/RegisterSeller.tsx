import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Eye, EyeOff, Loader2, AlertCircle, Store, MapPin, Phone, Lock, Hash, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';
import { registerSeller, sendOTP } from '../../services/auth.service';
import { getProvinces, getProvinceTree, type Province, type District, type Ward } from '../../services/location.service';
import { uploadDocument } from '../../services/upload.service';
import SearchableDropdown from '../../components/SearchableDropdown';

const RegisterSeller: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    shopName: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    description: '',
    shopPhone: '',
    shopType: 1, // 1: Cá nhân, 2: Doanh nghiệp
    taxCode: '',
    licensePdf: ''
  });
  
  const [selectedLocation, setSelectedLocation] = useState({
    provinceCode: 0,
    districtCode: 0,
    wardCode: 0
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [errors, setErrors] = useState<any>({});
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch provinces on load
    getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (otpSent && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleProvinceChange = async (val: string | number) => {
    const provinceCode = Number(val);
    const provinceName = provinces.find(p => p.code === provinceCode)?.name || '';
    setFormData(prev => ({ ...prev, province: provinceName, district: '', ward: '' }));
    setSelectedLocation({ provinceCode, districtCode: 0, wardCode: 0 });
    setDistricts([]);
    setWards([]);
    if (provinceCode) {
      const tree = await getProvinceTree(provinceCode);
      if (tree) {
        setDistricts(tree.districts || []);
      }
    }
  };

  const handleDistrictChange = (val: string | number) => {
    const districtCode = Number(val);
    const district = districts.find(d => d.code === districtCode) as any;
    const districtName = district?.name || '';
    setFormData(prev => ({ ...prev, district: districtName, ward: '' }));
    setSelectedLocation(prev => ({ ...prev, districtCode, wardCode: 0 }));
    setWards(district ? district.wards || [] : []);
  };

  const handleWardChange = (val: string | number) => {
    const wardCode = Number(val);
    const wardName = wards.find(w => w.code === wardCode)?.name || '';
    setFormData(prev => ({ ...prev, ward: wardName }));
    setSelectedLocation(prev => ({ ...prev, wardCode }));
  };

  const validateField = (name: string, value: any) => {
    let errorMsg = '';
    switch (name) {
      case 'fullName':
        if (!value.trim()) errorMsg = 'Họ tên không được để trống.';
        else if (value.trim().length < 3) errorMsg = 'Họ tên phải từ 3 ký tự trở lên.';
        break;
      case 'username':
        if (!value.trim()) errorMsg = 'Tên đăng nhập không được để trống.';
        else if (!/^[a-zA-Z0-9_]{6,12}$/.test(value.trim())) errorMsg = 'Từ 6-12 ký tự, không dấu, khoảng trắng.';
        break;
      case 'email':
        if (!value.trim()) errorMsg = 'Email không được để trống.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) errorMsg = 'Địa chỉ email không hợp lệ.';
        break;
      case 'password':
        if (!value) errorMsg = 'Mật khẩu không được để trống.';
        else if (value.length < 6) errorMsg = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
        break;
      case 'confirmPassword':
        if (value !== formData.password) errorMsg = 'Mật khẩu không khớp.';
        break;
      case 'otp':
        if (otpSent) {
          if (!value || value.length !== 6) errorMsg = 'Mã OTP phải gồm 6 chữ số.';
        }
        break;
      case 'shopName':
        if (!value.trim()) errorMsg = 'Tên cửa hàng không được để trống.';
        break;
      case 'shopPhone':
        if (!value.trim()) errorMsg = 'SĐT không được để trống.';
        else if (!/^[0-9]{10}$/.test(value.trim())) errorMsg = 'SĐT phải gồm đúng 10 chữ số.';
        break;
      case 'address':
        if (!value.trim()) errorMsg = 'Vui lòng nhập địa chỉ chi tiết.';
        break;
      case 'taxCode':
        if ((formData.shopType === 2 || formData.shopType === 3) && (!value || !value.trim())) {
          errorMsg = 'Hộ/Doanh nghiệp cần nhập MST.';
        }
        break;
    }
    setErrors((prev: any) => ({ ...prev, [name]: errorMsg, form: '' }));
    return errorMsg;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'otp' && value && !/^\d*$/.test(value)) return;
    if (name === 'shopPhone' && value && !/^\d*$/.test(value)) return;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'shopType' ? parseInt(value) : value 
    }));
    
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '', form: '' }));
    }
  };

  const handleSendOTP = async () => {
    if (!formData.email.trim()) {
      setErrors((prev: any) => ({ ...prev, email: 'Email là bắt buộc.' }));
      return;
    }
    setIsSendingOTP(true);
    setErrors((prev: any) => ({ ...prev, form: '', email: '', otp: '' }));
    try {
      const response = await sendOTP(formData.email.trim());
      if (response.success) {
        setOtpSent(true);
        setTimeLeft(300);
      } else {
        setErrors((prev: any) => ({ ...prev, form: response.message || 'Không thể gửi OTP.' }));
      }
    } catch (err: any) {
      setErrors((prev: any) => ({ ...prev, form: err.message }));
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setErrors((prev: any) => ({ ...prev, licensePdf: 'Chỉ được phép tải lên 1 file duy nhất.' }));
      return;
    }

    const file = files[0];

    // Validate size (max 2MB) and type
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev: any) => ({ ...prev, licensePdf: 'File quá lớn, tối đa 2MB.' }));
      return;
    }
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev: any) => ({ ...prev, licensePdf: 'Chỉ chấp nhận định dạng PDF hoặc DOC/DOCX.' }));
      return;
    }

    setErrors((prev: any) => ({ ...prev, licensePdf: '' }));
    setSelectedFile(file);
    setFormData(prev => ({ ...prev, licensePdf: URL.createObjectURL(file) }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Họ tên phải từ 3 ký tự trở lên.';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống.';
    } else if (!/^[a-zA-Z0-9_]{6,12}$/.test(formData.username.trim())) {
      newErrors.username = 'Từ 6-12 ký tự, không dấu, khoảng trắng.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Địa chỉ email không hợp lệ.';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp.';
    }

    if (!otpSent) {
      newErrors.form = 'Vui lòng xác thực email.';
    } else if (!formData.otp || formData.otp.length !== 6) {
      newErrors.otp = 'Mã OTP phải gồm 6 chữ số.';
    }
    
    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Tên cửa hàng không được để trống.';
    }

    if (!formData.shopPhone.trim()) {
      newErrors.shopPhone = 'SĐT không được để trống.';
    } else if (!/^[0-9]{10}$/.test(formData.shopPhone.trim())) {
      newErrors.shopPhone = 'SĐT phải gồm đúng 10 chữ số.';
    }

    if (!formData.province) newErrors.province = 'Vui lòng chọn Tỉnh/Thành.';
    if (!formData.district) newErrors.district = 'Vui lòng chọn Quận/Huyện.';
    if (!formData.ward) newErrors.ward = 'Vui lòng chọn Phường/Xã.';
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ chi tiết.';

    if ((formData.shopType === 2 || formData.shopType === 3) && !formData.taxCode.trim()) {
      newErrors.taxCode = 'Hộ/Doanh nghiệp cần nhập MST.';
    }

    if (!formData.licensePdf) {
      newErrors.licensePdf = 'Yêu cầu tải lên Giấy phép kinh doanh.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    
    try {
      let finalLicensePdfUrl = formData.licensePdf;
      
      // Upload file nếu có selectedFile
      if (selectedFile) {
        const uploadRes = await uploadDocument(selectedFile);
        if (uploadRes.success && uploadRes.url) {
          finalLicensePdfUrl = uploadRes.url;
        } else {
          setErrors((prev: any) => ({ ...prev, form: uploadRes.message || 'Tải file lên thất bại.' }));
          setIsLoading(false);
          return;
        }
      }

      const response = await registerSeller({
        ...formData,
        licensePdf: finalLicensePdfUrl
      });
      
      if (response.success) {
        navigate(PATHS.AUTH.LOGIN);
      } else {
        setErrors((prev: any) => ({ ...prev, form: response.message || 'Đăng ký thất bại.' }));
      }
    } catch (err: any) {
      setErrors((prev: any) => ({ ...prev, form: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="register-container min-h-screen py-10" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
      <section className="register-card" style={{ maxWidth: '1200px', width: '95%' }}>
        <header className="mb-6 border-b border-gray-700/50 pb-4">
          <h2 className="register-title text-orange-400">Đăng ký Đối tác Người Bán</h2>
          <p className="register-subtitle">Khởi tạo cửa hàng trên ZenTek Exchange</p>
        </header>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Cột 1: Thông tin tài khoản */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="text-orange-400" size={20} />
                Thông tin Tài khoản
              </h3>

              <div className="flex gap-3">
                <fieldset className="register-field border-none p-0 m-0 flex-1">
                  <label className="register-label">Họ tên *</label>
                  <div className="input-with-icon">
                    <User className="input-icon-left" size={16} />
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} placeholder="Họ tên" className={`register-input ${errors.fullName ? 'register-input-error' : ''}`} disabled={isLoading} />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
                </fieldset>
                <fieldset className="register-field border-none p-0 m-0 flex-1">
                  <label className="register-label">Tên đăng nhập *</label>
                  <div className="input-with-icon">
                    <User className="input-icon-left" size={16} />
                    <input type="text" name="username" value={formData.username} onChange={handleChange} onBlur={handleBlur} placeholder="Tên đăng nhập" className={`register-input ${errors.username ? 'register-input-error' : ''}`} disabled={isLoading} />
                  </div>
                  {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
                </fieldset>
              </div>

              <fieldset className="register-field border-none p-0 m-0 mb-4">
                <label className="register-label">Email *</label>
                <div className="input-with-icon">
                  <Mail className="input-icon-left" size={18} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email" className={`register-input ${errors.email ? 'register-input-error' : ''}`} disabled={isLoading || otpSent} />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </fieldset>

              <div className="flex gap-3">
                <fieldset className="register-field border-none p-0 m-0 flex-1">
                  <label className="register-label">Mật khẩu *</label>
                  <div className="input-with-icon relative">
                    <Lock className="input-icon-left" size={16} />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder="Mật khẩu" className={`register-input pr-10 ${errors.password ? 'register-input-error' : ''}`} disabled={isLoading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                </fieldset>
                <fieldset className="register-field border-none p-0 m-0 flex-1">
                  <label className="register-label">Xác nhận MK *</label>
                  <div className="input-with-icon relative">
                    <Lock className="input-icon-left" size={16} />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Nhập lại" className={`register-input pr-10 ${errors.confirmPassword ? 'register-input-error' : ''}`} disabled={isLoading} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                </fieldset>
              </div>

              <fieldset className="register-field-full border-none p-0 m-0 pt-2">
                <label className="register-label">Xác thực Email *</label>
                <div className="flex gap-2">
                  <input type="text" maxLength={6} name="otp" value={formData.otp} onChange={handleChange} onBlur={handleBlur} placeholder="Mã 6 số" className={`register-input flex-1 ${errors.otp ? 'register-input-error' : ''}`} disabled={isLoading || !otpSent} style={{ letterSpacing: '2px', textAlign: 'center', fontWeight: '600' }} />
                  <button type="button" onClick={handleSendOTP} disabled={isSendingOTP || (otpSent && timeLeft > 0)} className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border border-orange-500/30 font-semibold rounded-lg transition-colors whitespace-nowrap" style={{ minWidth: '110px' }}>
                    {isSendingOTP ? <Loader2 size={18} className="animate-spin mx-auto" /> : (otpSent && timeLeft > 0) ? `Lại (${formatTime(timeLeft)})` : 'Gửi OTP'}
                  </button>
                </div>
                {errors.otp && <p className="text-xs text-red-400 mt-1">{errors.otp}</p>}
                {otpSent && !errors.otp && <p className="text-xs text-green-400 mt-1">Mã đã gửi. (Hiệu lực: {formatTime(timeLeft)})</p>}
              </fieldset>
            </div>

            {/* Cột 2: Thông tin cơ bản cửa hàng */}
            <div className="border-t md:border-t-0 md:border-l border-gray-700/50 pt-6 md:pt-0 md:pl-6 lg:pl-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Store className="text-orange-400" size={20} />
                Thông tin Cửa hàng
              </h3>

              <div className="space-y-4">
                <fieldset className="register-field border-none p-0 m-0 mb-4">
                  <label className="register-label">Tên cửa hàng *</label>
                  <div className="input-with-icon">
                    <Store className="input-icon-left" size={16} />
                    <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} onBlur={handleBlur} placeholder="Ví dụ: ZenTek Store" className={`register-input ${errors.shopName ? 'register-input-error' : ''}`} disabled={isLoading} />
                  </div>
                  {errors.shopName && <p className="text-xs text-red-400 mt-1">{errors.shopName}</p>}
                </fieldset>

                <div className="grid grid-cols-2 gap-3">
                  <fieldset className="register-field border-none p-0 m-0">
                    <label className="register-label">SĐT Cửa hàng *</label>
                    <div className="input-with-icon">
                      <Phone className="input-icon-left" size={16} />
                      <input type="text" maxLength={10} name="shopPhone" value={formData.shopPhone} onChange={handleChange} onBlur={handleBlur} placeholder="10 số..." className={`register-input ${errors.shopPhone ? 'register-input-error' : ''}`} disabled={isLoading} />
                    </div>
                    {errors.shopPhone && <p className="text-xs text-red-400 mt-1">{errors.shopPhone}</p>}
                  </fieldset>
                  
                  <fieldset className="register-field border-none p-0 m-0">
                    <label className="register-label">Mô hình *</label>
                    <SearchableDropdown
                      options={[
                        { value: 1, label: 'Cá nhân' },
                        { value: 2, label: 'Hộ kinh doanh' },
                        { value: 3, label: 'Doanh nghiệp nhỏ' }
                      ]}
                      value={formData.shopType}
                      onChange={(val) => handleChange({ target: { name: 'shopType', value: val } } as any)}
                      disabled={isLoading}
                    />
                  </fieldset>
                </div>

                <fieldset className="register-field border-none p-0 m-0 mb-4 animate-fade-in">
                  <label className="register-label">
                    Mã số thuế (MST) {formData.shopType !== 1 && '*'}
                  </label>
                  <div className="input-with-icon">
                    <Hash className="input-icon-left" size={16} />
                    <input type="text" name="taxCode" value={formData.taxCode} onChange={handleChange} onBlur={handleBlur} placeholder="Nhập MST..." className={`register-input ${errors.taxCode ? 'register-input-error' : ''}`} disabled={isLoading} />
                  </div>
                  {errors.taxCode && <p className="text-xs text-red-400 mt-1">{errors.taxCode}</p>}
                </fieldset>

                <fieldset className="register-field border-none p-0 m-0">
                  <label className="register-label">Giấy phép kinh doanh (PDF/DOC) *</label>
                  <div className="flex items-center gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-all ${
                      formData.licensePdf ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-gray-500/50 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                    } ${errors.licensePdf ? 'border-red-500/50 bg-red-500/10' : ''} ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                      {isUploading ? (
                        <><Loader2 size={16} className="animate-spin" /> Đang tải lên...</>
                      ) : formData.licensePdf ? (
                        <><CheckCircle2 size={16} /> Đã chọn file ({selectedFile?.name || 'File tạm'})</>
                      ) : (
                        <><Upload size={16} /> Chọn File Tải Lên</>
                      )}
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" multiple={true} onChange={handleFileUpload} disabled={isUploading || isLoading} />
                    </label>
                  </div>
                  {formData.licensePdf && (
                    <div className="mt-2 text-right">
                      <a href={formData.licensePdf.startsWith('blob:') ? formData.licensePdf : `http://localhost:5000${formData.licensePdf}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg text-sm font-medium transition-colors">
                        <FileText size={14} /> Xem giấy phép
                      </a>
                    </div>
                  )}
                  {errors.licensePdf && <p className="text-xs text-red-400 mt-1">{errors.licensePdf}</p>}
                </fieldset>
              </div>
            </div>

            {/* Cột 3: Thông tin địa chỉ */}
            <div className="border-t md:border-t-0 md:border-l border-gray-700/50 pt-6 md:pt-0 md:pl-6 lg:pl-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="text-orange-400" size={20} />
                Địa chỉ & Giới thiệu
              </h3>

              <div className="space-y-4">

                <fieldset className="register-field border-none p-0 m-0 mb-4">
                  <label className="register-label">Tỉnh / Thành *</label>
                  <SearchableDropdown
                    options={provinces.map(p => ({ value: p.code, label: p.name }))}
                    value={selectedLocation.provinceCode}
                    onChange={handleProvinceChange}
                    placeholder="Chọn Tỉnh/Thành"
                    disabled={isLoading}
                    error={!!errors.province}
                  />
                </fieldset>

                <fieldset className="register-field border-none p-0 m-0 mb-4">
                  <label className="register-label">Quận / Huyện *</label>
                  <SearchableDropdown
                    options={districts.map(d => ({ value: d.code, label: d.name }))}
                    value={selectedLocation.districtCode}
                    onChange={handleDistrictChange}
                    placeholder="Chọn Quận/Huyện"
                    disabled={isLoading || !selectedLocation.provinceCode}
                    error={!!errors.district}
                  />
                </fieldset>
                
                <fieldset className="register-field border-none p-0 m-0 mb-4">
                  <label className="register-label">Phường / Xã *</label>
                  <SearchableDropdown
                    options={wards.map(w => ({ value: w.code, label: w.name }))}
                    value={selectedLocation.wardCode}
                    onChange={handleWardChange}
                    placeholder="Chọn Phường/Xã"
                    disabled={isLoading || !selectedLocation.districtCode}
                    error={!!errors.ward}
                  />
                </fieldset>
                
                <fieldset className="register-field border-none p-0 m-0">
                  <label className="register-label">Đường/Số nhà *</label>
                  <div className="input-with-icon">
                    <MapPin className="input-icon-left" size={16} />
                    <input type="text" name="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} placeholder="Chi tiết..." className={`register-input ${errors.address ? 'register-input-error' : ''}`} disabled={isLoading} />
                  </div>
                </fieldset>

                {(errors.province || errors.district || errors.ward || errors.address) && (
                  <p className="text-xs text-red-400 mt-1">Vui lòng nhập đầy đủ địa chỉ.</p>
                )}
              </div>
            </div>
          </div>

          {errors.form && (
            <div className="mt-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm">{errors.form}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center border-t border-gray-700/50 pt-6">
            <button 
              type="submit" 
              disabled={isLoading || isSendingOTP}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-900/50 flex items-center gap-2 w-full max-w-sm justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={20} /> ĐANG XỬ LÝ...</> : 'TẠO CỬA HÀNG & ĐĂNG KÝ'}
            </button>
            <p className="mt-4 text-gray-400 text-sm">
              Bạn chỉ muốn mua hàng? <Link to={PATHS.AUTH.REGISTER} className="text-orange-400 hover:text-orange-300 hover:underline">Đăng ký khách hàng</Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
};

export default RegisterSeller;

import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, CheckCircle2, Eye, EyeOff, FileText, Store, User } from 'lucide-react';
import api from '../../services/api';
import { type Shop } from '../../pages/admin/ShopManagement';
import { uploadDocument } from '../../services/upload.service';
import SearchableDropdown from '../SearchableDropdown';
import { getProvinces, getDistricts, getWards, type Province, type District, type Ward } from '../../services/location.service';

interface CreateShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shop?: Shop | null;
}

const CreateShopModal: React.FC<CreateShopModalProps> = ({ isOpen, onClose, onSuccess, shop }) => {
  const isEditMode = !!shop;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    shopName: '',
    description: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    shopPhone: '',
    shopType: '1',
    taxCode: '',
    licensePdf: ''
  });

  const [selectedLocation, setSelectedLocation] = useState({
    provinceCode: 0,
    districtCode: 0,
    wardCode: 0
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      getProvinces().then(setProvinces);

      if (shop) {
        setFormData({
          username: shop.TenDangNhap || '',
          password: '',
          confirmPassword: '',
          email: shop.Email || '',
          fullName: shop.TenNguoiBan || '',
          shopName: shop.TenCuaHang,
          description: shop.MoTa || '',
          address: shop.DiaChi,
          ward: shop.PhuongXa,
          district: shop.QuanHuyen,
          province: shop.TinhThanh,
          shopPhone: shop.SoDienThoai,
          shopType: shop.LoaiHinhCuaHang.toString(),
          taxCode: shop.MaSoThue,
          licensePdf: shop.PdfGiayPhep || ''
        });
      } else {
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
          fullName: '',
          shopName: '',
          description: '',
          address: '',
          ward: '',
          district: '',
          province: '',
          shopPhone: '',
          shopType: '1',
          taxCode: '',
          licensePdf: ''
        });
        setSelectedFile(null);
      }
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError('');
    }
  }, [isOpen, shop]);

  const handleProvinceChange = async (val: string | number) => {
    const provinceCode = Number(val);
    const provinceName = provinces.find(p => p.code === provinceCode)?.name || '';
    setFormData(prev => ({ ...prev, province: provinceName, district: '', ward: '' }));
    setSelectedLocation(prev => ({ ...prev, provinceCode, districtCode: 0, wardCode: 0 }));
    setDistricts([]);
    setWards([]);
    if (provinceCode) {
      const dists = await getDistricts(provinceCode);
      setDistricts(dists);
    }
  };

  const handleDistrictChange = async (val: string | number) => {
    const districtCode = Number(val);
    const districtName = districts.find(d => d.code === districtCode)?.name || '';
    setFormData(prev => ({ ...prev, district: districtName, ward: '' }));
    setSelectedLocation(prev => ({ ...prev, districtCode, wardCode: 0 }));
    setWards([]);
    if (districtCode) {
      const ws = await getWards(districtCode);
      setWards(ws);
    }
  };

  const handleWardChange = (val: string | number) => {
    const wardCode = Number(val);
    const wardName = wards.find(w => w.code === wardCode)?.name || '';
    setFormData(prev => ({ ...prev, ward: wardName }));
    setSelectedLocation(prev => ({ ...prev, wardCode }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setFormData(prev => ({ ...prev, licensePdf: URL.createObjectURL(file) }));
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
      
      let finalLicensePdfUrl = formData.licensePdf;
      if (selectedFile) {
        setIsUploading(true);
        const uploadRes = await uploadDocument(selectedFile);
        if (uploadRes.success && uploadRes.url) {
          finalLicensePdfUrl = uploadRes.url;
        } else {
          setError(uploadRes.message || 'Tải file lên thất bại.');
          setLoading(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      if (isEditMode && shop) {
        const payload = {
          TenCuaHang: formData.shopName,
          MoTa: formData.description,
          DiaChi: formData.address,
          PhuongXa: formData.ward,
          QuanHuyen: formData.district,
          TinhThanh: formData.province,
          SoDienThoai: formData.shopPhone,
          LoaiHinhCuaHang: parseInt(formData.shopType),
          MaSoThue: formData.taxCode,
          PdfGiayPhep: finalLicensePdfUrl
        };
        const response = await api.put(`/shops/${shop.MaCuaHang}`, payload);
        if (response.data.success) {
          onSuccess();
          onClose();
        }
      } else {
        const payload = {
          ...formData,
          shopType: parseInt(formData.shopType),
          licensePdf: finalLicensePdfUrl
        };
        const response = await api.post('/shops', payload);
        if (response.data.success) {
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'tạo'} cửa hàng.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-default rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-border-default">
          <h3 className="text-xl font-semibold text-text-main flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            {isEditMode ? 'Chỉnh sửa cửa hàng' : 'Thêm mới cửa hàng & Người dùng'}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="shop-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {!isEditMode && (
              <div>
                <h4 className="text-lg font-medium text-text-main mb-3 border-b border-border-default pb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Thông tin tài khoản
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-text-muted mb-1">Họ tên *</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted" placeholder="Họ và tên" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-text-muted mb-1">Tên đăng nhập *</label>
                    <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted" placeholder="Tên đăng nhập" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-muted mb-1">Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted" placeholder="Email liên hệ" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-text-muted mb-1">Mật khẩu *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted pr-10" placeholder="Mật khẩu" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-text-muted mb-1">Xác nhận mật khẩu *</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted pr-10" placeholder="Nhập lại mật khẩu" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-lg font-medium text-text-main mb-3 border-b border-border-default pb-2 flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Thông tin cửa hàng
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Tên cửa hàng *</label>
                  <input type="text" name="shopName" required value={formData.shopName} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted" placeholder="Ví dụ: ZenTek Store" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Loại hình kinh doanh *</label>
                  <select name="shopType" required value={formData.shopType} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option value="1">Cá nhân</option>
                    <option value="2">Hộ kinh doanh</option>
                    <option value="3">Doanh nghiệp</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Số điện thoại *</label>
                  <input type="text" name="shopPhone" required value={formData.shopPhone} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted" placeholder="SĐT liên hệ shop" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Mã số thuế {formData.shopType !== '1' && '*'}</label>
                  <input type="text" name="taxCode" required={formData.shopType !== '1'} disabled={isEditMode} value={formData.taxCode} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Mã số thuế" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Tỉnh / Thành phố *</label>
                  {isEditMode ? (
                    <input type="text" name="province" required value={formData.province} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all" />
                  ) : (
                    <SearchableDropdown options={provinces.map(p => ({ value: p.code, label: p.name }))} value={selectedLocation.provinceCode} onChange={handleProvinceChange} placeholder="Chọn Tỉnh/Thành" theme="admin" />
                  )}
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Quận / Huyện *</label>
                  {isEditMode ? (
                    <input type="text" name="district" required value={formData.district} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all" />
                  ) : (
                    <SearchableDropdown options={districts.map(d => ({ value: d.code, label: d.name }))} value={selectedLocation.districtCode} onChange={handleDistrictChange} placeholder="Chọn Quận/Huyện" disabled={!formData.province} theme="admin" />
                  )}
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Phường / Xã *</label>
                  {isEditMode ? (
                    <input type="text" name="ward" required value={formData.ward} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all" />
                  ) : (
                    <SearchableDropdown options={wards.map(w => ({ value: w.code, label: w.name }))} value={selectedLocation.wardCode} onChange={handleWardChange} placeholder="Chọn Phường/Xã" disabled={!formData.district} theme="admin" />
                  )}
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-text-muted mb-1">Địa chỉ chi tiết *</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted" placeholder="Số nhà, đường phố" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-muted mb-1">Giấy phép kinh doanh (PDF/DOC) {!isEditMode && '*'}</label>
                  <div className="flex items-center gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-all ${
                      formData.licensePdf ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-border-default bg-surface hover:bg-surface-muted text-text-muted'
                    }`}>
                      {isUploading ? (
                        <><Loader2 size={16} className="animate-spin" /> Đang tải lên...</>
                      ) : formData.licensePdf ? (
                        <><CheckCircle2 size={16} /> Đã chọn file ({selectedFile?.name || 'Đã có file đính kèm'})</>
                      ) : (
                        <><Upload size={16} /> Chọn File Tải Lên</>
                      )}
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={isUploading || loading} />
                    </label>
                  </div>
                  {formData.licensePdf && (
                    <div className="mt-2 text-right">
                      <a 
                        href={formData.licensePdf.startsWith('http') || formData.licensePdf.startsWith('blob:') ? formData.licensePdf : `http://localhost:5000${formData.licensePdf}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FileText size={14} /> Xem giấy phép
                      </a>
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-muted mb-1">Mô tả cửa hàng</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-muted" placeholder="Mô tả về ngành hàng kinh doanh..." rows={3} />
                </div>
              </div>
            </div>

            {error && <p className="text-danger text-sm mt-2">{error}</p>}

          </form>
        </div>

        <div className="p-5 border-t border-border-default flex justify-end gap-3 bg-surface-muted/30">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg font-medium text-sm border border-border-default hover:bg-surface text-text-body transition-colors">
            Hủy
          </button>
          <button type="submit" form="shop-form" disabled={loading} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center min-w-[100px]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditMode ? 'Lưu thay đổi' : 'Tạo mới')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShopModal;

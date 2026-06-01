import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Info, Truck } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';

// --- Mock dữ liệu địa chỉ (cascade) ---
interface Province { code: string; name: string; }
interface District { code: string; name: string; provinceCode: string; }
interface Ward { code: string; name: string; districtCode: string; }

const mockProvinces: Province[] = [
  { code: '01', name: 'Thành phố Hà Nội' },
  { code: '02', name: 'Thành phố Hồ Chí Minh' },
  { code: '03', name: 'Đà Nẵng' },
];
const mockDistricts: District[] = [
  { code: '001', name: 'Quận Ba Đình', provinceCode: '01' },
  { code: '002', name: 'Quận Hoàn Kiếm', provinceCode: '01' },
  { code: '003', name: 'Quận 1', provinceCode: '02' },
  { code: '004', name: 'Quận 2', provinceCode: '02' },
  { code: '005', name: 'Quận Hải Châu', provinceCode: '03' },
];
const mockWards: Ward[] = [
  { code: '0001', name: 'Phường Phúc Xá', districtCode: '001' },
  { code: '0002', name: 'Phường Trúc Bạch', districtCode: '001' },
  { code: '0003', name: 'Phường Hàng Bạc', districtCode: '002' },
  { code: '0004', name: 'Phường Bến Nghé', districtCode: '003' },
  { code: '0005', name: 'Phường Thảo Điền', districtCode: '004' },
  { code: '0006', name: 'Phường Hòa Thuận Tây', districtCode: '005' },
];

// --- Mock sản phẩm trong giỏ ---
interface CartItem {
  maChiTietGioHang: string;
  sanPhamId: string;
  tenSanPham: string;
  anh: string;
  phanLoai?: string;
  donGia: number;
  soLuong: number;
  tonKho: number;
  daHetHang: boolean;
}

const mockCartItems: CartItem[] = [
  {
    maChiTietGioHang: 'ct1',
    sanPhamId: 'sp1',
    tenSanPham: 'Áo thun nam cổ tròn',
    anh: 'https://picsum.photos/id/1/80/80',
    phanLoai: 'M, Đen',
    donGia: 150000,
    soLuong: 2,
    tonKho: 10,
    daHetHang: false,
  },
  {
    maChiTietGioHang: 'ct2',
    sanPhamId: 'sp2',
    tenSanPham: 'Quần jean rách gối',
    anh: 'https://picsum.photos/id/2/80/80',
    phanLoai: 'Size L, Xanh',
    donGia: 350000,
    soLuong: 1,
    tonKho: 5,
    daHetHang: false,
  },
];

const mockUser = {
  hoTen: 'Trần Thị Bích',
  soDienThoai: '0912345678',
  // Không có email
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [userInfo, setUserInfo] = useState({ hoTen: '', soDienThoai: '' }); // Không có email
  const [address, setAddress] = useState({
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    detail: '',
  });
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.donGia * item.soLuong, 0);
  const total = subtotal;

  const fetchCheckoutData = useCallback(async () => {
    setLoadingCart(true);
    console.log('[API Giả lập] GET /api/cart/checkout-data');
    await new Promise(resolve => setTimeout(resolve, 800));
    setCartItems(mockCartItems.filter(item => !item.daHetHang));
    setUserInfo({
      hoTen: mockUser.hoTen,
      soDienThoai: mockUser.soDienThoai,
    });
    setLoadingCart(false);
  }, []);

  const fetchProvinces = useCallback(async () => {
    console.log('[API Giả lập] GET /api/provinces');
    await new Promise(resolve => setTimeout(resolve, 300));
    setProvinces(mockProvinces);
  }, []);

  useEffect(() => {
    fetchCheckoutData();
    fetchProvinces();
  }, [fetchCheckoutData, fetchProvinces]);

  useEffect(() => {
    if (!address.provinceCode) {
      setDistricts([]);
      setAddress(prev => ({ ...prev, districtCode: '', wardCode: '' }));
      return;
    }
    const loadDistricts = async () => {
      setLoadingDistricts(true);
      console.log(`[API Giả lập] GET /api/districts?provinceId=${address.provinceCode}`);
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = mockDistricts.filter(d => d.provinceCode === address.provinceCode);
      setDistricts(filtered);
      setAddress(prev => ({ ...prev, districtCode: '', wardCode: '' }));
      setLoadingDistricts(false);
    };
    loadDistricts();
  }, [address.provinceCode]);

  useEffect(() => {
    if (!address.districtCode) {
      setWards([]);
      setAddress(prev => ({ ...prev, wardCode: '' }));
      return;
    }
    const loadWards = async () => {
      setLoadingWards(true);
      console.log(`[API Giả lập] GET /api/wards?districtId=${address.districtCode}`);
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = mockWards.filter(w => w.districtCode === address.districtCode);
      setWards(filtered);
      setAddress(prev => ({ ...prev, wardCode: '' }));
      setLoadingWards(false);
    };
    loadWards();
  }, [address.districtCode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!userInfo.hoTen.trim()) newErrors.hoTen = 'Họ tên không được để trống';
    if (!userInfo.soDienThoai.trim()) newErrors.soDienThoai = 'Số điện thoại không được để trống';
    else if (!/^\d{10}$/.test(userInfo.soDienThoai)) newErrors.soDienThoai = 'Số điện thoại phải gồm 10 chữ số';
    if (!address.provinceCode) newErrors.province = 'Vui lòng chọn tỉnh/thành';
    if (!address.districtCode) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!address.wardCode) newErrors.ward = 'Vui lòng chọn phường/xã';
    if (!address.detail.trim()) newErrors.detail = 'Địa chỉ cụ thể không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFullAddress = () => {
    const province = provinces.find(p => p.code === address.provinceCode)?.name || '';
    const district = districts.find(d => d.code === address.districtCode)?.name || '';
    const ward = wards.find(w => w.code === address.wardCode)?.name || '';
    return `${address.detail}, ${ward}, ${district}, ${province}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    console.log('[API Giả lập] POST /api/orders', {
      hoTen: userInfo.hoTen,
      soDienThoai: userInfo.soDienThoai,
      // Không gửi email
      diaChi: getFullAddress(),
      ghiChu: note,
      phuongThucThanhToan: 'COD',
      items: cartItems.map(item => ({
        sanPhamId: item.sanPhamId,
        soLuong: item.soLuong,
        donGia: item.donGia,
        phanLoai: item.phanLoai,
      })),
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockOrderId = 'DH' + Math.floor(Math.random() * 10000);
    setCreatedOrderId(mockOrderId);
    setSubmitting(false);
    setShowSuccessModal(true);
  };

  const handleViewOrder = () => {
    console.log(`[Tương tác] Xem chi tiết đơn hàng ${createdOrderId}`);
    navigate(PATHS.Buyer.HOA_DON_BAN_HANG.replace(':orderId', createdOrderId));
  };

  const handleContinueShopping = () => {
    console.log('[Tương tác] Tiếp tục mua sắm');
    navigate('/');
  };

  if (!loadingCart && cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container text-center py-16">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold">Giỏ hàng trống hoặc có sản phẩm hết hàng</h2>
          <button onClick={() => navigate('/cart')} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1 className="checkout-title">Thanh toán</h1>
          <div className="shipping-note-badge">
            <Truck size={14} /> Vận chuyển bởi đối tác bên ngoài
          </div>
        </div>

        <div className="checkout-layout">
          {/* Cột trái: PHIẾU ĐẶT HÀNG - dạng tờ thư */}
          <div className="checkout-form-col">
            <div className="order-slip">
              <div className="slip-header">
                <div className="slip-icon">📋</div>
                <div className="slip-title">PHIẾU THÔNG TIN GIAO HÀNG</div>
                <div className="slip-sub">Vui lòng điền đầy đủ thông tin bên dưới</div>
              </div>

              <form onSubmit={handleSubmit} className="slip-form">
                <div className="form-section">
                  <h3>Người nhận</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Họ và tên *</label>
                      <input
                        type="text"
                        value={userInfo.hoTen}
                        onChange={e => setUserInfo({ ...userInfo, hoTen: e.target.value })}
                        placeholder="Nhập họ tên"
                      />
                      {errors.hoTen && <span className="error">{errors.hoTen}</span>}
                    </div>
                    <div className="form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        value={userInfo.soDienThoai}
                        onChange={e => setUserInfo({ ...userInfo, soDienThoai: e.target.value })}
                        placeholder="0912345678"
                      />
                      {errors.soDienThoai && <span className="error">{errors.soDienThoai}</span>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Địa chỉ nhận hàng</h3>
                  <div className="form-row three-col">
                    <div className="form-group">
                      <label>Tỉnh/Thành *</label>
                      <select
                        value={address.provinceCode}
                        onChange={e => setAddress({ ...address, provinceCode: e.target.value })}
                      >
                        <option value="">-- Chọn --</option>
                        {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                      </select>
                      {errors.province && <span className="error">{errors.province}</span>}
                    </div>
                    <div className="form-group">
                      <label>Quận/Huyện *</label>
                      <select
                        value={address.districtCode}
                        onChange={e => setAddress({ ...address, districtCode: e.target.value })}
                        disabled={!address.provinceCode || loadingDistricts}
                      >
                        <option value="">-- Chọn --</option>
                        {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                      </select>
                      {errors.district && <span className="error">{errors.district}</span>}
                    </div>
                    <div className="form-group">
                      <label>Phường/Xã *</label>
                      <select
                        value={address.wardCode}
                        onChange={e => setAddress({ ...address, wardCode: e.target.value })}
                        disabled={!address.districtCode || loadingWards}
                      >
                        <option value="">-- Chọn --</option>
                        {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                      </select>
                      {errors.ward && <span className="error">{errors.ward}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ cụ thể (số nhà, đường) *</label>
                    <input
                      type="text"
                      value={address.detail}
                      onChange={e => setAddress({ ...address, detail: e.target.value })}
                      placeholder="Ví dụ: 123 Đường ABC"
                    />
                    {errors.detail && <span className="error">{errors.detail}</span>}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Ghi chú (không bắt buộc)</h3>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Ghi chú về thời gian, địa điểm giao hàng..."
                  />
                </div>

                <div className="shipping-notice">
                  <Info size={16} />
                  <span>Đơn hàng sẽ được giao bởi đối tác vận chuyển bên ngoài (GHN, GHTK, Viettel Post,...). Phí vận chuyển sẽ được tính dựa trên khoảng cách và khối lượng, bạn sẽ thanh toán trực tiếp cho nhân viên giao hàng.</span>
                </div>

                <button type="submit" disabled={submitting} className="submit-btn">
                  {submitting ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
                </button>
              </form>

              <div className="slip-footer">
                * Bằng việc đặt hàng, bạn đồng ý với điều khoản giao hàng của ZenTekExchange
              </div>
            </div>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng dạng thẻ */}
          <div className="checkout-summary-col">
            <div className="order-summary-card">
              <h3>Đơn hàng của bạn</h3>
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.maChiTietGioHang} className="summary-item">
                    <img src={item.anh} alt={item.tenSanPham} />
                    <div className="summary-item-info">
                      <div className="summary-item-name">{item.tenSanPham}</div>
                      {item.phanLoai && <div className="summary-item-variant">{item.phanLoai}</div>}
                      <div className="summary-item-price">x{item.soLuong} · {item.donGia.toLocaleString()}đ</div>
                    </div>
                    <div className="summary-item-total">{(item.donGia * item.soLuong).toLocaleString()}đ</div>
                  </div>
                ))}
              </div>
              <div className="summary-total-line">
                <span>Tổng tiền hàng:</span>
                <span>{subtotal.toLocaleString()}đ</span>
              </div>
              <div className="summary-shipping-note">
                <Truck size={14} /> Phí vận chuyển: Tính theo bưu cục khi giao hàng
              </div>
              <div className="summary-grand-total">
                <span>Tổng cộng:</span>
                <span className="grand-total">{total.toLocaleString()}đ</span>
              </div>
              <div className="cod-badge">Thanh toán khi nhận hàng (COD)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal thành công */}
      {showSuccessModal && (
        <div className="checkout-modal-overlay" onClick={() => {}}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-green-500 text-5xl mb-3">✓</div>
              <h3 className="text-xl font-bold mb-2">Đặt hàng thành công!</h3>
              <p className="text-gray-600 mb-4">Mã đơn hàng: <strong>{createdOrderId}</strong></p>
              <p className="text-sm text-gray-500 mb-6">Cảm ơn bạn đã mua sắm tại ZenTekExchange</p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleViewOrder} className="px-4 py-2 bg-primary text-white rounded-lg">Xem đơn hàng</button>
                <button onClick={handleContinueShopping} className="px-4 py-2 border border-gray-300 rounded-lg">Tiếp tục mua sắm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
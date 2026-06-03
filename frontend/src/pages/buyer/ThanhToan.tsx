import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Info, Truck } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';
import { getProvinces, getDistricts, getWards, type Province, type District, type Ward } from '../../services/location.service';
import SearchableDropdown from '../../components/SearchableDropdown';
import { orderService, type OrderItem } from '../../services/order.service';
import { storage } from '../../utils/storage.utils';
import { getProductImageUrl, getStoreLogoUrl } from '../../utils/image.utils';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tempOrderId = new URLSearchParams(location.search).get('tempOrderId') || '';

  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [userInfo, setUserInfo] = useState(() => {
    const user = storage.getUser();
    return {
      hoTen: user?.fullName || '',
      soDienThoai: user?.phone || ''
    };
  });
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
  const [createdOrderIds, setCreatedOrderIds] = useState<string[]>([]);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.donGia * item.soLuong, 0);
  const total = subtotal;

  // Group cart items by shop/store
  const groupedItems = useMemo(() => {
    const groups: Record<string, { shopName: string; shopLogo: string | null; items: OrderItem[] }> = {};
    cartItems.forEach(item => {
      const shopKey = item.tenCuaHang || 'Cửa hàng';
      if (!groups[shopKey]) {
        groups[shopKey] = {
          shopName: shopKey,
          shopLogo: item.logoCuaHang || null,
          items: []
        };
      }
      groups[shopKey].items.push(item);
    });
    return Object.values(groups);
  }, [cartItems]);

  const fetchCheckoutData = useCallback(async () => {
    if (!tempOrderId) {
      setLoadingCart(false);
      alert('Không tìm thấy mã đơn hàng tạm.');
      navigate(PATHS.Buyer.CART);
      return;
    }
    try {
      setLoadingCart(true);
      const res = await orderService.getTempOrder(tempOrderId);
      if (res.success) {
        setCartItems(res.data.items);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Đơn hàng tạm không tồn tại hoặc đã hết hạn.');
      navigate(PATHS.Buyer.CART);
    } finally {
      setLoadingCart(false);
    }
  }, [tempOrderId, navigate]);

  const fetchProvinces = useCallback(async () => {
    const data = await getProvinces();
    setProvinces(data as any[]);
  }, []);

  useEffect(() => {
    fetchCheckoutData();
    fetchProvinces();
  }, [fetchCheckoutData, fetchProvinces]);

  const handleProvinceChange = async (val: string | number) => {
    const provinceCode = Number(val);
    setAddress(prev => ({ ...prev, provinceCode: String(provinceCode), districtCode: '', wardCode: '' }));
    setDistricts([]);
    setWards([]);
    if (provinceCode) {
      setLoadingWards(true);
      const fetchedDistricts = await getDistricts(provinceCode);
      setDistricts(fetchedDistricts);
      setLoadingWards(false);
    }
  };

  const handleDistrictChange = async (val: string | number) => {
    const districtCode = Number(val);
    setAddress(prev => ({ ...prev, districtCode: String(districtCode), wardCode: '' }));
    setWards([]);
    if (districtCode) {
      setLoadingWards(true);
      const fetchedWards = await getWards(districtCode);
      setWards(fetchedWards);
      setLoadingWards(false);
    }
  };

  const handleWardChange = (val: string | number) => {
    const wardCode = Number(val);
    setAddress(prev => ({ ...prev, wardCode: String(wardCode) }));
  };

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
    const province = provinces.find(p => String(p.code) === address.provinceCode)?.name || '';
    const district = districts.find(d => String(d.code) === address.districtCode)?.name || '';
    const ward = wards.find(w => String(w.code) === address.wardCode)?.name || '';
    return `${address.detail}, ${ward}, ${district}, ${province}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!tempOrderId) {
      alert('Không tìm thấy mã đơn hàng tạm.');
      return;
    }
    setSubmitting(true);
    try {
      const orderParams = {
        tempOrderId,
        hoTenNguoiNhan: userInfo.hoTen,
        soDienThoaiNguoiNhan: userInfo.soDienThoai,
        diaChiNhan: getFullAddress(),
        ghiChu: note,
        items: cartItems.map(item => ({
          sanPhamId: item.sanPhamId,
          phanLoaiId: item.phanLoaiId,
          soLuong: item.soLuong
        }))
      };

      const res = await orderService.placeOrder(orderParams);
      if (res.success && res.data?.MaDonHang) {
        const orderIds = res.data.maDonHangs || [res.data.MaDonHang];
        setCreatedOrderIds(orderIds);
        setCreatedOrderId(res.data.MaDonHang);
        setShowSuccessModal(true);
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewOrder = () => {
    if (createdOrderIds.length > 1) {
      console.log(`[Tương tác] Xem danh sách đơn hàng (${createdOrderIds.length} đơn)`);
      navigate(PATHS.Buyer.ORDERS);
    } else {
      console.log(`[Tương tác] Xem chi tiết đơn hàng ${createdOrderId}`);
      navigate(PATHS.Buyer.HOA_DON_BAN_HANG.replace(':orderId', createdOrderId));
    }
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
                      <SearchableDropdown
                        theme="admin"
                        options={provinces.map(p => ({ value: p.code, label: p.name }))}
                        value={address.provinceCode}
                        onChange={handleProvinceChange}
                        placeholder="Chọn Tỉnh/Thành"
                      />
                      {errors.province && <span className="error">{errors.province}</span>}
                    </div>
                    <div className="form-group">
                      <label>Quận/Huyện *</label>
                      <SearchableDropdown
                        theme="admin"
                        options={districts.map(d => ({ value: d.code, label: d.name }))}
                        value={address.districtCode}
                        onChange={handleDistrictChange}
                        placeholder="Chọn Quận/Huyện"
                        disabled={!address.provinceCode}
                      />
                      {errors.district && <span className="error">{errors.district}</span>}
                    </div>
                    <div className="form-group">
                      <label>Phường/Xã *</label>
                      <SearchableDropdown
                        theme="admin"
                        options={wards.map(w => ({ value: w.code, label: w.name }))}
                        value={address.wardCode}
                        onChange={handleWardChange}
                        placeholder="Chọn Phường/Xã"
                        disabled={!address.districtCode || loadingWards}
                      />
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
                {groupedItems.map((group, groupIdx) => (
                  <div key={groupIdx} className="summary-shop-group">
                    <div className="summary-shop-header">
                      {group.shopLogo ? (
                        <img src={getStoreLogoUrl(group.shopLogo)} alt={group.shopName} className="summary-shop-logo" />
                      ) : (
                        <div className="summary-shop-icon-fallback">
                          {group.shopName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{group.shopName}</span>
                    </div>
                    <div className="summary-shop-divider" />
                    
                    {group.items.map(item => (
                      <div key={item.sanPhamId + '_' + (item.phanLoaiId || '')} className="summary-item">
                        <img src={getProductImageUrl(item.anh)} alt={item.tenSanPham} />
                        <div className="summary-item-info">
                          <div className="summary-item-name">{item.tenSanPham}</div>
                          {item.phanLoai && <div className="summary-item-variant">{item.phanLoai}</div>}
                          <div className="summary-item-price">x{item.soLuong} · {item.donGia.toLocaleString()}đ</div>
                        </div>
                        <div className="summary-item-total">{(item.donGia * item.soLuong).toLocaleString()}đ</div>
                      </div>
                    ))}
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
              {createdOrderIds.length > 1 ? (
                <>
                  <p className="text-gray-600 mb-2 text-sm">
                    Đơn hàng của bạn đã được tự động tách thành <strong>{createdOrderIds.length} đơn hàng</strong> riêng biệt theo từng shop:
                  </p>
                  <p className="text-gray-800 font-semibold mb-4 text-xs bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                    {createdOrderIds.join(', ')}
                  </p>
                </>
              ) : (
                <p className="text-gray-600 mb-4 text-sm">Mã đơn hàng: <strong>{createdOrderId}</strong></p>
              )}
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
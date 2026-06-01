import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';

interface CartItem {
  maChiTietGioHang: string;
  sanPhamId: string;
  tenSanPham: string;
  anh: string;
  phanLoai?: string;
  tenCuaHang: string;
  donGia: number;
  soLuong: number;
  tonKho: number;
  daHetHang: boolean;
}

// Mock data (giữ nguyên)
const mockCartItems: CartItem[] = [
  {
    maChiTietGioHang: 'ct1',
    sanPhamId: 'sp1',
    tenSanPham: 'Áo thun nam cổ tròn',
    anh: 'https://picsum.photos/id/1/100/100',
    phanLoai: 'M, Đen',
    tenCuaHang: 'Fashion Store',
    donGia: 150000,
    soLuong: 2,
    tonKho: 10,
    daHetHang: false,
  },
  {
    maChiTietGioHang: 'ct2',
    sanPhamId: 'sp2',
    tenSanPham: 'Quần jean rách gối',
    anh: 'https://picsum.photos/id/2/100/100',
    phanLoai: 'Size L, Xanh',
    tenCuaHang: 'Denim Shop',
    donGia: 350000,
    soLuong: 1,
    tonKho: 5,
    daHetHang: false,
  },
  {
    maChiTietGioHang: 'ct3',
    sanPhamId: 'sp3',
    tenSanPham: 'Giày thể thao',
    anh: 'https://picsum.photos/id/3/100/100',
    phanLoai: 'Size 42',
    tenCuaHang: 'Sport Store',
    donGia: 890000,
    soLuong: 1,
    tonKho: 0,
    daHetHang: true,
  },
];

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lấy giỏ hàng
  const fetchCart = useCallback(async () => {
    setLoading(true);
    console.log('[API Giả lập] GET /api/cart');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const stored = localStorage.getItem('cart_items');
    let cartList = stored ? JSON.parse(stored) : [];
    if (cartList.length === 0) {
      cartList = mockCartItems;
      localStorage.setItem('cart_items', JSON.stringify(cartList));
    }

    setItems(cartList);
    // Mặc định chọn tất cả sản phẩm còn hàng
    const initialSelected = new Set(
      cartList.filter((item: any) => !item.daHetHang).map((item: any) => item.maChiTietGioHang)
    );
    setSelectedIds(initialSelected as Set<string>);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Cập nhật số lượng
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    const item = items.find(i => i.maChiTietGioHang === itemId);
    if (!item) return;
    if (newQuantity < 1) return;
    if (newQuantity > item.tonKho && !item.daHetHang) {
      setError(`Số lượng vượt quá tồn kho (${item.tonKho})`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    setUpdatingItemId(itemId);
    console.log(`[API Giả lập] PUT /api/cart/update`, { itemId, newQuantity });
    await new Promise(resolve => setTimeout(resolve, 500));
    const updated = items.map(i =>
      i.maChiTietGioHang === itemId ? { ...i, soLuong: newQuantity } : i
    );
    setItems(updated);
    localStorage.setItem('cart_items', JSON.stringify(updated));
    setUpdatingItemId(null);
  };

  // Xóa sản phẩm
  const removeItem = async (itemId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    console.log(`[API Giả lập] DELETE /api/cart/remove/${itemId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newItems = items.filter(i => i.maChiTietGioHang !== itemId);
    setItems(newItems);
    localStorage.setItem('cart_items', JSON.stringify(newItems));
    const newSelected = new Set(selectedIds);
    newSelected.delete(itemId);
    setSelectedIds(newSelected);
    alert('Đã xóa sản phẩm');
  };

  // Chọn / bỏ chọn một sản phẩm
  const toggleSelect = (itemId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    setSelectedIds(newSelected);
  };

  // Chọn tất cả sản phẩm còn hàng
  const toggleSelectAll = () => {
    const availableIds = items.filter(item => !item.daHetHang).map(item => item.maChiTietGioHang);
    if (selectedIds.size === availableIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableIds));
    }
  };

  // Tính tổng tiền dựa trên các sản phẩm được chọn
  const selectedItems = items.filter(item => selectedIds.has(item.maChiTietGioHang) && !item.daHetHang);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.donGia * item.soLuong, 0);
  const total = subtotal; // chưa tính phí ship

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    console.log('[Tương tác] Tiến hành thanh toán với các sản phẩm:', selectedItems.map(i => i.maChiTietGioHang));
    navigate(PATHS.Buyer.CHECKOUT, { state: { selectedIds: Array.from(selectedIds) } });
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-skeleton">Đang tải giỏ hàng...</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty">
            <ShoppingBag size={64} />
            <h2>Giỏ hàng của bạn đang trống</h2>
            <Link to="/" className="btn-primary">Mua sắm ngay</Link>
          </div>
        </div>
      </div>
    );
  }

  const availableCount = items.filter(i => !i.daHetHang).length;
  const isAllSelected = availableCount > 0 && selectedIds.size === availableCount;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-layout">
          {/* Cột trái: Danh sách sản phẩm dạng bảng */}
          <div className="cart-items-col">
            {/* Header bảng */}
            <div className="cart-table-header">
              <div className="cart-col-select">
                <label className="checkbox-label">
                  <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
                  <span>Chọn tất cả ({availableCount})</span>
                </label>
              </div>
              <div className="cart-col-product">Sản phẩm</div>
              <div className="cart-col-price">Đơn giá</div>
              <div className="cart-col-quantity">Số lượng</div>
              <div className="cart-col-total">Thành tiền</div>
              <div className="cart-col-action"></div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="cart-items-list">
              {items.map(item => {
                const isSelected = selectedIds.has(item.maChiTietGioHang);
                const isOutOfStock = item.daHetHang || item.tonKho === 0;
                const isUpdating = updatingItemId === item.maChiTietGioHang;
                return (
                  <div key={item.maChiTietGioHang} className={`cart-row ${isOutOfStock ? 'row-out-of-stock' : ''}`}>
                    <div className="cart-col-select">
                      <input
                        type="checkbox"
                        checked={isSelected && !isOutOfStock}
                        onChange={() => toggleSelect(item.maChiTietGioHang)}
                        disabled={isOutOfStock}
                      />
                    </div>
                    <div className="cart-col-product">
                      <img src={item.anh} alt={item.tenSanPham} className="cart-product-img" />
                      <div className="cart-product-info">
                        <Link to={`/san-pham/${item.sanPhamId}`} className="cart-product-name">
                          {item.tenSanPham}
                        </Link>
                        {item.phanLoai && <div className="cart-product-variant">Phân loại: {item.phanLoai}</div>}
                        <div className="cart-product-store">{item.tenCuaHang}</div>
                        {isOutOfStock && <div className="cart-outofstock-badge">Hết hàng</div>}
                      </div>
                    </div>
                    <div className="cart-col-price">{item.donGia.toLocaleString()}đ</div>
                    <div className="cart-col-quantity">
                      <div className="quantity-control">
                        <button
                          onClick={() => updateQuantity(item.maChiTietGioHang, item.soLuong - 1)}
                          disabled={isUpdating || item.soLuong <= 1 || isOutOfStock}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.soLuong}</span>
                        <button
                          onClick={() => updateQuantity(item.maChiTietGioHang, item.soLuong + 1)}
                          disabled={isUpdating || isOutOfStock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-col-total">{(item.donGia * item.soLuong).toLocaleString()}đ</div>
                    <div className="cart-col-action">
                      <button onClick={() => removeItem(item.maChiTietGioHang)} disabled={isUpdating}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-continue">
              <Link to="/" className="btn-continue">
                <ArrowLeft size={16} /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="cart-summary-col">
            <div className="cart-summary-card">
              <h3>Tóm tắt đơn hàng</h3>
              <div className="summary-row">
                <span>Tổng tiền sản phẩm:</span>
                <span>{subtotal.toLocaleString()}đ</span>
              </div>
              {/* PHẦN ĐÃ SỬA: Thêm lưu ý về phí vận chuyển */}
              <div className="summary-row shipping-note">
                <div className="flex items-start gap-1">
                  <span>Phí vận chuyển:</span>
                  <span className="inline-block w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs text-center leading-4 cursor-help"
                        title="ZenTekExchange sử dụng đơn vị vận chuyển bên thứ ba (GHN, GHTK, Viettel Post...). Phí sẽ được tính chính xác dựa trên khoảng cách và khối lượng khi bạn thanh toán.">
                    ?
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium">Tính sau</div>
                  <div className="text-xs text-gray-400">(Theo bảng giá vận chuyển)</div>
                </div>
              </div>
              <div className="summary-total">
                <span>Tổng cộng:</span>
                <span className="total-amount">{total.toLocaleString()}đ</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="btn-checkout"
              >
                Thanh toán ({selectedItems.length} sản phẩm)
              </button>
            </div>
          </div>
        </div>
      </div>
      {error && <div className="cart-toast-error">{error}</div>}
    </div>
  );
};

export default Cart;
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Truck, CheckCircle, XCircle, Package, ChevronRight, Search } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';
import { getUserFromStorage, isBuyer, isSeller } from '../../utils/role.utils';

// Định nghĩa kiểu dữ liệu
interface OrderItem {
  maSanPham: string;
  tenSanPham: string;
  anh: string;
  phanLoai?: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}

interface Order {
  maDonHang: string;
  ngayTao: string;
  trangThai: 'Chờ xử lý' | 'Đang giao' | 'Đã nhận' | 'Đã hủy';
  tongTien: number;
  items: OrderItem[];
  daDanhGia?: boolean;       // Buyer: đã đánh giá chưa
  shopId: string;            // ID shop bán hàng (dùng để lọc cho Seller)
  buyerId: string;           // ID người mua (dùng để lọc cho Buyer)
  daTraLoi?: boolean;        // Seller: đã trả lời đánh giá chưa
}

// Mock dữ liệu đơn hàng (có gắn shopId và buyerId)
// Mock dữ liệu đơn hàng mở rộng cho cả Buyer (buyer-001) và Seller (shop-001)
const mockOrders: Order[] = [
  // ========== ĐƠN CỦA SHOP-001 (seller hiện tại) ==========
  {
    maDonHang: 'DH001',
    ngayTao: '2025-03-20T10:30:00Z',
    trangThai: 'Chờ xử lý',
    tongTien: 450000,
    shopId: 'shop-001',
    buyerId: 'buyer-001',
    items: [
      { maSanPham: 'SP1', tenSanPham: 'Áo thun nam', anh: 'https://picsum.photos/id/1/100/100', phanLoai: 'M, Đen', soLuong: 2, donGia: 150000, thanhTien: 300000 },
      { maSanPham: 'SP2', tenSanPham: 'Quần jeans', anh: 'https://picsum.photos/id/2/100/100', phanLoai: 'L, Xanh', soLuong: 1, donGia: 150000, thanhTien: 150000 },
    ]
  },
  {
    maDonHang: 'DH002',
    ngayTao: '2025-03-18T14:20:00Z',
    trangThai: 'Đang giao',
    tongTien: 890000,
    shopId: 'shop-001',
    buyerId: 'buyer-001',
    items: [
      { maSanPham: 'SP3', tenSanPham: 'Giày thể thao', anh: 'https://picsum.photos/id/3/100/100', phanLoai: 'Size 42', soLuong: 1, donGia: 890000, thanhTien: 890000 }
    ]
  },
  {
    maDonHang: 'DH003',
    ngayTao: '2025-03-15T09:00:00Z',
    trangThai: 'Đã nhận',
    tongTien: 250000,
    shopId: 'shop-001',
    buyerId: 'buyer-001',
    items: [
      { maSanPham: 'SP4', tenSanPham: 'Mũ lưỡi trai', anh: 'https://picsum.photos/id/4/100/100', soLuong: 2, donGia: 125000, thanhTien: 250000 }
    ],
    daDanhGia: false,    // Buyer chưa đánh giá
    daTraLoi: false      // Seller chưa trả lời
  },
  {
    maDonHang: 'DH005',
    ngayTao: '2025-03-22T08:00:00Z',
    trangThai: 'Đã hủy',
    tongTien: 320000,
    shopId: 'shop-001',
    buyerId: 'buyer-001',
    items: [
      { maSanPham: 'SP6', tenSanPham: 'Áo sơ mi', anh: 'https://picsum.photos/id/6/100/100', soLuong: 1, donGia: 320000, thanhTien: 320000 }
    ]
  },
  {
    maDonHang: 'DH006',
    ngayTao: '2025-03-25T11:15:00Z',
    trangThai: 'Đã nhận',
    tongTien: 540000,
    shopId: 'shop-001',
    buyerId: 'buyer-002',   // Buyer khác, nhưng vẫn thuộc shop-001
    items: [
      { maSanPham: 'SP7', tenSanPham: 'Váy hoa', anh: 'https://picsum.photos/id/7/100/100', soLuong: 1, donGia: 540000, thanhTien: 540000 }
    ],
    daDanhGia: true,     // Đã đánh giá
    daTraLoi: false      // Seller chưa trả lời
  },
  {
    maDonHang: 'DH007',
    ngayTao: '2025-03-26T09:30:00Z',
    trangThai: 'Chờ xử lý',
    tongTien: 210000,
    shopId: 'shop-001',
    buyerId: 'buyer-003',
    items: [
      { maSanPham: 'SP8', tenSanPham: 'Quần short', anh: 'https://picsum.photos/id/8/100/100', soLuong: 3, donGia: 70000, thanhTien: 210000 }
    ]
  },

  // ========== ĐƠN CỦA SHOP KHÁC (không thuộc seller hiện tại, chỉ để test lọc) ==========
  {
    maDonHang: 'DH004',
    ngayTao: '2025-03-10T16:45:00Z',
    trangThai: 'Đã hủy',
    tongTien: 120000,
    shopId: 'shop-002',
    buyerId: 'buyer-001',  // Buyer-001 mua từ shop khác -> không hiển thị với seller shop-001, nhưng buyer-001 vẫn thấy
    items: [
      { maSanPham: 'SP5', tenSanPham: 'Balo', anh: 'https://picsum.photos/id/5/100/100', soLuong: 1, donGia: 120000, thanhTien: 120000 }
    ]
  },
  {
    maDonHang: 'DH008',
    ngayTao: '2025-03-27T14:00:00Z',
    trangThai: 'Đang giao',
    tongTien: 999000,
    shopId: 'shop-003',
    buyerId: 'buyer-001',
    items: [
      { maSanPham: 'SP9', tenSanPham: 'Điện thoại', anh: 'https://picsum.photos/id/9/100/100', soLuong: 1, donGia: 999000, thanhTien: 999000 }
    ]
  }
];

// Component hiển thị badge trạng thái
const StatusBadge: React.FC<{ status: Order['trangThai'] }> = ({ status }) => {
  const config = {
    'Chờ xử lý': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'Đang giao': { color: 'bg-blue-100 text-blue-800', icon: Truck },
    'Đã nhận': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'Đã hủy': { color: 'bg-red-100 text-red-800', icon: XCircle },
  };
  const { color, icon: Icon } = config[status];
  return (
    <span className={`don-mua__status-badge ${color}`}>
      <Icon size={14} /> {status}
    </span>
  );
};

// Component một card đơn hàng (phân biệt buyer/seller)
const OrderCard: React.FC<{ order: Order; role: 'buyer' | 'seller'; onAction: (action: string, orderId: string) => void }> = ({ order, role, onAction }) => {
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');
  
  // Xác định các nút hiển thị dựa trên role và trạng thái
  const renderActions = () => {
    if (role === 'buyer') {
      switch (order.trangThai) {
        case 'Chờ xử lý':
          return (
            <>
              <button onClick={() => onAction('cancel', order.maDonHang)} className="don-mua__btn don-mua__btn--outline">Hủy đơn</button>
              <button onClick={() => onAction('contact', order.maDonHang)} className="don-mua__btn don-mua__btn--secondary">Liên hệ</button>
            </>
          );
        case 'Đang giao':
          return (
            <>
              <button onClick={() => onAction('received', order.maDonHang)} className="don-mua__btn don-mua__btn--primary">Đã nhận hàng</button>
              <button onClick={() => onAction('contact', order.maDonHang)} className="don-mua__btn don-mua__btn--secondary">Liên hệ</button>
            </>
          );
        case 'Đã nhận':
          return (
            <>
              {!order.daDanhGia && (
                <button onClick={() => onAction('review', order.maDonHang)} className="don-mua__btn don-mua__btn--primary">Đánh giá</button>
              )}
              <button onClick={() => onAction('buyAgain', order.maDonHang)} className="don-mua__btn don-mua__btn--outline">Mua lại</button>
            </>
          );
        case 'Đã hủy':
          return (
            <button onClick={() => onAction('buyAgain', order.maDonHang)} className="don-mua__btn don-mua__btn--outline">Mua lại</button>
          );
        default:
          return null;
      }
    } else { // seller
      switch (order.trangThai) {
        case 'Chờ xử lý':
          return (
            <>
              <button onClick={() => onAction('confirmShip', order.maDonHang)} className="don-mua__btn don-mua__btn--primary">Xác nhận giao hàng</button>
              <button onClick={() => onAction('cancel', order.maDonHang)} className="don-mua__btn don-mua__btn--outline">Hủy đơn</button>
            </>
          );
        case 'Đang giao':
          return (
            <>
              {/* Seller không có nút "Đã nhận" - chỉ buyer mới có */}
              <button onClick={() => onAction('contactBuyer', order.maDonHang)} className="don-mua__btn don-mua__btn--secondary">Liên hệ người mua</button>
            </>
          );
        case 'Đã nhận':
          return (
            <>
              {!order.daTraLoi && (
                <button onClick={() => onAction('replyReview', order.maDonHang)} className="don-mua__btn don-mua__btn--primary">Trả lời đánh giá</button>
              )}
              {/* Không có nút Mua lại cho seller */}
            </>
          );
        case 'Đã hủy':
          return null;
        default:
          return null;
      }
    }
  };

  return (
    <div className="don-mua__card">
      <div className="don-mua__card-header">
        <div className="don-mua__order-info">
          <span className="don-mua__order-id">Mã đơn: {order.maDonHang}</span>
          <span className="don-mua__order-date">{formatDate(order.ngayTao)}</span>
        </div>
        <StatusBadge status={order.trangThai} />
      </div>

      <div className="don-mua__items">
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="don-mua__item">
            <img src={item.anh} alt={item.tenSanPham} className="don-mua__item-img" />
            <div className="don-mua__item-details">
              <div className="don-mua__item-name">{item.tenSanPham}</div>
              {item.phanLoai && <div className="don-mua__item-variant">Phân loại: {item.phanLoai}</div>}
              <div className="don-mua__item-price">x{item.soLuong} · {item.donGia.toLocaleString()}đ</div>
            </div>
            <div className="don-mua__item-total">{item.thanhTien.toLocaleString()}đ</div>
          </div>
        ))}
        {order.items.length > 2 && (
          <div className="don-mua__more-items">+{order.items.length - 2} sản phẩm khác</div>
        )}
      </div>

      <div className="don-mua__card-footer">
        <div className="don-mua__total">Tổng tiền: <strong>{order.tongTien.toLocaleString()}đ</strong></div>
        <div className="don-mua__actions">
          {renderActions()}
          {/* Nút xem chi tiết chung cho cả hai role */}
          <Link to={PATHS.Buyer.HOA_DON_BAN_HANG.replace(':orderId', order.maDonHang)} className="don-mua__btn don-mua__btn--link">
            Xem chi tiết <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const DonMua: React.FC = () => {
  const user = getUserFromStorage();
  const role = user ? (isBuyer(user) ? 'buyer' : isSeller(user) ? 'seller' : null) : null;
  const [activeTab, setActiveTab] = useState<string>('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Các tab hiển thị tùy theo role
  const buyerTabs = ['Tất cả', 'Chờ xử lý', 'Đang giao', 'Đã nhận', 'Đã hủy'];
  const sellerTabs = ['Tất cả', 'Chờ xử lý', 'Đang giao', 'Đã hủy']; // Seller không có tab "Đã nhận"
  const tabs = role === 'buyer' ? buyerTabs : (role === 'seller' ? sellerTabs : []);

  // Giả lập gọi API lấy đơn hàng theo role và user
  const fetchOrders = async () => {
    setLoading(true);
    console.log(`[API Giả lập] GET /api/orders?role=${role}&userId=${user?.id}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    let filtered = [...mockOrders];
    if (role === 'buyer') {
      filtered = filtered.filter(order => order.buyerId === user?.id);
    } else if (role === 'seller') {
      // Giả định seller hiện tại có shopId = 'shop-001'
      const currentShopId = 'shop-001'; // Trong thực tế lấy từ context hoặc API
      filtered = filtered.filter(order => order.shopId === currentShopId);
    }
    setOrders(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lọc theo tab trạng thái + từ khóa tìm kiếm
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (activeTab !== 'Tất cả') {
      result = result.filter(o => o.trangThai === activeTab);
    }
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      result = result.filter(order => 
        order.maDonHang.toLowerCase().includes(keyword) ||
        order.items.some(item => item.tenSanPham.toLowerCase().includes(keyword))
      );
    }
    return result;
  }, [orders, activeTab, searchKeyword]);

  const handleAction = (action: string, orderId: string) => {
    console.log(`[Tương tác] ${action} trên đơn hàng ${orderId} với role ${role}`);
    const order = orders.find(o => o.maDonHang === orderId);
    if (!order) return;

    switch (action) {
      case 'cancel':
        if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
          console.log(`[API Giả lập] PUT /api/orders/${orderId}/cancel`);
          alert(`Đã hủy đơn hàng ${orderId} (demo)`);
          fetchOrders();
        }
        break;
      case 'received':
        if (window.confirm('Xác nhận đã nhận hàng?')) {
          console.log(`[API Giả lập] PUT /api/orders/${orderId}/confirm-received`);
          alert(`Đã xác nhận nhận hàng cho đơn ${orderId}`);
          fetchOrders();
        }
        break;
      case 'buyAgain':
        console.log(`[API Giả lập] POST /api/cart/add-multiple from order ${orderId}`);
        alert(`Đã thêm sản phẩm của đơn ${orderId} vào giỏ hàng (demo)`);
        break;
      case 'review':
        alert(`Chuyển đến trang đánh giá cho đơn ${orderId}`);
        break;
      case 'contact':
        alert(`Mở chat với người bán cho đơn ${orderId}`);
        break;
      case 'confirmShip':
        if (window.confirm('Xác nhận giao đơn hàng này?')) {
          console.log(`[API Giả lập] PUT /api/orders/${orderId}/confirm-ship`);
          alert(`Đã xác nhận giao hàng cho đơn ${orderId}`);
          fetchOrders();
        }
        break;
      case 'replyReview':
        alert(`Mở form trả lời đánh giá cho đơn ${orderId}`);
        break;
      case 'contactBuyer':
        alert(`Mở chat với người mua cho đơn ${orderId}`);
        break;
      default:
        break;
    }
  };

  if (!role) {
    return <div className="don-mua-page">Vui lòng đăng nhập để xem đơn hàng.</div>;
  }

  return (
    <div className="don-mua-page">
      <div className="don-mua-container">
        {/* Thanh tìm kiếm */}
        <div className="don-mua__search-wrapper">
          <div className="don-mua__search-box">
            <Search size={20} className="don-mua__search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng (mã đơn, tên sản phẩm)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="don-mua__search-input"
            />
            {searchKeyword && (
              <button className="don-mua__search-clear" onClick={() => setSearchKeyword('')}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="don-mua-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`don-mua-tab ${activeTab === tab ? 'don-mua-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Danh sách đơn hàng */}
        {loading ? (
          <div className="don-mua-loading">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="don-mua-skeleton-card">
                <div className="don-mua-skeleton-header"></div>
                <div className="don-mua-skeleton-item"></div>
                <div className="don-mua-skeleton-footer"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="don-mua-empty">
            <Package size={48} className="mx-auto" />
            <p>Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <div className="don-mua-list">
            {filteredOrders.map(order => (
              <OrderCard key={order.maDonHang} order={order} role={role as 'buyer' | 'seller'} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonMua;
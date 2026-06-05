import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Truck, CheckCircle, XCircle, Package, ChevronRight, Search, ClipboardList } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';
import { getUserFromStorage, isBuyer, isSeller } from '../../utils/role.utils';
import { orderAdminService, type OrderDetailItem } from '../../services/orderAdmin.service';
import { chatService } from '../../services/chat.service';
import { cartService } from '../../services/cart.service';
import ReviewModal from '../../components/buyer/ReviewModal';
import ReplyReviewModal from '../../components/seller/ReplyReviewModal';
import PaginationProduct from '../../components/common/PaginationProduct';
import { getProductImageUrl } from '../../utils/image.utils';

// Định nghĩa kiểu dữ liệu
interface OrderItem {
  maSanPham: string;
  tenSanPham: string;
  anh: string;
  phanLoaiId?: string | null;
  phanLoai?: string | null;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  sellerId?: string;
  shopId?: string;
  tenCuaHang?: string;
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

// Component hiển thị badge trạng thái
const StatusBadge: React.FC<{ status: Order['trangThai'] }> = ({ status }) => {
  const config = {
    'Chờ xử lý': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'Đang giao': { color: 'bg-blue-100 text-blue-800', icon: Truck },
    'Đã nhận': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'Đã hủy': { color: 'bg-red-100 text-red-800', icon: XCircle },
  };
  const state = config[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock };
  const { color, icon: Icon } = state;
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
              <button onClick={() => onAction('contactBuyer', order.maDonHang)} className="don-mua__btn don-mua__btn--secondary">Liên hệ người mua</button>
            </>
          );
        case 'Đã nhận':
          return (
            <>
              {!order.daTraLoi && (
                <button onClick={() => onAction('replyReview', order.maDonHang)} className="don-mua__btn don-mua__btn--primary">Trả lời đánh giá</button>
              )}
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
            <img 
              src={getProductImageUrl(item.anh)} 
              alt={item.tenSanPham} 
              className="don-mua__item-img" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/default-product.svg';
              }}
            />
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
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const role = user ? (isBuyer(user) ? 'buyer' : isSeller(user) ? 'seller' : null) : null;
  const [activeTab, setActiveTab] = useState<string>('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Review Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string>('');
  const [reviewItems, setReviewItems] = useState<OrderDetailItem[]>([]);

  // Reply Review Modal States
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyOrderId, setReplyOrderId] = useState<string>('');
  const [replyItems, setReplyItems] = useState<OrderDetailItem[]>([]);

  // Cancellation Modal States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Các tab hiển thị tùy theo role
  const buyerTabs = ['Tất cả', 'Chờ xử lý', 'Đang giao', 'Đã nhận', 'Đã hủy'];
  const sellerTabs = ['Tất cả', 'Chờ xử lý', 'Đang giao', 'Đã hủy']; // Seller không có tab "Đã nhận"
  const tabs = role === 'buyer' ? buyerTabs : (role === 'seller' ? sellerTabs : []);

  // Gọi API lấy đơn hàng thực tế
  const fetchOrders = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const res = await orderAdminService.getOrders(role, currentPage, 5, activeTab, debouncedSearchKeyword);
      if (res.success) {
        const mappedOrders: Order[] = res.data.map((order: any) => ({
          maDonHang: order.maDonHang,
          ngayTao: order.ngayTao,
          trangThai: order.trangThai,
          tongTien: order.tongTien,
          daDanhGia: order.daDanhGia,
          shopId: order.shopId,
          buyerId: order.buyerId,
          daTraLoi: order.daTraLoi,
          items: order.items.map((item: any) => ({
            maSanPham: item.maSanPham,
            tenSanPham: item.tenSanPham,
            anh: item.anh,
            phanLoaiId: item.phanLoaiId,
            phanLoai: item.phanLoai,
            soLuong: item.soLuong,
            donGia: item.donGia,
            thanhTien: item.thanhTien,
            sellerId: item.sellerId,
            shopId: item.shopId,
            tenCuaHang: item.tenCuaHang
          }))
        }));
        setOrders(mappedOrders);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  // Tab change resets page
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeTab, debouncedSearchKeyword]);

  const filteredOrders = orders;

  const handleAction = async (action: string, orderId: string) => {
    const order = orders.find(o => o.maDonHang === orderId);
    if (!order) return;

    switch (action) {
      case 'cancel':
        setCancelOrderId(orderId);
        setCancelReason('');
        setIsCancelModalOpen(true);
        break;

      case 'received':
        if (window.confirm('Bạn có chắc chắn xác nhận đã nhận được hàng?')) {
          try {
            const res = await orderAdminService.confirmReceived(orderId);
            if (res.success) {
              alert('Xác nhận đã nhận hàng thành công.');
              fetchOrders();
            }
          } catch (err: any) {
            alert(err.response?.data?.message || err.message || 'Lỗi khi xác nhận đã nhận hàng.');
          }
        }
        break;

      case 'confirmShip':
        if (window.confirm('Xác nhận giao đơn hàng này cho bên vận chuyển?')) {
          try {
            const res = await orderAdminService.confirmShipment(orderId);
            if (res.success) {
              alert('Xác nhận giao hàng thành công.');
              fetchOrders();
            }
          } catch (err: any) {
            alert(err.response?.data?.message || err.message || 'Lỗi khi xác nhận giao hàng.');
          }
        }
        break;

      case 'buyAgain':
        try {
          setLoading(true);
          // Thêm tuần tự tất cả sản phẩm của đơn hàng vào giỏ hàng
          for (const item of order.items) {
            await cartService.addToCart(item.maSanPham, item.soLuong, item.phanLoaiId || undefined);
          }
          alert('Đã thêm sản phẩm của đơn hàng vào giỏ hàng.');
          navigate(PATHS.Buyer.CART);
        } catch (err: any) {
          alert(err.response?.data?.message || err.message || 'Lỗi khi mua lại sản phẩm.');
        } finally {
          setLoading(false);
        }
        break;

      case 'contact':
      case 'contactBuyer':
        try {
          setLoading(true);
          const otherUserId = role === 'buyer' ? order.items[0]?.sellerId : order.buyerId;
          if (!otherUserId) {
            alert('Không tìm thấy thông tin đối tác chat.');
            return;
          }

          // Tìm hoặc tạo phòng chat riêng tư (1 bước duy nhất)
          const res = await chatService.findOrCreatePrivateChat(otherUserId);
          const conversationId = res.data?.conversationId;

          if (conversationId) {
            if (role === 'buyer') {
              navigate(`${PATHS.Buyer.MESSAGES}?chatId=${conversationId}`);
            } else {
              navigate(`${PATHS.Seller.MESSAGES}?chatId=${conversationId}`);
            }
          } else {
            alert('Không thể tạo phòng chat.');
          }
        } catch (err: any) {
          alert(err.response?.data?.message || err.message || 'Lỗi khi kết nối chat.');
        } finally {
          setLoading(false);
        }
        break;

      case 'review':
        try {
          setLoading(true);
          const res = await orderAdminService.getOrderDetails(orderId);
          if (res.success && res.data) {
            setReviewItems(res.data.items);
            setReviewOrderId(orderId);
            setIsReviewModalOpen(true);
          }
        } catch (err: any) {
          alert(err.response?.data?.message || err.message || 'Lỗi khi tải chi tiết đơn hàng để đánh giá.');
        } finally {
          setLoading(false);
        }
        break;

      case 'replyReview':
        try {
          setLoading(true);
          const res = await orderAdminService.getOrderDetails(orderId);
          if (res.success && res.data) {
            setReplyItems(res.data.items);
            setReplyOrderId(orderId);
            setIsReplyModalOpen(true);
          }
        } catch (err: any) {
          alert(err.response?.data?.message || err.message || 'Lỗi khi tải chi tiết đơn hàng để phản hồi.');
        } finally {
          setLoading(false);
        }
        break;

      default:
        break;
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelOrderId) return;
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn.');
      return;
    }

    setIsSubmittingCancel(true);
    try {
      const res = await orderAdminService.cancelOrder(cancelOrderId, cancelReason);
      if (res.success) {
        alert('Hủy đơn hàng thành công.');
        setIsCancelModalOpen(false);
        setCancelOrderId(null);
        setCancelReason('');
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi hủy đơn hàng.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (!role) {
    return <div className="don-mua-page">Vui lòng đăng nhập để xem đơn hàng.</div>;
  }

  return (
    <div className={`don-mua-page ${role === 'seller' ? 'don-mua-page--seller' : ''}`}>
      <div className="don-mua-container">
        {role === 'seller' && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" /> Quản lý đơn hàng
            </h2>
          </div>
        )}
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
              onClick={() => handleTabChange(tab)}
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
          <>
            <div className="don-mua-list">
              {filteredOrders.map(order => (
                <OrderCard key={order.maDonHang} order={order} role={role as 'buyer' | 'seller'} onAction={handleAction} />
              ))}
            </div>
            <PaginationProduct
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>

      {/* cancellation Reason Modal Overlay */}
      {isCancelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Hủy Đơn Hàng</h3>
              <button className="modal-close-btn" onClick={() => setIsCancelModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCancelSubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: '12px', fontSize: '0.95rem', color: '#555' }}>
                  Vui lòng nhập lý do bạn muốn hủy đơn hàng <strong>#{cancelOrderId}</strong>:
                </p>
                <textarea
                  className="modal-textarea"
                  placeholder="Nhập lý do hủy đơn (ví dụ: Thay đổi ý định, Nhập sai địa chỉ, Muốn chọn sản phẩm khác...)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={isSubmittingCancel}
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn modal-btn--cancel"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isSubmittingCancel}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn--submit"
                  disabled={isSubmittingCancel}
                >
                  {isSubmittingCancel ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Rich Media Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={reviewOrderId}
        items={reviewItems}
        onSuccess={(firstProductId) => {
          fetchOrders();
          if (firstProductId) {
            navigate(PATHS.PUPLIC.PRODUCT_DETAIL.replace(':id', firstProductId));
          }
        }}
      />
      {/* Reply Review Modal */}
      <ReplyReviewModal
        isOpen={isReplyModalOpen}
        onClose={() => {
          setIsReplyModalOpen(false);
          fetchOrders();
        }}
        orderId={replyOrderId}
        items={replyItems}
        onSuccess={() => {
          fetchOrders();
        }}
      />
    </div>
  );
};

export default DonMua;
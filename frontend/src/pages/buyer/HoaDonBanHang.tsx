import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ShoppingBag, Printer } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';
import { getUserFromStorage, isBuyer, isSeller } from '../../utils/role.utils';
import { orderAdminService, type AdminOrder } from '../../services/orderAdmin.service';
import { chatService } from '../../services/chat.service';
import { cartService } from '../../services/cart.service';
import ReviewModal from '../../components/buyer/ReviewModal';

const HoaDonBanHang: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const user = getUserFromStorage();
  const role = user ? (isBuyer(user) ? 'buyer' : isSeller(user) ? 'seller' : null) : null;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await orderAdminService.getOrderDetails(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết hóa đơn:', error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');
  const formatCurrency = (num: number) => num.toLocaleString() + 'đ';

  const handlePrint = () => {
    console.log('[Tương tác] In hóa đơn');
    window.print();
  };

  const handleContact = async () => {
    if (!order || !role) return;
    console.log('[Tương tác] Liên hệ qua chat');
    try {
      setLoading(true);
      // Buyer liên hệ shop owner (sellerId); Seller liên hệ buyer (buyerId)
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
  };

  const handleBuyAgain = async () => {
    if (!order) return;
    console.log('[API] Mua lại từ đơn hàng', order.maDonHang);
    try {
      setLoading(true);
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
  };

  const handleOpenReview = () => {
    console.log('[Tương tác] Mở modal đánh giá');
    setShowReviewModal(true);
  };

  if (!role) {
    return <div className="invoice-page">Vui lòng đăng nhập để xem thông tin hóa đơn.</div>;
  }

  if (loading) {
    return (
      <div className="invoice-page">
        <div className="invoice-loading">Đang tải hóa đơn...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="invoice-page">
        <div className="invoice-error">
          <p>Không tìm thấy hóa đơn hoặc bạn không có quyền xem đơn hàng này.</p>
          <button onClick={() => navigate(PATHS.Buyer.ORDERS)} className="invoice-btn invoice-btn-primary">
            {role === 'buyer' ? 'Quay lại đơn mua' : 'Quay lại danh sách đơn hàng'}
          </button>
        </div>
      </div>
    );
  }

  const canReview = role === 'buyer' && order.trangThai === 'Đã nhận' && order.items.some(item => !item.daDanhGia);

  return (
    <div className="invoice-page">
      {/* Các nút hành động (bên ngoài hóa đơn) */}
      <div className="invoice-actions">
        <button className="invoice-btn invoice-btn-outline" onClick={handlePrint}>
          <Printer size={16} /> In hóa đơn
        </button>
        {canReview && (
          <button className="invoice-btn invoice-btn-primary" onClick={handleOpenReview}>
            Đánh giá
          </button>
        )}
        <button className="invoice-btn invoice-btn-outline" onClick={handleContact}>
          <MessageSquare size={16} /> Liên hệ {role === 'buyer' ? 'người bán' : 'người mua'}
        </button>
        {role === 'buyer' && (
          <button className="invoice-btn invoice-btn-outline" onClick={handleBuyAgain}>
            <ShoppingBag size={16} /> Mua lại
          </button>
        )}
      </div>

      {/* Hóa đơn giấy */}
      <div className="invoice-paper">
        {/* Header hóa đơn */}
        <div className="invoice-header">
          <h1 className="invoice-title">HÓA ĐƠN BÁN HÀNG</h1>
          <div className="invoice-subtitle">ZenTekExchange - Cửa hàng trực tuyến</div>
          <div className="invoice-divider"></div>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="invoice-info">
          <div className="invoice-row">
            <span className="invoice-label">Mã đơn hàng:</span>
            <span className="invoice-value">{order.maDonHang}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Ngày đặt:</span>
            <span className="invoice-value">{formatDate(order.ngayTao)}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Trạng thái:</span>
            <span className={`invoice-status status-${order.trangThai.replace(/ /g, '-')}`}>
              {order.trangThai}
            </span>
          </div>
          <div className="invoice-divider-light"></div>
          <div className="invoice-row">
            <span className="invoice-label">Người nhận:</span>
            <span className="invoice-value">{order.hoTenNguoiNhan}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Điện thoại:</span>
            <span className="invoice-value">{order.soDienThoaiNguoiNhan}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Địa chỉ giao:</span>
            <span className="invoice-value">{order.diaChiNhan}</span>
          </div>
          {order.lyDoHuy && (
            <div className="invoice-row cancel-reason">
              <span className="invoice-label">Lý do hủy:</span>
              <span className="invoice-value">{order.lyDoHuy}</span>
            </div>
          )}
        </div>

        {/* Bảng sản phẩm */}
        <div className="invoice-items">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>Phân loại</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr 
                  key={item.maSanPham} 
                  className="invoice-table-row"
                  onClick={() => navigate(PATHS.PUPLIC.PRODUCT_DETAIL.replace(':id', item.maSanPham))}
                >
                  <td className="text-center">{idx + 1}</td>
                  <td>
                    <div className="invoice-product-name">{item.tenSanPham}</div>
                  </td>
                  <td>{item.phanLoai || '—'}</td>
                  <td className="text-center">{item.soLuong}</td>
                  <td className="text-right">{formatCurrency(item.donGia)}</td>
                  <td className="text-right">{formatCurrency(item.thanhTien)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tổng cộng */}
        <div className="invoice-total">
          <div className="invoice-total-row">
            <span>Tổng cộng:</span>
            <span className="invoice-total-amount">{formatCurrency(order.tongTien)}</span>
          </div>
        </div>

        {/* Footer hóa đơn */}
        <div className="invoice-footer">
          <div className="invoice-divider"></div>
          <div className="invoice-thanks">Cảm ơn quý khách! Hẹn gặp lại.</div>
        </div>
      </div>

      {/* Modal đánh giá */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        orderId={orderId!}
        items={order.items}
        onSuccess={(firstProductId) => {
          fetchOrderDetail();
          if (firstProductId) {
            navigate(PATHS.PUPLIC.PRODUCT_DETAIL.replace(':id', firstProductId));
          }
        }}
      />
    </div>
  );
};

export default HoaDonBanHang;
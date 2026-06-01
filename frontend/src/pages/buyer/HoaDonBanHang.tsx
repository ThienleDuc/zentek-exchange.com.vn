// ====================
// Page: Hóa đơn bán hàng - Chi tiết đơn hàng (dạng hóa đơn giấy)
// Session: Mỗi phiên làm việc đều có tên trang này
// ====================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ShoppingBag, Printer } from 'lucide-react';
import { PATHS } from '../../utils/path.utils';

// Định nghĩa dữ liệu (giống trước, đã loại bỏ phí vận chuyển)
interface OrderDetailItem {
  maSanPham: string;
  tenSanPham: string;
  anh: string;
  phanLoai?: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  daDanhGia?: boolean;
}

interface OrderDetail {
  maDonHang: string;
  ngayTao: string;
  trangThai: 'Chờ xử lý' | 'Đang giao' | 'Đã nhận' | 'Đã hủy';
  hoTenNguoiNhan: string;
  soDienThoaiNguoiNhan: string;
  diaChiNhan: string;
  lyDoHuy?: string;
  tongTien: number;
  items: OrderDetailItem[];
}

// Mock data (giống trước)
const mockOrderDetails: Record<string, OrderDetail> = {
  DH001: {
    maDonHang: 'DH001',
    ngayTao: '2025-03-20T10:30:00Z',
    trangThai: 'Chờ xử lý',
    hoTenNguoiNhan: 'Trần Thị Bích',
    soDienThoaiNguoiNhan: '0912345678',
    diaChiNhan: '123 Đường Láng, Đống Đa, Hà Nội',
    tongTien: 450000,
    items: [
      { maSanPham: 'SP1', tenSanPham: 'Áo thun nam', anh: 'https://picsum.photos/id/1/100/100', phanLoai: 'M, Đen', soLuong: 2, donGia: 150000, thanhTien: 300000, daDanhGia: false },
      { maSanPham: 'SP2', tenSanPham: 'Quần jeans', anh: 'https://picsum.photos/id/2/100/100', phanLoai: 'L, Xanh', soLuong: 1, donGia: 150000, thanhTien: 150000, daDanhGia: false }
    ]
  },
  DH003: {
    maDonHang: 'DH003',
    ngayTao: '2025-03-15T09:00:00Z',
    trangThai: 'Đã nhận',
    hoTenNguoiNhan: 'Trần Thị Bích',
    soDienThoaiNguoiNhan: '0912345678',
    diaChiNhan: '123 Đường Láng, Đống Đa, Hà Nội',
    tongTien: 250000,
    items: [
      { maSanPham: 'SP4', tenSanPham: 'Mũ lưỡi trai', anh: 'https://picsum.photos/id/4/100/100', soLuong: 2, donGia: 125000, thanhTien: 250000, daDanhGia: false }
    ]
  }
};

const HoaDonBanHang: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState<{ [productId: string]: { rating: number; comment: string } }>({});

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      console.log(`[API Giả lập] GET /api/orders/${orderId}`);
      await new Promise(resolve => setTimeout(resolve, 800));
      const found = mockOrderDetails[orderId || ''];
      if (found) {
        setOrder(found);
        const initReview: any = {};
        found.items.forEach(item => {
          if (!item.daDanhGia) {
            initReview[item.maSanPham] = { rating: 5, comment: '' };
          }
        });
        setReviewData(initReview);
      } else {
        setOrder(null);
      }
      setLoading(false);
    };
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');
  const formatCurrency = (num: number) => num.toLocaleString() + 'đ';

  const handlePrint = () => {
    console.log('[Tương tác] In hóa đơn');
    window.print();
  };

  const handleContactSeller = () => {
    console.log('[Tương tác] Liên hệ người bán');
    alert('Mở chat với người bán (demo)');
  };

  const handleBuyAgain = () => {
    console.log('[API Giả lập] POST /api/cart/add-multiple from order', order?.maDonHang);
    alert('Đã thêm tất cả sản phẩm vào giỏ hàng (demo)');
  };

  const handleOpenReview = () => {
    console.log('[Tương tác] Mở modal đánh giá');
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    console.log('[API Giả lập] POST /api/reviews', reviewData);
    alert('Đã gửi đánh giá thành công!');
    setShowReviewModal(false);
  };

  const handleRatingChange = (productId: string, rating: number) => {
    setReviewData(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }));
  };

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
          <p>Không tìm thấy đơn hàng.</p>
          <button onClick={() => navigate(PATHS.Buyer.ORDERS)} className="invoice-btn invoice-btn-primary">Quay lại đơn mua</button>
        </div>
      </div>
    );
  }

  const canReview = order.trangThai === 'Đã nhận' && order.items.some(item => !item.daDanhGia);

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
        <button className="invoice-btn invoice-btn-outline" onClick={handleContactSeller}>
          <MessageSquare size={16} /> Liên hệ
        </button>
        <button className="invoice-btn invoice-btn-outline" onClick={handleBuyAgain}>
          <ShoppingBag size={16} /> Mua lại
        </button>
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
                <tr key={item.maSanPham}>
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

      {/* Modal đánh giá (giữ nguyên) */}
      {showReviewModal && (
        <div className="invoice-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="invoice-modal" onClick={e => e.stopPropagation()}>
            <h3>Đánh giá sản phẩm</h3>
            <div className="invoice-modal-body">
              {order.items.filter(item => !item.daDanhGia).map(item => (
                <div key={item.maSanPham} className="review-product">
                  <img src={item.anh} alt={item.tenSanPham} />
                  <div>
                    <div><strong>{item.tenSanPham}</strong></div>
                    <div className="review-stars">
                      {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => handleRatingChange(item.maSanPham, star)}>
                          {star <= (reviewData[item.maSanPham]?.rating || 0) ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Nhận xét của bạn..."
                      value={reviewData[item.maSanPham]?.comment || ''}
                      onChange={(e) => setReviewData(prev => ({
                        ...prev,
                        [item.maSanPham]: { ...prev[item.maSanPham], comment: e.target.value }
                      }))}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="invoice-modal-footer">
              <button className="invoice-btn invoice-btn-outline" onClick={() => setShowReviewModal(false)}>Hủy</button>
              <button className="invoice-btn invoice-btn-primary" onClick={handleSubmitReview}>Gửi đánh giá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoaDonBanHang;
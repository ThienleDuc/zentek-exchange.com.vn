import React, { useState, useEffect } from 'react';
import { Star, Check, Loader2 } from 'lucide-react';
import { productSellerService } from '../../services/productSeller.service';
import { getProductImageUrl } from '../../utils/image.utils';
import type { OrderDetailItem } from '../../services/orderAdmin.service';

interface ReplyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  items: OrderDetailItem[];
  onSuccess: () => void;
}

const ReplyReviewModal: React.FC<ReplyReviewModalProps> = ({ isOpen, onClose, orderId, items, onSuccess }) => {
  const [localItems, setLocalItems] = useState<OrderDetailItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Filter items that have reviews
  const reviewedItems = localItems.filter(item => item.reviewId);

  // Sync props to local state when opened
  useEffect(() => {
    if (isOpen && items.length > 0) {
      setLocalItems(items);
      
      const firstReviewed = items.find(item => item.reviewId);
      if (firstReviewed) {
        setActiveItemId(firstReviewed.MaChiTietDonHang);
        setReplyText(firstReviewed.reviewTraLoiNoiDung || '');
      }
    }
  }, [isOpen, items]);

  // Sync reply text when switching active items
  const handleActiveItemChange = (itemId: string) => {
    setActiveItemId(itemId);
    const item = localItems.find(i => i.MaChiTietDonHang === itemId);
    if (item) {
      setReplyText(item.reviewTraLoiNoiDung || '');
    }
  };

  if (!isOpen || reviewedItems.length === 0) return null;

  const activeItem = localItems.find(item => item.MaChiTietDonHang === activeItemId);

  const handleSubmitReply = async () => {
    if (!activeItem || !activeItem.reviewId) return;
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await productSellerService.replyReview(activeItem.reviewId, replyText.trim());
      if (res.success) {
        alert('Gửi phản hồi thành công!');
        
        // Update local items state so it updates the UI immediately
        setLocalItems(prev => prev.map(item => {
          if (item.MaChiTietDonHang === activeItemId) {
            return {
              ...item,
              reviewTraLoiNoiDung: replyText.trim()
            };
          }
          return item;
        }));

        // Notify parent component
        onSuccess();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi gửi phản hồi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-container" onClick={e => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>Trả lời đánh giá đơn hàng #{orderId}</h3>
          <button className="review-modal-close" onClick={onClose} disabled={submitting}>✕</button>
        </div>

        {/* Product Selection Chips */}
        <div className="review-products-chips">
          {reviewedItems.map(item => {
            const isActive = item.MaChiTietDonHang === activeItemId;
            const hasReplied = !!item.reviewTraLoiNoiDung;
            const stars = item.reviewSoSao || 5;

            return (
              <button
                key={item.MaChiTietDonHang}
                type="button"
                className={`review-product-chip ${isActive ? 'chip--active' : ''} ${hasReplied ? 'chip--completed' : ''}`}
                onClick={() => handleActiveItemChange(item.MaChiTietDonHang)}
                disabled={submitting}
              >
                <img 
                  src={getProductImageUrl(item.anh)} 
                  alt={item.tenSanPham} 
                  className="chip-img" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/default-product.svg';
                  }}
                />
                <div className="chip-details">
                  <div className="chip-title">{item.tenSanPham}</div>
                  <div className="chip-meta">
                    <span className="chip-stars">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
                    {hasReplied && <span className="chip-check"><Check size={12} /> Đã trả lời</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reply Form Area */}
        {activeItem && activeItem.reviewId && (
          <div className="review-form-area">
            <div className="review-form-product-info">
              <strong>Sản phẩm:</strong> {activeItem.tenSanPham}
            </div>

            {/* Stars Section (Read-only) */}
            <div className="review-stars-section">
              <span className="review-field-label">Khách hàng đánh giá:</span>
              <div className="review-stars-row">
                {[1, 2, 3, 4, 5].map(star => {
                  const isGold = star <= (activeItem.reviewSoSao || 5);
                  return (
                    <Star
                      key={star}
                      size={24}
                      className={isGold ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  );
                })}
                <span className="review-rating-text">
                  {activeItem.reviewSoSao} / 5 Sao
                </span>
              </div>
            </div>

            {/* Buyer Comment (Read-only) */}
            <div className="review-comment-section">
              <span className="review-field-label">Nhận xét của khách hàng:</span>
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.9rem',
                color: '#495057',
                fontStyle: 'italic',
                minHeight: '40px'
              }}>
                {activeItem.reviewNoiDung || '(Khách hàng không để lại nhận xét)'}
              </div>
            </div>

            {/* Reply Textarea */}
            <div className="review-comment-section">
              <span className="review-field-label">Nội dung phản hồi của bạn:</span>
              <textarea
                className="review-textarea"
                placeholder="Nhập nội dung phản hồi của bạn đến khách hàng..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                disabled={submitting}
                rows={4}
              />
            </div>

            {/* Action button inside the area for immediate feedback */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                className="review-btn btn-primary"
                onClick={handleSubmitReply}
                disabled={submitting || !replyText.trim() || replyText.trim() === activeItem.reviewTraLoiNoiDung}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                    Đang gửi...
                  </>
                ) : activeItem.reviewTraLoiNoiDung ? 'Cập nhật phản hồi' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="review-modal-footer">
          <button
            type="button"
            className="review-btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyReviewModal;

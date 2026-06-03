import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProductDetailType } from '../../../pages/admin/ProductDetail';
import productSellerService from '../../../services/productSeller.service';
import { getMediaUrl, getUserAvatarUrl } from '../../../utils/image.utils';
import ContactCardModal from '../chat/ContactCardModal';
import { userService } from '../../../services/user.service';

interface ProductReviewsProps {
  product: ProductDetailType;
  currentUserId?: string;
  role?: 'admin' | 'seller' | 'buyer';
  onRefresh?: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ product, currentUserId, role = 'buyer', onRefresh }) => {
  const navigate = useNavigate();
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [replyingReview, setReplyingReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactUser, setContactUser] = useState<any | null>(null);

  const handleAvatarClick = async (userId: string, userName: string, userAvatar?: string | null) => {
    if (!userId) return;
    if (currentUserId && userId.toLowerCase() === currentUserId.toLowerCase()) return;

    try {
      const res = await userService.getUserById(userId);
      const userData = res.data || {};
      setContactUser({
        userId: userData.userId || userId,
        fullName: userData.fullName || userName,
        avatar: userData.avatar || userAvatar,
        phone: userData.phone || null,
        email: userData.email || null,
        roleName: userData.roleName || null,
        createdAt: userData.createdAt || null,
        storeName: userData.storeName || null,
        storeLogo: userData.storeLogo || null
      });
      setIsContactModalOpen(true);
    } catch (e) {
      setContactUser({ userId, fullName: userName, avatar: userAvatar });
      setIsContactModalOpen(true);
    }
  };

  const handleOpenReply = (review: any) => {
    setReplyingReview(review);
    setReplyText(review.TraLoiNoiDung || '');
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await productSellerService.replyReview(replyingReview.MaDanhGia, replyText);
      if (res.success) {
        setReplyingReview(null);
        setReplyText('');
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi trả lời.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const totalReviews = product.reviews?.length || 0;
  
  const getReviewCount = (star: number | null) => {
    if (star === null) return totalReviews;
    return product.reviews?.filter(r => r.SoSao === star).length || 0;
  };

  const filteredReviews = filterStar === null 
    ? product.reviews 
    : product.reviews?.filter(r => r.SoSao === filterStar);

  const sortedReviews = filteredReviews ? [...filteredReviews].sort((a, b) => {
    if (currentUserId) {
      const aIsCurrentUser = a.NguoiMuaId?.toLowerCase() === currentUserId.toLowerCase();
      const bIsCurrentUser = b.NguoiMuaId?.toLowerCase() === currentUserId.toLowerCase();
      if (aIsCurrentUser && !bIsCurrentUser) return -1;
      if (!aIsCurrentUser && bIsCurrentUser) return 1;
    }
    return new Date(b.NgayTao).getTime() - new Date(a.NgayTao).getTime();
  }) : [];

  const filterOptions = [
    { label: 'Tất cả', value: null },
    { label: '5 Sao', value: 5 },
    { label: '4 Sao', value: 4 },
    { label: '3 Sao', value: 3 },
    { label: '2 Sao', value: 2 },
    { label: '1 Sao', value: 1 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border-default mt-6 overflow-hidden">
      <div className="p-6 pb-4">
         <h2 className="text-lg font-bold text-text-main">Đánh giá sản phẩm</h2>
      </div>
      
      {/* Review Summary */}
      <div className="px-6 pb-6 flex flex-col md:flex-row items-center gap-10 md:gap-16 border-b border-border-default/50">
        {/* Left: Overall Score */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline text-text-main mb-1">
            <span className="text-[3.5rem] font-bold leading-none">{product.DiemDanhGia.toFixed(1)}</span>
            <span className="text-2xl font-medium text-text-muted">/5</span>
          </div>
          <div className="flex text-yellow-500 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.round(product.DiemDanhGia) ? 'fill-current' : 'text-border-default fill-current'}`} />
            ))}
          </div>
          <div className="text-sm text-text-muted">({product.reviews?.length || 0} đánh giá)</div>
        </div>
        
        {/* Middle: Progress Bars */}
        <div className="flex-1 w-full max-w-sm flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = product.reviews?.filter(r => r.SoSao === star).length || 0;
            const total = product.reviews?.length || 0;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm text-text-muted">
                <span className="w-10 whitespace-nowrap">{star} sao</span>
                <div className="flex-1 h-2.5 bg-surface-muted border border-border-default rounded-full overflow-hidden">
                  <div className="h-full bg-text-muted rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                <span className="w-10 text-right">{percent}%</span>
              </div>
            );
          })}
        </div>
        
        {/* Right: Info */}
        <div className="hidden md:flex flex-1 justify-center items-center text-sm text-text-muted">
          <p>Trang quản trị chỉ hiển thị các đánh giá<br/>đã được hệ thống lưu trữ.</p>
        </div>
      </div>
      
      <div className="p-6">
        {totalReviews > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filterOptions.map(opt => (
              <button
                key={opt.label}
                onClick={() => setFilterStar(opt.value)}
                className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                  filterStar === opt.value 
                    ? 'border-primary bg-primary/10 text-primary font-medium' 
                    : 'border-border-default bg-surface hover:bg-surface-muted text-text-muted hover:text-text-main'
                }`}
              >
                {opt.label} ({getReviewCount(opt.value)})
              </button>
            ))}
          </div>
        )}

        {product.reviews && product.reviews.length > 0 ? (
          sortedReviews && sortedReviews.length > 0 ? (
            <div className="space-y-6">
              {sortedReviews.map(r => (
                <div key={r.MaDanhGia} className="border-b border-border-default pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div 
                      onClick={() => handleAvatarClick(r.NguoiMuaId, r.TenNguoiMua, r.AnhDaiDien)}
                      className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-primary bg-primary/20 overflow-hidden ${
                        currentUserId && r.NguoiMuaId?.toLowerCase() === currentUserId.toLowerCase() 
                          ? 'cursor-default' 
                          : 'cursor-pointer hover:opacity-80 transition-opacity'
                      }`}
                    >
                      {r.AnhDaiDien ? (
                        <img 
                          src={getUserAvatarUrl(r.AnhDaiDien)} 
                          alt={r.TenNguoiMua} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        r.TenNguoiMua?.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-main text-sm">{r.TenNguoiMua}</div>
                      <div className="flex text-yellow-500 mt-1 mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.SoSao ? 'fill-current' : 'text-gray-300'}`} />)}
                      </div>
                      <p className="text-sm text-text-main mb-2 leading-relaxed">{r.NoiDung}</p>
                      
                      {((r.media && r.media.length > 0) || r.DuongDanVideo) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {r.DuongDanVideo && (
                            <video
                              src={getMediaUrl(r.DuongDanVideo)}
                              controls
                              className="w-16 h-16 rounded border border-border-default object-cover animate-in fade-in"
                            />
                          )}
                          {r.media && r.media.map((m: any) => m.LoaiMedia === 'video' ? (
                            <video key={m.MaPhanHoi} src={getMediaUrl(m.DuongDanMedia)} controls className="w-16 h-16 rounded border border-border-default object-cover" />
                          ) : (
                            <img key={m.MaPhanHoi} src={getMediaUrl(m.DuongDanMedia)} alt="Review" className="w-16 h-16 rounded object-cover border border-border-default cursor-pointer hover:border-primary" />
                          ))}
                        </div>
                      )}
                      
                      {r.TraLoiNoiDung && (
                        <div className="mt-4 bg-surface-muted border border-border-default p-4 rounded-lg text-sm relative before:absolute before:-top-2 before:left-6 before:w-4 before:h-4 before:bg-surface-muted before:border-l before:border-t before:border-border-default before:rotate-45">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-text-main">Phản hồi của Người bán:</span>
                            {role === 'seller' && (
                              <button
                                onClick={() => handleOpenReply(r)}
                                className="text-xs text-primary hover:underline font-medium"
                              >
                                Chỉnh sửa
                              </button>
                            )}
                          </div>
                          <p className="text-text-muted">{r.TraLoiNoiDung}</p>
                        </div>
                      )}

                      {!r.TraLoiNoiDung && role === 'seller' && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleOpenReply(r)}
                            className="text-xs px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg transition font-medium"
                          >
                            Phản hồi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-text-muted">
               Không có đánh giá nào phù hợp với bộ lọc.
            </div>
          )
        ) : (
          <div className="py-12 text-center">
             <div className="text-text-muted mb-2">Chưa có đánh giá nào</div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border-default rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-text-main">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border-default bg-surface-muted">
              <h3 className="text-lg font-bold text-text-main">Trả lời đánh giá</h3>
              <button
                onClick={() => setReplyingReview(null)}
                className="text-text-muted hover:text-text-main transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleReplySubmit} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Người đánh giá: {replyingReview.TenNguoiMua}</p>
                <div className="bg-surface-muted p-3 rounded-xl border border-border-default text-sm text-text-muted italic mb-4">
                  "{replyingReview.NoiDung || 'Không để lại nội dung.'}"
                </div>
                
                <label className="block text-sm font-medium text-text-body mb-1">Câu trả lời phản hồi *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Nhập nội dung phản hồi khách hàng..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full bg-surface border border-border-default focus:border-primary rounded-xl px-4 py-2.5 text-text-main outline-none transition text-sm resize-none"
                />
              </div>

              {/* Form Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 bg-surface border border-border-default hover:bg-surface-muted text-text-body rounded-lg transition font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition font-medium disabled:opacity-50"
                >
                  {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ContactCardModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        user={contactUser}
        onContactCreated={(convId) => {
          if (role === 'admin') {
            navigate(`/admin/messages?chatId=${convId}`);
          } else if (role === 'seller') {
            navigate(`/seller/chat?chatId=${convId}`);
          } else {
            navigate(`/buyer/tin-nhan?chatId=${convId}`);
          }
        }}
      />
    </div>
  );
};

export default ProductReviews;

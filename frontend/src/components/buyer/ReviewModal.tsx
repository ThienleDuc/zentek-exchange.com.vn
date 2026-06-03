import React, { useState, useEffect, useRef } from 'react';
import { Star, Check, Film, ImageIcon, Loader2 } from 'lucide-react';
import { orderAdminService, type OrderDetailItem } from '../../services/orderAdmin.service';
import { uploadMedia } from '../../services/upload.service';
import { getProductImageUrl } from '../../utils/image.utils';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  items: OrderDetailItem[];
  onSuccess: (firstProductId?: string) => void;
}

interface SingleProductReview {
  sanPhamId: string;
  tenSanPham: string;
  anh: string | null;
  soSao: number;
  noiDung: string;
  duongDanVideo: string;
  images: string[];
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, orderId, items, onSuccess }) => {
  const [reviewsState, setReviewsState] = useState<{ [productId: string]: SingleProductReview }>({});
  const [activeProductId, setActiveProductId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Loading states for media uploads
  const [uploadingImage, setUploadingImage] = useState<{ [productId: string]: boolean }>({});
  const [uploadingVideo, setUploadingVideo] = useState<{ [productId: string]: boolean }>({});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Filter unrated products
  const unratedItems = items.filter(item => !item.daDanhGia);

  useEffect(() => {
    if (isOpen && unratedItems.length > 0) {
      const initialReviews: { [productId: string]: SingleProductReview } = {};
      unratedItems.forEach(item => {
        initialReviews[item.maSanPham] = {
          sanPhamId: item.maSanPham,
          tenSanPham: item.tenSanPham,
          anh: item.anh,
          soSao: 5,
          noiDung: '',
          duongDanVideo: '',
          images: []
        };
      });
      setReviewsState(initialReviews);
      setActiveProductId(unratedItems[0].maSanPham);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen || unratedItems.length === 0) return null;

  const activeReview = reviewsState[activeProductId];

  const handleRatingChange = (productId: string, rating: number) => {
    setReviewsState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        soSao: rating
      }
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviewsState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        noiDung: comment
      }
    }));
  };

  // Upload Image handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeReview) return;

    const currentImages = activeReview.images || [];
    if (currentImages.length >= 5) {
      alert('Chỉ được tải lên tối đa 5 hình ảnh cho mỗi sản phẩm.');
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ.');
      return;
    }

    setUploadingImage(prev => ({ ...prev, [activeProductId]: true }));
    try {
      const res = await uploadMedia(file);
      if (res.success && res.url) {
        setReviewsState(prev => {
          const prodReview = prev[activeProductId];
          const updatedImages = [...prodReview.images, res.url!].slice(0, 5);
          return {
            ...prev,
            [activeProductId]: {
              ...prodReview,
              images: updatedImages
            }
          };
        });
      } else {
        alert(res.message || 'Lỗi khi tải ảnh lên.');
      }
    } catch (err: any) {
      alert(err.message || 'Không thể upload ảnh.');
    } finally {
      setUploadingImage(prev => ({ ...prev, [activeProductId]: false }));
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Upload Video handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeReview) return;

    if (activeReview.duongDanVideo) {
      alert('Chỉ được tải lên tối đa 1 video cho mỗi sản phẩm.');
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('video/')) {
      alert('Vui lòng chọn tệp video hợp lệ.');
      return;
    }

    setUploadingVideo(prev => ({ ...prev, [activeProductId]: true }));
    try {
      const res = await uploadMedia(file);
      if (res.success && res.url) {
        setReviewsState(prev => ({
          ...prev,
          [activeProductId]: {
            ...prev[activeProductId],
            duongDanVideo: res.url!
          }
        }));
      } else {
        alert(res.message || 'Lỗi khi tải video lên.');
      }
    } catch (err: any) {
      alert(err.message || 'Không thể upload video.');
    } finally {
      setUploadingVideo(prev => ({ ...prev, [activeProductId]: false }));
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const removeImage = (productId: string, index: number) => {
    setReviewsState(prev => {
      const prodReview = prev[productId];
      const updatedImages = prodReview.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        [productId]: {
          ...prodReview,
          images: updatedImages
        }
      };
    });
  };

  const removeVideo = (productId: string) => {
    setReviewsState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        duongDanVideo: ''
      }
    }));
  };

  const handleSubmit = async () => {
    // Collect all completed reviews (where comment is not empty or rating is selected)
    const reviewsToSubmit = Object.values(reviewsState).map(rev => ({
      sanPhamId: rev.sanPhamId,
      soSao: rev.soSao,
      noiDung: rev.noiDung.trim(),
      duongDanVideo: rev.duongDanVideo || undefined,
      images: rev.images && rev.images.length > 0 ? rev.images : undefined
    }));

    if (reviewsToSubmit.length === 0) {
      alert('Không có sản phẩm nào được chọn đánh giá.');
      return;
    }

    // Ensure at least rating or comment is filled for all items, or simply submit whatever is initialized
    setSubmitting(true);
    try {
      const res = await orderAdminService.submitOrderReviews(orderId, reviewsToSubmit);
      if (res.success) {
        alert('Gửi đánh giá thành công!');
        const firstProductId = reviewsToSubmit[0]?.sanPhamId;
        onSuccess(firstProductId);
        onClose();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Gỗi khi gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper check if a review for a product has been custom-modified (e.g. comment typed or images added)
  const isFilled = (productId: string) => {
    const rev = reviewsState[productId];
    if (!rev) return false;
    return rev.noiDung.trim().length > 0 || rev.images.length > 0 || rev.duongDanVideo.length > 0;
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-container" onClick={e => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>Đánh giá sản phẩm</h3>
          <button className="review-modal-close" onClick={onClose} disabled={submitting}>✕</button>
        </div>

        {/* Product Selection Chips */}
        <div className="review-products-chips">
          {unratedItems.map(item => {
            const isActive = item.maSanPham === activeProductId;
            const completed = isFilled(item.maSanPham);
            const stars = reviewsState[item.maSanPham]?.soSao || 5;

            return (
              <button
                key={item.maSanPham}
                type="button"
                className={`review-product-chip ${isActive ? 'chip--active' : ''} ${completed ? 'chip--completed' : ''}`}
                onClick={() => setActiveProductId(item.maSanPham)}
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
                    {completed && <span className="chip-check"><Check size={12} /> Đã soạn</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Focused Review Form */}
        {activeReview && (
          <div className="review-form-area">
            <div className="review-form-product-info">
              <strong>Đang đánh giá:</strong> {activeReview.tenSanPham}
            </div>

            {/* Stars Picker */}
            <div className="review-stars-section">
              <span className="review-field-label">Chất lượng sản phẩm:</span>
              <div className="review-stars-row">
                {[1, 2, 3, 4, 5].map(star => {
                  const isGold = star <= activeReview.soSao;
                  return (
                    <button
                      key={star}
                      type="button"
                      className="review-star-btn"
                      onClick={() => handleRatingChange(activeProductId, star)}
                      disabled={submitting}
                    >
                      <Star
                        size={28}
                        className={isGold ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  );
                })}
                <span className="review-rating-text">
                  {activeReview.soSao === 5 && 'Tuyệt vời'}
                  {activeReview.soSao === 4 && 'Rất tốt'}
                  {activeReview.soSao === 3 && 'Bình thường'}
                  {activeReview.soSao === 2 && 'Không tốt'}
                  {activeReview.soSao === 1 && 'Tệ'}
                </span>
              </div>
            </div>

            {/* Comment Box */}
            <div className="review-comment-section">
              <span className="review-field-label">Nhận xét chi tiết:</span>
              <textarea
                className="review-textarea"
                placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này với người mua khác nhé..."
                value={activeReview.noiDung}
                onChange={e => handleCommentChange(activeProductId, e.target.value)}
                disabled={submitting}
                rows={4}
              />
            </div>

            {/* Media Upload Area */}
            <div className="review-media-section">
              <div className="review-media-buttons">
                {/* Image Upload Trigger */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    id="review-image-input"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={submitting || uploadingImage[activeProductId] || activeReview.images.length >= 5}
                    ref={imageInputRef}
                  />
                  <label
                    htmlFor="review-image-input"
                    className={`review-upload-trigger ${activeReview.images.length >= 5 ? 'disabled' : ''}`}
                  >
                    {uploadingImage[activeProductId] ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ImageIcon size={16} />
                    )}
                    Thêm ảnh ({activeReview.images.length}/5)
                  </label>
                </div>

                {/* Video Upload Trigger */}
                <div>
                  <input
                    type="file"
                    accept="video/*"
                    id="review-video-input"
                    className="hidden"
                    onChange={handleVideoUpload}
                    disabled={submitting || uploadingVideo[activeProductId] || !!activeReview.duongDanVideo}
                    ref={videoInputRef}
                  />
                  <label
                    htmlFor="review-video-input"
                    className={`review-upload-trigger ${activeReview.duongDanVideo ? 'disabled' : ''}`}
                  >
                    {uploadingVideo[activeProductId] ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Film size={16} />
                    )}
                    Thêm video ({activeReview.duongDanVideo ? '1' : '0'}/1)
                  </label>
                </div>
              </div>

              {/* Previews Grid */}
              {(activeReview.images.length > 0 || activeReview.duongDanVideo) && (
                <div className="review-previews-gallery">
                  {/* Images list */}
                  {activeReview.images.map((imgUrl, index) => (
                    <div key={index} className="review-preview-thumb">
                      <img src={imgUrl} alt={`preview-${index}`} />
                      <button
                        type="button"
                        className="review-thumb-remove"
                        onClick={() => removeImage(activeProductId, index)}
                        disabled={submitting}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Video preview */}
                  {activeReview.duongDanVideo && (
                    <div className="review-preview-thumb video-preview-thumb">
                      <video src={activeReview.duongDanVideo} controls />
                      <button
                        type="button"
                        className="review-thumb-remove"
                        onClick={() => removeVideo(activeProductId)}
                        disabled={submitting}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="review-modal-footer">
          <button
            type="button"
            className="review-btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="button"
            className="review-btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

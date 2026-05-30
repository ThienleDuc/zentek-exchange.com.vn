import React, { useState } from 'react';
import { Star } from 'lucide-react';
import type { ProductDetailType } from '../../../pages/admin/ProductDetail';

interface ProductReviewsProps {
  product: ProductDetailType;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
  const [filterStar, setFilterStar] = useState<number | null>(null);

  const totalReviews = product.reviews?.length || 0;
  
  const getReviewCount = (star: number | null) => {
    if (star === null) return totalReviews;
    return product.reviews?.filter(r => r.SoSao === star).length || 0;
  };

  const filteredReviews = filterStar === null 
    ? product.reviews 
    : product.reviews?.filter(r => r.SoSao === filterStar);

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
          filteredReviews && filteredReviews.length > 0 ? (
            <div className="space-y-6">
              {filteredReviews.map(r => (
                <div key={r.MaDanhGia} className="border-b border-border-default pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">{r.TenNguoiMua?.charAt(0)}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-main text-sm">{r.TenNguoiMua}</div>
                      <div className="flex text-yellow-500 mt-1 mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.SoSao ? 'fill-current' : 'text-gray-300'}`} />)}
                      </div>
                      <p className="text-sm text-text-main mb-2 leading-relaxed">{r.NoiDung}</p>
                      
                      {r.media && r.media.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {r.media.map((m: any) => m.LoaiMedia === 'anh' ? (
                            <img key={m.MaPhanHoi} src={m.DuongDanMedia} alt="Review" className="w-16 h-16 rounded object-cover border border-border-default cursor-pointer hover:border-primary" />
                          ) : null)}
                        </div>
                      )}
                      
                      {r.TraLoiNoiDung && (
                        <div className="mt-4 bg-surface-muted border border-border-default p-4 rounded-lg text-sm relative before:absolute before:-top-2 before:left-6 before:w-4 before:h-4 before:bg-surface-muted before:border-l before:border-t before:border-border-default before:rotate-45">
                          <div className="font-semibold text-text-main mb-1">Phản hồi của Người bán:</div>
                          <p className="text-text-muted">{r.TraLoiNoiDung}</p>
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
    </div>
  );
};

export default ProductReviews;

import React, { useState } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, Undo, Share2, Check } from 'lucide-react';
import type { ProductDetailType } from '../../../pages/admin/ProductDetail';
import { getProductImageUrl } from '../../../utils/image.utils';

interface ProductInfoProps {
  product: ProductDetailType;
  handleAction?: (actionStatus: string, confirmMessage: string) => void;
  onSelectVariantImage?: (url: string) => void;
  role?: 'admin' | 'seller' | 'buyer';
  onAddToCart?: (qty: number) => void;
  onBuyNow?: (qty: number) => void;
  selectedVariantId?: string | null;
  onSelectVariantId?: (id: string) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ 
  product, 
  handleAction, 
  onSelectVariantImage, 
  role = 'admin',
  onAddToCart,
  onBuyNow,
  selectedVariantId = null,
  onSelectVariantId
}) => {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const handleShareLink = () => {
    const shareLink = `${window.location.origin}/san-pham/${product.MaSanPham}`;
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Không thể sao chép link:', err);
      });
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border-default p-6 flex flex-col h-fit">
      {/* Title, Badge & Share */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-start gap-2">
          <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded shadow-sm whitespace-nowrap mt-1 uppercase tracking-wider">
            {product.TinhTrang}
          </span>
          <h1 className="text-xl font-bold text-text-main leading-snug">{product.TieuDe}</h1>
        </div>
        <button 
          onClick={handleShareLink}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
            copied 
              ? 'bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20' 
              : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'
          }`}
          title="Chia sẻ link sản phẩm"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Đã sao chép!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ</span>
            </>
          )}
        </button>
      </div>

      {/* Rating & Stats row */}
      <div className="flex items-center gap-3 text-xs mb-3 text-text-muted">
        <div className="flex items-center gap-1 text-yellow-500 font-medium">
          <span className="border-b border-yellow-500">{product.DiemDanhGia.toFixed(1)}</span>
          <Star className="w-3.5 h-3.5 fill-current" />
        </div>
        <div className="w-px h-3 bg-border-default"></div>
        <div className="flex items-center gap-1">
          <span className="text-text-main font-medium">{product.LuotXem}</span> Lượt xem
        </div>
        <div className="w-px h-3 bg-border-default"></div>
        <div className="flex items-center gap-1">
          <span className="text-text-main font-medium">{product.SoLuongDaBan}</span> Đã bán
        </div>
      </div>

      {/* Price Box */}
      <div className="bg-surface-muted/50 px-4 py-3 rounded-lg mb-4 flex items-center border border-border-default/50">
        <div className="text-2xl font-bold text-primary">{product.Gia.toLocaleString('vi-VN')} đ</div>
      </div>

      {/* Out of Stock Notice Banner */}
      {(product.DaHetHang === 1 || product.DaHetHang === true || product.SoLuong === 0) && (
        <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/20 text-danger rounded-lg flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse shrink-0"></span>
          <span>Sản phẩm này hiện đang TẠM HẾT HÀNG</span>
        </div>
      )}

      {product.CuaHangTrangThai === false && (
        <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/20 text-danger rounded-lg flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse shrink-0"></span>
          <span>Cửa hàng của sản phẩm này hiện đã bị khóa</span>
        </div>
      )}

      {/* Info table-like display */}
      <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm mb-4">
        <div className="text-text-muted">Danh mục</div>
        <div className="font-medium text-text-main">
          {product.TenDanhMucCha ? (
            <span className="flex items-center gap-1.5">
              <span className="text-text-muted hover:text-primary cursor-pointer transition-colors">{product.TenDanhMucCha}</span>
              <span className="text-text-muted text-[10px] opacity-60">▶</span>
              <span>{product.TenDanhMuc}</span>
            </span>
          ) : (
            product.TenDanhMuc
          )}
        </div>

        <div className="text-text-muted">Kho hàng</div>
        <div className="font-medium text-text-main">{product.SoLuong}</div>

        {role !== 'buyer' && (
          <>
            <div className="text-text-muted">Trạng thái</div>
            <div>
              <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${product.TrangThaiDuyet === 'Đã duyệt' ? 'bg-secondary/10 text-secondary' : product.TrangThaiDuyet === 'Chờ phê duyệt' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                {product.TrangThaiDuyet}
              </span>
            </div>
          </>
        )}

        <div className="text-text-muted">Thời gian</div>
        <div className="text-text-muted text-xs space-y-0.5">
          <div>Đăng: {product.NgayDang ? new Date(product.NgayDang).toLocaleDateString('vi-VN') : '---'}</div>
          <div>Cập nhật: {product.NgaySua ? new Date(product.NgaySua).toLocaleDateString('vi-VN') : '---'}</div>
        </div>
      </div>

      {/* Variations (Phân loại) */}
      {product.variations && product.variations.length > 0 && (
        <div className="mb-4 pt-4 border-t border-border-default">
          <div className="text-text-muted text-sm font-medium mb-3">Phân loại sản phẩm</div>
          <div className="flex flex-wrap gap-3">
            {product.variations.map((variant) => (
              <div 
                key={variant.MaPhanLoai} 
                onClick={() => {
                  if (variant.DuongDanAnh && onSelectVariantImage) {
                    onSelectVariantImage(variant.DuongDanAnh);
                  }
                  if (onSelectVariantId) {
                    onSelectVariantId(variant.MaPhanLoai);
                  }
                }}
                className={`flex items-center gap-2 p-1.5 pr-3 rounded-lg transition-all shadow-sm cursor-pointer border-2 ${
                  selectedVariantId === variant.MaPhanLoai
                    ? 'border-primary bg-primary/5'
                    : 'border-border-default bg-surface-muted hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                {variant.DuongDanAnh ? (
                  <img 
                    src={getProductImageUrl(variant.DuongDanAnh)} 
                    alt={variant.TenPhanLoai} 
                    className="w-8 h-8 object-cover rounded-md border border-border-default/50"
                  />
                ) : (
                  <div className="w-8 h-8 bg-border-default rounded-md flex items-center justify-center text-[10px] text-text-muted">No IMG</div>
                )}
                <span className="text-sm text-text-main font-medium">{variant.TenPhanLoai}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role-based Actions */}
      <div className="flex gap-3 pt-4 border-t border-border-default mt-6">
        {role === 'admin' && handleAction && (
          <div className="flex flex-col gap-3 w-full">
            {product.CuaHangTrangThai === false ? (
              <div className="p-3 bg-danger/10 border border-danger/25 text-danger text-center rounded-lg text-sm font-semibold w-full">
                Không thể thực hiện thao tác phê duyệt vì cửa hàng đã bị khóa.
              </div>
            ) : (
              <>
                {product.TrangThaiDuyet === 'Chờ phê duyệt' && (
                  <div className="flex gap-3 w-full">
                    <button onClick={() => handleAction('Đã từ chối', 'Từ chối sản phẩm này?')} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-danger/10 text-danger border border-danger hover:bg-danger hover:text-white rounded-lg transition-colors text-sm font-bold">
                      <XCircle className="w-4 h-4" /> TỪ CHỐI
                    </button>
                    <button onClick={() => handleAction('Đã duyệt', 'Duyệt sản phẩm này?')} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/30 rounded-lg transition-colors text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" /> PHÊ DUYỆT
                    </button>
                  </div>
                )}
                {product.TrangThaiDuyet !== 'Chờ phê duyệt' && (
                  <button onClick={() => handleAction('Chờ phê duyệt', 'Hủy phê duyệt và chuyển về trạng thái chờ?')} className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-warning/10 text-warning border border-warning hover:bg-warning hover:text-white rounded-lg transition-colors text-sm font-bold">
                    <Undo className="w-4 h-4" /> HỦY PHÊ DUYỆT
                  </button>
                )}
                {product.TrangThaiDuyet === 'Đã duyệt' && (
                  <button onClick={() => handleAction('Đã gỡ', 'Gỡ bài vi phạm?')} className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-danger text-white hover:bg-danger-hover shadow-md shadow-danger/30 rounded-lg transition-colors text-sm font-bold">
                    <Trash2 className="w-4 h-4" /> GỠ BÀI VI PHẠM
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {role === 'seller' && handleAction && (
          <div className="flex flex-col gap-3 w-full">
            {(product.DaHetHang === 1 || product.DaHetHang === true || product.SoLuong === 0) ? (
              <button 
                onClick={() => handleAction('Còn hàng', 'Xác nhận sản phẩm này đã có hàng trở lại?')} 
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-secondary text-white hover:bg-secondary/95 shadow-md rounded-lg transition-colors text-sm font-bold"
              >
                <CheckCircle2 className="w-4 h-4" /> XÁC NHẬN CÒN HÀNG
              </button>
            ) : (
              <button 
                onClick={() => handleAction('Hết hàng', 'Bạn có chắc chắn muốn xác nhận hết hàng cho sản phẩm này?')} 
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-danger/10 text-danger border border-danger hover:bg-danger hover:text-white rounded-lg transition-colors text-sm font-bold"
              >
                <XCircle className="w-4 h-4" /> XÁC NHẬN HẾT HÀNG
              </button>
            )}
          </div>
        )}

        {role === 'buyer' && (
          <div className="flex flex-col gap-4 w-full pt-4 border-t border-border-default mt-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-muted font-medium">Số lượng:</span>
              <div className="flex items-center border border-border-default rounded-lg overflow-hidden bg-surface-muted w-32 h-10">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-full flex items-center justify-center hover:bg-surface-hover transition-colors text-lg font-bold text-text-muted hover:text-text-main"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.SoLuong}
                  value={quantity}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setQuantity(Math.min(product.SoLuong, Math.max(1, val)));
                    }
                  }}
                  className="flex-1 w-full h-full text-center bg-transparent text-sm font-semibold outline-none text-text-main [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.min(product.SoLuong, prev + 1))}
                  className="w-10 h-full flex items-center justify-center hover:bg-surface-hover transition-colors text-lg font-bold text-text-muted hover:text-text-main"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-text-muted">({product.SoLuong} sản phẩm có sẵn)</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => onAddToCart && onAddToCart(quantity)}
                disabled={product.SoLuong === 0 || product.DaHetHang === 1 || product.DaHetHang === true}
                className="flex-1 h-11 flex items-center justify-center gap-1.5 px-4 bg-secondary/10 text-secondary border border-secondary hover:bg-secondary hover:text-white rounded-lg transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thêm giỏ hàng
              </button>
              <button 
                onClick={() => onBuyNow && onBuyNow(quantity)}
                disabled={product.SoLuong === 0 || product.DaHetHang === 1 || product.DaHetHang === true}
                className="flex-1 h-11 flex items-center justify-center gap-1.5 px-4 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/30 rounded-lg transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mua hàng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;

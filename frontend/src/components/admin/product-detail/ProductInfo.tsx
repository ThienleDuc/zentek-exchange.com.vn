import React from 'react';
import { Star, CheckCircle2, XCircle, Trash2, Undo } from 'lucide-react';
import type { ProductDetailType } from '../../../pages/admin/ProductDetail';
import { SERVER_URL } from '../../../services/api';

interface ProductInfoProps {
  product: ProductDetailType;
  handleAction?: (actionStatus: string, confirmMessage: string) => void;
  onSelectVariantImage?: (url: string) => void;
  role?: 'admin' | 'seller' | 'buyer';
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product, handleAction, onSelectVariantImage, role = 'admin' }) => {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border-default p-6 flex flex-col h-fit">
      {/* Title & Badge */}
      <div className="flex items-start gap-2 mb-2">
        <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded shadow-sm whitespace-nowrap mt-1 uppercase tracking-wider">
          {product.TinhTrang}
        </span>
        <h1 className="text-xl font-bold text-text-main leading-snug">{product.TieuDe}</h1>
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

        <div className="text-text-muted">Trạng thái</div>
        <div>
          <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${product.TrangThaiDuyet === 'Đã duyệt' ? 'bg-secondary/10 text-secondary' : product.TrangThaiDuyet === 'Chờ phê duyệt' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
            {product.TrangThaiDuyet}
          </span>
        </div>

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
                }}
                className={`flex items-center gap-2 p-1.5 pr-3 bg-surface-muted border border-border-default rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm ${variant.DuongDanAnh && onSelectVariantImage ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {variant.DuongDanAnh ? (
                  <img 
                    src={variant.DuongDanAnh.startsWith('http') ? variant.DuongDanAnh : `${SERVER_URL}/uploads/products/${variant.DuongDanAnh}`} 
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
          </div>
        )}

        {role === 'seller' && (
          <>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-surface-muted text-text-main border border-border-default hover:bg-border-default rounded-lg transition-colors text-sm font-bold">
              Chỉnh sửa
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-danger/10 text-danger border border-danger hover:bg-danger hover:text-white rounded-lg transition-colors text-sm font-bold">
               Xoá sản phẩm
            </button>
          </>
        )}

        {role === 'buyer' && (
          <>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-secondary/10 text-secondary border border-secondary hover:bg-secondary hover:text-white rounded-lg transition-colors text-sm font-bold">
              Thêm vào giỏ
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/30 rounded-lg transition-colors text-sm font-bold">
              Mua ngay
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;

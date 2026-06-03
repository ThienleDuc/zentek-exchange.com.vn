import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { getProductImageUrl } from '../../utils/image.utils';

interface ProductImageGalleryProps {
  images: any[];
  activeImageUrl?: string | null;
  onSelectImage?: (url: string) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, activeImageUrl, onSelectImage }) => {
  const [internalImage, setInternalImage] = useState<string | null>(images?.length > 0 ? images[0].DuongDanAnh : null);
  const mainImage = activeImageUrl !== undefined ? activeImageUrl : internalImage;

  const handleSelectImage = (url: string) => {
    if (onSelectImage) onSelectImage(url);
    else setInternalImage(url);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-surface-muted border border-border-default rounded-xl flex flex-col items-center justify-center text-text-muted">
        <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
        <p>Chưa có hình ảnh</p>
      </div>
    );
  }

  // Lọc ra các ảnh (đã sort từ backend: ảnh chính lên đầu)
  return (
    <div className="flex flex-col gap-4">
      {/* Ảnh chính */}
      <div className="w-full aspect-square rounded-xl border border-border-default overflow-hidden bg-surface-muted relative group">
        <img src={getProductImageUrl(mainImage || '')} alt="Product Main" className="w-full h-full object-contain" />
      </div>

      {/* Danh sách ảnh phụ */}
      {images.length > 1 && (
        <div className="relative group/carousel">
          <div className="flex gap-2 overflow-x-auto snap-x scrollbar-hide py-1 px-1">
            {images.map((img, index) => (
              <div 
                key={index}
                onClick={() => handleSelectImage(img.DuongDanAnh)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden cursor-pointer snap-start transition-all ${mainImage === img.DuongDanAnh ? 'border-primary shadow-sm' : 'border-border-default hover:border-text-muted'}`}
              >
                <img src={getProductImageUrl(img.DuongDanAnh)} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {/* Gợi ý cuộn nếu nhiều ảnh */}
          {images.length > 5 && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;

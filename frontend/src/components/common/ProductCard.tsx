import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductImageUrl } from '../../utils/image.utils';

export interface Product {
  MaSanPham: string;
  TieuDe: string;
  Gia: number;
  SoLuongDaBan: number;
  TinhTrang: string;
  DaHetHang: boolean | number;
  HinhAnh: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const formatSoldCount = (sold: number): string => {
    if (sold >= 1000000) return `${(sold / 1000000).toFixed(1)}M`;
    if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k+`;
    return `${sold}`;
  };

  return (
    <article 
      className="product-card" 
      onClick={() => navigate(`/san-pham/${product.MaSanPham}`)}
    >
      <figure className="product-image-wrapper">
        <img 
          src={getProductImageUrl(product.HinhAnh)} 
          alt={product.TieuDe} 
          className="product-image" 
          loading="lazy" 
        />
        <figcaption 
          className={`condition-badge ${product.TinhTrang === 'Mới' ? 'new' : 'old'}`}
          data-condition={product.TinhTrang === 'Mới' ? 'new' : 'old'}
        >
          {product.TinhTrang}
        </figcaption>
        {product.DaHetHang ? (
          <div className="out-of-stock-overlay">
            <span className="out-of-stock-text">HẾT HÀNG</span>
          </div>
        ) : null}
      </figure>
      <div className="product-info">
        <h3 className="product-title" title={product.TieuDe}>{product.TieuDe}</h3>
        <div className="product-price">{product.Gia.toLocaleString('vi-VN')} ₫</div>
        <div className="product-sold">Đã bán {formatSoldCount(product.SoLuongDaBan)}</div>
      </div>
    </article>
  );
};

export default ProductCard;

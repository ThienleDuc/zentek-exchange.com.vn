// frontend/src/pages/Home.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage.utils';
import { getDashboardPath } from '../../utils/role.utils';
import { productService } from '../../services/product.service';
import { getProductImageUrl } from '../../utils/image.utils';

// Interface cho sản phẩm
interface Product {
  MaSanPham: string;
  TieuDe: string;
  Gia: number;
  SoLuongDaBan: number;
  TinhTrang: string;
  DaHetHang: boolean;
  HinhAnh: string;
}

// Component quản lý một danh sách sản phẩm (dùng chung cho cả hai khối)
interface ProductSectionProps {
  title: string;
  icon: string;
  sortBy: 'best_seller' | 'newest';
  limit?: number;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, icon, sortBy, limit = 20 }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API lấy danh sách sản phẩm
  const fetchProductsData = useCallback(async (currentOffset: number, currentLimit: number): Promise<Product[]> => {
    const response = await productService.getProducts({
      sortBy,
      offset: currentOffset,
      limit: currentLimit
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Lỗi khi tải sản phẩm');
  }, [sortBy]);

  // Tải lần đầu
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductsData(0, limit);
        setProducts(data);
        setOffset(limit);
        setHasMore(data.length === limit);
      } catch (err: any) {
        setError(err.message || "Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [fetchProductsData, limit]);

  // Tải thêm
  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const newProducts = await fetchProductsData(offset, limit);
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setOffset(prev => prev + limit);
        if (newProducts.length < limit) setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý click vào card (chuyển trang chi tiết)
  const handleProductClick = (product: Product) => {
    navigate(`/san-pham/${product.MaSanPham}`);
  };

  return (
    <section className="product-section">
      <h2 className="section-title">
        <span>{icon}</span> {title}
      </h2>
      <div className="products-grid">
        {products.map(product => (
          <article key={product.MaSanPham} className="product-card" onClick={() => handleProductClick(product)}>
            <figure className="product-image-wrapper">
              <img src={getProductImageUrl(product.HinhAnh)} alt={product.TieuDe} className="product-image" loading="lazy" />
              <figcaption className="condition-badge" data-condition={product.TinhTrang === 'Mới' ? 'new' : 'old'}>
                {product.TinhTrang}
              </figcaption>
              {product.DaHetHang && (
                <div className="out-of-stock-overlay">
                  <span className="out-of-stock-text">HẾT HÀNG</span>
                </div>
              )}
            </figure>
            <div className="product-info">
              <h3 className="product-title" title={product.TieuDe}>{product.TieuDe}</h3>
              <div className="product-price">{product.Gia.toLocaleString('vi-VN')} ₫</div>
              <div className="product-sold">Đã bán {product.SoLuongDaBan}</div>
            </div>
          </article>
        ))}
        {/* Hiển thị skeleton khi đang tải thêm */}
        {loading && (
          <>
            {Array(4).fill(0).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-price"></div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="load-more-container">
        {hasMore && !loading && (
          <button className="load-more-btn" onClick={loadMore}>Xem thêm</button>
        )}
        {!hasMore && products.length > 0 && (
          <button className="load-more-btn" disabled>Đã hết sản phẩm</button>
        )}
      </div>
      {error && <div className="error-msg">{error}</div>}
    </section>
  );
};

// Trang Home chính
const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = storage.getUser();
  const token = storage.getToken();
  const roleName = user?.roleName;

  // Chuyển hướng nếu đã đăng nhập và có dashboard riêng
  useEffect(() => {
    if (token && roleName) {
      const dashboardPath = getDashboardPath(roleName as any);
      if (dashboardPath !== '/') {
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [roleName, token, navigate]);

  // Nếu đang trong trạng thái chờ redirect (có user và dashboard khác '/'), không render gì
  if (user && token && roleName && getDashboardPath(roleName as any) !== '/') {
    return null;
  }

  return (
    <main className="page-home">
      <div className="home-container">
        {/* Khối sản phẩm bán chạy nhất */}
        <ProductSection
          title="Bán chạy nhất"
          icon="🔥"
          sortBy="best_seller"
          limit={18}
        />
        {/* Khối sản phẩm mới nhất */}
        <ProductSection
          title="Mới nhất"
          icon="✨"
          sortBy="newest"
          limit={18}
        />
      </div>
    </main>
  );
};

export default Home;
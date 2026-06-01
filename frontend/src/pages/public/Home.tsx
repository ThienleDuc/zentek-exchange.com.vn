// frontend/src/pages/Home.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage.utils';
import { getDashboardPath } from '../../utils/role.utils';

// --- Dữ liệu giả (mock products) ---
// Hàm tạo sản phẩm mẫu cho từng danh sách
const generateMockProducts = (baseId: string, isBestSeller: boolean = true) => {
  const products = [];
  const conditions = ['Mới', 'Cũ'];
  const titles = [
    "Laptop Gaming ASUS ROG Strix G15", "iPhone 15 Pro Max 256GB", "Tai nghe không dây Sony WH-1000XM5",
    "Bàn phím cơ Keychron K2", "Chuột không dây Logitech MX Master 3S", "Màn hình Dell UltraSharp 27",
    "Ổ cứng SSD Samsung 1TB", "Card đồ họa RTX 4060", "RAM DDR5 16GB Kingston", "Loa Bluetooth JBL Charge 5",
    "Điện thoại Samsung S24 Ultra", "iPad Pro 11 inch M2", "MacBook Air M3", "Pin dự phòng 20000mAh",
    "Cáp sạc nhanh 100W", "Balo chống sốc cao cấp", "Đồng hồ thông minh Apple Watch S9",
    "Máy ảnh Sony ZV-E10", "Webcam 4K Logitech Brio", "Đèn LED streamer", "Router WiFi 6"
  ];

  for (let i = 1; i <= 40; i++) {
    const id = `${baseId}_${i}`;
    const titleIndex = (i - 1) % titles.length;
    let title = titles[titleIndex] + (isBestSeller ? ` (Hot ${i})` : ` (Mới ${i})`);
    if (i === 7) title = "Sản phẩm có tên cực kỳ dài để kiểm tra giới hạn hai dòng trên card nó sẽ hiển thị ba chấm cuối cùng";
    const price = Math.floor(Math.random() * 25000000) + 500000;
    const sold = isBestSeller ? Math.floor(Math.random() * 1500) + 50 : Math.floor(Math.random() * 300) + 5;
    const condition = conditions[i % 2];
    const isOutOfStock = (i % 7 === 0); // Cứ 7 sản phẩm có 1 hết hàng
    const imageUrl = `https://picsum.photos/id/${100 + (i % 50)}/400/400`; // Ảnh giả
    products.push({
      MaSanPham: id,
      TieuDe: title,
      Gia: price,
      SoLuongDaBan: sold,
      TinhTrang: condition,
      DaHetHang: isOutOfStock,
      HinhAnh: imageUrl,
    });
  }
  return products;
};

// Dữ liệu cho hai danh sách
const bestSellerFull = generateMockProducts("bs", true);
const newestFull = generateMockProducts("nw", false);

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
  allProducts: Product[];
  limit?: number;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, icon, allProducts, limit = 20 }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm mô phỏng gọi API (giả định)
  const fetchProducts = useCallback(async (currentOffset: number, currentLimit: number): Promise<Product[]> => {
    // GHI CHÚ: Đây là API giả định lấy sản phẩm với offset/limit.
    // Thực tế sẽ gọi: GET /api/products?offset=...&limit=...&sortBy=...
    console.log(`[API giả định] Gọi GET /api/products?offset=${currentOffset}&limit=${currentLimit}&sortBy=${title.includes('Bán chạy') ? 'sales' : 'newest'}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = currentOffset;
        const end = currentOffset + currentLimit;
        const chunk = allProducts.slice(start, end);
        resolve(chunk);
      }, 500);
    });
  }, [allProducts, title]);

  // Tải lần đầu
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProducts(0, limit);
        setProducts(data);
        setOffset(limit);
        setHasMore(data.length === limit);
      } catch (err) {
        setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [fetchProducts, limit]);

  // Tải thêm
  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const newProducts = await fetchProducts(offset, limit);
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setOffset(prev => prev + limit);
        if (newProducts.length < limit) setHasMore(false);
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý click vào card (chuyển trang chi tiết)
  const handleProductClick = (product: Product) => {
    // GHI CHÚ: Điều hướng đến trang chi tiết sản phẩm
    console.log(`[API giả định] Điều hướng đến /san-pham/${product.MaSanPham}`);
    alert(`[Demo] Chuyển đến trang chi tiết: ${product.TieuDe}\nMã: ${product.MaSanPham}`);
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
              <img src={product.HinhAnh} alt={product.TieuDe} className="product-image" loading="lazy" />
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
              <h3 className="product-title">{product.TieuDe}</h3>
              <div className="product-price">{product.Gia.toLocaleString('vi-VN')} ₫</div>
              <div className="product-sold">Đã bán {product.SoLuongDaBan}</div>
            </div>
          </article>
        ))}
        {/* Hiển thị skeleton khi đang tải thêm */}
        {loading && (
          <>
            {Array(limit).fill(0).map((_, idx) => (
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
          allProducts={bestSellerFull}
          limit={20}
        />
        {/* Khối sản phẩm mới nhất */}
        <ProductSection
          title="Mới nhất"
          icon="✨"
          allProducts={newestFull}
          limit={20}
        />
      </div>
    </main>
  );
};

export default Home;
// frontend/src/pages/Search.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// --- Helper: format số lượng đã bán ---
const formatSoldCount = (sold: number): string => {
  if (sold >= 1000) {
    const thousands = Math.floor(sold / 1000);
    return `${thousands}k+`;
  }
  return `${sold}`;
};

// --- Dữ liệu giả (mock products) ---
// Tạo một mảng lớn sản phẩm giả lập (200 sản phẩm) để test phân trang và filter
const generateMockProductList = (count: number) => {
  const products = [];
  const categories = [
    { id: 'cat1', name: 'Điện thoại & Tablet', children: ['Điện thoại Apple', 'Điện thoại Android', 'Máy tính bảng'] },
    { id: 'cat2', name: 'Máy tính xách tay', children: ['Laptop Gaming', 'Laptop Văn phòng', 'MacBook'] },
    { id: 'cat3', name: 'Linh kiện máy tính', children: ['CPU', 'VGA', 'RAM', 'Mainboard', 'SSD/HDD'] },
    { id: 'cat4', name: 'Thiết bị âm thanh', children: ['Tai nghe', 'Loa', 'Micro'] },
    { id: 'cat5', name: 'Phụ kiện & Khác', children: ['Chuột bàn phím', 'Cáp sạc', 'Balo túi'] },
  ];
  const stores = ['ZenTek Official', 'TechPro', 'GearVN', 'CellphoneS', 'LaptopAZ', 'AudioHouse'];
  const conditions = ['Mới', 'Cũ'];
  const titles = [
    "Laptop Gaming ASUS ROG Strix G15", "iPhone 15 Pro Max 256GB", "Tai nghe không dây Sony WH-1000XM5",
    "Bàn phím cơ Keychron K2", "Chuột không dây Logitech MX Master 3S", "Màn hình Dell UltraSharp 27",
    "Ổ cứng SSD Samsung 1TB", "Card đồ họa RTX 4060", "RAM DDR5 16GB Kingston", "Loa Bluetooth JBL Charge 5",
    "Điện thoại Samsung S24 Ultra", "iPad Pro 11 inch M2", "MacBook Air M3", "Pin dự phòng 20000mAh",
    "Cáp sạc nhanh 100W", "Balo chống sốc cao cấp", "Đồng hồ thông minh Apple Watch S9"
  ];

  for (let i = 1; i <= count; i++) {
    const catIndex = i % categories.length;
    const cat = categories[catIndex];
    const subCat = cat.children[i % cat.children.length];
    const store = stores[i % stores.length];
    const condition = conditions[i % 2];
    const price = 200000 + Math.floor(Math.random() * 30000000);
    const sold = Math.floor(Math.random() * 5000);
    const rating = (Math.random() * 4 + 1).toFixed(1);
    const date = new Date(Date.now() - Math.random() * 90 * 24 * 3600000);
    const outOfStock = i % 13 === 0;
    products.push({
      MaSanPham: `sp_${i}`,
      TieuDe: `${titles[i % titles.length]} ${i}`,
      Gia: price,
      SoLuongDaBan: sold,
      DiemDanhGia: parseFloat(rating),
      TinhTrang: condition,
      DaHetHang: outOfStock,
      HinhAnh: `https://picsum.photos/id/${(i % 70) + 100}/400/400`,
      TenCuaHang: store,
      TenDanhMuc: cat.name,
      TenDanhMucCon: subCat,
      NgayDang: date.toISOString(),
      MaDanhMuc: cat.id,
      MaCuaHang: `store_${store}`,
    });
  }
  return products;
};

const allMockProducts = generateMockProductList(200);

// Interface cho sản phẩm
interface Product {
  MaSanPham: string;
  TieuDe: string;
  Gia: number;
  SoLuongDaBan: number;
  DiemDanhGia: number;
  TinhTrang: string;
  DaHetHang: boolean;
  HinhAnh: string;
  TenCuaHang: string;
  TenDanhMuc: string;
  TenDanhMucCon: string;
  NgayDang: string;
  MaDanhMuc: string;
  MaCuaHang: string;
}

// Interface filter
interface Filters {
  keyword: string;
  category: string;
  priceMin: number | '';
  priceMax: number | '';
  rating: number;
  condition: string;
  store: string;
  sort: string;
  page: number;
}

// Hàm lọc sản phẩm dựa trên filter (giả lập server-side)
const filterProducts = (products: Product[], filters: Filters): { filtered: Product[]; total: number } => {
  let filtered = [...products];
  
  // Tìm kiếm theo từ khóa
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    filtered = filtered.filter(p => p.TieuDe.toLowerCase().includes(kw));
  }
  
  // Lọc danh mục
  if (filters.category) {
    filtered = filtered.filter(p => p.TenDanhMuc === filters.category || p.TenDanhMucCon === filters.category);
  }
  
  // Lọc giá (đã sửa)
  const minPrice = filters.priceMin !== '' && filters.priceMin != null ? Number(filters.priceMin) : null;
  const maxPrice = filters.priceMax !== '' && filters.priceMax != null ? Number(filters.priceMax) : null;
  
  if (minPrice !== null && !isNaN(minPrice)) {
    filtered = filtered.filter(p => (p.Gia ?? 0) >= minPrice);
  }
  if (maxPrice !== null && !isNaN(maxPrice)) {
    filtered = filtered.filter(p => (p.Gia ?? 0) <= maxPrice);
  }
  
  // Lọc đánh giá
  if (filters.rating > 0) {
    filtered = filtered.filter(p => p.DiemDanhGia >= filters.rating);
  }
  
  // Lọc tình trạng
  if (filters.condition) {
    filtered = filtered.filter(p => p.TinhTrang === filters.condition);
  }
  
  // Lọc cửa hàng
  if (filters.store) {
    filtered = filtered.filter(p => p.TenCuaHang === filters.store);
  }
  
  // Sắp xếp (giữ nguyên)
  switch (filters.sort) {
    case 'price_asc':
      filtered.sort((a, b) => a.Gia - b.Gia);
      break;
    case 'price_desc':
      filtered.sort((a, b) => b.Gia - a.Gia);
      break;
    case 'newest':
      filtered.sort((a, b) => new Date(b.NgayDang).getTime() - new Date(a.NgayDang).getTime());
      break;
    case 'best_seller':
      filtered.sort((a, b) => b.SoLuongDaBan - a.SoLuongDaBan);
      break;
    case 'top_rated':
      filtered.sort((a, b) => b.DiemDanhGia - a.DiemDanhGia);
      break;
    default:
      break;
  }
  
  return { filtered, total: filtered.length };
};

// Component Sidebar bộ lọc
interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  onReset: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onReset }) => {
  // Danh sách danh mục (lấy từ dữ liệu giả)
  const categories = [
    'Điện thoại & Tablet', 'Máy tính xách tay', 'Linh kiện máy tính', 'Thiết bị âm thanh', 'Phụ kiện & Khác'
  ];
  const stores = [...new Set(allMockProducts.map(p => p.TenCuaHang))];
  
  return (
    <aside className="search-sidebar">
      <div className="sidebar-header">
        <h3>Bộ lọc tìm kiếm</h3>
        <button className="reset-btn" onClick={onReset}>Đặt lại</button>
      </div>

      {/* Danh mục */}
      <div className="filter-group">
        <label className="filter-label">Danh mục</label>
        <select value={filters.category} onChange={(e) => onFilterChange({ category: e.target.value, page: 1 })}>
          <option value="">Tất cả</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Khoảng giá */}
      <div className="filter-group">
        <label className="filter-label">Khoảng giá</label>
        <div className="price-range">
          <input type="number" placeholder="Từ" value={filters.priceMin === '' ? '' : filters.priceMin}
            onChange={(e) => onFilterChange({ priceMin: e.target.value === '' ? '' : Number(e.target.value), page: 1 })} />
          <span>-</span>
          <input type="number" placeholder="Đến" value={filters.priceMax === '' ? '' : filters.priceMax}
            onChange={(e) => onFilterChange({ priceMax: e.target.value === '' ? '' : Number(e.target.value), page: 1 })} />
        </div>
      </div>

      {/* Đánh giá sao */}
      <div className="filter-group">
        <label className="filter-label">Đánh giá</label>
        <div className="rating-options">
          {[5,4,3,2,1].map(star => (
            <label key={star} className="rating-option">
              <input type="radio" name="rating" checked={filters.rating === star}
                onChange={() => onFilterChange({ rating: star, page: 1 })} />
              <span>{star} sao trở lên</span>
            </label>
          ))}
          <label className="rating-option">
            <input type="radio" name="rating" checked={filters.rating === 0}
              onChange={() => onFilterChange({ rating: 0, page: 1 })} />
            <span>Tất cả</span>
          </label>
        </div>
      </div>

      {/* Tình trạng */}
      <div className="filter-group">
        <label className="filter-label">Tình trạng</label>
        <div className="condition-options">
          <label>
            <input type="radio" name="condition" value="Mới" checked={filters.condition === 'Mới'}
              onChange={() => onFilterChange({ condition: 'Mới', page: 1 })} />
            <span>Mới</span>
          </label>
          <label>
            <input type="radio" name="condition" value="Cũ" checked={filters.condition === 'Cũ'}
              onChange={() => onFilterChange({ condition: 'Cũ', page: 1 })} />
            <span>Cũ</span>
          </label>
          <label>
            <input type="radio" name="condition" value="" checked={filters.condition === ''}
              onChange={() => onFilterChange({ condition: '', page: 1 })} />
            <span>Tất cả</span>
          </label>
        </div>
      </div>

      {/* Cửa hàng */}
      <div className="filter-group">
        <label className="filter-label">Cửa hàng</label>
        <select value={filters.store} onChange={(e) => onFilterChange({ store: e.target.value, page: 1 })}>
          <option value="">Tất cả</option>
          {stores.map(store => (
            <option key={store} value={store}>{store}</option>
          ))}
        </select>
      </div>
    </aside>
  );
};

// Component chính Search
const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();



  // Khởi tạo filters từ URL
  const initialFilters: Filters = {
    keyword: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : '',
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : '',
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : 0,
    condition: searchParams.get('condition') || '',
    store: searchParams.get('store') || '',
    sort: searchParams.get('sort') || 'relevance',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const limit = 12; // Số sản phẩm mỗi trang

  // Hàm gọi API giả định (lọc và phân trang)
  const fetchProducts = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    // Mô phỏng delay
    await new Promise(resolve => setTimeout(resolve, 400));
    const { filtered, total: totalCount } = filterProducts(allMockProducts, currentFilters);
    const start = (currentFilters.page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    setProducts(paged);
    setTotal(totalCount);
    setLoading(false);
  }, [limit]);

  // Cập nhật khi filters thay đổi
  useEffect(() => {
    // Đồng bộ URL
    const params: Record<string, string> = {};
    if (filters.keyword) params.q = filters.keyword;
    if (filters.category) params.category = filters.category;
    if (filters.priceMin !== '') params.priceMin = String(filters.priceMin);
    if (filters.priceMax !== '') params.priceMax = String(filters.priceMax);
    if (filters.rating > 0) params.rating = String(filters.rating);
    if (filters.condition) params.condition = filters.condition;
    if (filters.store) params.store = filters.store;
    if (filters.sort !== 'relevance') params.sort = filters.sort;
    if (filters.page > 1) params.page = String(filters.page);
    setSearchParams(params, { replace: true });
    fetchProducts(filters);
  }, [filters, setSearchParams, fetchProducts]);

  // Hàm thay đổi filter
  const updateFilter = (newFilter: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilter }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: filters.keyword, // giữ từ khóa tìm kiếm? Nên giữ? Theo UX, reset nên xóa hết ngoại trừ từ khóa
      category: '',
      priceMin: '',
      priceMax: '',
      rating: 0,
      condition: '',
      store: '',
      sort: 'relevance',
      page: 1,
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="page-search search-results search">
      <div className="search-container">
        {/* Sidebar - desktop */}
        <FilterSidebar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />

        {/* Nút mở filter mobile */}
        <button className="mobile-filter-toggle" onClick={() => setMobileFilterOpen(true)}>
          🔍 Bộ lọc
        </button>

        {/* Mobile filter drawer */}
        {mobileFilterOpen && (
          <div className="mobile-filter-overlay" onClick={() => setMobileFilterOpen(false)}>
            <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
              <FilterSidebar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />
              <button className="close-drawer" onClick={() => setMobileFilterOpen(false)}>Đóng</button>
            </div>
          </div>
        )}

        {/* Vùng kết quả */}
        <div className="search-results">
          <div className="result-toolbar">
            <div className="result-count">
              {loading ? 'Đang tìm...' : `Tìm thấy ${total} sản phẩm`}
            </div>
            <div className="sort-options">
              <label>Sắp xếp:</label>
              <select value={filters.sort} onChange={(e) => updateFilter({ sort: e.target.value, page: 1 })}>
                <option value="relevance">Liên quan nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
                <option value="best_seller">Bán chạy nhất</option>
                <option value="top_rated">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* Grid sản phẩm */}
          <div className="products-grid">
            {loading ? (
              // Skeleton
              Array(limit).fill(0).map((_, idx) => (
                <div key={idx} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text short"></div>
                  <div className="skeleton-price"></div>
                </div>
              ))
            ) : products.length === 0 ? (
              <div className="no-results">
                <p>Không tìm thấy sản phẩm phù hợp.</p>
                <button onClick={resetFilters}>Xóa bộ lọc</button>
              </div>
            ) : (
              products.map(product => (
                <article key={product.MaSanPham} className="product-card" onClick={() => {
                  console.log(`[API giả định] Điều hướng đến /san-pham/${product.MaSanPham}`);
                  alert(`Chi tiết sản phẩm: ${product.TieuDe}`);
                }}>
                  <figure className="product-image-wrapper">
                    <img src={product.HinhAnh} alt={product.TieuDe} className="product-image" loading="lazy" />
                    <figcaption className={`condition-badge ${product.TinhTrang === 'Mới' ? 'new' : 'old'}`}>
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
                    <div className="product-sold">Đã bán {formatSoldCount(product.SoLuongDaBan)}</div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Phân trang số */}
          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={filters.page === 1}
                onClick={() => updateFilter({ page: filters.page - 1 })}
                className="pagination-btn"
              >
                ‹ Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = filters.page;
                if (totalPages <= 5) pageNum = i + 1;
                else if (filters.page <= 3) pageNum = i + 1;
                else if (filters.page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = filters.page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${pageNum === filters.page ? 'active' : ''}`}
                    onClick={() => updateFilter({ page: pageNum })}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={filters.page === totalPages}
                onClick={() => updateFilter({ page: filters.page + 1 })}
                className="pagination-btn"
              >
                Sau ›
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Search;
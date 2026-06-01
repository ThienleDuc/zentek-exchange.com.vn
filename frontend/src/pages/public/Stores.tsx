// frontend/src/pages/Stores.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Store, Package, TrendingUp, CheckCircle, MapPin } from 'lucide-react';

// --- Helper: format số lượng (k+) ---
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${Math.floor(num / 1000)}k+`;
  return `${num}`;
};

// --- Helper: hiển thị sao đánh giá ---
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  return (
    <div className="stars-container">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="star filled" size={14} fill="currentColor" />
      ))}
      {hasHalf && <Star key="half" className="star half" size={14} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="star empty" size={14} />
      ))}
    </div>
  );
};

// --- Dữ liệu giả (mock stores) ---
const generateMockStores = (count: number) => {
  const stores = [];
  const provinces = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai'];
  const businessTypes = [
    { id: 1, name: 'Cá nhân' },
    { id: 2, name: 'Hộ kinh doanh' },
    { id: 3, name: 'Doanh nghiệp nhỏ' },
  ];
  const categories = ['Điện thoại', 'Laptop', 'Linh kiện', 'Âm thanh', 'Phụ kiện'];
  const storeNames = [
    'ZenTek Official', 'TechPro Việt Nam', 'GearVN', 'CellphoneS', 'LaptopAZ', 'AudioHouse',
    'AnPhat Computer', 'Phong Vũ', 'Thế giới di động', 'FPT Shop', 'MediaMart', 'Hoàng Hà Mobile'
  ];

  for (let i = 1; i <= count; i++) {
    const id = `store_${i}`;
    const name = `${storeNames[i % storeNames.length]} ${i}`;
    const logo = i % 7 === 0 ? null : `https://picsum.photos/id/${(i % 50) + 100}/200/200`;
    const province = provinces[i % provinces.length];
    const businessType = businessTypes[i % businessTypes.length];
    const verified = i % 5 !== 0;
    const totalProducts = 10 + Math.floor(Math.random() * 200);
    const totalSold = 100 + Math.floor(Math.random() * 50000);
    const avgRating = parseFloat((Math.random() * 2 + 3).toFixed(1));
    const totalReviews = Math.floor(Math.random() * 300);
    const joinDate = new Date(Date.now() - Math.random() * 2 * 365 * 24 * 3600000);
    const description = `Chuyên cung cấp các sản phẩm ${categories[i % categories.length]} chất lượng cao. Uy tín hàng đầu.`;

    stores.push({
      MaCuaHang: id,
      TenCuaHang: name,
      Logo: logo,
      MoTa: description,
      TinhThanh: province,      // Chỉ lưu tỉnh thành
      LoaiHinh: businessType.id,
      LoaiHinhTen: businessType.name,
      DaXacThucPhapLy: verified,
      SoSanPham: totalProducts,
      SoLuongDaBan: totalSold,
      DiemDanhGia: avgRating,
      SoLuongDanhGia: totalReviews,
      NgayTao: joinDate.toISOString(),
      NguoiBanHoTen: `Chủ shop ${name}`,
    });
  }
  return stores;
};

const allMockStores = generateMockStores(80);

interface Store {
  MaCuaHang: string;
  TenCuaHang: string;
  Logo: string | null;
  MoTa: string;
  TinhThanh: string;
  LoaiHinh: number;
  LoaiHinhTen: string;
  DaXacThucPhapLy: boolean;
  SoSanPham: number;
  SoLuongDaBan: number;
  DiemDanhGia: number;
  SoLuongDanhGia: number;
  NgayTao: string;
  NguoiBanHoTen: string;
}

interface Filters {
  search: string;
  categoryIds: string[];
  minRating: number;
  province: string;
  businessType: string;
  verified: boolean;
  sort: string;
  page: number;
}

// Hàm lọc cửa hàng giả định
const filterStores = (stores: Store[], filters: Filters): { filtered: Store[]; total: number } => {
  let filtered = [...stores];
  
  if (filters.search) {
    const kw = filters.search.toLowerCase();
    filtered = filtered.filter(s => s.TenCuaHang.toLowerCase().includes(kw));
  }
  
  if (filters.province) {
    filtered = filtered.filter(s => s.TinhThanh === filters.province);
  }
  
  if (filters.businessType) {
    filtered = filtered.filter(s => s.LoaiHinhTen === filters.businessType);
  }
  
  if (filters.verified) {
    filtered = filtered.filter(s => s.DaXacThucPhapLy === true);
  }
  
  if (filters.minRating > 0) {
    filtered = filtered.filter(s => s.DiemDanhGia >= filters.minRating);
  }
  
  switch (filters.sort) {
    case 'name_asc':
      filtered.sort((a, b) => a.TenCuaHang.localeCompare(b.TenCuaHang));
      break;
    case 'name_desc':
      filtered.sort((a, b) => b.TenCuaHang.localeCompare(a.TenCuaHang));
      break;
    case 'newest':
      filtered.sort((a, b) => new Date(b.NgayTao).getTime() - new Date(a.NgayTao).getTime());
      break;
    case 'top_rated':
      filtered.sort((a, b) => b.DiemDanhGia - a.DiemDanhGia);
      break;
    case 'best_seller':
      filtered.sort((a, b) => b.SoLuongDaBan - a.SoLuongDaBan);
      break;
    case 'most_products':
      filtered.sort((a, b) => b.SoSanPham - a.SoSanPham);
      break;
    default:
      break;
  }
  return { filtered, total: filtered.length };
};

// Component Sidebar bộ lọc (giữ nguyên, chỉ lọc theo tỉnh từ `TinhThanh`)
const FilterSidebar: React.FC<{ filters: Filters; onFilterChange: (newFilters: Partial<Filters>) => void; onReset: () => void }> = 
({ filters, onFilterChange, onReset }) => {
  const provinces = [...new Set(allMockStores.map(s => s.TinhThanh))];
  const businessTypes = [...new Set(allMockStores.map(s => s.LoaiHinhTen))];
  
  return (
    <aside className="stores-sidebar">
      <div className="sidebar-header">
        <h3>Lọc cửa hàng</h3>
        <button className="reset-btn" onClick={onReset}>Đặt lại</button>
      </div>
      
      <div className="filter-group">
        <label className="filter-label">Địa điểm (Tỉnh/Thành)</label>
        <select value={filters.province} onChange={(e) => onFilterChange({ province: e.target.value, page: 1 })}>
          <option value="">Tất cả</option>
          {provinces.map(prov => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <label className="filter-label">Loại hình</label>
        <select value={filters.businessType} onChange={(e) => onFilterChange({ businessType: e.target.value, page: 1 })}>
          <option value="">Tất cả</option>
          {businessTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <label className="filter-label">Xác thực</label>
        <label className="checkbox-label">
          <input type="checkbox" checked={filters.verified} onChange={(e) => onFilterChange({ verified: e.target.checked, page: 1 })} />
          <span>Đã xác thực pháp lý</span>
        </label>
      </div>
      
      <div className="filter-group">
        <label className="filter-label">Đánh giá</label>
        <div className="rating-options">
          {[5,4,3].map(rating => (
            <label key={rating} className="rating-option">
              <input type="radio" name="rating" checked={filters.minRating === rating} onChange={() => onFilterChange({ minRating: rating, page: 1 })} />
              <span>{rating} sao trở lên</span>
            </label>
          ))}
          <label className="rating-option">
            <input type="radio" name="rating" checked={filters.minRating === 0} onChange={() => onFilterChange({ minRating: 0, page: 1 })} />
            <span>Tất cả</span>
          </label>
        </div>
      </div>
    </aside>
  );
};

// Component chính Stores
const Stores: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialFilters: Filters = {
    search: searchParams.get('search') || '',
    categoryIds: searchParams.get('categoryIds')?.split(',') || [],
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : 0,
    province: searchParams.get('province') || '',
    businessType: searchParams.get('businessType') || '',
    verified: searchParams.get('verified') === 'true',
    sort: searchParams.get('sort') || '',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };
  
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const limit = 12;
  
  const fetchStores = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    const { filtered, total: totalCount } = filterStores(allMockStores, currentFilters);
    const start = (currentFilters.page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    setStores(paged);
    setTotal(totalCount);
    setLoading(false);
  }, [limit]);
  
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.minRating > 0) params.minRating = String(filters.minRating);
    if (filters.province) params.province = filters.province;
    if (filters.businessType) params.businessType = filters.businessType;
    if (filters.verified) params.verified = 'true';
    if (filters.sort) params.sort = filters.sort;
    if (filters.page > 1) params.page = String(filters.page);
    setSearchParams(params, { replace: true });
    fetchStores(filters);
  }, [filters, setSearchParams, fetchStores]);
  
  const updateFilter = (newFilter: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilter }));
  };
  
  const resetFilters = () => {
    setFilters({
      search: '',
      categoryIds: [],
      minRating: 0,
      province: '',
      businessType: '',
      verified: false,
      sort: '',
      page: 1,
    });
  };
  
  const totalPages = Math.ceil(total / limit);
  
  return (
    <main className="page-stores">
      <div className="stores-container">
        <FilterSidebar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />
        
        <button className="mobile-filter-toggle" onClick={() => setMobileFilterOpen(true)}>
          <Store size={18} /> Bộ lọc
        </button>
        
        {mobileFilterOpen && (
          <div className="mobile-filter-overlay" onClick={() => setMobileFilterOpen(false)}>
            <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
              <FilterSidebar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />
              <button className="close-drawer" onClick={() => setMobileFilterOpen(false)}>Đóng</button>
            </div>
          </div>
        )}
        
        <div className="stores-results">
          <div className="result-toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm theo tên cửa hàng..."
                value={filters.search}
                onChange={(e) => updateFilter({ search: e.target.value, page: 1 })}
              />
            </div>
            <div className="result-count">
              {loading ? 'Đang tải...' : `${total} cửa hàng`}
            </div>
            <div className="sort-options">
              <label>Sắp xếp:</label>
              <select value={filters.sort} onChange={(e) => updateFilter({ sort: e.target.value, page: 1 })}>
                <option value="">Mặc định</option>
                <option value="name_asc">Tên A-Z</option>
                <option value="name_desc">Tên Z-A</option>
                <option value="newest">Mới nhất</option>
                <option value="top_rated">Đánh giá cao nhất</option>
                <option value="best_seller">Bán chạy nhất</option>
                <option value="most_products">Nhiều sản phẩm nhất</option>
              </select>
            </div>
          </div>
          
          <div className="stores-grid">
            {loading ? (
              Array(limit).fill(0).map((_, idx) => (
                <div key={idx} className="store-card skeleton-store-card">
                  <div className="store-logo skeleton-logo"></div>
                  <div className="store-info">
                    <div className="skeleton-text store-name-skeleton"></div>
                    <div className="skeleton-text store-rating-skeleton"></div>
                    <div className="skeleton-text store-stats-skeleton"></div>
                    <div className="skeleton-text store-address-skeleton"></div>
                  </div>
                </div>
              ))
            ) : stores.length === 0 ? (
              <div className="no-results">
                <p>Không tìm thấy cửa hàng phù hợp.</p>
                <button onClick={resetFilters}>Xóa bộ lọc</button>
              </div>
            ) : (
              stores.map(store => (
                <article
                  key={store.MaCuaHang}
                  className="store-card"
                  onClick={() => {
                    console.log(`[API giả định] Điều hướng đến /cua-hang/${store.MaCuaHang}`);
                    alert(`Trang chi tiết: ${store.TenCuaHang}`);
                  }}
                >
                  <div className="store-logo">
                    {store.Logo ? (
                      <img src={store.Logo} alt={store.TenCuaHang} loading="lazy" />
                    ) : (
                      <div className="logo-placeholder"><Store size={32} /></div>
                    )}
                  </div>
                  <div className="store-info">
                    <h3 className="store-name">
                      {store.TenCuaHang}
                      {store.DaXacThucPhapLy && (
                        <CheckCircle size={16} className="verified-badge" />
                      )}
                    </h3>
                    <div className="store-rating">
                      {renderStars(store.DiemDanhGia)}
                      <span className="rating-score">{store.DiemDanhGia.toFixed(1)}</span>
                      <span className="review-count">({store.SoLuongDanhGia} đánh giá)</span>
                    </div>
                    <div className="store-stats">
                      <div className="stat">
                        <Package size={14} />
                        <span>{formatNumber(store.SoSanPham)} sản phẩm</span>
                      </div>
                      <div className="stat">
                        <TrendingUp size={14} />
                        <span>Đã bán {formatNumber(store.SoLuongDaBan)}</span>
                      </div>
                    </div>
                    <div className="store-address">
                      <MapPin size={14} />
                      <span>{store.TinhThanh}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
          
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

export default Stores;
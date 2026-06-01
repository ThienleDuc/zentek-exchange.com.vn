// frontend/src/pages/public/Search.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { SERVER_URL } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';
import { getProvinces, getProvinceTree, type Province, type District, type Ward } from '../../services/location.service';
import PaginationProduct from '../../components/common/PaginationProduct';

// --- Helper: format số lượng đã bán ---
const formatSoldCount = (sold: number): string => {
  if (sold >= 1000) {
    const thousands = Math.floor(sold / 1000);
    return `${thousands}k+`;
  }
  return `${sold}`;
};

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
  province: string;
  district: string;
  ward: string;
  sort: string;
  page: number;
}

// Component Sidebar bộ lọc
interface FilterSidebarProps {
  filters: Filters;
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  selectedLocation: {
    provinceCode: string | number;
    districtCode: string | number;
    wardCode: string | number;
  };
  handleProvinceChange: (val: string | number) => void;
  handleWardChange: (val: string | number) => void;
  handleDistrictChange: (val: string | number) => void;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  onReset: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  provinces,
  districts,
  wards,
  selectedLocation,
  handleProvinceChange,
  handleWardChange,
  handleDistrictChange,
  onFilterChange,
  onReset
}) => {
  return (
    <aside className="search-sidebar">
      <div className="sidebar-header">
        <h3>Bộ lọc tìm kiếm</h3>
        <button className="reset-btn" onClick={onReset}>Đặt lại</button>
      </div>

      {/* Địa điểm (3 cấp: Tỉnh -> Xã -> Quận) */}
      <div className="filter-group">
        <label className="filter-label">Tỉnh / Thành</label>
        <SearchableDropdown
          theme="light"
          options={provinces.map(p => ({ value: p.code, label: p.name }))}
          value={selectedLocation.provinceCode}
          onChange={handleProvinceChange}
          placeholder="Chọn Tỉnh/Thành"
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Phường / Xã</label>
        <SearchableDropdown
          theme="light"
          options={wards.map(w => ({ value: w.code, label: w.name }))}
          value={selectedLocation.wardCode}
          onChange={handleWardChange}
          placeholder="Chọn Phường/Xã"
          disabled={!selectedLocation.provinceCode}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Quận / Huyện</label>
        <SearchableDropdown
          theme="light"
          options={districts.map(d => ({ value: d.code, label: d.name }))}
          value={selectedLocation.districtCode}
          onChange={handleDistrictChange}
          placeholder="Chọn Quận/Huyện"
          disabled={!selectedLocation.wardCode}
        />
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
    </aside>
  );
};

// Component chính Search
const Search: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo filters từ URL
  const initialFilters: Filters = {
    keyword: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : '',
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : '',
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : 0,
    condition: searchParams.get('condition') || '',
    province: searchParams.get('province') || '',
    district: searchParams.get('district') || '',
    ward: searchParams.get('ward') || '',
    sort: searchParams.get('sort') || 'relevance',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const limit = 12; // Số sản phẩm mỗi trang

  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [allDistrictsOfProvince, setAllDistrictsOfProvince] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState({
    provinceCode: '' as string | number,
    districtCode: '' as string | number,
    wardCode: '' as string | number
  });

  // Fetch provinces on load and check query params
  useEffect(() => {
    const initLocation = async () => {
      try {
        const provsList = await getProvinces();
        setProvinces(provsList);

        const urlProv = searchParams.get('province') || '';
        const urlWard = searchParams.get('ward') || '';

        if (urlProv) {
          const matchingProv = provsList.find(p => p.name === urlProv);
          if (matchingProv) {
            const provCode = matchingProv.code;
            setSelectedLocation(prev => ({ ...prev, provinceCode: provCode }));
            
            const tree = await getProvinceTree(provCode);
            if (tree) {
              setAllDistrictsOfProvince(tree.districts || []);
              const flatWards = (tree.districts || []).flatMap(d => (d.wards || []).map(w => ({
                ...w,
                district_code: d.code
              })));
              setWards(flatWards);

              if (urlWard) {
                const matchingWard = flatWards.find(w => w.name === urlWard);
                if (matchingWard) {
                  setSelectedLocation(prev => ({ ...prev, wardCode: matchingWard.code }));
                  const distCode = matchingWard.district_code;
                  const matchingDist = (tree.districts || []).find(d => d.code === distCode);
                  if (matchingDist) {
                    setDistricts([matchingDist]);
                    setSelectedLocation(prev => ({ ...prev, wardCode: matchingWard.code, districtCode: matchingDist.code }));
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khởi tạo địa điểm:', err);
      }
    };
    initLocation();
  }, []);

  // Gọi API tìm kiếm thực tế
  const fetchProducts = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    try {
      const response = await productService.searchProducts({
        q: currentFilters.keyword,
        category: currentFilters.category,
        priceMin: currentFilters.priceMin,
        priceMax: currentFilters.priceMax,
        rating: currentFilters.rating,
        condition: currentFilters.condition,
        province: currentFilters.province,
        district: currentFilters.district,
        ward: currentFilters.ward,
        sort: currentFilters.sort,
        page: currentFilters.page,
        limit
      });
      if (response.success && response.data) {
        setProducts(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Cập nhật khi URL searchParams đổi: đồng bộ state filters và fetch
  useEffect(() => {
    const urlKeyword = searchParams.get('q') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlPriceMin = searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : '';
    const urlPriceMax = searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : '';
    const urlRating = searchParams.get('rating') ? Number(searchParams.get('rating')) : 0;
    const urlCondition = searchParams.get('condition') || '';
    const urlProvince = searchParams.get('province') || '';
    const urlDistrict = searchParams.get('district') || '';
    const urlWard = searchParams.get('ward') || '';
    const urlSort = searchParams.get('sort') || 'relevance';
    const urlPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

    const newFilters: Filters = {
      keyword: urlKeyword,
      category: urlCategory,
      priceMin: urlPriceMin,
      priceMax: urlPriceMax,
      rating: urlRating,
      condition: urlCondition,
      province: urlProvince,
      district: urlDistrict,
      ward: urlWard,
      sort: urlSort,
      page: urlPage
    };

    setFilters(newFilters);
    fetchProducts(newFilters);

    if (!urlProvince) {
      setSelectedLocation({
        provinceCode: '',
        districtCode: '',
        wardCode: ''
      });
      setDistricts([]);
      setWards([]);
      setAllDistrictsOfProvince([]);
    }
  }, [searchParams, fetchProducts]);

  // Hàm thay đổi filter bằng cách cập nhật URL searchParams
  const updateFilter = (newFilter: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilter).forEach(([key, val]) => {
      const urlKey = key === 'keyword' ? 'q' : key;
      if (val === '' || val === null || val === undefined || val === 0) {
        params.delete(urlKey);
      } else {
        params.set(urlKey, String(val));
      }
    });

    if (newFilter.page === undefined) {
      params.delete('page');
    }

    setSearchParams(params, { replace: true });
  };

  const handleProvinceChange = async (val: string | number) => {
    const provinceCode = Number(val);
    const provinceName = provinces.find(p => p.code === provinceCode)?.name || '';
    
    updateFilter({
      province: provinceName,
      district: '',
      ward: ''
    });

    setSelectedLocation({
      provinceCode,
      districtCode: '',
      wardCode: ''
    });

    setWards([]);
    setDistricts([]);
    setAllDistrictsOfProvince([]);

    if (provinceCode) {
      const tree = await getProvinceTree(provinceCode);
      if (tree) {
        setAllDistrictsOfProvince(tree.districts || []);
        const flatWards = (tree.districts || []).flatMap(d => (d.wards || []).map(w => ({
          ...w,
          district_code: d.code
        })));
        setWards(flatWards);
      }
    }
  };

  const handleWardChange = (val: string | number) => {
    const wardCode = Number(val);
    const ward = wards.find(w => w.code === wardCode) as any;
    const wardName = ward?.name || '';

    updateFilter({
      ward: wardName,
      district: ''
    });

    setSelectedLocation(prev => ({
      ...prev,
      wardCode,
      districtCode: ''
    }));

    setDistricts([]);

    if (ward) {
      const distCode = ward.district_code;
      const matchingDist = allDistrictsOfProvince.find(d => d.code === distCode);
      if (matchingDist) {
        setDistricts([matchingDist]);
        updateFilter({
          ward: wardName,
          district: matchingDist.name
        });
        setSelectedLocation(prev => ({
          ...prev,
          wardCode,
          districtCode: matchingDist.code
        }));
      }
    }
  };

  const handleDistrictChange = (val: string | number) => {
    const districtCode = Number(val);
    const districtName = districts.find(d => d.code === districtCode)?.name || '';

    updateFilter({
      district: districtName
    });

    setSelectedLocation(prev => ({
      ...prev,
      districtCode
    }));
  };

  const resetFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    setSearchParams(params, { replace: true });

    setSelectedLocation({
      provinceCode: '',
      districtCode: '',
      wardCode: ''
    });
    setWards([]);
    setDistricts([]);
    setAllDistrictsOfProvince([]);
  };

  const getImageUrl = (path: string) => {
    if (!path) return '/default-product.png';
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `${SERVER_URL}${path}`;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="page-search search-results search">
      <div className="search-container">
        {/* Sidebar - desktop */}
        <FilterSidebar 
          filters={filters} 
          provinces={provinces}
          districts={districts}
          wards={wards}
          selectedLocation={selectedLocation}
          handleProvinceChange={handleProvinceChange}
          handleWardChange={handleWardChange}
          handleDistrictChange={handleDistrictChange}
          onFilterChange={updateFilter} 
          onReset={resetFilters} 
        />

        {/* Nút mở filter mobile */}
        <button className="mobile-filter-toggle" onClick={() => setMobileFilterOpen(true)}>
          🔍 Bộ lọc
        </button>

        {/* Mobile filter drawer */}
        {mobileFilterOpen && (
          <div className="mobile-filter-overlay" onClick={() => setMobileFilterOpen(false)}>
            <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
              <FilterSidebar 
                filters={filters} 
                provinces={provinces}
                districts={districts}
                wards={wards}
                selectedLocation={selectedLocation}
                handleProvinceChange={handleProvinceChange}
                handleWardChange={handleWardChange}
                handleDistrictChange={handleDistrictChange}
                onFilterChange={updateFilter} 
                onReset={resetFilters} 
              />
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
                  navigate(`/san-pham/${product.MaSanPham}`);
                }}>
                  <figure className="product-image-wrapper">
                    <img src={getImageUrl(product.HinhAnh)} alt={product.TieuDe} className="product-image" loading="lazy" />
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
                    <h3 className="product-title" title={product.TieuDe}>{product.TieuDe}</h3>
                    <div className="product-price">{product.Gia.toLocaleString('vi-VN')} ₫</div>
                    <div className="product-sold">Đã bán {formatSoldCount(product.SoLuongDaBan)}</div>
                  </div>
                </article>
              ))
            )}
          </div>

          <PaginationProduct
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={(page) => updateFilter({ page })}
          />
        </div>
      </div>
    </main>
  );
};

export default Search;
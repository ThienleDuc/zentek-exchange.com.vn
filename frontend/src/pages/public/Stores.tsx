// frontend/src/pages/public/Stores.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Store as StoreIcon, Package, TrendingUp, CheckCircle, MapPin } from 'lucide-react';
import { storeService } from '../../services/store.service';
import { getStoreLogoUrl } from '../../utils/image.utils';
import SearchableDropdown from '../../components/SearchableDropdown';
import { getProvinces, getDistricts, getWards, type Province, type District, type Ward } from '../../services/location.service';
import PaginationProduct from '../../components/common/PaginationProduct';

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
  minRating: number;
  province: string;
  district: string;
  ward: string;
  businessType: string;
  verified: boolean;
  sort: string;
  page: number;
}

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
  handleDistrictChange: (val: string | number) => void;
  handleWardChange: (val: string | number) => void;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  onReset: () => void;
}

// Component Sidebar bộ lọc
const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  provinces,
  districts,
  wards,
  selectedLocation,
  handleProvinceChange,
  handleDistrictChange,
  handleWardChange,
  onFilterChange,
  onReset,
}) => {
  const businessTypes = ['Cá nhân', 'Hộ kinh doanh', 'Doanh nghiệp nhỏ'];
  
  return (
    <aside className="stores-sidebar">
      <div className="sidebar-header">
        <h3>Lọc cửa hàng</h3>
        <button className="reset-btn" onClick={onReset}>Đặt lại</button>
      </div>
      
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
        <label className="filter-label">Quận / Huyện</label>
        <SearchableDropdown
          theme="light"
          options={districts.map(d => ({ value: d.code, label: d.name }))}
          value={selectedLocation.districtCode}
          onChange={handleDistrictChange}
          placeholder="Chọn Quận/Huyện"
          disabled={!selectedLocation.provinceCode}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Xã / Phường</label>
        <SearchableDropdown
          theme="light"
          options={wards.map(w => ({ value: w.code, label: w.name }))}
          value={selectedLocation.wardCode}
          onChange={handleWardChange}
          placeholder="Chọn Xã/Phường"
          disabled={!selectedLocation.districtCode}
        />
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialFilters: Filters = {
    search: searchParams.get('search') || '',
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : 0,
    province: searchParams.get('province') || '',
    district: searchParams.get('district') || '',
    ward: searchParams.get('ward') || '',
    businessType: searchParams.get('businessType') || '',
    verified: true,
    sort: searchParams.get('sort') || '',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };
  
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [searchVal, setSearchVal] = useState(initialFilters.search);
  const [stores, setStores] = useState<Store[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const limit = 12;

  // State cho dropdown địa chỉ
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedLocation, setSelectedLocation] = useState({
    provinceCode: '' as string | number,
    districtCode: '' as string | number,
    wardCode: '' as string | number
  });

  // Load provinces and initialize from URL search params
  useEffect(() => {
    const initLocation = async () => {
      try {
        const provsList = await getProvinces();
        setProvinces(provsList);

        const urlProv = searchParams.get('province') || '';
        const urlDist = searchParams.get('district') || '';
        const urlWard = searchParams.get('ward') || '';

        if (urlProv) {
          const matchingProv = provsList.find(p => p.name === urlProv);
          if (matchingProv) {
            const provCode = matchingProv.code;
            setSelectedLocation(prev => ({ ...prev, provinceCode: provCode }));
            const distsList = await getDistricts(provCode);
            setDistricts(distsList);

            if (urlDist) {
              const matchingDist = distsList.find(d => d.name === urlDist);
              if (matchingDist) {
                const distCode = matchingDist.code;
                setSelectedLocation(prev => ({ ...prev, districtCode: distCode }));
                const wardsList = await getWards(distCode);
                setWards(wardsList);

                if (urlWard) {
                  const matchingWard = wardsList.find(w => w.name === urlWard);
                  if (matchingWard) {
                    setSelectedLocation(prev => ({ ...prev, wardCode: matchingWard.code }));
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
  
  const fetchStores = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    try {
      const response = await storeService.getStores({
        search: currentFilters.search,
        province: currentFilters.province,
        district: currentFilters.district,
        ward: currentFilters.ward,
        businessType: currentFilters.businessType,
        verified: currentFilters.verified,
        minRating: currentFilters.minRating,
        sort: currentFilters.sort,
        page: currentFilters.page,
        limit
      });
      if (response.success && response.data) {
        setStores(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách cửa hàng:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Cập nhật khi URL searchParams đổi: đồng bộ state filters và fetch
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlMinRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : 0;
    const urlProvince = searchParams.get('province') || '';
    const urlDistrict = searchParams.get('district') || '';
    const urlWard = searchParams.get('ward') || '';
    const urlBusinessType = searchParams.get('businessType') || '';
    const urlSort = searchParams.get('sort') || '';
    const urlPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

    const newFilters: Filters = {
      search: urlSearch,
      minRating: urlMinRating,
      province: urlProvince,
      district: urlDistrict,
      ward: urlWard,
      businessType: urlBusinessType,
      verified: true,
      sort: urlSort,
      page: urlPage
    };

    setFilters(newFilters);
    setSearchVal(urlSearch);
    fetchStores(newFilters);

    if (!urlProvince) {
      setSelectedLocation({
        provinceCode: '',
        districtCode: '',
        wardCode: ''
      });
      setDistricts([]);
      setWards([]);
    }
  }, [searchParams, fetchStores]);

  // Debounce search input to update searchParams
  useEffect(() => {
    const handler = setTimeout(() => {
      const urlSearch = searchParams.get('search') || '';
      if (searchVal !== urlSearch) {
        updateFilter({ search: searchVal, page: 1 });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Hàm thay đổi filter bằng cách cập nhật URL searchParams
  const updateFilter = (newFilter: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilter).forEach(([key, val]) => {
      if (val === '' || val === null || val === undefined || val === 0 || (key === 'verified' && val === true)) {
        params.delete(key);
      } else {
        params.set(key, String(val));
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
      ward: '',
    });

    setSelectedLocation({
      provinceCode,
      districtCode: '',
      wardCode: ''
    });

    setDistricts([]);
    setWards([]);

    if (provinceCode) {
      const distsList = await getDistricts(provinceCode);
      setDistricts(distsList);
    }
  };

  const handleDistrictChange = async (val: string | number) => {
    const districtCode = Number(val);
    const districtName = districts.find(d => d.code === districtCode)?.name || '';

    updateFilter({
      district: districtName,
      ward: '',
    });

    setSelectedLocation(prev => ({
      ...prev,
      districtCode,
      wardCode: ''
    }));

    setWards([]);

    if (districtCode) {
      const wardsList = await getWards(districtCode);
      setWards(wardsList);
    }
  };

  const handleWardChange = (val: string | number) => {
    const wardCode = Number(val);
    const wardName = wards.find(w => w.code === wardCode)?.name || '';

    updateFilter({
      ward: wardName,
    });

    setSelectedLocation(prev => ({
      ...prev,
      wardCode
    }));
  };
  
  const resetFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    setSearchParams(params, { replace: true });

    setSelectedLocation({
      provinceCode: '',
      districtCode: '',
      wardCode: ''
    });
    setDistricts([]);
    setWards([]);
  };

  
  const totalPages = Math.ceil(total / limit);
  
  return (
    <main className="page-stores">
      <div className="stores-container">
        <FilterSidebar 
          filters={filters} 
          provinces={provinces}
          districts={districts}
          wards={wards}
          selectedLocation={selectedLocation}
          handleProvinceChange={handleProvinceChange}
          handleDistrictChange={handleDistrictChange}
          handleWardChange={handleWardChange}
          onFilterChange={updateFilter} 
          onReset={resetFilters} 
        />
        
        <button className="mobile-filter-toggle" onClick={() => setMobileFilterOpen(true)}>
          <StoreIcon size={18} /> Bộ lọc
        </button>
        
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
                handleDistrictChange={handleDistrictChange}
                handleWardChange={handleWardChange}
                onFilterChange={updateFilter} 
                onReset={resetFilters} 
              />
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
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
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
                    navigate(`/cua-hang/${store.MaCuaHang}`);
                  }}
                >
                  <div className="store-logo">
                    {store.Logo ? (
                       <img src={getStoreLogoUrl(store.Logo)} alt={store.TenCuaHang} loading="lazy" />
                    ) : (
                      <div className="logo-placeholder"><StoreIcon size={32} /></div>
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

export default Stores;
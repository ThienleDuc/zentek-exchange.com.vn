import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Package, TrendingUp, MapPin, MessageCircle, Calendar, Phone, Info, Search, ShieldCheck } from 'lucide-react';
import { storeService } from '../../services/store.service';
import { productService } from '../../services/product.service';
import { chatService } from '../../services/chat.service';
import { getUserFromStorage, isBuyer, isSeller } from '../../utils/role.utils';
import { getStoreLogoUrl } from '../../utils/image.utils';
import { PATHS } from '../../utils/path.utils';
import PaginationProduct from '../../components/common/PaginationProduct';
import ProductCard from '../../components/common/ProductCard';

// Format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k+`;
  return `${num}`;
};


const StoreDetail: React.FC = () => {
  const { id: storeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getUserFromStorage();

  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');

  // Filter States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [sort, setSort] = useState('newest');
  const [offset, setOffset] = useState(0);
  const limit = 12;

  const currentPage = Math.floor(offset / limit) + 1;

  // Debounce search keyword
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setOffset(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  // Fetch Store Details
  useEffect(() => {
    const fetchStoreDetail = async () => {
      if (!storeId) return;
      setLoadingStore(true);
      try {
        const res = await storeService.getStoreDetail(storeId);
        if (res.success && res.data) {
          setStore(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết cửa hàng:', err);
      } finally {
        setLoadingStore(false);
      }
    };
    fetchStoreDetail();
  }, [storeId]);

  // Fetch Store Products
  const fetchStoreProducts = useCallback(async () => {
    if (!storeId) return;
    setLoadingProducts(true);
    try {
      const res = await productService.searchProducts({
        store: storeId,
        q: debouncedKeyword,
        sort,
        page: currentPage,
        limit
      });
      if (res.success) {
        setProducts(res.data || []);
        setTotalProducts(res.total || 0);
      }
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm cửa hàng:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [storeId, debouncedKeyword, sort, currentPage, limit]);

  useEffect(() => {
    fetchStoreProducts();
  }, [fetchStoreProducts]);

  // Handle initiate chat with shop owner
  const handleChatNow = async () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để nhắn tin với cửa hàng.');
      navigate(PATHS.AUTH.LOGIN);
      return;
    }

    if (store?.NguoiBanId && currentUser.id.toString().toLowerCase() === store.NguoiBanId.toLowerCase()) {
      alert('Bạn không thể nhắn tin với cửa hàng của chính mình.');
      return;
    }

    try {
      const res = await chatService.findOrCreatePrivateChat(store.NguoiBanId);
      const conversationId = res.data?.conversationId;

      if (conversationId) {
        if (isBuyer(currentUser)) {
          navigate(`${PATHS.Buyer.MESSAGES}?chatId=${conversationId}`);
        } else if (isSeller(currentUser)) {
          navigate(`${PATHS.Seller.MESSAGES}?chatId=${conversationId}`);
        } else {
          navigate(`/admin/messages?chatId=${conversationId}`);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi kết nối chat.');
    }
  };

  if (loadingStore) {
    return (
      <div className="store-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin cửa hàng...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="store-detail-error">
        <p>Cửa hàng không tồn tại hoặc đã ngừng hoạt động.</p>
        <button onClick={() => navigate(PATHS.PUPLIC.STORES)}>Quay lại danh sách</button>
      </div>
    );
  }

  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <div className="store-detail-page">
      <div className="store-detail-container">
        
        {/* Profile Header */}
        <header className="store-profile-header">
          <div className="store-profile-left">
            <div className="profile-logo-wrapper">
              {store.Logo ? (
                <img src={getStoreLogoUrl(store.Logo)} alt={store.TenCuaHang} className="profile-logo" />
              ) : (
                <div className="profile-logo-placeholder">
                  {store.TenCuaHang.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-text-details">
              <h1 className="profile-title">
                {store.TenCuaHang}
                {store.DaXacThucPhapLy && (
                  <span className="profile-verified-badge" title="Đã xác thực pháp lý">
                    <ShieldCheck size={18} />
                    Xác thực
                  </span>
                )}
              </h1>
              <p className="profile-owner">Chủ sở hữu: {store.NguoiBanHoTen}</p>
              <button className="profile-chat-btn" onClick={handleChatNow}>
                <MessageCircle size={16} /> Nhắn tin
              </button>
            </div>
          </div>

          <div className="store-profile-right">
            <div className="kpi-grid">
              <div className="kpi-card">
                <Package className="kpi-icon text-primary" size={20} />
                <div className="kpi-content">
                  <span className="kpi-value">{formatNumber(store.SoSanPham)}</span>
                  <span className="kpi-label">Sản phẩm</span>
                </div>
              </div>
              <div className="kpi-card">
                <TrendingUp className="kpi-icon text-success" size={20} />
                <div className="kpi-content">
                  <span className="kpi-value">{formatNumber(store.SoLuongDaBan)}</span>
                  <span className="kpi-label">Đã bán</span>
                </div>
              </div>
              <div className="kpi-card">
                <Star className="kpi-icon text-warning" size={20} />
                <div className="kpi-content">
                  <div className="flex items-center gap-1">
                    <span className="kpi-value">{Number(store.DiemDanhGia).toFixed(1)}</span>
                    <span className="text-xs text-text-muted">/5</span>
                  </div>
                  <span className="kpi-label">({store.SoLuongDanhGia} đánh giá)</span>
                </div>
              </div>
              <div className="kpi-card">
                <MapPin className="kpi-icon text-danger" size={20} />
                <div className="kpi-content">
                  <span className="kpi-value text-ellipsis" title={store.TinhThanh}>{store.TinhThanh}</span>
                  <span className="kpi-label">Khu vực</span>
                </div>
              </div>
              <div className="kpi-card">
                <Info className="kpi-icon text-info" size={20} />
                <div className="kpi-content">
                  <span className="kpi-value">{store.LoaiHinhTen}</span>
                  <span className="kpi-label">Mô hình</span>
                </div>
              </div>
              <div className="kpi-card">
                <Calendar className="kpi-icon text-secondary" size={20} />
                <div className="kpi-content">
                  <span className="kpi-value">{new Date(store.NgayTao).toLocaleDateString('vi-VN')}</span>
                  <span className="kpi-label">Ngày tham gia</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="store-tabs-wrapper">
          <button 
            className={`store-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Sản phẩm cửa hàng ({totalProducts})
          </button>
          <button 
            className={`store-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            Hồ sơ cửa hàng
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' ? (
          <div className="store-products-section">
            
            {/* Products Toolbar */}
            <div className="store-products-toolbar">
              <div className="store-search-box">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Tìm sản phẩm trong cửa hàng này..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                />
              </div>
              <div className="store-sort-options">
                <label>Sắp xếp theo:</label>
                <select value={sort} onChange={e => { setSort(e.target.value); setOffset(0); }}>
                  <option value="newest">Mới nhất</option>
                  <option value="best_seller">Bán chạy nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="top_rated">Đánh giá cao</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="store-products-grid">
                {Array(6).fill(0).map((_, idx) => (
                  <div key={idx} className="skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text short"></div>
                    <div className="skeleton-price"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="store-products-empty">
                <p>Không tìm thấy sản phẩm nào trong cửa hàng.</p>
              </div>
            ) : (
              <>
                <div className="store-products-grid">
                  {products.map(product => (
                    <ProductCard key={product.MaSanPham} product={product} />
                  ))}
                </div>

                <PaginationProduct
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setOffset((page - 1) * limit)}
                />
              </>
            )}
          </div>
        ) : (
          <div className="store-about-section">
            <div className="about-details-card">
              <h2 className="section-title">Hồ Sơ Cửa Hàng</h2>
              
              <div className="info-row-group">
                <div className="info-detail-row">
                  <span className="detail-label">Tên cửa hàng:</span>
                  <span className="detail-val font-semibold text-text-main">{store.TenCuaHang}</span>
                </div>
                <div className="info-detail-row">
                  <span className="detail-label">Loại hình kinh doanh:</span>
                  <span className="detail-val">{store.LoaiHinhTen}</span>
                </div>
                <div className="info-detail-row">
                  <span className="detail-label">Chủ sở hữu:</span>
                  <span className="detail-val">{store.NguoiBanHoTen}</span>
                </div>
                <div className="info-detail-row">
                  <span className="detail-label">Địa chỉ liên hệ:</span>
                  <span className="detail-val">
                    {store.DiaChi ? `${store.DiaChi}, ` : ''}
                    {store.PhuongXa ? `${store.PhuongXa}, ` : ''}
                    {store.QuanHuyen ? `${store.QuanHuyen}, ` : ''}
                    {store.TinhThanh || ''}
                  </span>
                </div>
                <div className="info-detail-row">
                  <span className="detail-label">Số điện thoại:</span>
                  <span className="detail-val flex items-center gap-1.5">
                    <Phone size={14} className="text-text-muted" />
                    {store.SoDienThoai || '(Chưa cập nhật)'}
                  </span>
                </div>
              </div>

              <div className="about-description-area">
                <h3 className="description-title">Giới thiệu cửa hàng:</h3>
                <p className="description-text">
                  {store.MoTa || 'Cửa hàng chưa cập nhật thông tin giới thiệu chi tiết.'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StoreDetail;

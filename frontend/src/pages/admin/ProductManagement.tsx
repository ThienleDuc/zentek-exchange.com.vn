import { useState, useEffect } from 'react';
import { Search, Package, Shield, TrendingUp, Archive, Store, ChevronDown, ChevronRight, Plus, Eye, Pencil } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis, LineChart, Line } from 'recharts';
import api from '../../services/api';
import { productAdminService } from '../../services/productAdmin.service';
import productSellerService from '../../services/productSeller.service';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSeller } from '../../utils/role.utils';
import { storage } from '../../utils/storage.utils';
import ProductEditModal from '../../components/admin/ProductEditModal';
import { getProductImageUrl } from '../../utils/image.utils';

export interface Product {
  MaSanPham: string;
  TieuDe: string;
  Gia: number;
  SoLuong: number;
  SoLuongDaBan: number;
  NgayDang: string;
  TrangThaiDuyet: string;
  TinhTrang: string;
  TenCuaHang: string;
  TenDanhMuc: string;
  HinhAnh: string;
  DanhMucId?: string;
  FileMoTa?: string | null;
  LinkSanPham?: string | null;
  DaHetHang?: boolean | number;
}

export interface CategoryTree {
  MaDanhMuc: string;
  TenDanhMuc: string;
  children?: CategoryTree[];
}

const ProductManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    TotalProducts: 0,
    PendingProducts: 0,
    ApprovedProducts: 0,
    RejectedProducts: 0,
    RemovedProducts: 0,
  });
  const [growthData, setGrowthData] = useState([]);
  const [topViewsData, setTopViewsData] = useState([]);
  const [topSalesData, setTopSalesData] = useState([]);

  // Role detection
  const currentUser = storage.getUser();
  const isSellerUser = isSeller(currentUser);

  // Filter & Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const [cuaHangFilter, setCuaHangFilter] = useState('');
  const [danhMucFilter, setDanhMucFilter] = useState('');
  const [tinhTrangFilter, setTinhTrangFilter] = useState('');
  
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Seller Action States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [outOfStockProduct, setOutOfStockProduct] = useState<Product | null>(null);
  const [inStockProduct, setInStockProduct] = useState<Product | null>(null);
  const [inStockQty, setInStockQty] = useState<number>(10);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories?format=tree');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryName = (cats: CategoryTree[], id: string): string => {
    for (let c of cats) {
      if (c.MaDanhMuc === id) return c.TenDanhMuc;
      if (c.children) {
        const found = getCategoryName(c.children, id);
        if (found) return found;
      }
    }
    return '';
  };



  const handleOutOfStockClick = (product: Product) => {
    setOutOfStockProduct(product);
  };

  const handleConfirmOutOfStock = async () => {
    if (!outOfStockProduct) return;
    try {
      const res = await productSellerService.setOutOfStock(outOfStockProduct.MaSanPham);
      if (res.success) {
        setOutOfStockProduct(null);
        fetchProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xác nhận hết hàng.');
    }
  };

  const handleInStockClick = (product: Product) => {
    setInStockProduct(product);
    setInStockQty(10); // default
  };

  const handleConfirmInStock = async () => {
    if (!inStockProduct) return;
    if (inStockQty <= 0) {
      alert('Số lượng hàng phải lớn hơn 0.');
      return;
    }
    try {
      const res = await productSellerService.setInStock(inStockProduct.MaSanPham, inStockQty);
      if (res.success) {
        setInStockProduct(null);
        fetchProducts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xác nhận còn hàng.');
    }
  };

  const fetchStats = async () => {
    try {
      const data = isSellerUser
        ? await productSellerService.getStats(tuNgay, denNgay)
        : await productAdminService.getStats(tuNgay, denNgay);
      if (data.success) {
        setStats(data.data.overview);
        setGrowthData(data.data.growth);
        if (isSellerUser) {
          setTopViewsData(data.data.topViews || []);
          setTopSalesData(data.data.topSales || []);
        }
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (isSellerUser) {
        const res = await productSellerService.getProducts();
        if (res.success) {
          let filtered = res.data;
          if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter((p: any) => 
              p.TieuDe.toLowerCase().includes(searchLower) || 
              p.MaSanPham.toLowerCase().includes(searchLower)
            );
          }
          if (statusFilter) {
            filtered = filtered.filter((p: any) => p.TrangThaiDuyet === statusFilter);
          }
          if (tinhTrangFilter) {
            filtered = filtered.filter((p: any) => p.TinhTrang === tinhTrangFilter);
          }
          if (danhMucFilter) {
            filtered = filtered.filter((p: any) => p.DanhMucId === danhMucFilter);
          }
          if (tuNgay) {
            const tuDate = new Date(tuNgay);
            filtered = filtered.filter((p: any) => new Date(p.NgayDang) >= tuDate);
          }
          if (denNgay) {
            const denDate = new Date(denNgay);
            denDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter((p: any) => new Date(p.NgayDang) <= denDate);
          }
          
          setProducts(filtered.slice((page - 1) * limit, page * limit));
          setTotalPages(Math.ceil(filtered.length / limit) || 1);
        }
      } else {
        const data = await productAdminService.getProducts({
          page,
          limit,
          search,
          trangThai: statusFilter,
          tuNgay,
          denNgay,
          cuaHang: cuaHangFilter,
          danhMuc: danhMucFilter,
          tinhTrang: tinhTrangFilter
        });
        if (data.success) {
          setProducts(data.data);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [tuNgay, denNgay]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, limit, search, statusFilter, tuNgay, denNgay, cuaHangFilter, danhMucFilter, tinhTrangFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Chờ phê duyệt':
        return <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-medium">Chờ duyệt</span>;
      case 'Đã duyệt':
        return <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-xs font-medium">Đã duyệt</span>;
      case 'Đã từ chối':
      case 'Đã gỡ':
        return <span className="px-3 py-1 bg-danger/10 text-danger border border-danger/20 rounded-full text-xs font-medium">{status}</span>;
      default:
        return <span className="px-3 py-1 bg-surface-muted text-text-muted rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="product-management-page space-y-6 text-text-main">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> Quản lý sản phẩm
        </h2>
        {isSellerUser && (
          <button
            onClick={() => { setEditingProduct(null); setIsEditModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        )}
      </div>

      {/* Date Filter */}
      {true && (
        <div className="bg-surface backdrop-blur-md border border-border-default rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-text-muted mb-1">Từ ngày</label>
            <input 
              type="date" 
              value={tuNgay} 
              onChange={(e) => {setTuNgay(e.target.value); setPage(1);}}
              className="px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none text-text-main"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Đến ngày</label>
            <input 
              type="date" 
              value={denNgay} 
              onChange={(e) => {setDenNgay(e.target.value); setPage(1);}}
              className="px-3 py-2 bg-surface-muted border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none text-text-main"
            />
          </div>
        </div>
      )}

      {/* Dashboards */}
      {true && (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isSellerUser ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
          {/* Tổng quan số lượng (Bar chart) */}
          <div className="bg-surface border border-border-default rounded-xl p-4 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
              <Archive className="w-4 h-4 text-primary" /> Tổng quan số lượng
            </h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Tổng số', value: stats.TotalProducts, fill: '#3B82F6' },
                  { name: 'Chờ duyệt', value: stats.PendingProducts, fill: '#F59E0B' },
                  { name: 'Vi phạm', value: stats.RemovedProducts, fill: '#EF4444' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#334155', opacity: 0.2 }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trạng thái sản phẩm (Pie chart) */}
          <div className="bg-surface border border-border-default rounded-xl p-4 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Trạng thái sản phẩm
            </h3>
            <div className="h-[220px] w-full">
              {stats.TotalProducts > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Chờ duyệt', value: stats.PendingProducts, color: '#F59E0B' },
                        { name: 'Đã duyệt', value: stats.ApprovedProducts, color: '#10B981' },
                        { name: 'Từ chối', value: stats.RejectedProducts, color: '#EF4444' },
                        { name: 'Đã gỡ', value: stats.RemovedProducts, color: '#64748B' }
                      ]}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none"
                    >
                      {
                        [
                          { color: '#F59E0B' }, { color: '#10B981' }, { color: '#EF4444' }, { color: '#64748B' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      }
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-text-muted">Chưa có dữ liệu</div>
              )}
            </div>
          </div>

          {/* Cột 3: Tăng trưởng (Line chart) cho Admin OR Top sản phẩm bán chạy (Bar chart) cho Seller */}
          {!isSellerUser ? (
            <div className="bg-surface border border-border-default rounded-xl p-4 shadow-sm lg:col-span-1">
              <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Thống kê đăng mới
              </h3>
              <div className="h-[220px] w-full">
                {growthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }} />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} name="Số sản phẩm" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-text-muted">Chưa có dữ liệu</div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border-default rounded-xl p-4 shadow-sm lg:col-span-1">
              <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Top sản phẩm bán chạy
              </h3>
              <div className="h-[220px] w-full">
                {topSalesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSalesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                      />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                        formatter={(value: any) => [value, 'Đã bán']}
                        labelFormatter={(label) => `Sản phẩm: ${label}`}
                      />
                      <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} name="Đã bán" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-text-muted">Chưa có dữ liệu</div>
                )}
              </div>
            </div>
          )}

          {/* Cột 4 (Seller Only): Top sản phẩm xem nhiều (Bar chart) */}
          {isSellerUser && (
            <div className="bg-surface border border-border-default rounded-xl p-4 shadow-sm lg:col-span-1">
              <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-500" /> Top sản phẩm xem nhiều
              </h3>
              <div className="h-[220px] w-full">
                {topViewsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topViewsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                      />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                        formatter={(value: any) => [value, 'Lượt xem']}
                        labelFormatter={(label) => `Sản phẩm: ${label}`}
                      />
                      <Bar dataKey="value" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Lượt xem" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-text-muted">Chưa có dữ liệu</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bảng dữ liệu và Bộ lọc */}
      <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm flex flex-col gap-6 mt-2">
        <div className="flex flex-col md:flex-row flex-wrap justify-start gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm tên, mã sản phẩm..."
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1);}}
              className="w-full pl-9 pr-4 py-2 bg-surface-muted border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none text-text-main"
            />
          </div>
          
          {/* Shop Name Filter (Admin Only) */}
          {!isSellerUser && (
            <div className="relative w-full md:w-56">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo tên cửa hàng..."
                value={cuaHangFilter}
                onChange={(e) => {setCuaHangFilter(e.target.value); setPage(1);}}
                className="w-full pl-9 pr-4 py-2 bg-surface-muted border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none text-text-main"
              />
            </div>
          )}

          <div className="w-full md:w-48">
            <Select
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'Chờ phê duyệt', label: 'Chờ phê duyệt' },
                { value: 'Đã duyệt', label: 'Đã duyệt' },
                { value: 'Đã từ chối', label: 'Đã từ chối' },
                { value: 'Đã gỡ', label: 'Đã gỡ' }
              ]}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val as string); setPage(1); }}
            />
          </div>
          <div className="relative w-full md:w-64 group z-20">
            <button 
              className="w-full px-4 py-2 bg-surface-muted border border-border-default rounded-lg text-sm text-left flex justify-between items-center text-text-main group-hover:border-primary transition-colors focus:ring-2 focus:ring-primary outline-none"
            >
              <span className="truncate font-medium">{danhMucFilter ? getCategoryName(categories, danhMucFilter) || 'Đã chọn danh mục' : 'Tất cả danh mục'}</span>
              <ChevronDown className="w-4 h-4 text-text-muted group-hover:rotate-180 transition-transform duration-300" />
            </button>
            
            {/* Hover Menu 2 cấp */}
            <div className="absolute top-full left-0 mt-1 w-[500px] bg-surface border border-border-default shadow-xl rounded-lg hidden group-hover:flex z-30 min-h-[300px] overflow-hidden">
              {/* Cột trái: Cấp 1 */}
              <div className="w-1/2 bg-surface-muted border-r border-border-default py-2 flex flex-col max-h-[400px] overflow-y-auto">
                <div 
                  className={`px-4 py-2.5 cursor-pointer text-sm font-medium hover:bg-surface hover:text-primary transition-colors ${danhMucFilter === '' ? 'text-primary bg-surface' : 'text-text-main'}`}
                  onClick={() => { setDanhMucFilter(''); setPage(1); }}
                  onMouseEnter={() => setHoveredCategory(null)}
                >
                  -- Tất cả danh mục --
                </div>
                {categories.map(c => (
                  <div 
                    key={c.MaDanhMuc}
                    className={`px-4 py-2.5 cursor-pointer text-sm font-medium hover:bg-surface hover:text-primary flex justify-between items-center transition-colors ${danhMucFilter === c.MaDanhMuc ? 'text-primary bg-surface' : 'text-text-main'} ${hoveredCategory === c.MaDanhMuc ? 'bg-surface text-primary' : ''}`}
                    onClick={() => { setDanhMucFilter(c.MaDanhMuc); setPage(1); }}
                    onMouseEnter={() => setHoveredCategory(c.MaDanhMuc)}
                  >
                    <span className="truncate">{c.TenDanhMuc}</span>
                    {c.children && c.children.length > 0 && <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />}
                  </div>
                ))}
              </div>

              {/* Cột phải: Cấp 2 */}
              <div className="w-1/2 bg-surface flex flex-col max-h-[400px] overflow-y-auto">
                {hoveredCategory && categories.find(c => c.MaDanhMuc === hoveredCategory)?.children?.length ? (
                  <div className="py-2 animate-in fade-in duration-200">
                    <div className="px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border-default mb-1">
                      {categories.find(c => c.MaDanhMuc === hoveredCategory)?.TenDanhMuc}
                    </div>
                    {categories.find(c => c.MaDanhMuc === hoveredCategory)?.children?.map(child => (
                      <div 
                        key={child.MaDanhMuc}
                        className={`px-4 py-2 cursor-pointer text-sm hover:bg-primary/10 hover:text-primary transition-colors ${danhMucFilter === child.MaDanhMuc ? 'text-primary font-bold bg-primary/5' : 'text-text-main'}`}
                        onClick={(e) => { e.stopPropagation(); setDanhMucFilter(child.MaDanhMuc); setPage(1); }}
                      >
                        {child.TenDanhMuc}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 p-4 flex flex-col items-center justify-center text-text-muted opacity-50 pointer-events-none">
                    <Archive className="w-8 h-8 mb-2" />
                    <span className="text-xs text-center">Các danh mục con<br/>sẽ hiển thị ở đây</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full md:w-40">
            <Select
              options={[
                { value: '', label: 'Tình trạng (Tất cả)' },
                { value: 'Mới', label: 'Mới' },
                { value: 'Cũ', label: 'Cũ' }
              ]}
              value={tinhTrangFilter}
              onChange={(val) => { setTinhTrangFilter(val as string); setPage(1); }}
            />
          </div>
        </div>

        <div className="bg-surface-muted rounded-lg overflow-hidden border border-border-default">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-main">
              <thead className="bg-surface border-b border-border-default text-xs uppercase font-semibold text-text-muted">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sản phẩm</th>
                  {!isSellerUser && <th className="px-6 py-4 font-semibold">Cửa hàng</th>}
                  <th className="px-6 py-4 font-semibold">Phân loại</th>
                  <th className="px-6 py-4 font-semibold">Giá & Kho</th>
                  <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {loading ? (
                  <tr><td colSpan={isSellerUser ? 5 : 6} className="px-6 py-8 text-center text-text-muted">Đang tải dữ liệu...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={isSellerUser ? 5 : 6} className="px-6 py-8 text-center text-text-muted">Không tìm thấy sản phẩm nào</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.MaSanPham} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.HinhAnh ? (
                            <img src={getProductImageUrl(p.HinhAnh)} alt={p.TieuDe} className="w-12 h-12 rounded object-cover border border-border-default" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-surface-muted border border-border-default flex items-center justify-center">
                              <Package className="w-6 h-6 text-text-muted" />
                            </div>
                          )}
                          <div className="max-w-[200px]">
                            <div className="font-semibold text-text-main truncate" title={p.TieuDe}>{p.TieuDe}</div>
                            <div className="text-xs text-text-muted">{new Date(p.NgayDang).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </div>
                      </td>
                      {!isSellerUser && <td className="px-6 py-4">{p.TenCuaHang}</td>}
                      <td className="px-6 py-4">
                        <div className="font-medium">{p.TenDanhMuc}</div>
                        <div className="text-xs text-text-muted">Tình trạng: {p.TinhTrang}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-primary">{p.Gia.toLocaleString('vi-VN')} đ</div>
                        <div className="text-xs text-text-muted">Kho: {p.SoLuong} | Đã bán: {p.SoLuongDaBan}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(p.TrangThaiDuyet)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {isSellerUser ? (
                            <>
                              <button
                                onClick={() => navigate(`${location.pathname}/${p.MaSanPham}`)}
                                className="p-2 text-primary hover:bg-primary/10 rounded-xl transition border border-primary/20 hover:border-primary/40 bg-primary/5"
                                title="Xem chi tiết"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => { setEditingProduct(p); setIsEditModalOpen(true); }}
                                className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition border border-yellow-500/20 hover:border-yellow-500/40 bg-yellow-500/5"
                                title="Chỉnh sửa"
                              >
                                <Pencil size={16} />
                              </button>
                              {(p.DaHetHang === 1 || p.DaHetHang === true || p.SoLuong === 0) ? (
                                <button
                                  onClick={() => handleInStockClick(p)}
                                  className="p-2 text-green-500 hover:bg-green-500/10 rounded-xl transition border border-green-500/20 hover:border-green-500/40 bg-green-500/5"
                                  title="Xác nhận còn hàng"
                                >
                                  <Package size={16} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOutOfStockClick(p)}
                                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition border border-red-500/20 hover:border-red-500/40 bg-red-500/5"
                                  title="Xác nhận hết hàng"
                                >
                                  <Archive size={16} />
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => navigate(`${location.pathname}/${p.MaSanPham}`)}
                              className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
                              title="Xem chi tiết"
                            >
                              CHI TIẾT
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && products.length > 0 && (
          <div className="pt-2 flex justify-end">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Product Edit/Add Modal */}
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        onSuccess={() => { setIsEditModalOpen(false); setEditingProduct(null); fetchProducts(); }}
      />

      {/* Out of Stock Confirm Modal */}
      {isSellerUser && outOfStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border-default rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-4 text-text-main animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
              <Archive size={22} />
              <span>Xác nhận hết hàng?</span>
            </h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Bạn có chắc chắn muốn chuyển sản phẩm <strong className="text-text-main">"{outOfStockProduct.TieuDe}"</strong> sang trạng thái hết hàng?
              Hành động này sẽ cập nhật số lượng tồn kho của sản phẩm về 0.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setOutOfStockProduct(null)}
                className="px-4 py-2 bg-surface border border-border-default hover:bg-surface-muted text-text-body rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmOutOfStock}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In Stock Confirm Modal */}
      {isSellerUser && inStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border-default rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-4 text-text-main animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold flex items-center gap-2 text-green-500">
              <Package size={22} />
              <span>Xác nhận còn hàng?</span>
            </h3>
            <div className="space-y-2">
              <p className="text-text-muted text-sm leading-relaxed">
                Nhập số lượng hàng mới cho sản phẩm <strong className="text-text-main">"{inStockProduct.TieuDe}"</strong>:
              </p>
              <input
                type="number"
                min="1"
                required
                value={inStockQty}
                onChange={e => setInStockQty(Number(e.target.value))}
                className="w-full bg-surface border border-border-default focus:border-primary rounded-xl px-4 py-2.5 text-sm text-text-main outline-none transition focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setInStockProduct(null); setInStockQty(10); }}
                className="px-4 py-2 bg-surface border border-border-default hover:bg-surface-muted text-text-body rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmInStock}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

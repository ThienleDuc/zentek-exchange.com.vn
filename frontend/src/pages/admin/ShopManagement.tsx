import React, { useState, useEffect } from 'react';
import { Search, Store, Building2, UserCircle, CheckCircle2, XCircle, Filter, Plus, Eye, Edit, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Select from '../../components/common/Select';
import ShopDetailModal from '../../components/admin/ShopDetailModal';
import CreateShopModal from '../../components/admin/CreateShopModal';
import Alert, { type AlertType } from '../../components/common/Alert';

export interface Shop {
  MaCuaHang: string;
  NguoiBanId: string;
  TenCuaHang: string;
  MoTa: string;
  Logo: string;
  DiaChi: string;
  PhuongXa: string;
  QuanHuyen: string;
  TinhThanh: string;
  SoDienThoai: string;
  LoaiHinhCuaHang: number;
  MaSoThue: string;
  PdfGiayPhep: string;
  DaXacThucPhapLy: boolean;
  LyDoTuChoi: string;
  NgayTao: string;
  TrangThai: boolean;
  TenNguoiBan: string;
  Email: string;
  TenDangNhap: string;
}

const ShopManagement = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    TotalShops: 0,
    ActiveShops: 0,
    PendingShops: 0,
    SuspendedShops: 0,
    last7Days: []
  });

  // Filter & Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals state
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopToEdit, setShopToEdit] = useState<Shop | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: React.ReactNode;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const showAlert = (type: AlertType, title: string, message: React.ReactNode, onConfirm?: () => void) => {
    setAlertConfig({ isOpen: true, type, title, message, onConfirm });
  };
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  const fetchStats = async () => {
    try {
      const response = await api.get('/shops/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(approvalFilter && { approval: approvalFilter }),
        ...(typeFilter && { type: typeFilter })
      });
      const response = await api.get(`/shops?${params}`);
      if (response.data.success) {
        setShops(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchShops();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, limit, search, statusFilter, approvalFilter, typeFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getStatusBadge = (daXacThuc: boolean, trangThai: boolean) => {
    if (!daXacThuc) {
      return <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-medium">Chờ duyệt</span>;
    }
    if (!trangThai) {
      return <span className="px-3 py-1 bg-danger/10 text-danger border border-danger/20 rounded-full text-xs font-medium">Bị khóa</span>;
    }
    return <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-xs font-medium">Hoạt động</span>;
  };

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1:
        return <div className="flex items-center gap-1 text-text-muted"><UserCircle size={14}/> Cá nhân</div>;
      case 2:
        return <div className="flex items-center gap-1 text-text-muted"><Building2 size={14}/> Hộ kinh doanh</div>;
      case 3:
        return <div className="flex items-center gap-1 text-text-muted"><Building2 size={14}/> Doanh nghiệp</div>;
      default:
        return <div className="flex items-center gap-1 text-text-muted"><Store size={14}/> Khác</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
        <Store className="w-6 h-6 text-primary" /> Quản lý cửa hàng
      </h2>

      {/* Card 1: Biểu đồ thống kê */}
      <div className="bg-surface backdrop-blur-md border border-border-default rounded-xl p-6 shadow-2xl flex flex-col gap-4">
        <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Tổng quan Thống kê
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-muted rounded-lg p-4 border border-border-default flex flex-col">
            <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" /> Đăng ký mới (7 ngày)
            </h3>
            <div className="h-[200px] w-full flex items-center justify-center">
              {stats.last7Days && stats.last7Days.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                      cursor={{ fill: '#334155', opacity: 0.4 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="active" stackId="a" fill="#10B981" name="Hoạt động" />
                    <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Chờ duyệt" />
                    <Bar dataKey="suspended" stackId="a" fill="#EF4444" name="Bị khóa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-text-muted">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
          
          <div className="bg-surface-muted rounded-lg p-4 border border-border-default flex flex-col">
            <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">Tỷ lệ trạng thái</h3>
            <div className="h-[200px] w-full flex items-center justify-center">
              {stats.TotalShops > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Hoạt động', value: stats.ActiveShops, color: '#10B981' },
                        { name: 'Chờ duyệt', value: stats.PendingShops, color: '#F59E0B' },
                        { name: 'Bị khóa', value: stats.SuspendedShops, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {
                        [
                          { name: 'Hoạt động', value: stats.ActiveShops, color: '#10B981' },
                          { name: 'Chờ duyệt', value: stats.PendingShops, color: '#F59E0B' },
                          { name: 'Bị khóa', value: stats.SuspendedShops, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      }
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value: any) => [`${value} cửa hàng`, 'Số lượng']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-text-muted">
                  Chưa có dữ liệu
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Bảng dữ liệu */}
      <div className="bg-surface backdrop-blur-md border border-border-default rounded-xl p-6 shadow-2xl flex flex-col gap-6 mt-2">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Store className="w-5 h-5" /> Danh sách Cửa hàng
          </h2>
          <div className="flex flex-wrap gap-4 w-full xl:w-auto items-center">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Tên shop, MST, tên chủ..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-surface-muted border border-border-default rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted text-text-main"
              />
            </div>
            <div className="flex bg-surface-muted border border-border-default rounded-lg p-1">
              <button
                onClick={() => { setApprovalFilter(''); setPage(1); }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium ${approvalFilter === '' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => { setApprovalFilter('pending'); setPage(1); }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium ${approvalFilter === 'pending' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
              >
                Chờ xác thực
              </button>
              <button
                onClick={() => { setApprovalFilter('verified'); setPage(1); }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium ${approvalFilter === 'verified' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}
              >
                Đã xác thực
              </button>
            </div>
            <div className="w-44">
              <Select
                options={[
                  { value: '', label: 'Tất cả trạng thái' },
                  { value: 'active', label: 'Hoạt động' },
                  { value: 'suspended', label: 'Bị khóa' }
                ]}
                value={statusFilter}
                onChange={(val) => { setStatusFilter(val as string); setPage(1); }}
              />
            </div>
            <div className="w-44">
              <Select
                options={[
                  { value: '', label: 'Tất cả loại hình' },
                  { value: '1', label: 'Cá nhân' },
                  { value: '2', label: 'Hộ KD' },
                  { value: '3', label: 'Doanh nghiệp' }
                ]}
                value={typeFilter}
                onChange={(val) => { setTypeFilter(val as string); setPage(1); }}
              />
            </div>
            <button 
              onClick={() => {
                setShopToEdit(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-blue-500/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Thêm mới
            </button>
          </div>
        </div>

        <div className="bg-surface-muted rounded-lg overflow-hidden border border-border-default">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-main">
              <thead className="bg-surface border-b border-border-default text-xs uppercase font-semibold text-text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Cửa hàng</th>
                <th className="px-6 py-4 font-semibold">Chủ sở hữu</th>
                <th className="px-6 py-4 font-semibold">Mã số thuế</th>
                <th className="px-6 py-4 font-semibold">Loại hình</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">Đang tải dữ liệu...</td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">Không tìm thấy cửa hàng nào</td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.MaCuaHang} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {shop.Logo ? (
                          <img src={shop.Logo} alt={shop.TenCuaHang} className="w-10 h-10 rounded-full object-cover border border-border-default" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {shop.TenCuaHang.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-text-main">{shop.TenCuaHang}</div>
                          <div className="text-xs text-text-muted">{shop.SoDienThoai}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{shop.TenNguoiBan}</div>
                      <div className="text-xs text-text-muted">{shop.TenDangNhap}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{shop.MaSoThue}</td>
                    <td className="px-6 py-4">{getTypeBadge(shop.LoaiHinhCuaHang)}</td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(shop.DaXacThucPhapLy, shop.TrangThai)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedShop(shop);
                            setIsDetailModalOpen(true);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${!shop.DaXacThucPhapLy ? 'text-white bg-primary hover:bg-primary-hover' : 'text-primary bg-primary/10 hover:bg-primary/20'}`}
                          title={!shop.DaXacThucPhapLy ? 'Phê duyệt' : 'Chi tiết'}
                        >
                          {!shop.DaXacThucPhapLy ? <CheckCircle2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setShopToEdit(shop);
                            setIsCreateModalOpen(true);
                          }}
                          className="p-1.5 text-text-muted bg-surface border border-border-default hover:text-text-main hover:bg-surface-muted rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {!loading && shops.length > 0 && (
          <div className="pt-4 flex justify-end">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ShopDetailModal
        isOpen={isDetailModalOpen}
        shop={selectedShop}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdate={() => {
          fetchShops();
          fetchStats();
        }}
        showAlert={showAlert}
      />

      <CreateShopModal
        isOpen={isCreateModalOpen}
        shop={shopToEdit}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchShops();
          fetchStats();
          showAlert('success', 'Thành công', shopToEdit ? 'Cập nhật cửa hàng thành công.' : 'Tạo cửa hàng mới thành công.');
        }}
      />

      <Alert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onClose={closeAlert}
      />
    </div>
  );
};

export default ShopManagement;

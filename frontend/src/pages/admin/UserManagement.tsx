import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Loader2, AlertCircle, Users, UserPlus, Shield, User as UserIcon, Store } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import UserDetailModal from '../../components/admin/UserDetailModal';
import CreateUserModal from '../../components/admin/CreateUserModal';
import Alert, { type AlertType } from '../../components/common/Alert';

interface User {
  MaNguoiDung: string;
  TenDangNhap: string;
  MatKhauHash?: string;
  Email: string;
  HoTen: string;
  SoDienThoai: string;
  VaiTroId?: string;
  roleName: string;
  AnhDaiDien: string | null;
  NgayTao: string;
  NgayCapNhat?: string;
  DaXoa?: boolean;
}

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308'];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<{
    roles: Array<{ name: string; value: number }>;
    last7Days: Array<{ date: string; newUsers: number }>;
  }>({ roles: [], last7Days: [] });
  const [loadingStats, setLoadingStats] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      setLoadingStats(true);
      const response = await api.get('/users/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải thống kê:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/users?page=${page}&limit=5&search=${search}`);
      if (response.data.success) {
        setUsers(response.data.data.data);
        setTotal(response.data.data.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  const handleDelete = (id: string, name: string) => {
    showAlert(
      'confirm',
      'Xác nhận xoá',
      `Bạn có chắc chắn muốn xoá người dùng ${name}? Tài khoản và cửa hàng liên quan sẽ bị vô hiệu hóa.`,
      async () => {
        try {
          const response = await api.delete(`/users/${id}`);
          if (response.data.success) {
            showAlert('success', 'Thành công', 'Xoá người dùng thành công.');
            fetchUsers();
            fetchStats(); // Update stats after deleting
          }
        } catch (err: any) {
          showAlert('error', 'Lỗi', err.response?.data?.message || 'Có lỗi xảy ra khi xoá.');
        }
      }
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto flex flex-col gap-6 text-text-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main">Quản lý Người dùng</h1>
          <p className="text-text-muted mt-1">Phân tích và quản lý tài khoản trên hệ thống</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface backdrop-blur-md border border-border-default rounded-xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Tổng người dùng</p>
            <h3 className="text-2xl font-bold text-text-main">
              {stats.roles.reduce((sum: number, r: any) => sum + r.value, 0)}
            </h3>
          </div>
        </div>
        <div className="bg-surface backdrop-blur-md border border-border-default rounded-xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <UserIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Người mua (Buyer)</p>
            <h3 className="text-2xl font-bold text-text-main">
              {stats.roles.find((r: any) => r.name === 'Buyer')?.value || 0}
            </h3>
          </div>
        </div>
        <div className="bg-surface backdrop-blur-md border border-border-default rounded-xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Store size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted">Người bán (Seller)</p>
            <h3 className="text-2xl font-bold text-text-main">
              {stats.roles.find((r: any) => r.name === 'Seller')?.value || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Charts (4/12 width) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: Tỷ lệ Vai trò */}
          <div className="bg-surface backdrop-blur-md border border-border-default rounded-xl p-6 shadow-2xl flex flex-col gap-4">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Tỷ lệ Vai trò
            </h2>
            <div className="bg-surface-muted rounded-lg p-4 border border-border-default">
              <div className="h-[220px] w-full flex items-center justify-center">
                {loadingStats ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : stats.roles.length === 0 ? (
                  <p className="text-text-muted">Chưa có dữ liệu</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.roles}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.roles.map((_entry: any, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Đăng ký mới (7 ngày) */}
          <div className="bg-surface backdrop-blur-md border border-border-default rounded-xl p-6 shadow-2xl flex flex-col gap-4">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-secondary" /> Đăng ký mới (7 ngày)
            </h2>
            <div className="bg-surface-muted rounded-lg p-4 border border-border-default">
              <div className="h-[220px] w-full flex items-center justify-center">
                {loadingStats ? (
                  <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                ) : stats.last7Days.length === 0 ? (
                  <p className="text-text-muted">Chưa có dữ liệu</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.last7Days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                        cursor={{ fill: '#334155', opacity: 0.4 }}
                      />
                      <Bar dataKey="newUsers" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Người dùng mới" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Table (8/12 width) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface backdrop-blur-md border border-border-default rounded-xl p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                <Users className="w-5 h-5" /> Danh sách Người dùng
              </h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={search}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 bg-surface-muted border border-border-default rounded-lg text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted"
                  />
                </div>
                <button 
                  onClick={() => {
                    setUserToEdit(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Thêm mới</span>
                </button>
              </div>
            </div>

            {/* Bảng */}
            <div className="bg-surface-muted rounded-lg overflow-hidden border border-border-default">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-text-body">
                  <thead className="bg-surface border-b border-border-default text-xs uppercase font-semibold text-text-muted">
                    <tr>
                      <th className="px-6 py-4">Tài khoản</th>
                      <th className="px-6 py-4">Liên hệ</th>
                      <th className="px-6 py-4">Vai trò</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default">
                    {loading && users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                          <p>Đang tải dữ liệu...</p>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <p className="text-slate-500">Không tìm thấy người dùng nào.</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.MaNguoiDung} className="hover:bg-surface transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-text-main">{user.HoTen}</div>
                            <div className="text-xs text-text-muted mt-1">@{user.TenDangNhap}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-text-body">{user.Email}</div>
                            <div className="text-xs text-text-muted mt-1">{user.SoDienThoai || 'Chưa cập nhật'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                              user.roleName === 'Admin' 
                                ? 'bg-danger/10 text-danger border-danger/20' 
                                : user.roleName === 'Seller'
                                ? 'bg-secondary/10 text-secondary border-secondary/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                            }`}>
                              {user.roleName}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setUserToEdit(user);
                                  setIsCreateModalOpen(true);
                                }}
                                className="p-2 text-text-muted hover:text-warning hover:bg-warning/10 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(user.MaNguoiDung, user.HoTen)}
                                className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                title="Xoá"
                              >
                                <Trash2 className="w-4 h-4" />
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

            <Pagination 
              currentPage={page} 
              totalPages={total} 
              onPageChange={setPage} 
            />
          </div>
        </div>
      </div>

      <UserDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        user={selectedUser} 
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        user={userToEdit}
        onSuccess={() => {
          fetchUsers();
          fetchStats();
          showAlert('success', 'Thành công', userToEdit ? 'Cập nhật người dùng thành công.' : 'Tạo người dùng mới thành công.');
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

export default UserManagement;

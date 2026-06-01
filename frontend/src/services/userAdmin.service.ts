import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  roleId: string;
  roleName: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface GetUsersResponse {
  data: User[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const userAdminService = {
  getUsers: async (page: number = 1, limit: number = 10, search: string = '') => {
    const response = await api.get<{ success: boolean; data: any }>(
      `/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    );
    const rawData = response.data.data;
    const mappedUsers = (rawData.data || []).map((u: any) => ({
      id: u.MaNguoiDung,
      username: u.TenDangNhap,
      email: u.Email,
      fullName: u.HoTen,
      phone: u.SoDienThoai,
      roleId: u.VaiTroId,
      roleName: u.roleName,
      avatar: u.AnhDaiDien,
      isActive: !u.DaXoa,
      createdAt: u.NgayTao,
    }));
    return {
      data: mappedUsers,
      total: rawData.total,
      currentPage: rawData.currentPage,
      totalPages: rawData.totalPages
    };
  }
};

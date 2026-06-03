import api from './api';

export const userService = {
  searchContacts: async (q: string) => {
    const response = await api.get('/users/search', { params: { q } });
    const payload = response.data?.data || [];
    return payload.map((u: any) => ({
      userId: u.userId || u.MaNguoiDung || null,
      fullName: u.fullName || u.HoTen || '',
      email: u.Email || u.email || null,
      phone: u.phone || u.SoDienThoai || null,
      avatar: u.avatar || u.AnhDaiDien || null,
      roleName: u.roleName || u.TenVaiTro || null,
      createdAt: u.createdAt || u.NgayTao || null,
      storeId: u.storeId || u.MaCuaHang || null,
      storeName: u.storeName || u.TenCuaHang || null,
      storeLogo: u.storeLogo || u.Logo || null
    }));
  },

  searchStores: async (q: string) => {
    const response = await api.get('/users/search-stores', { params: { q } });
    const payload = response.data?.data || [];
    return payload.map((s: any) => ({
      storeId: s.storeId || s.MaCuaHang || null,
      storeName: s.storeName || s.TenCuaHang || '',
      storeLogo: s.storeLogo || s.Logo || null,
      storePhone: s.storePhone || s.SoDienThoai || null,
      storeEmail: s.storeEmail || s.Email || null,
      storeAddress: s.storeAddress || s.DiaChi || null,
      storeDescription: s.storeDescription || s.MoTa || null,
      userId: s.userId || s.MaNguoiDung || null,
      fullName: s.fullName || s.HoTen || '',
      avatar: s.avatar || s.AnhDaiDien || null
    }));
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    const raw = response.data?.data;
    if (!raw) return response.data;
    return {
      success: true,
      data: {
        userId: raw.userId || raw.MaNguoiDung || null,
        fullName: raw.fullName || raw.HoTen || '',
        email: raw.Email || raw.email || null,
        phone: raw.phone || raw.SoDienThoai || null,
        avatar: raw.avatar || raw.AnhDaiDien || null,
        roleName: raw.roleName || raw.TenVaiTro || null,
        createdAt: raw.createdAt || raw.NgayTao || null,
        storeId: raw.storeId || raw.MaCuaHang || null,
        storeName: raw.storeName || raw.TenCuaHang || null,
        storeLogo: raw.storeLogo || raw.Logo || null
      }
    };
  }
};

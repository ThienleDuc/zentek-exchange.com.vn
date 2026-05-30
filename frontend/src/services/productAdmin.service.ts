import api from './api';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  trangThai?: string;
  tuNgay?: string;
  denNgay?: string;
  cuaHang?: string;
  danhMuc?: string;
  tinhTrang?: string;
}

export const productAdminService = {
  // Lấy danh sách sản phẩm
  getProducts: async (params?: ProductQueryParams) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  // Lấy thống kê
  getStats: async (tuNgay?: string, denNgay?: string) => {
    const response = await api.get('/admin/products/stats', { params: { tuNgay, denNgay } });
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getProductDetail: async (id: string) => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  // Cập nhật trạng thái sản phẩm
  updateProductStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/products/${id}/status`, { status });
    return response.data;
  }
};

export default productAdminService;

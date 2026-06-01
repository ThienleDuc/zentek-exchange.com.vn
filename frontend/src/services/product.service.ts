import api from './api';

export interface ProductPublicParams {
  sortBy?: string;
  offset?: number;
  limit?: number;
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  priceMin?: number | '';
  priceMax?: number | '';
  rating?: number;
  condition?: string;
  store?: string;
  province?: string;
  district?: string;
  ward?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  // Lấy danh sách sản phẩm trang chủ (Bán chạy, Mới nhất)
  getProducts: async (params?: ProductPublicParams) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (params?: ProductSearchParams) => {
    const response = await api.get('/products/search', { params });
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getProductDetail: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
};

export default productService;

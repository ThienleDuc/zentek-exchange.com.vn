import api from './api';

export interface StoreSearchParams {
  search?: string;
  province?: string;
  district?: string;
  ward?: string;
  businessType?: string;
  verified?: boolean;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const storeService = {
  // Lấy danh sách cửa hàng
  getStores: async (params?: StoreSearchParams) => {
    const response = await api.get('/stores', { params });
    return response.data;
  }
};

export default storeService;

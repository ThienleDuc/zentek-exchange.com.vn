import api from './api';

export interface OrderItem {
  maChiTietGioHang?: string;
  sanPhamId: string;
  phanLoaiId?: string;
  soLuong: number;
  donGia: number;
  tenSanPham: string;
  phanLoai?: string;
  anh: string;
  tenCuaHang: string;
  logoCuaHang?: string | null;
  tonKho: number;
}

export interface PlaceOrderParams {
  tempOrderId: string;
  hoTenNguoiNhan: string;
  soDienThoaiNguoiNhan: string;
  diaChiNhan: string;
  ghiChu?: string;
  items?: { sanPhamId: string; phanLoaiId?: string; soLuong: number }[];
}

export const orderService = {
  // Create a temporary order from selected cart items
  createTempOrderFromCart: async (cartItemIds: string[]) => {
    const response = await api.post('/temp-order/create', {
      cartItemIds,
      isBuyNow: false
    });
    return response.data;
  },

  // Create a temporary order directly for "Buy Now"
  createTempOrderFromBuyNow: async (productId: string, quantity: number, classificationId?: string) => {
    const response = await api.post('/temp-order/create', {
      SanPhamId: productId,
      PhanLoaiId: classificationId,
      SoLuong: quantity,
      isBuyNow: true
    });
    return response.data;
  },

  // Retrieve temporary order details
  getTempOrder: async (tempOrderId: string) => {
    const response = await api.get(`/temp-order/${tempOrderId}`);
    return response.data;
  },

  // Place actual order
  placeOrder: async (params: PlaceOrderParams) => {
    const response = await api.post('/orders', params);
    return response.data;
  }
};

export default orderService;

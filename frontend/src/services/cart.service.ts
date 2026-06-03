import api from './api';

export interface CartItem {
  maChiTietGioHang: string;
  sanPhamId: string;
  tenSanPham: string;
  anh: string;
  phanLoai?: string;
  tenCuaHang: string;
  donGia: number;
  soLuong: number;
  tonKho: number;
  daHetHang: boolean;
}

export const cartService = {
  // Fetch user's cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add product to cart
  addToCart: async (productId: string, quantity: number, classificationId?: string) => {
    const response = await api.post('/cart/add', {
      SanPhamId: productId,
      PhanLoaiId: classificationId,
      SoLuong: quantity
    });
    window.dispatchEvent(new Event('cart-updated'));
    return response.data;
  },

  // Update item quantity
  updateQuantity: async (itemId: string, newQuantity: number) => {
    const response = await api.put('/cart/update', {
      itemId,
      newQuantity
    });
    window.dispatchEvent(new Event('cart-updated'));
    return response.data;
  },

  // Remove item from cart
  removeItem: async (itemId: string) => {
    const response = await api.delete(`/cart/remove/${itemId}`);
    window.dispatchEvent(new Event('cart-updated'));
    return response.data;
  }
};

export default cartService;

import api from './api';

export interface OrderDetailItem {
  MaChiTietDonHang: string;
  maSanPham: string;
  phanLoaiId?: string | null;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  tenSanPham: string;
  phanLoai?: string | null;
  tenCuaHang: string;
  sellerId: string;
  shopId: string;
  anh: string | null;
  daDanhGia?: boolean;
  reviewId?: string | null;
  reviewSoSao?: number | null;
  reviewNoiDung?: string | null;
  reviewTraLoiNoiDung?: string | null;
}

export interface AdminOrder {
  maDonHang: string;
  ngayTao: string;
  trangThai: string;
  tongTien: number;
  buyerId: string;
  shopId: string;
  daDanhGia?: boolean;
  daTraLoi?: boolean;
  hoTenNguoiNhan?: string;
  soDienThoaiNguoiNhan?: string;
  diaChiNhan?: string;
  lyDoHuy?: string;
  items: OrderDetailItem[];
}

export const orderAdminService = {
  // Get orders list for buyer or seller
  getOrders: async (role: 'buyer' | 'seller', page: number = 1, limit: number = 10, status?: string, search?: string) => {
    let url = `/orders?role=${role}&page=${page}&limit=${limit}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await api.get<{ 
      success: boolean; 
      data: AdminOrder[]; 
      pagination?: { totalPages: number; currentPage: number; totalItems: number; limit: number } 
    }>(url);
    return response.data;
  },

  // Get order invoice details by ID
  getOrderDetails: async (orderId: string) => {
    const response = await api.get<{ success: boolean; data: AdminOrder }>(`/orders/${orderId}`);
    return response.data;
  },

  // Seller confirms shipment
  confirmShipment: async (orderId: string) => {
    const response = await api.put<{ success: boolean; message: string }>(`/orders/${orderId}/xac-nhan-giao`);
    return response.data;
  },

  // Cancel order (buyer or seller)
  cancelOrder: async (orderId: string, reason: string) => {
    const response = await api.put<{ success: boolean; message: string }>(`/orders/${orderId}/huy`, {
      lyDoHuy: reason
    });
    return response.data;
  },

  // Buyer confirms receipt
  confirmReceived: async (orderId: string) => {
    const response = await api.put<{ success: boolean; message: string }>(`/orders/${orderId}/da-nhan`);
    return response.data;
  },

  // Submit reviews for items in an order
  submitOrderReviews: async (orderId: string, reviews: { sanPhamId: string; soSao: number; noiDung: string }[]) => {
    const response = await api.post<{ success: boolean; message: string }>(`/orders/${orderId}/danh-gia`, {
      reviews
    });
    return response.data;
  }
};

export default orderAdminService;

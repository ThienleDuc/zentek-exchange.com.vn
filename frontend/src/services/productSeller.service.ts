import api from './api';

export interface ProductImageInput {
  url: string;
  isMain: boolean;
  tempId?: string;
}

export interface ProductVariationInput {
  name: string;
  imageTempId: string;
}

export interface CreateProductInput {
  TieuDe: string;
  DanhMucId: string;
  Gia: number;
  TinhTrang: string;
  SoLuong: number;
  FileMoTa?: string | null;
  LinkSanPham?: string | null;
  images: ProductImageInput[];
  variations: ProductVariationInput[];
}

export interface UpdateProductInput {
  TieuDe: string;
  DanhMucId: string;
  Gia: number;
  TinhTrang: string;
  SoLuong: number;
  FileMoTa?: string | null;
  LinkSanPham?: string | null;
}

export interface SellerProduct {
  MaSanPham: string;
  CuaHangId: string;
  DanhMucId: string;
  TieuDe: string;
  FileMoTa: string | null;
  Gia: number;
  TinhTrang: string;
  SoLuong: number;
  SoLuongDaBan: number;
  LuotXem: number;
  DiemDanhGia: number;
  LinkSanPham: string | null;
  TrangThaiDuyet: string;
  TrangThaiHienThi: boolean;
  NgayDang: string;
  NgaySua: string | null;
  HinhAnh?: string;
  images?: any[];
  variations?: any[];
  TenCuaHang?: string;
  TenDanhMuc?: string;
  TenDanhMucCha?: string;
}

export interface ReviewMedia {
  MaPhanHoi: string;
  DanhGiaId: string | null;
  TinNhanId: string | null;
  LoaiPhanHoi: string;
  LoaiMedia: 'anh' | 'video';
  DuongDanMedia: string;
  NgayTao: string;
}

export interface ProductReview {
  MaDanhGia: string;
  SanPhamId: string;
  NguoiMuaId: string;
  DonHangId: string;
  SoSao: number;
  NoiDung: string | null;
  DuongDanVideo: string | null;
  HuuIch: number;
  NgayTao: string;
  NgayCapNhat: string | null;
  TraLoiNoiDung: string | null;
  TraLoiNgayTao: string | null;
  TraLoiNgayCapNhat: string | null;
  TenNguoiMua: string;
  AnhDaiDien: string | null;
  media?: ReviewMedia[];
}

export const productSellerService = {
  // Lấy danh sách sản phẩm của Seller
  getProducts: async () => {
    const response = await api.get('/products/seller');
    return response.data;
  },

  // Lấy thống kê sản phẩm của Seller
  getStats: async (tuNgay: string = '', denNgay: string = '') => {
    const response = await api.get('/products/seller/stats', {
      params: { tuNgay, denNgay }
    });
    return response.data;
  },

  // Lấy chi tiết sản phẩm của Seller (kể cả chưa duyệt)
  getProductDetail: async (id: string) => {
    const response = await api.get(`/products/seller/${id}`);
    return response.data;
  },

  // Tạo sản phẩm mới
  createProduct: async (data: CreateProductInput) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Cập nhật thông tin sản phẩm
  updateProduct: async (id: string, data: UpdateProductInput) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Xác nhận hết hàng
  setOutOfStock: async (id: string) => {
    const response = await api.put(`/products/${id}/out-of-stock`);
    return response.data;
  },

  // Xác nhận còn hàng
  setInStock: async (id: string, quantity: number) => {
    const response = await api.put(`/products/${id}/in-stock`, { quantity });
    return response.data;
  },

  // Lấy danh sách đánh giá sản phẩm có lọc theo số sao
  getProductReviews: async (id: string, sosao: number = 0) => {
    const response = await api.get(`/products/${id}/reviews`, {
      params: { sosao }
    });
    return response.data;
  },

  // Seller trả lời đánh giá
  replyReview: async (reviewId: string, noiDung: string) => {
    const response = await api.post(`/products/reviews/${reviewId}/reply`, { noiDung });
    return response.data;
  }
};

export default productSellerService;

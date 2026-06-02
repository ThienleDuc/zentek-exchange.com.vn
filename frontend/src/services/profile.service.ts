import api from './api';

export interface UserProfileResponse {
  success: boolean;
  data: {
    MaNguoiDung: string;
    TenDangNhap: string;
    Email: string;
    HoTen: string;
    SoDienThoai: string | null;
    AnhDaiDien: string | null;
    NgayTao: string;
    NgayCapNhat: string | null;
    roleName: string;
  };
}

export interface SellerProfileResponse {
  success: boolean;
  data: {
    user: {
      maNguoiDung: string;
      tenDangNhap: string;
      hoTen: string;
      email: string;
      soDienThoai: string | null;
      anhDaiDien: string | null;
      ngayTao: string;
    };
    shop: {
      maCuaHang: string;
      tenCuaHang: string;
      moTa: string | null;
      logo: string | null;
      diaChi: string;
      phuongXa: string;
      quanHuyen: string;
      tinhThanh: string;
      soDienThoai: string;
      loaiHinhCuaHang: number;
      maSoThue: string;
      daXacThucPhapLy: boolean;
      ngayTao: string;
    } | null;
  };
}

export interface CommonResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Lấy thông tin cá nhân của người dùng hiện tại (Buyer/Seller)
 */
export const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await api.get<UserProfileResponse>('/user/profile');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể lấy thông tin người dùng. Vui lòng kiểm tra lại.';
    throw new Error(message);
  }
};

/**
 * Cập nhật thông tin cá nhân của người dùng (Buyer)
 */
export const updateUserProfile = async (payload: {
  HoTen: string;
  Email: string;
  SoDienThoai: string | null;
  AnhDaiDien: string | null;
  otp?: string;
}): Promise<CommonResponse> => {
  try {
    const response = await api.put<CommonResponse>('/user/profile', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Cập nhật thông tin thất bại. Vui lòng kiểm tra lại.';
    throw new Error(message);
  }
};

/**
 * Lấy thông tin tài khoản và cửa hàng của người bán
 */
export const getSellerProfile = async (): Promise<SellerProfileResponse> => {
  try {
    const response = await api.get<SellerProfileResponse>('/seller/profile');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể lấy thông tin cửa hàng. Vui lòng kiểm tra lại.';
    throw new Error(message);
  }
};

/**
 * Cập nhật thông tin tài khoản và cửa hàng của người bán
 */
export const updateSellerProfile = async (payload: {
  user: any;
  shop: any;
  otp?: string;
}): Promise<CommonResponse> => {
  try {
    const response = await api.put<CommonResponse>('/seller/profile', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Cập nhật hồ sơ cửa hàng thất bại. Vui lòng kiểm tra lại.';
    throw new Error(message);
  }
};

/**
 * Gửi mã OTP xác thực
 */
export const sendOtp = async (payload: {
  email?: string;
  phone?: string;
}): Promise<CommonResponse> => {
  try {
    const response = await api.post<CommonResponse>('/otp/send', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
    throw new Error(message);
  }
};

/**
 * Xác thực mã OTP
 */
export const verifyOtp = async (payload: {
  email?: string;
  phone?: string;
  otp: string;
}): Promise<CommonResponse> => {
  try {
    const response = await api.post<CommonResponse>('/otp/verify', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.';
    throw new Error(message);
  }
};

/**
 * Lấy tổng quan doanh thu, đơn hàng, tồn kho của người bán
 */
export const getSellerOverview = async (): Promise<CommonResponse> => {
  try {
    const response = await api.get<CommonResponse>('/seller/dashboard/overview');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể lấy thông tin tổng quan dashboard.';
    throw new Error(message);
  }
};

/**
 * Lấy dữ liệu biểu đồ doanh thu & đơn hàng của người bán
 */
export const getSellerRevenueChart = async (period: string): Promise<CommonResponse> => {
  try {
    const response = await api.get<CommonResponse>(`/seller/dashboard/revenue-chart?period=${period}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể lấy dữ liệu biểu đồ doanh thu.';
    throw new Error(message);
  }
};

/**
 * Lấy dữ liệu tăng trưởng của người bán
 */
export const getSellerGrowth = async (period: string): Promise<CommonResponse> => {
  try {
    const response = await api.get<CommonResponse>(`/seller/dashboard/growth?period=${period}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể lấy dữ liệu tăng trưởng.';
    throw new Error(message);
  }
};

/**
 * Lấy danh sách sản phẩm bán chạy của người bán
 */
export const getSellerTopProducts = async (limit: number): Promise<CommonResponse> => {
  try {
    const response = await api.get<CommonResponse>(`/seller/dashboard/top-products?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể lấy dữ liệu sản phẩm bán chạy.';
    throw new Error(message);
  }
};

/**
 * Lấy phân bố đánh giá sao của người bán
 */
export const getSellerRatingDistribution = async (): Promise<CommonResponse> => {
  try {
    const response = await api.get<CommonResponse>('/seller/dashboard/rating-distribution');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể lấy dữ liệu phân bố đánh giá.';
    throw new Error(message);
  }
};


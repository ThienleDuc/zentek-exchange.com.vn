import axios from 'axios';

// Định nghĩa Base URL trỏ về Backend API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_URL = API_BASE_URL.replace('/api', '');
export const REPO_URL = import.meta.env.VITE_REPO_URL || SERVER_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout 10s
});

// Request Interceptor: Tự động đính kèm JWT token vào header Authorization nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý tập trung các lỗi phản hồi (VD: 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu token hết hạn hoặc không hợp lệ -> Xóa bộ nhớ và điều hướng đăng nhập
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Tùy chỉnh: Chuyển hướng người dùng về trang đăng nhập nếu cần
      // window.location.href = '/dang-nhap';
    }
    return Promise.reject(error);
  }
);

export default api;

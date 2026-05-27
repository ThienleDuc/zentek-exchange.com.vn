import api from './api';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại kết nối.';
    throw new Error(message);
  }
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể đăng ký tài khoản. Vui lòng kiểm tra lại kết nối.';
    throw new Error(message);
  }
};

export const registerSeller = async (credentials: any): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register-seller', credentials);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể đăng ký cửa hàng. Vui lòng kiểm tra lại kết nối.';
    throw new Error(message);
  }
};

export const sendOTP = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/send-otp', { email });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại.';
    throw new Error(message);
  }
};

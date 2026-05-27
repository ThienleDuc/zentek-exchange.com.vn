// --- Authentication Types ---

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  roleName: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  otpSent?: boolean;
  email?: string;
}

export interface RegisterSellerCredentials {
  username: string;
  password?: string;
  email: string;
  fullName: string;
  otp: string;
  shopName: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  description?: string;
  shopPhone: string;
  shopType: number; // 1: Cá nhân, 2: Doanh nghiệp
  taxCode?: string;
  licensePdf: string;
}

export interface VerifyOTPCredentials {
  email: string;
  otp: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password?: string;
  email: string;
  fullName: string;
  roleName?: string;
  otp?: string;
}

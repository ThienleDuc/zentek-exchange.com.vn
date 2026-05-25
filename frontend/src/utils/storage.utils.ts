export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REMEMBER_ME: 'remember_me'
};

export const storage = {
  // Lưu token
  setToken: (token: string) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  // Lấy token
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Lưu thông tin người dùng
  setUser: (user: any) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Lấy thông tin người dùng
  getUser: () => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  // Xóa toàn bộ dữ liệu đăng nhập
  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Lưu trạng thái "Ghi nhớ đăng nhập"
  setRememberMe: (value: boolean) => {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(value));
  },

  // Lấy trạng thái "Ghi nhớ đăng nhập"
  getRememberMe: () => {
    const value = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    return value ? JSON.parse(value) : false;
  }
};

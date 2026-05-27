class OTPService {
  constructor() {
    this.pendingOTPs = new Map();
    setInterval(() => this.cleanupExpiredOTPs(), 5 * 60 * 1000);
  }

  storeOTP(email, otp, durationMinutes = 5) {
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;
    const key = email.toLowerCase().trim();
    this.pendingOTPs.set(key, { otp: otp.trim(), expiresAt });
    console.log(`🔑 Đã lưu OTP cho ${key}. Mã: ${otp}, Hết hạn lúc: ${new Date(expiresAt).toLocaleTimeString()}`);
  }

  verifyOTP(email, otp) {
    const key = email.toLowerCase().trim();
    const record = this.pendingOTPs.get(key);

    if (!record) throw new Error('Yêu cầu đăng ký đã hết hạn hoặc không tồn tại. Vui lòng gửi lại mã OTP.');
    if (Date.now() > record.expiresAt) {
      this.pendingOTPs.delete(key);
      throw new Error('Mã xác thực OTP đã hết hạn (hiệu lực 5 phút). Vui lòng gửi lại mã OTP.');
    }
    if (record.otp !== otp.trim()) throw new Error('Mã xác thực OTP không chính xác.');
    
    return true;
  }

  clearOTP(email) {
    const key = email.toLowerCase().trim();
    this.pendingOTPs.delete(key);
    console.log(`🧹 Đã dọn dẹp cache OTP cho email: ${key}`);
  }

  cleanupExpiredOTPs() {
    const now = Date.now();
    let count = 0;
    for (const [key, record] of this.pendingOTPs.entries()) {
      if (now > record.expiresAt) {
        this.pendingOTPs.delete(key);
        count++;
      }
    }
    if (count > 0) console.log(`🧹 [Cron] Đã xóa ${count} mã OTP hết hạn.`);
  }
}

module.exports = new OTPService();

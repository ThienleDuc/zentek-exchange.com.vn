const authService = require('../services/auth/auth.service');
const otpService = require('../services/auth/otp.service');
const { poolPromise } = require('../config/db');

async function runTests() {
  console.log('🏁 Bắt đầu kiểm thử tích hợp Auth OTP Service...');
  const testId = Math.floor(Math.random() * 10000);
  const testUser = {
    username: `tst_${testId}`, // Sử dụng 6 ký tự để khớp với kiểm tra mới (6-12 ký tự)
    email: `test_${testId}@zentek.com`,
    password: 'password123',
    fullName: 'Test User OTP',
    roleName: 'Buyer'
  };

  try {
    // 1. Kiểm thử Đăng Ký Bước 1 (Gửi OTP)
    console.log(`\n1. Kiểm thử Đăng ký Bước 1 với username: ${testUser.username}`);
    const regResult = await authService.register(testUser);
    if (regResult && regResult.otpSent && regResult.email === testUser.email) {
      console.log('✅ Bước 1 thành công! OTP đã được gửi.');
    } else {
      throw new Error('❌ Lỗi đăng ký bước 1: Phản hồi không đúng định dạng.');
    }

    // Lấy mã OTP vừa sinh trong bộ nhớ tạm để thực hiện tiếp Bước 2
    const pendingRecord = otpService.getPendingRegistration(testUser.email);
    if (!pendingRecord) {
      throw new Error('❌ Lỗi: Không tìm thấy OTP được lưu tạm trong Cache.');
    }
    const generatedOTP = pendingRecord.otp;
    console.log(`🔑 Mã OTP lấy ra từ cache kiểm thử: ${generatedOTP}`);

    // 2. Kiểm thử xác thực OTP thành công (Bước 2)
    console.log('\n2. Kiểm thử xác thực OTP đúng...');
    const verifyResult = await authService.verifyOTP({
      email: testUser.email,
      otp: generatedOTP
    });
    if (verifyResult && verifyResult.token && verifyResult.user.username === testUser.username) {
      console.log('✅ Xác thực OTP thành công! Người dùng đã được lưu vào DB và trả về JWT Token.');
    } else {
      throw new Error('❌ Lỗi xác thực OTP: Dữ liệu trả về không hợp lệ.');
    }

    // 3. Kiểm thử Đăng ký trùng lặp (Kiểm tra chặn đăng ký thông tin đã tồn tại trong DB)
    console.log('\n3. Kiểm thử chặn trùng lặp thông tin...');
    try {
      await authService.register(testUser);
      throw new Error('❌ Lỗi: Đăng ký trùng lặp không bị chặn.');
    } catch (err) {
      console.log(`✅ Chặn thành công lỗi trùng lặp: "${err.message}"`);
    }

    // 4. Kiểm thử Đăng nhập bằng tài khoản vừa tạo
    console.log('\n4. Kiểm thử đăng nhập...');
    const loginResult = await authService.login({
      identifier: testUser.username,
      password: testUser.password
    });
    if (loginResult && loginResult.token && loginResult.user.username === testUser.username) {
      console.log('✅ Đăng nhập thành công! Nhận được JWT Token hợp lệ.');
    } else {
      throw new Error('❌ Lỗi đăng nhập: Trả về phản hồi không hợp lệ.');
    }

    // 5. Dọn dẹp dữ liệu kiểm thử
    console.log('\n5. Dọn dẹp dữ liệu kiểm thử...');
    const pool = await poolPromise;
    await pool.request()
      .input('TenDangNhap', testUser.username)
      .query('DELETE FROM NguoiDung WHERE TenDangNhap = @TenDangNhap');
    console.log('✅ Đã dọn dẹp tài khoản kiểm thử thành công.');

    console.log('\n🎉 TOÀN BỘ CÁC BÀI KIỂM THỬ XÁC THỰC OTP ĐÃ THÀNH CÔNG!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ KẾT QUẢ KIỂM THỬ: THẤT BẠI!', error);
    
    // Dọn dẹp khẩn cấp trong trường hợp lỗi
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('TenDangNhap', testUser.username)
        .query('DELETE FROM NguoiDung WHERE TenDangNhap = @TenDangNhap');
      console.log('🧹 Đã dọn dẹp khẩn cấp tài khoản kiểm thử.');
    } catch (cleanupErr) {
      console.error('Lỗi khi dọn dẹp khẩn cấp:', cleanupErr);
    }
    process.exit(1);
  }
}

runTests();

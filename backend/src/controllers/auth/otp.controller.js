const otpService = require('../../services/auth/otp.service');
const userRepository = require('../../repositories/auth/user.repository');
const { sendOTPEmail } = require('../../utils/mail.utils');

class OTPController {
  /**
   * POST /api/otp/send
   */
  async sendOTP(req, res) {
    try {
      const userId = req.user.userId;
      const { email, phone } = req.body;

      if (!email && !phone) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Email hoặc Số điện thoại.' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      if (email) {
        // Kiểm tra email đã có người khác sử dụng chưa
        const isEmailTaken = await userRepository.isEmailTakenByOther(email, userId);
        if (isEmailTaken) {
          return res.status(400).json({ success: false, message: 'Email này đã được sử dụng bởi tài khoản khác.' });
        }

        // Lưu và gửi OTP qua email
        otpService.storeOTP(email, otp, 5);
        await sendOTPEmail(email, otp);

        return res.status(200).json({
          success: true,
          message: 'Mã OTP đã được gửi đến email của bạn.'
        });
      }

      if (phone) {
        // Kiểm tra số điện thoại đã có người khác sử dụng chưa
        const isPhoneTaken = await userRepository.isPhoneTakenByOther(phone, userId);
        if (isPhoneTaken) {
          return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi tài khoản khác.' });
        }

        // Lưu OTP và mô phỏng gửi qua điện thoại bằng cách in ra console
        otpService.storeOTP(phone, otp, 5);

        console.log('\n======================================================');
        console.log(`✉️  MÔ PHỎNG SMS OTP GỬI TỚI SỐ ĐIỆN THOẠI: ${phone}`);
        console.log(`🔑 MÃ OTP XÁC THỰC: [ ${otp} ] (Hãy dùng mã này để xác thực)`);
        console.log('======================================================\n');

        return res.status(200).json({
          success: true,
          message: 'Mã OTP đã được gửi đến số điện thoại của bạn.'
        });
      }
    } catch (error) {
      console.error('Error in OTPController.sendOTP:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/otp/verify
   */
  async verifyOTP(req, res) {
    try {
      const { email, phone, otp } = req.body;
      const target = email || phone;

      if (!target || !otp) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin xác thực và mã OTP.' });
      }

      try {
        otpService.verifyOTP(target, otp);
        // Lưu ý: Không clear OTP ở đây nếu muốn giữ để kiểm tra lúc lưu profile, hoặc có thể clear luôn tùy thuộc luồng.
        // Đối với Buyer, họ verify trước khi lưu, nên nếu clear ở đây thì bước lưu sẽ không verify được lại.
        // Vì vậy ta chỉ verify, không clear ngay. Cache OTP sẽ tự hết hạn hoặc được clear sau khi lưu thành công.
        return res.status(200).json({
          success: true,
          message: 'Xác thực OTP thành công.'
        });
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
    } catch (error) {
      console.error('Error in OTPController.verifyOTP:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new OTPController();

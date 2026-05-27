const nodemailer = require('nodemailer');
require('dotenv').config();

// Khởi tạo Transporter sử dụng cấu hình SMTP từ .env
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.MAILTRAP_PORT || '2525'),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Kiểm tra kết nối SMTP khi khởi động
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Cấu hình kết nối Mailtrap SMTP chưa chính xác hoặc chưa xác thực. Sử dụng chế độ Console Fallback để chạy trên localhost.');
  } else {
    console.log('✅ Kết nối Mailtrap SMTP thành công. Sẵn sàng gửi Email.');
  }
});

/**
 * Gửi email chứa mã OTP xác thực đăng ký tài khoản
 * 
 * @param {string} toEmail Địa chỉ email nhận OTP
 * @param {string} otp Mã xác thực 6 chữ số
 * @returns {Promise<Object>} Phản hồi từ nodemailer hoặc mock object khi lỗi
 */
const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"ZenTek Exchange" <${process.env.EMAIL_FROM || 'no-reply@zentek.com'}>`,
    to: toEmail,
    subject: `[ZenTek Exchange] Mã xác thực đăng ký tài khoản - ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; background-image: url('https://images.unsplash.com/photo-1614064010860-9e6e582d9213?q=80&w=1200&auto=format&fit=crop'); background-size: cover; background-position: center; padding: 50px 20px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <div style="max-width: 600px; width: 100%; background-color: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; box-sizing: border-box; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #38bdf8; text-transform: uppercase; letter-spacing: 3px;">ZenTek Exchange</h1>
                  <p style="color: #94a3b8; font-size: 15px; margin-top: 10px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">Sàn Giao Dịch Điện Tử Tương Lai</p>
                </div>
                
                <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.05);">
                  <p style="font-size: 18px; color: #f8fafc; margin-top: 0; font-weight: 600;">Xin chào,</p>
                  <p style="font-size: 16px; color: #cbd5e1; line-height: 1.6; margin-bottom: 25px;">
                    Cảm ơn bạn đã đăng ký tài khoản tại <strong style="color: #38bdf8;">ZenTek Exchange</strong>. Để hoàn tất quy trình kích hoạt tài khoản, vui lòng sử dụng mã bảo mật sau:
                  </p>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <div style="display: inline-block; background-color: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 15px 40px;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #ffffff; margin-left: 12px;">${otp}</span>
                    </div>
                  </div>
                  
                  <div style="background-color: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 15px; border-radius: 0 8px 8px 0;">
                    <p style="font-size: 14px; color: #fca5a5; margin: 0; line-height: 1.5;">
                      <strong style="color: #ef4444;">LƯU Ý:</strong> Mã OTP này chỉ có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối KHÔNG chia sẻ mã này với bất kỳ ai để bảo vệ tài khoản của bạn.
                    </p>
                  </div>
                </div>
                
                <div style="margin-top: 35px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 25px;">
                  <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
                    Đây là email gửi tự động từ hệ thống bảo mật của ZenTek.<br>Vui lòng không phản hồi lại địa chỉ này.
                  </p>
                  <p style="color: #475569; font-size: 12px; margin: 12px 0 0 0; font-weight: 600; text-transform: uppercase;">
                    &copy; ${new Date().getFullYear()} ZenTek Exchange
                  </p>
                </div>
                
              </div>
            </td>
          </tr>
        </table>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email OTP đã được gửi tới: ${toEmail}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Lỗi kết nối Mailtrap SMTP:', error.message);
    console.log('\n======================================================');
    console.log(`⚠️  FALLBACK: KHÔNG GỬI ĐƯỢC EMAIL QUA MAILTRAP.`);
    console.log(`✉️  EMAIL NHẬN: ${toEmail}`);
    console.log(`🔑 MÃ OTP ĐĂNG KÝ: [ ${otp} ] (Đã in ra console để phát triển trên localhost)`);
    console.log('======================================================\n');
    
    // Trả về mock info để tiến trình đăng ký không bị lỗi 500
    return { mockSent: true, messageId: `mock_${Date.now()}` };
  }
};

module.exports = {
  sendOTPEmail
};

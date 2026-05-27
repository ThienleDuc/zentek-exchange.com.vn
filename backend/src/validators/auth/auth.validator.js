const validateSendOTP = (req, res, next) => {
  const { email } = req.body;
  if (!email || !email.trim()) return res.status(400).json({ success: false, message: 'Email không được để trống.' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return res.status(400).json({ success: false, message: 'Địa chỉ email không đúng định dạng.' });
  next();
};

const validateRegister = (req, res, next) => {
  const { username, password, email, fullName, otp } = req.body;
  const errors = [];

  if (!username || !username.trim()) {
    errors.push('Tên đăng nhập không được để trống.');
  } else {
    const usernameRegex = /^[a-zA-Z0-9_]{6,12}$/;
    if (!usernameRegex.test(username.trim())) errors.push('Tên đăng nhập phải từ 6-12 ký tự, không dấu, không khoảng trắng, chỉ dùng chữ, số và gạch dưới.');
  }

  if (!password) {
    errors.push('Mật khẩu không được để trống.');
  } else if (password.length < 6) {
    errors.push('Mật khẩu phải chứa ít nhất 6 ký tự.');
  }

  if (!email || !email.trim()) {
    errors.push('Email không được để trống.');
  } else if (email.length > 100) {
    errors.push('Email không được vượt quá 100 ký tự.');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) errors.push('Địa chỉ email không đúng định dạng.');
  }

  if (!fullName || !fullName.trim()) {
    errors.push('Họ tên không được để trống.');
  } else if (fullName.trim().length < 3 || fullName.trim().length > 100) {
    errors.push('Họ tên phải từ 3 đến 100 ký tự.');
  } else {
    const nameRegex = /^[\p{L}\s]{3,100}$/u;
    if (!nameRegex.test(fullName.trim())) errors.push('Họ tên không được chứa ký tự đặc biệt hoặc chữ số.');
  }

  if (!otp || !otp.trim()) {
    errors.push('Mã xác thực OTP không được để trống.');
  } else {
    const otpRegex = /^[0-9]{6}$/;
    if (!otpRegex.test(otp.trim())) errors.push('Mã xác thực OTP phải gồm đúng 6 chữ số.');
  }

  if (errors.length > 0) return res.status(400).json({ success: false, message: errors[0], errors });
  next();
};

const validateLogin = (req, res, next) => {
  const { identifier, password } = req.body;
  const errors = [];
  if (!identifier || !identifier.trim()) errors.push('Tên đăng nhập hoặc email không được để trống.');
  if (!password) errors.push('Mật khẩu không được để trống.');
  if (errors.length > 0) return res.status(400).json({ success: false, message: errors[0], errors });
  next();
};

const validateRegisterSeller = (req, res, next) => {
  const { 
    username, password, email, fullName, otp,
    shopName, province, district, ward, address, shopPhone, shopType, taxCode, licensePdf
  } = req.body;
  const errors = [];

  if (!username || !username.trim()) {
    errors.push('Tên đăng nhập không được để trống.');
  } else {
    const usernameRegex = /^[a-zA-Z0-9_]{6,12}$/;
    if (!usernameRegex.test(username.trim())) errors.push('Tên đăng nhập phải từ 6-12 ký tự, không dấu, không khoảng trắng, chỉ dùng chữ, số và gạch dưới.');
  }

  if (!password) {
    errors.push('Mật khẩu không được để trống.');
  } else if (password.length < 6) {
    errors.push('Mật khẩu phải chứa ít nhất 6 ký tự.');
  }

  if (!email || !email.trim()) {
    errors.push('Email không được để trống.');
  } else if (email.length > 100) {
    errors.push('Email không được vượt quá 100 ký tự.');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) errors.push('Địa chỉ email không đúng định dạng.');
  }

  if (!fullName || !fullName.trim()) {
    errors.push('Họ tên không được để trống.');
  } else if (fullName.trim().length < 3 || fullName.trim().length > 100) {
    errors.push('Họ tên phải từ 3 đến 100 ký tự.');
  } else {
    const nameRegex = /^[\p{L}\s]{3,100}$/u;
    if (!nameRegex.test(fullName.trim())) errors.push('Họ tên không được chứa ký tự đặc biệt hoặc chữ số.');
  }

  if (!otp || !otp.trim()) {
    errors.push('Mã xác thực OTP không được để trống.');
  } else {
    const otpRegex = /^[0-9]{6}$/;
    if (!otpRegex.test(otp.trim())) errors.push('Mã xác thực OTP phải gồm đúng 6 chữ số.');
  }

  // Validate shop info
  if (!shopName || !shopName.trim()) {
    errors.push('Tên cửa hàng không được để trống.');
  } else if (shopName.trim().length > 50) {
    errors.push('Tên cửa hàng không được vượt quá 50 ký tự.');
  }

  if (!province || !province.trim()) errors.push('Tỉnh thành không được để trống.');
  if (!district || !district.trim()) errors.push('Quận huyện không được để trống.');
  if (!ward || !ward.trim()) errors.push('Phường xã không được để trống.');
  if (!address || !address.trim()) errors.push('Địa chỉ chi tiết không được để trống.');

  if (!shopPhone || !shopPhone.trim()) {
    errors.push('Số điện thoại cửa hàng không được để trống.');
  } else {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(shopPhone.trim())) errors.push('Số điện thoại cửa hàng phải gồm 10 chữ số.');
  }

  if (![1, 2, 3].includes(shopType)) {
    errors.push('Loại hình cửa hàng không hợp lệ.');
  }

  if ((shopType === 2 || shopType === 3) && (!taxCode || !taxCode.trim())) {
    errors.push('Hộ kinh doanh và Doanh nghiệp yêu cầu phải nhập Mã số thuế.');
  }

  if (!licensePdf || !licensePdf.trim()) {
    errors.push('Giấy phép kinh doanh (PDF/DOC) không được để trống.');
  }

  if (errors.length > 0) return res.status(400).json({ success: false, message: errors[0], errors });
  next();
};

module.exports = { validateSendOTP, validateRegister, validateRegisterSeller, validateLogin };

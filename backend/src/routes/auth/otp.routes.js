const express = require('express');
const router = express.Router();
const otpController = require('../../controllers/auth/otp.controller');
const { authenticateToken } = require('../../middlewares/auth/auth.middleware');

// Các endpoint xác thực OTP cho tài khoản (đáp ứng /api/otp/send và /api/otp/verify)
router.post('/send', authenticateToken, otpController.sendOTP);
router.post('/verify', authenticateToken, otpController.verifyOTP);

module.exports = router;

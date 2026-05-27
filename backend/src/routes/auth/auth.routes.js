const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/auth.controller');
const { validateSendOTP, validateRegister, validateRegisterSeller, validateLogin } = require('../../validators/auth/auth.validator');

// Gửi OTP (POST /api/auth/send-otp)
router.post('/send-otp', validateSendOTP, authController.sendOTP);

// Đăng ký tài khoản (POST /api/auth/register)
router.post('/register', validateRegister, authController.register);

// Đăng ký người bán (POST /api/auth/register-seller)
router.post('/register-seller', validateRegisterSeller, authController.registerSeller);

// Đăng nhập tài khoản (POST /api/auth/login)
router.post('/login', validateLogin, authController.login);

module.exports = router;

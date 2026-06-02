const express = require('express');
const router = express.Router();
const userProfileController = require('../../controllers/user/userProfile.controller');
const { authenticateToken } = require('../../middlewares/auth/auth.middleware');

// Profile endpoints (đáp ứng /api/user/profile)
router.get('/profile', authenticateToken, userProfileController.getProfile);
router.put('/profile', authenticateToken, userProfileController.updateProfile);

// NguoiDung endpoints (đáp ứng /api/nguoidung/doi-mat-khau và /api/nguoidung/thong-tin)
router.put('/doi-mat-khau', authenticateToken, userProfileController.changePassword);
router.put('/thong-tin', authenticateToken, userProfileController.updateProfile);

module.exports = router;

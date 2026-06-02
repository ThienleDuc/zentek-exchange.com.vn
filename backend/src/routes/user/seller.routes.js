const express = require('express');
const router = express.Router();
const sellerProfileController = require('../../controllers/user/sellerProfile.controller');
const { authenticateToken, authorizeRoles } = require('../../middlewares/auth/auth.middleware');

const sellerDashboardController = require('../../controllers/user/sellerDashboard.controller');

// Các endpoint cho Seller (đáp ứng /api/seller/profile)
router.get('/profile', authenticateToken, authorizeRoles('Seller'), sellerProfileController.getProfile);
router.put('/profile', authenticateToken, authorizeRoles('Seller'), sellerProfileController.updateProfile);

// Dashboard endpoints (đáp ứng /api/seller/dashboard/...)
router.get('/dashboard/overview', authenticateToken, authorizeRoles('Seller'), sellerDashboardController.getOverview.bind(sellerDashboardController));
router.get('/dashboard/revenue-chart', authenticateToken, authorizeRoles('Seller'), sellerDashboardController.getRevenueChart.bind(sellerDashboardController));
router.get('/dashboard/growth', authenticateToken, authorizeRoles('Seller'), sellerDashboardController.getGrowth.bind(sellerDashboardController));
router.get('/dashboard/top-products', authenticateToken, authorizeRoles('Seller'), sellerDashboardController.getTopProducts.bind(sellerDashboardController));
router.get('/dashboard/rating-distribution', authenticateToken, authorizeRoles('Seller'), sellerDashboardController.getRatingDistribution.bind(sellerDashboardController));

module.exports = router;


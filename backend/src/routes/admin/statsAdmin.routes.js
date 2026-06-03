const express = require('express');
const router = express.Router();
const statsAdminController = require('../../controllers/statsAdmin.controller');
const { authenticateToken, authorizeRoles } = require('../../middlewares/auth/auth.middleware');

// Apply authentication and check authorization for admin/moderator roles
router.use(authenticateToken);
router.use(authorizeRoles('Admin', 'Moderator'));

router.get('/overview', statsAdminController.getOverview.bind(statsAdminController));
router.get('/revenue-chart', statsAdminController.getRevenueChart.bind(statsAdminController));
router.get('/growth', statsAdminController.getGrowth.bind(statsAdminController));
router.get('/rating-distribution', statsAdminController.getRatingDistribution.bind(statsAdminController));
router.get('/category-revenue', statsAdminController.getCategoryRevenue.bind(statsAdminController));

module.exports = router;

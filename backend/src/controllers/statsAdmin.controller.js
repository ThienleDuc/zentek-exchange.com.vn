const statsAdminService = require('../services/statsAdmin.service');

class StatsAdminController {
  getDates(req) {
    const { from, to } = req.query;
    
    // Default from: 30 days ago
    // Default to: today
    const toDate = to ? to : new Date().toISOString().split('T')[0];
    
    let fromDate = from;
    if (!fromDate) {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      fromDate = d.toISOString().split('T')[0];
    }

    return {
      start: `${fromDate} 00:00:00`,
      end: `${toDate} 23:59:59`
    };
  }

  async getOverview(req, res) {
    try {
      const { start, end } = this.getDates(req);
      const data = await statsAdminService.getOverview(start, end);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error in StatsAdminController.getOverview:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRevenueChart(req, res) {
    try {
      const { start, end } = this.getDates(req);
      const data = await statsAdminService.getRevenueChart(start, end);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error in StatsAdminController.getRevenueChart:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getGrowth(req, res) {
    try {
      const { start, end } = this.getDates(req);
      const data = await statsAdminService.getGrowth(start, end);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error in StatsAdminController.getGrowth:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRatingDistribution(req, res) {
    try {
      const { start, end } = this.getDates(req);
      const data = await statsAdminService.getRatingDistribution(start, end);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error in StatsAdminController.getRatingDistribution:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCategoryRevenue(req, res) {
    try {
      const { start, end } = this.getDates(req);
      const data = await statsAdminService.getCategoryRevenue(start, end);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error in StatsAdminController.getCategoryRevenue:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new StatsAdminController();

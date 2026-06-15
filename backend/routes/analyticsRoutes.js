const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Agent analytics
router.get('/agent/:agentId', analyticsController.getAgentAnalytics);
router.get('/leads/:agentId', analyticsController.getLeadAnalytics);
router.get('/properties/:agentId', analyticsController.getPropertyAnalytics);
router.get('/sales/:agentId', analyticsController.getSalesReports);
router.get('/export/:agentId', analyticsController.exportAnalytics);

module.exports = router;

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// Agent analytics
router.get('/agent/:agentId', authenticateToken, analyticsController.getAgentAnalytics);
router.get('/leads/:agentId', authenticateToken, analyticsController.getLeadAnalytics);
router.get('/properties/:agentId', authenticateToken, analyticsController.getPropertyAnalytics);
router.get('/sales/:agentId', authenticateToken, analyticsController.getSalesReports);
router.get('/export/:agentId', authenticateToken, analyticsController.exportAnalytics);

module.exports = router;

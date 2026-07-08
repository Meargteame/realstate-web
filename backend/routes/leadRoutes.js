const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken } = require('../middleware/auth');
const { leadLimiter } = require('../middleware/rateLimiter');

router.get('/export', authenticateToken, leadController.exportLeads);
router.post('/', leadLimiter, leadController.createLead);
router.get('/', authenticateToken, leadController.getAllLeads);
router.patch('/:id/status', authenticateToken, leadController.updateLeadStatus);
router.patch('/:id/favorite', authenticateToken, leadController.toggleFavorite);
router.patch('/:id', authenticateToken, leadController.updateLead);
router.delete('/:id', authenticateToken, leadController.deleteLead);

module.exports = router;

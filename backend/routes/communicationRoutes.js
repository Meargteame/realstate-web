const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { authenticateToken } = require('../middleware/auth');

// SMS routes
router.post('/sms', authenticateToken, communicationController.sendSMS);
router.get('/sms/history', authenticateToken, communicationController.getSMSHistory);
router.post('/sms/webhook', communicationController.handleSMSWebhook);

// Email routes
router.post('/email', authenticateToken, communicationController.sendEmail);
router.post('/email/template', authenticateToken, communicationController.sendTemplateEmail);
router.get('/email/history', authenticateToken, communicationController.getEmailHistory);

module.exports = router;

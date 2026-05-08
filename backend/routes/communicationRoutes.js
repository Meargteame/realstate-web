const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');

// SMS routes
router.post('/sms', communicationController.sendSMS);
router.get('/sms/history', communicationController.getSMSHistory);
router.post('/sms/webhook', communicationController.handleSMSWebhook);

// Email routes
router.post('/email', communicationController.sendEmail);
router.post('/email/template', communicationController.sendTemplateEmail);
router.get('/email/history', communicationController.getEmailHistory);

module.exports = router;

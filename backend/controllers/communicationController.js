const smsService = require('../services/smsService');
const emailIntegrationService = require('../services/emailIntegrationService');

// POST /api/communication/sms - Send SMS
exports.sendSMS = async (req, res) => {
  try {
    const { to, body, leadId, agentId } = req.body;

    if (!to || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, body' });
    }

    const smsMessage = await smsService.sendSMS({
      to,
      body,
      leadId,
      agentId
    });

    res.status(201).json(smsMessage);
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// GET /api/communication/sms/history - Get SMS history
exports.getSMSHistory = async (req, res) => {
  try {
    const { leadId, agentId } = req.query;

    const messages = await smsService.getSMSHistory({
      leadId,
      agentId
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching SMS history:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// POST /api/communication/sms/webhook - Twilio webhook for incoming SMS
exports.handleSMSWebhook = async (req, res) => {
  try {
    const smsMessage = await smsService.handleIncomingSMS(req.body);
    res.json({ success: true, message: smsMessage });
  } catch (error) {
    console.error('Error handling SMS webhook:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// POST /api/communication/email - Send email
exports.sendEmail = async (req, res) => {
  try {
    const { to, from, subject, body, attachments, leadId, agentId } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    const emailMessage = await emailIntegrationService.sendEmail({
      to,
      from,
      subject,
      body,
      attachments,
      leadId,
      agentId
    });

    res.status(201).json(emailMessage);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// POST /api/communication/email/template - Send template email
exports.sendTemplateEmail = async (req, res) => {
  try {
    const { templateType, variables, to, leadId, agentId } = req.body;

    if (!templateType || !variables || !to) {
      return res.status(400).json({ error: 'Missing required fields: templateType, variables, to' });
    }

    const emailMessage = await emailIntegrationService.sendTemplateEmail({
      templateType,
      variables,
      to,
      leadId,
      agentId
    });

    res.status(201).json(emailMessage);
  } catch (error) {
    console.error('Error sending template email:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// GET /api/communication/email/history - Get email history
exports.getEmailHistory = async (req, res) => {
  try {
    const { leadId, agentId } = req.query;

    const messages = await emailIntegrationService.getEmailHistory({
      leadId,
      agentId
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching email history:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

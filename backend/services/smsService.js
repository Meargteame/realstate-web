const prisma = require('../config/prisma');

// Twilio configuration (would be set in .env)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client (only if credentials are provided)
let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.warn('Twilio not configured. SMS features will be mocked.');
  }
}

/**
 * Send SMS message
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number
 * @param {string} options.body - Message body
 * @param {string} options.leadId - Optional lead ID
 * @param {string} options.agentId - Optional agent ID
 * @returns {Promise<Object>} SMS message record
 */
async function sendSMS({ to, body, leadId, agentId }) {
  try {
    let status = 'queued';
    let sid = null;

    // Send via Twilio if configured
    if (twilioClient && TWILIO_PHONE_NUMBER) {
      try {
        const message = await twilioClient.messages.create({
          body,
          from: TWILIO_PHONE_NUMBER,
          to
        });
        sid = message.sid;
        status = message.status;
      } catch (twilioError) {
        console.error('Twilio error:', twilioError);
        status = 'failed';
      }
    } else {
      // Mock mode - simulate successful send
      console.log(`📱 [MOCK SMS] To: ${to}, Body: ${body}`);
      status = 'sent';
      sid = `mock_${Date.now()}`;
    }

    // Save to database
    const smsMessage = await prisma.sMSMessage.create({
      data: {
        to,
        from: TWILIO_PHONE_NUMBER || 'mock-number',
        body,
        status,
        sid,
        leadId,
        agentId,
        direction: 'outbound'
      }
    });

    return smsMessage;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

/**
 * Handle incoming SMS (Twilio webhook)
 * @param {Object} webhookData - Twilio webhook data
 * @returns {Promise<Object>} SMS message record
 */
async function handleIncomingSMS(webhookData) {
  try {
    const { From, To, Body, MessageSid } = webhookData;

    // Save incoming SMS
    const smsMessage = await prisma.sMSMessage.create({
      data: {
        to: To,
        from: From,
        body: Body,
        status: 'received',
        sid: MessageSid,
        direction: 'inbound'
      }
    });

    // TODO: Match to lead/agent and create conversation message
    console.log('📱 Incoming SMS:', { from: From, body: Body });

    return smsMessage;
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
    throw error;
  }
}

/**
 * Get SMS history for a lead or agent
 * @param {Object} options - Query options
 * @param {string} options.leadId - Lead ID
 * @param {string} options.agentId - Agent ID
 * @returns {Promise<Array>} SMS messages
 */
async function getSMSHistory({ leadId, agentId }) {
  try {
    const where = {};
    if (leadId) where.leadId = leadId;
    if (agentId) where.agentId = agentId;

    const messages = await prisma.sMSMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return messages;
  } catch (error) {
    console.error('Error fetching SMS history:', error);
    throw error;
  }
}

/**
 * Update SMS status (for Twilio status callbacks)
 * @param {string} sid - Twilio message SID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated SMS message
 */
async function updateSMSStatus(sid, status) {
  try {
    const smsMessage = await prisma.sMSMessage.updateMany({
      where: { sid },
      data: { status, updatedAt: new Date() }
    });

    return smsMessage;
  } catch (error) {
    console.error('Error updating SMS status:', error);
    throw error;
  }
}

module.exports = {
  sendSMS,
  handleIncomingSMS,
  getSMSHistory,
  updateSMSStatus
};

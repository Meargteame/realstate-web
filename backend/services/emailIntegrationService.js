const prisma = require('../config/prisma');
const emailService = require('./emailService');

/**
 * Send email through platform
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.from - Sender email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - HTML body
 * @param {Array} options.attachments - File attachments
 * @param {string} options.leadId - Optional lead ID
 * @param {string} options.agentId - Optional agent ID
 * @returns {Promise<Object>} Email message record
 */
async function sendEmail({ to, from, subject, body, attachments, leadId, agentId }) {
  try {
    let status = 'queued';
    let messageId = null;

    // Send via email service
    try {
      const result = await emailService.sendEmail({
        to,
        from: from || process.env.EMAIL_FROM,
        subject,
        html: body,
        attachments
      });
      
      status = 'sent';
      messageId = result.messageId || `email_${Date.now()}`;
    } catch (emailError) {
      console.error('Email service error:', emailError);
      status = 'failed';
    }

    // Save to database
    const emailMessage = await prisma.emailMessage.create({
      data: {
        to,
        from: from || process.env.EMAIL_FROM || 'noreply@example.com',
        subject,
        body,
        status,
        messageId,
        leadId,
        agentId,
        attachments: attachments ? JSON.stringify(attachments) : null
      }
    });

    return emailMessage;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Get email history for a lead or agent
 * @param {Object} options - Query options
 * @param {string} options.leadId - Lead ID
 * @param {string} options.agentId - Agent ID
 * @returns {Promise<Array>} Email messages
 */
async function getEmailHistory({ leadId, agentId }) {
  try {
    const where = {};
    if (leadId) where.leadId = leadId;
    if (agentId) where.agentId = agentId;

    const messages = await prisma.emailMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return messages;
  } catch (error) {
    console.error('Error fetching email history:', error);
    throw error;
  }
}

/**
 * Update email status (for delivery tracking)
 * @param {string} messageId - Email message ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated email message
 */
async function updateEmailStatus(messageId, status) {
  try {
    const emailMessage = await prisma.emailMessage.updateMany({
      where: { messageId },
      data: { status, updatedAt: new Date() }
    });

    return emailMessage;
  } catch (error) {
    console.error('Error updating email status:', error);
    throw error;
  }
}

/**
 * Send email using template
 * @param {Object} options - Template email options
 * @param {string} options.templateType - Template type (welcome, listing_alert, etc.)
 * @param {Object} options.variables - Template variables
 * @param {string} options.to - Recipient email
 * @param {string} options.leadId - Optional lead ID
 * @param {string} options.agentId - Optional agent ID
 * @returns {Promise<Object>} Email message record
 */
async function sendTemplateEmail({ templateType, variables, to, leadId, agentId }) {
  try {
    // Get template
    const template = await prisma.emailTemplate.findFirst({
      where: { type: templateType, isActive: true }
    });

    if (!template) {
      throw new Error(`Template not found: ${templateType}`);
    }

    // Replace variables in subject and content
    let subject = template.subject;
    let body = template.content;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });

    // Send email
    return await sendEmail({
      to,
      subject,
      body,
      leadId,
      agentId
    });
  } catch (error) {
    console.error('Error sending template email:', error);
    throw error;
  }
}

module.exports = {
  sendEmail,
  getEmailHistory,
  updateEmailStatus,
  sendTemplateEmail
};

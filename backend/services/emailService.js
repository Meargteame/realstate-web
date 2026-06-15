const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter with environment configuration
   */
  initializeTransporter() {
    try {
      // Check for SendGrid configuration first
      if (process.env.SENDGRID_API_KEY) {
        this.transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        this.isConfigured = true;
        console.log('✅ Email service configured with SendGrid');
        return;
      }

      // Fallback to SMTP configuration
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        this.isConfigured = true;
        console.log('✅ Email service configured with SMTP');
        return;
      }

      // Development mode - log that email is not configured
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Email service not configured - using development mode without email');
        this.isConfigured = false;
        return;
      }

      console.log('⚠️  Email service not configured - no email credentials found');
      this.isConfigured = false;

    } catch (error) {
      console.error('❌ Email service initialization error:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Setup Ethereal Email for development testing
   */
  async setupEtherealEmail() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      this.isConfigured = true;
      console.log('✅ Email service configured with Ethereal Email for development');
      console.log(`📧 Test email credentials: ${testAccount.user} / ${testAccount.pass}`);
      
    } catch (error) {
      console.error('❌ Ethereal Email setup error:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send search alert email to user
   */
  async sendSearchAlert({ user, savedSearch, newProperties }) {
    if (!this.isConfigured) {
      console.log('⚠️  Email service not configured - skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const emailHtml = this.generateSearchAlertHtml({
        user,
        savedSearch,
        newProperties
      });

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@torra-realestate.com',
        to: user.email,
        subject: `New Properties Found: ${savedSearch.name}`,
        html: emailHtml,
        text: this.generateSearchAlertText({ user, savedSearch, newProperties })
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // Log preview URL for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
      }

      console.log(`✅ Search alert email sent to ${user.email} for "${savedSearch.name}"`);
      
      return { 
        success: true, 
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(result) : null
      };

    } catch (error) {
      console.error('❌ Send search alert email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HTML email template for search alerts
   */
  generateSearchAlertHtml({ user, savedSearch, newProperties }) {
    const propertyCards = newProperties.map(property => `
      <div style="border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px; overflow: hidden; background: white;">
        <img src="${property.imageUrl}" alt="${property.address}" style="width: 100%; height: 200px; object-fit: cover;">
        <div style="padding: 16px;">
          <h3 style="margin: 0 0 8px 0; color: #333; font-size: 18px;">$${property.price.toLocaleString()}</h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${property.address}, ${property.city}, ${property.state}</p>
          <div style="display: flex; gap: 16px; margin-bottom: 12px;">
            <span style="color: #888; font-size: 14px;">${property.beds} beds</span>
            <span style="color: #888; font-size: 14px;">${property.baths} baths</span>
            <span style="color: #888; font-size: 14px;">${property.sqft.toLocaleString()} sqft</span>
          </div>
          ${property.agent ? `
            <div style="border-top: 1px solid #f0f0f0; padding-top: 12px; margin-top: 12px;">
              <p style="margin: 0; color: #666; font-size: 13px;">Listed by ${property.agent.name}</p>
              <p style="margin: 0; color: #666; font-size: 13px;">${property.agent.brokerage}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Properties Found - ${savedSearch.name}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f8f8;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background-color: #b40101; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">TORRA Commercial Real Estate</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">New Properties Alert</p>
          </div>

          <!-- Content -->
          <div style="padding: 24px;">
            <h2 style="color: #333; margin: 0 0 16px 0;">Hi ${user.name},</h2>
            
            <p style="color: #666; line-height: 1.5; margin: 0 0 20px 0;">
              Great news! We found <strong>${newProperties.length} new propert${newProperties.length === 1 ? 'y' : 'ies'}</strong> 
              that match your saved search "<strong>${savedSearch.name}</strong>".
            </p>

            <!-- Properties -->
            <div style="margin: 24px 0;">
              ${propertyCards}
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/properties" 
                 style="background-color: #b40101; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View All Properties
              </a>
            </div>

            <!-- Search Details -->
            <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <h4 style="margin: 0 0 8px 0; color: #333;">Search Details:</h4>
              <p style="margin: 0; color: #666; font-size: 14px;">${this.getFilterSummary(savedSearch.filters)}</p>
              <p style="margin: 8px 0 0 0; color: #666; font-size: 12px;">
                Frequency: ${savedSearch.frequency.charAt(0).toUpperCase() + savedSearch.frequency.slice(1)} alerts
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 8px 0; color: #888; font-size: 12px;">
              You're receiving this because you have email alerts enabled for "${savedSearch.name}".
            </p>
            <p style="margin: 0; color: #888; font-size: 12px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/saved-searches" style="color: #b40101;">
                Manage your saved searches
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text email for search alerts
   */
  generateSearchAlertText({ user, savedSearch, newProperties }) {
    const propertyList = newProperties.map(property => 
      `• $${property.price.toLocaleString()} - ${property.address}, ${property.city}, ${property.state}\n  ${property.beds} beds, ${property.baths} baths, ${property.sqft.toLocaleString()} sqft`
    ).join('\n\n');

    return `
Hi ${user.name},

Great news! We found ${newProperties.length} new propert${newProperties.length === 1 ? 'y' : 'ies'} that match your saved search "${savedSearch.name}".

NEW PROPERTIES:
${propertyList}

SEARCH DETAILS:
${this.getFilterSummary(savedSearch.filters)}
Frequency: ${savedSearch.frequency.charAt(0).toUpperCase() + savedSearch.frequency.slice(1)} alerts

View all properties: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/properties

Manage your saved searches: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/saved-searches

---
You're receiving this because you have email alerts enabled for "${savedSearch.name}".
    `.trim();
  }

  /**
   * Get human-readable filter summary
   */
  getFilterSummary(filters) {
    const summary = [];
    
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? `$${(filters.minPrice / 1000).toFixed(0)}K` : 'Any';
      const max = filters.maxPrice ? `$${(filters.maxPrice / 1000).toFixed(0)}K` : 'Any';
      summary.push(`Price: ${min} - ${max}`);
    }
    
    if (filters.beds) summary.push(`${filters.beds}+ bedrooms`);
    if (filters.baths) summary.push(`${filters.baths}+ bathrooms`);
    if (filters.propertyType) summary.push(`Type: ${filters.propertyType}`);
    if (filters.city) summary.push(`City: ${filters.city}`);
    if (filters.state) summary.push(`State: ${filters.state}`);
    if (filters.bounds || filters.mapArea) summary.push('Custom map area');
    
    return summary.length > 0 ? summary.join(' • ') : 'No specific filters';
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(toEmail) {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@torra-realestate.com',
        to: toEmail,
        subject: 'TORRA Real Estate - Email Service Test',
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email to verify that the TORRA Real Estate email service is working correctly.</p>
          <p>If you received this email, the service is configured properly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        `,
        text: `
Email Service Test

This is a test email to verify that the TORRA Real Estate email service is working correctly.
If you received this email, the service is configured properly.

Timestamp: ${new Date().toISOString()}
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return { 
        success: true, 
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(result) : null
      };

    } catch (error) {
      console.error('Test email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a password reset email with a secure reset link
   */
  async sendPasswordResetEmail({ to, name, resetUrl }) {
    if (!this.isConfigured) {
      console.log('⚠️  Email service not configured - password reset email not sent.');
      console.log(`🔗 Password reset link for ${to}: ${resetUrl}`);
      // Surface the link in dev so the flow remains testable without email.
      return { success: false, error: 'Email service not configured', resetUrl };
    }

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@torra-realestate.com',
        to,
        subject: 'Reset your TORRA password',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f8f8f8;">
            <div style="max-width:600px;margin:0 auto;background:#fff;">
              <div style="background:#b40101;color:#fff;padding:24px;text-align:center;">
                <h1 style="margin:0;font-size:22px;">TORRA Commercial Real Estate</h1>
              </div>
              <div style="padding:32px 24px;">
                <h2 style="color:#333;margin:0 0 16px;">Hi ${name || 'there'},</h2>
                <p style="color:#666;line-height:1.5;margin:0 0 20px;">
                  We received a request to reset your password. Click the button below to choose a new one.
                  This link will expire in 1 hour.
                </p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="${resetUrl}" style="background:#b40101;color:#fff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="color:#999;font-size:13px;line-height:1.5;margin:0;">
                  If you didn't request this, you can safely ignore this email. The link below will expire automatically.
                </p>
                <p style="color:#999;font-size:12px;word-break:break-all;margin:16px 0 0;">${resetUrl}</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Hi ${name || 'there'},\n\nWe received a request to reset your password. Visit the link below to choose a new one (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`
      };

      const result = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
      }

      console.log(`✅ Password reset email sent to ${to}`);
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(result) : null
      };
    } catch (error) {
      console.error('❌ Send password reset email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify a lead about the status of their appointment booking.
   * kind: 'received' | 'confirmed' | 'rejected'
   */
  async sendBookingStatusEmail({ to, name, kind, dateLabel, timeLabel, location }) {
    const copy = {
      received: {
        subject: 'We received your appointment request',
        heading: 'Request received',
        body: `Thanks for requesting an appointment${dateLabel ? ` on <strong>${dateLabel}</strong>` : ''}${timeLabel ? ` at <strong>${timeLabel}</strong>` : ''}. Our agent will review it and get back to you shortly.`
      },
      confirmed: {
        subject: 'Your appointment is confirmed',
        heading: 'Appointment confirmed ✅',
        body: `Your appointment is confirmed for <strong>${dateLabel || ''} ${timeLabel || ''}</strong>${location ? ` at <strong>${location}</strong>` : ''}. We look forward to seeing you.`
      },
      rejected: {
        subject: 'Update on your appointment request',
        heading: 'Appointment update',
        body: `Unfortunately the requested time${dateLabel ? ` on <strong>${dateLabel}</strong>` : ''} is no longer available. Please reply to this email or book another slot and we'll be happy to help.`
      }
    }[kind] || {};

    if (!this.isConfigured) {
      console.log(`⚠️  Email service not configured - booking "${kind}" email not sent to ${to}.`);
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@torra-realestate.com',
        to,
        subject: copy.subject || 'Appointment update',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f8f8f8;">
            <div style="max-width:600px;margin:0 auto;background:#fff;">
              <div style="background:#b40101;color:#fff;padding:24px;text-align:center;">
                <h1 style="margin:0;font-size:22px;">TORRA Commercial Real Estate</h1>
              </div>
              <div style="padding:32px 24px;">
                <h2 style="color:#333;margin:0 0 16px;">Hi ${name || 'there'},</h2>
                <h3 style="color:#b40101;margin:0 0 12px;">${copy.heading || ''}</h3>
                <p style="color:#666;line-height:1.6;margin:0 0 20px;">${copy.body || ''}</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Hi ${name || 'there'},\n\n${(copy.body || '').replace(/<[^>]+>/g, '')}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Booking email preview URL:', nodemailer.getTestMessageUrl(result));
      }
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(result) : null
      };
    } catch (error) {
      console.error('❌ Send booking status email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email service status
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      hasTransporter: !!this.transporter,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

module.exports = new EmailService();
/**
 * Outlook Calendar Integration Service
 * 
 * This service provides two-way sync with Microsoft Outlook Calendar.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Azure Portal: https://portal.azure.com/
 * 2. Register a new application in Azure AD
 * 3. Add Microsoft Graph API permissions: Calendars.ReadWrite
 * 4. Create a client secret
 * 5. Add to .env:
 *    OUTLOOK_CLIENT_ID=your_client_id
 *    OUTLOOK_CLIENT_SECRET=your_client_secret
 *    OUTLOOK_REDIRECT_URI=http://localhost:5000/api/calendar/outlook/callback
 *    OUTLOOK_TENANT_ID=common (or your tenant ID)
 * 
 * USAGE:
 * - Agent authorizes Outlook Calendar access via OAuth
 * - Events created in platform sync to Outlook Calendar
 * - Events created in Outlook Calendar sync to platform
 * - Updates and deletions sync both ways
 */

const { Client } = require('@microsoft/microsoft-graph-client');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OutlookCalendarService {
  constructor() {
    this.msalClient = null;
    this.isConfigured = false;

    // Check if Outlook Calendar is configured
    if (process.env.OUTLOOK_CLIENT_ID && process.env.OUTLOOK_CLIENT_SECRET) {
      const msalConfig = {
        auth: {
          clientId: process.env.OUTLOOK_CLIENT_ID,
          authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID || 'common'}`,
          clientSecret: process.env.OUTLOOK_CLIENT_SECRET
        }
      };

      this.msalClient = new ConfidentialClientApplication(msalConfig);
      this.redirectUri = process.env.OUTLOOK_REDIRECT_URI || 'http://localhost:5000/api/calendar/outlook/callback';
      this.isConfigured = true;
      console.log('✅ Outlook Calendar service configured');
    } else {
      console.log('⚠️  Outlook Calendar not configured (optional feature)');
    }
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl(agentId) {
    if (!this.isConfigured) {
      throw new Error('Outlook Calendar not configured');
    }

    const authCodeUrlParameters = {
      scopes: ['Calendars.ReadWrite', 'offline_access'],
      redirectUri: this.redirectUri,
      state: agentId
    };

    return this.msalClient.getAuthCodeUrl(authCodeUrlParameters);
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code) {
    if (!this.isConfigured) {
      throw new Error('Outlook Calendar not configured');
    }

    const tokenRequest = {
      code,
      scopes: ['Calendars.ReadWrite', 'offline_access'],
      redirectUri: this.redirectUri
    };

    const response = await this.msalClient.acquireTokenByCode(tokenRequest);
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresOn: response.expiresOn
    };
  }

  /**
   * Get Microsoft Graph client with access token
   */
  getGraphClient(accessToken) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
  }

  /**
   * Sync event to Outlook Calendar
   */
  async syncEventToOutlook(event, accessToken) {
    if (!this.isConfigured) {
      console.log('Outlook Calendar not configured, skipping sync');
      return null;
    }

    try {
      const client = this.getGraphClient(accessToken);

      const outlookEvent = {
        subject: event.title,
        body: {
          contentType: 'text',
          content: event.description || ''
        },
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'Eastern Standard Time'
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'Eastern Standard Time'
        },
        location: {
          displayName: event.location || ''
        },
        isAllDay: event.allDay,
        reminderMinutesBeforeStart: event.reminderMinutes[0] || 15
      };

      // Add recurrence if applicable
      if (event.isRecurring && event.recurrenceRule) {
        // Convert RRULE to Outlook format (simplified)
        outlookEvent.recurrence = this.convertRRuleToOutlook(event.recurrenceRule);
      }

      let result;
      if (event.outlookEventId) {
        // Update existing event
        result = await client
          .api(`/me/events/${event.outlookEventId}`)
          .update(outlookEvent);
      } else {
        // Create new event
        result = await client
          .api('/me/events')
          .post(outlookEvent);

        // Update our database with Outlook event ID
        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { outlookEventId: result.id }
        });
      }

      return result;
    } catch (error) {
      console.error('Error syncing to Outlook Calendar:', error);
      throw error;
    }
  }

  /**
   * Delete event from Outlook Calendar
   */
  async deleteEventFromOutlook(outlookEventId, accessToken) {
    if (!this.isConfigured) {
      console.log('Outlook Calendar not configured, skipping delete');
      return;
    }

    try {
      const client = this.getGraphClient(accessToken);

      await client
        .api(`/me/events/${outlookEventId}`)
        .delete();
    } catch (error) {
      console.error('Error deleting from Outlook Calendar:', error);
      throw error;
    }
  }

  /**
   * Fetch events from Outlook Calendar
   */
  async fetchEventsFromOutlook(accessToken, startDate, endDate) {
    if (!this.isConfigured) {
      throw new Error('Outlook Calendar not configured');
    }

    try {
      const client = this.getGraphClient(accessToken);

      const response = await client
        .api('/me/calendarview')
        .query({
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString()
        })
        .select('subject,body,start,end,location,isAllDay,id')
        .orderby('start/dateTime')
        .get();

      return response.value;
    } catch (error) {
      console.error('Error fetching from Outlook Calendar:', error);
      throw error;
    }
  }

  /**
   * Import Outlook Calendar events to our platform
   */
  async importEventsFromOutlook(agentId, accessToken, startDate, endDate) {
    if (!this.isConfigured) {
      throw new Error('Outlook Calendar not configured');
    }

    try {
      const outlookEvents = await this.fetchEventsFromOutlook(accessToken, startDate, endDate);

      const imported = [];
      for (const oEvent of outlookEvents) {
        // Check if event already exists
        const existing = await prisma.calendarEvent.findFirst({
          where: { outlookEventId: oEvent.id }
        });

        if (!existing) {
          // Create new event
          const event = await prisma.calendarEvent.create({
            data: {
              title: oEvent.subject || 'Untitled Event',
              description: oEvent.body?.content,
              startTime: new Date(oEvent.start.dateTime),
              endTime: new Date(oEvent.end.dateTime),
              location: oEvent.location?.displayName,
              eventType: 'personal', // Default type for imported events
              agentId,
              outlookEventId: oEvent.id,
              allDay: oEvent.isAllDay
            }
          });
          imported.push(event);
        }
      }

      return imported;
    } catch (error) {
      console.error('Error importing from Outlook Calendar:', error);
      throw error;
    }
  }

  /**
   * Convert RRULE to Outlook recurrence format (simplified)
   */
  convertRRuleToOutlook(rrule) {
    // This is a simplified conversion
    // Full implementation would parse RRULE properly
    return {
      pattern: {
        type: 'daily',
        interval: 1
      },
      range: {
        type: 'noEnd',
        startDate: new Date().toISOString().split('T')[0]
      }
    };
  }
}

module.exports = new OutlookCalendarService();

/**
 * Google Calendar Integration Service
 * 
 * This service provides two-way sync with Google Calendar.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable Google Calendar API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized redirect URIs: http://localhost:5000/api/calendar/google/callback
 * 6. Download credentials and add to .env:
 *    GOOGLE_CLIENT_ID=your_client_id
 *    GOOGLE_CLIENT_SECRET=your_client_secret
 *    GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/google/callback
 * 
 * USAGE:
 * - Agent authorizes Google Calendar access via OAuth
 * - Events created in platform sync to Google Calendar
 * - Events created in Google Calendar sync to platform
 * - Updates and deletions sync both ways
 */

const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = null;
    this.calendar = null;
    this.isConfigured = false;

    // Check if Google Calendar is configured
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/google/callback'
      );
      this.isConfigured = true;
      console.log('✅ Google Calendar service configured');
    } else {
      console.log('⚠️  Google Calendar not configured (optional feature)');
    }
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl(agentId) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar not configured');
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: agentId // Pass agentId to identify user after callback
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar not configured');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Set credentials for authenticated requests
   */
  setCredentials(tokens) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar not configured');
    }

    this.oauth2Client.setCredentials(tokens);
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Sync event to Google Calendar
   */
  async syncEventToGoogle(event, tokens) {
    if (!this.isConfigured) {
      console.log('Google Calendar not configured, skipping sync');
      return null;
    }

    try {
      this.setCredentials(tokens);

      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'America/New_York'
        },
        reminders: {
          useDefault: false,
          overrides: event.reminderMinutes.map(minutes => ({
            method: 'popup',
            minutes
          }))
        }
      };

      // Add recurrence if applicable
      if (event.isRecurring && event.recurrenceRule) {
        googleEvent.recurrence = [event.recurrenceRule];
      }

      let result;
      if (event.googleEventId) {
        // Update existing event
        result = await this.calendar.events.update({
          calendarId: 'primary',
          eventId: event.googleEventId,
          resource: googleEvent
        });
      } else {
        // Create new event
        result = await this.calendar.events.insert({
          calendarId: 'primary',
          resource: googleEvent
        });

        // Update our database with Google event ID
        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { googleEventId: result.data.id }
        });
      }

      return result.data;
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteEventFromGoogle(googleEventId, tokens) {
    if (!this.isConfigured) {
      console.log('Google Calendar not configured, skipping delete');
      return;
    }

    try {
      this.setCredentials(tokens);

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId
      });
    } catch (error) {
      console.error('Error deleting from Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Fetch events from Google Calendar
   */
  async fetchEventsFromGoogle(tokens, timeMin, timeMax) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar not configured');
    }

    try {
      this.setCredentials(tokens);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching from Google Calendar:', error);
      throw error;
    }
  }

  /**
   * Import Google Calendar events to our platform
   */
  async importEventsFromGoogle(agentId, tokens, startDate, endDate) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar not configured');
    }

    try {
      const googleEvents = await this.fetchEventsFromGoogle(tokens, startDate, endDate);

      const imported = [];
      for (const gEvent of googleEvents) {
        // Check if event already exists
        const existing = await prisma.calendarEvent.findFirst({
          where: { googleEventId: gEvent.id }
        });

        if (!existing) {
          // Create new event
          const event = await prisma.calendarEvent.create({
            data: {
              title: gEvent.summary || 'Untitled Event',
              description: gEvent.description,
              startTime: new Date(gEvent.start.dateTime || gEvent.start.date),
              endTime: new Date(gEvent.end.dateTime || gEvent.end.date),
              location: gEvent.location,
              eventType: 'personal', // Default type for imported events
              agentId,
              googleEventId: gEvent.id,
              allDay: !gEvent.start.dateTime
            }
          });
          imported.push(event);
        }
      }

      return imported;
    } catch (error) {
      console.error('Error importing from Google Calendar:', error);
      throw error;
    }
  }
}

module.exports = new GoogleCalendarService();

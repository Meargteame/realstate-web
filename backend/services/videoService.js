/**
 * Video Chat Service
 * 
 * Provides WebRTC video chat functionality with optional Twilio Video integration.
 * Works in mock mode without Twilio credentials for development.
 * 
 * SETUP INSTRUCTIONS (Optional - works without):
 * 1. Sign up for Twilio: https://www.twilio.com/video
 * 2. Get Account SID and Auth Token
 * 3. Add to .env:
 *    TWILIO_ACCOUNT_SID=your_account_sid
 *    TWILIO_AUTH_TOKEN=your_auth_token
 *    TWILIO_API_KEY_SID=your_api_key_sid
 *    TWILIO_API_KEY_SECRET=your_api_key_secret
 * 
 * MOCK MODE:
 * - Works without Twilio credentials
 * - Uses Socket.IO for signaling
 * - Peer-to-peer WebRTC connections
 * - No recording capability in mock mode
 * 
 * FEATURES:
 * - One-on-one video calls
 * - Screen sharing
 * - Chat during call
 * - Call recording (Twilio only)
 * - Room management
 */

const prisma = require('../config/prisma');

class VideoService {
  constructor() {
    this.twilioClient = null;
    this.isConfigured = false;
    this.mockMode = true;

    // Check if Twilio Video is configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.isConfigured = true;
        this.mockMode = false;
        console.log('✅ Twilio Video service configured');
      } catch (error) {
        console.log('⚠️  Twilio Video not available, using mock mode');
      }
    } else {
      console.log('⚠️  Twilio Video not configured, using mock mode (peer-to-peer WebRTC)');
    }
  }

  /**
   * Create a video room
   */
  async createRoom(roomName, options = {}) {
    if (!this.mockMode && this.isConfigured) {
      try {
        const room = await this.twilioClient.video.rooms.create({
          uniqueName: roomName,
          type: options.type || 'peer-to-peer', // peer-to-peer, group, group-small
          recordParticipantsOnConnect: options.record || false,
          maxParticipants: options.maxParticipants || 2
        });

        return {
          roomSid: room.sid,
          roomName: room.uniqueName,
          status: room.status,
          type: room.type,
          provider: 'twilio'
        };
      } catch (error) {
        console.error('Error creating Twilio room:', error);
        throw error;
      }
    } else {
      // Mock mode - return mock room data
      return {
        roomSid: `mock_${Date.now()}`,
        roomName,
        status: 'in-progress',
        type: 'peer-to-peer',
        provider: 'mock'
      };
    }
  }

  /**
   * Generate access token for a participant
   */
  async generateAccessToken(identity, roomName) {
    if (!this.mockMode && this.isConfigured) {
      try {
        const AccessToken = require('twilio').jwt.AccessToken;
        const VideoGrant = AccessToken.VideoGrant;

        const token = new AccessToken(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_API_KEY_SID,
          process.env.TWILIO_API_KEY_SECRET,
          { identity }
        );

        const videoGrant = new VideoGrant({
          room: roomName
        });

        token.addGrant(videoGrant);

        return {
          token: token.toJwt(),
          identity,
          roomName,
          provider: 'twilio'
        };
      } catch (error) {
        console.error('Error generating Twilio token:', error);
        throw error;
      }
    } else {
      // Mock mode - return mock token
      return {
        token: `mock_token_${Date.now()}`,
        identity,
        roomName,
        provider: 'mock'
      };
    }
  }

  /**
   * Get room details
   */
  async getRoomDetails(roomSid) {
    if (!this.mockMode && this.isConfigured) {
      try {
        const room = await this.twilioClient.video.rooms(roomSid).fetch();
        
        return {
          roomSid: room.sid,
          roomName: room.uniqueName,
          status: room.status,
          type: room.type,
          duration: room.duration,
          participants: room.participants || [],
          provider: 'twilio'
        };
      } catch (error) {
        console.error('Error fetching room details:', error);
        throw error;
      }
    } else {
      // Mock mode
      return {
        roomSid,
        roomName: 'mock-room',
        status: 'in-progress',
        type: 'peer-to-peer',
        duration: 0,
        participants: [],
        provider: 'mock'
      };
    }
  }

  /**
   * End a video room
   */
  async endRoom(roomSid) {
    if (!this.mockMode && this.isConfigured) {
      try {
        const room = await this.twilioClient.video.rooms(roomSid).update({
          status: 'completed'
        });

        return {
          roomSid: room.sid,
          status: room.status,
          provider: 'twilio'
        };
      } catch (error) {
        console.error('Error ending room:', error);
        throw error;
      }
    } else {
      // Mock mode
      return {
        roomSid,
        status: 'completed',
        provider: 'mock'
      };
    }
  }

  /**
   * Get room recordings (Twilio only)
   */
  async getRoomRecordings(roomSid) {
    if (!this.mockMode && this.isConfigured) {
      try {
        const recordings = await this.twilioClient.video
          .rooms(roomSid)
          .recordings
          .list();

        return recordings.map(recording => ({
          sid: recording.sid,
          status: recording.status,
          duration: recording.duration,
          size: recording.size,
          url: recording.url,
          provider: 'twilio'
        }));
      } catch (error) {
        console.error('Error fetching recordings:', error);
        throw error;
      }
    } else {
      // Mock mode - no recordings
      return [];
    }
  }

  /**
   * Create a video call session
   */
  async createVideoCall(data) {
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create room with provider (Twilio or mock)
      const room = await this.createRoom(roomId, {
        type: 'peer-to-peer',
        maxParticipants: 10
      });

      // Store video call in database
      const videoCall = await prisma.videoCall.create({
        data: {
          roomId,
          agentId: data.agentId,
          leadId: data.leadId,
          leadName: data.leadName,
          leadEmail: data.leadEmail,
          propertyId: data.propertyId,
          status: 'scheduled'
        }
      });

      return {
        id: videoCall.id,
        roomId: videoCall.roomId,
        status: videoCall.status,
        provider: room.provider
      };
    } catch (error) {
      console.error('Error creating video call:', error);
      throw error;
    }
  }

  /**
   * Join a video call
   */
  async joinVideoCall(videoCallId, participantName, participantEmail, role = 'viewer') {
    try {
      const videoCall = await prisma.videoCall.findUnique({
        where: { id: videoCallId }
      });

      if (!videoCall) {
        throw new Error('Video call not found');
      }

      // Generate access token
      const token = await this.generateAccessToken(participantName, videoCall.roomId);

      // Record participant
      await prisma.videoCallParticipant.create({
        data: {
          videoCallId,
          participantName,
          participantEmail,
          role
        }
      });

      // Update video call status to active if it was scheduled
      if (videoCall.status === 'scheduled') {
        await prisma.videoCall.update({
          where: { id: videoCallId },
          data: {
            status: 'active',
            startTime: new Date()
          }
        });
      }

      return {
        videoCallId: videoCall.id,
        roomId: videoCall.roomId,
        token: token.token,
        provider: token.provider
      };
    } catch (error) {
      console.error('Error joining video call:', error);
      throw error;
    }
  }

  /**
   * End a video call
   */
  async endVideoCall(videoCallId) {
    try {
      const videoCall = await prisma.videoCall.findUnique({
        where: { id: videoCallId }
      });

      if (!videoCall) {
        throw new Error('Video call not found');
      }

      // End the room if using Twilio
      if (!this.mockMode) {
        await this.endRoom(videoCall.roomId);
      }

      // Calculate duration
      const endTime = new Date();
      const duration = videoCall.startTime 
        ? Math.floor((endTime - videoCall.startTime) / 1000)
        : 0;

      // Update video call
      const updated = await prisma.videoCall.update({
        where: { id: videoCallId },
        data: {
          status: 'completed',
          endTime,
          duration
        }
      });

      // Update all participants who haven't left
      await prisma.videoCallParticipant.updateMany({
        where: {
          videoCallId,
          leftAt: null
        },
        data: {
          leftAt: endTime
        }
      });

      return {
        id: updated.id,
        status: updated.status,
        duration: updated.duration
      };
    } catch (error) {
      console.error('Error ending video call:', error);
      throw error;
    }
  }

  /**
   * Create a virtual tour session
   */
  async createVirtualTour(videoCallId, propertyId, agentId) {
    try {
      const session = await prisma.virtualTourSession.create({
        data: {
          videoCallId,
          propertyId,
          agentId,
          chatEnabled: true,
          screenSharing: false,
          recordingEnabled: false
        }
      });

      return {
        id: session.id,
        videoCallId: session.videoCallId,
        propertyId: session.propertyId,
        chatEnabled: session.chatEnabled
      };
    } catch (error) {
      console.error('Error creating virtual tour session:', error);
      throw error;
    }
  }

  /**
   * Update virtual tour session
   */
  async updateVirtualTour(sessionId, updates) {
    try {
      const session = await prisma.virtualTourSession.update({
        where: { id: sessionId },
        data: updates
      });

      return session;
    } catch (error) {
      console.error('Error updating virtual tour:', error);
      throw error;
    }
  }

  /**
   * End virtual tour session
   */
  async endVirtualTour(sessionId) {
    try {
      const session = await prisma.virtualTourSession.update({
        where: { id: sessionId },
        data: {
          endedAt: new Date()
        }
      });

      return session;
    } catch (error) {
      console.error('Error ending virtual tour:', error);
      throw error;
    }
  }
}

module.exports = new VideoService();

const { PrismaClient } = require('@prisma/client');
const videoService = require('../services/videoService');
const prisma = new PrismaClient();

// Helper to serialize BigInt
const serializeBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

// =====================================================
// VIDEO CALLS
// =====================================================

// Create a video call
exports.createVideoCall = async (req, res) => {
  try {
    const { agentId, leadId, leadName, leadEmail, propertyId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }

    const videoCall = await videoService.createVideoCall({
      agentId,
      leadId,
      leadName,
      leadEmail,
      propertyId
    });

    res.status(201).json(videoCall);
  } catch (error) {
    console.error('Error creating video call:', error);
    res.status(500).json({ error: 'Failed to create video call' });
  }
};

// Join a video call
exports.joinVideoCall = async (req, res) => {
  try {
    const { videoCallId } = req.params;
    const { participantName, participantEmail, role } = req.body;

    if (!participantName) {
      return res.status(400).json({ error: 'Participant name is required' });
    }

    const joinData = await videoService.joinVideoCall(
      videoCallId,
      participantName,
      participantEmail,
      role
    );

    res.json(joinData);
  } catch (error) {
    console.error('Error joining video call:', error);
    res.status(500).json({ error: 'Failed to join video call' });
  }
};

// Get video call details
exports.getVideoCall = async (req, res) => {
  try {
    const { videoCallId } = req.params;

    const videoCall = await prisma.videoCall.findUnique({
      where: { id: videoCallId },
      include: {
        participants: true,
        tourSessions: true
      }
    });

    if (!videoCall) {
      return res.status(404).json({ error: 'Video call not found' });
    }

    res.json(serializeBigInt(videoCall));
  } catch (error) {
    console.error('Error fetching video call:', error);
    res.status(500).json({ error: 'Failed to fetch video call' });
  }
};

// Get agent's video calls
exports.getAgentVideoCalls = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.query;

    const where = { agentId };
    if (status) {
      where.status = status;
    }

    const videoCalls = await prisma.videoCall.findMany({
      where,
      include: {
        participants: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(serializeBigInt(videoCalls));
  } catch (error) {
    console.error('Error fetching video calls:', error);
    res.status(500).json({ error: 'Failed to fetch video calls' });
  }
};

// End a video call
exports.endVideoCall = async (req, res) => {
  try {
    const { videoCallId } = req.params;

    const result = await videoService.endVideoCall(videoCallId);

    res.json(result);
  } catch (error) {
    console.error('Error ending video call:', error);
    res.status(500).json({ error: 'Failed to end video call' });
  }
};

// =====================================================
// VIRTUAL TOURS
// =====================================================

// Create a virtual tour session
exports.createVirtualTour = async (req, res) => {
  try {
    const { videoCallId, propertyId, agentId } = req.body;

    if (!videoCallId || !propertyId || !agentId) {
      return res.status(400).json({ 
        error: 'Video call ID, property ID, and agent ID are required' 
      });
    }

    const session = await videoService.createVirtualTour(videoCallId, propertyId, agentId);

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating virtual tour:', error);
    res.status(500).json({ error: 'Failed to create virtual tour' });
  }
};

// Get virtual tour sessions for an agent
exports.getAgentVirtualTours = async (req, res) => {
  try {
    const { agentId } = req.params;

    const sessions = await prisma.virtualTourSession.findMany({
      where: { agentId },
      include: {
        videoCall: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(serializeBigInt(sessions));
  } catch (error) {
    console.error('Error fetching virtual tours:', error);
    res.status(500).json({ error: 'Failed to fetch virtual tours' });
  }
};

// Get virtual tour session details
exports.getVirtualTourDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.virtualTourSession.findUnique({
      where: { id: sessionId },
      include: {
        videoCall: {
          include: {
            participants: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Virtual tour session not found' });
    }

    res.json(serializeBigInt(session));
  } catch (error) {
    console.error('Error fetching virtual tour details:', error);
    res.status(500).json({ error: 'Failed to fetch virtual tour details' });
  }
};

// Update virtual tour session
exports.updateVirtualTour = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;

    const session = await videoService.updateVirtualTour(sessionId, updates);

    res.json(serializeBigInt(session));
  } catch (error) {
    console.error('Error updating virtual tour:', error);
    res.status(500).json({ error: 'Failed to update virtual tour' });
  }
};

// End a virtual tour
exports.endVirtualTour = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await videoService.endVirtualTour(sessionId);

    res.json(serializeBigInt(result));
  } catch (error) {
    console.error('Error ending virtual tour:', error);
    res.status(500).json({ error: 'Failed to end virtual tour' });
  }
};

// =====================================================
// VIDEO CALL STATISTICS
// =====================================================

// Get video call statistics
exports.getVideoCallStats = async (req, res) => {
  try {
    const { agentId } = req.params;

    const where = agentId ? { agentId } : {};

    // Get total calls
    const totalCalls = await prisma.videoCall.count({ where });

    // Get completed calls
    const completedCalls = await prisma.videoCall.count({
      where: { ...where, status: 'completed' }
    });

    // Get total duration
    const calls = await prisma.videoCall.findMany({
      where: { ...where, status: 'completed' },
      select: { duration: true }
    });

    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgDuration = completedCalls > 0 ? Math.round(totalDuration / completedCalls) : 0;

    // Get virtual tour stats
    const totalTours = await prisma.virtualTourSession.count({ where });

    const completedTours = await prisma.virtualTourSession.count({
      where: { ...where, endedAt: { not: null } }
    });

    res.json({
      totalCalls,
      completedCalls,
      totalDuration,
      avgDuration,
      totalTours,
      completedTours,
      successRate: totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching video call stats:', error);
    res.status(500).json({ error: 'Failed to fetch video call stats' });
  }
};

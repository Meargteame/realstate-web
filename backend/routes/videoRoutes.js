const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authenticateToken } = require('../middleware/auth');

// =====================================================
// VIDEO CALLS
// =====================================================

// Create a video call
router.post('/calls', authenticateToken, videoController.createVideoCall);

// Join a video call
router.post('/calls/:videoCallId/join', videoController.joinVideoCall);

// Get video call details
router.get('/calls/:videoCallId', authenticateToken, videoController.getVideoCall);

// Get agent's video calls
router.get('/calls/agent/:agentId', authenticateToken, videoController.getAgentVideoCalls);

// End a video call
router.post('/calls/:videoCallId/end', authenticateToken, videoController.endVideoCall);

// =====================================================
// VIRTUAL TOURS
// =====================================================

// Create virtual tour session
router.post('/tours', authenticateToken, videoController.createVirtualTour);

// Get agent's virtual tours
router.get('/tours/agent/:agentId', authenticateToken, videoController.getAgentVirtualTours);

// Get virtual tour details
router.get('/tours/:sessionId', authenticateToken, videoController.getVirtualTourDetails);

// Update virtual tour
router.put('/tours/:sessionId', authenticateToken, videoController.updateVirtualTour);

// End virtual tour
router.post('/tours/:sessionId/end', authenticateToken, videoController.endVirtualTour);

// =====================================================
// STATISTICS
// =====================================================

// Get video call statistics (with optional agentId)
router.get('/stats', authenticateToken, videoController.getVideoCallStats);
router.get('/stats/:agentId', authenticateToken, videoController.getVideoCallStats);

module.exports = router;

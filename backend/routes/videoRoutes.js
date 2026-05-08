const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authenticate } = require('../middleware/auth');

// =====================================================
// VIDEO CALLS
// =====================================================

// Create a video call
router.post('/calls', authenticate, videoController.createVideoCall);

// Join a video call
router.post('/calls/:videoCallId/join', videoController.joinVideoCall);

// Get video call details
router.get('/calls/:videoCallId', authenticate, videoController.getVideoCall);

// Get agent's video calls
router.get('/calls/agent/:agentId', authenticate, videoController.getAgentVideoCalls);

// End a video call
router.post('/calls/:videoCallId/end', authenticate, videoController.endVideoCall);

// =====================================================
// VIRTUAL TOURS
// =====================================================

// Create virtual tour session
router.post('/tours', authenticate, videoController.createVirtualTour);

// Get agent's virtual tours
router.get('/tours/agent/:agentId', authenticate, videoController.getAgentVirtualTours);

// Get virtual tour details
router.get('/tours/:sessionId', authenticate, videoController.getVirtualTourDetails);

// Update virtual tour
router.put('/tours/:sessionId', authenticate, videoController.updateVirtualTour);

// End virtual tour
router.post('/tours/:sessionId/end', authenticate, videoController.endVirtualTour);

// =====================================================
// STATISTICS
// =====================================================

// Get video call statistics
router.get('/stats/:agentId?', authenticate, videoController.getVideoCallStats);

module.exports = router;

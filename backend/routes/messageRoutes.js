const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Get all conversations for an agent
router.get('/conversations/:agentId', authenticateToken, messageController.getConversations);

// Get messages in a conversation (used by leads AND agents)
router.get('/conversation/:conversationId', optionalAuth, messageController.getMessages);

// Send a message (used by leads AND agents)
router.post('/send', optionalAuth, messageController.sendMessage);

// Mark conversation as read
router.patch('/conversation/:conversationId/read', authenticateToken, messageController.markAsRead);

module.exports = router;

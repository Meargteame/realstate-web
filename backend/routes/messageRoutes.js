const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// Get all conversations for an agent
router.get('/conversations/:agentId', authenticateToken, messageController.getConversations);

// Get messages in a conversation
router.get('/conversation/:conversationId', authenticateToken, messageController.getMessages);

// Send a message
router.post('/send', authenticateToken, messageController.sendMessage);

// Mark conversation as read
router.patch('/conversation/:conversationId/read', authenticateToken, messageController.markAsRead);

module.exports = router;

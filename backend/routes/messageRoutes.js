const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get all conversations for an agent
router.get('/conversations/:agentId', messageController.getConversations);

// Get messages in a conversation
router.get('/conversation/:conversationId', messageController.getMessages);

// Send a message
router.post('/send', messageController.sendMessage);

// Mark conversation as read
router.patch('/conversation/:conversationId/read', messageController.markAsRead);

module.exports = router;

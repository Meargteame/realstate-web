const prisma = require('../config/prisma');

// GET /api/messages/conversations/:agentId - Get all conversations for an agent
exports.getConversations = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const conversations = await prisma.conversation.findMany({
      where: { agentId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });
    
    // Get lead details for each conversation
    const conversationsWithLeads = await Promise.all(
      conversations.map(async (conv) => {
        const lead = await prisma.lead.findUnique({
          where: { id: conv.leadId },
          include: { property: true }
        });
        
        return {
          ...conv,
          lead
        };
      })
    );
    
    // Convert BigInt to Number
    const data = JSON.parse(JSON.stringify(conversationsWithLeads, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/messages/conversation/:conversationId - Get messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/messages/send - Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, leadId, agentId, senderId, senderType, content } = req.body;
    
    if (!content || !senderId || !senderType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let conversation;
    
    // If conversationId provided, use it
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });
    } 
    // Otherwise create or find conversation by leadId
    else if (leadId && agentId) {
      conversation = await prisma.conversation.upsert({
        where: { leadId },
        update: {},
        create: {
          leadId,
          agentId
        }
      });
    } else {
      return res.status(400).json({ error: 'Must provide conversationId or both leadId and agentId' });
    }
    
    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        senderType,
        content
      }
    });
    
    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
        unreadCount: senderType === 'lead' ? { increment: 1 } : undefined
      }
    });
    
    // Return message with conversationId for client to store
    res.json({
      ...message,
      conversationId: conversation.id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/messages/conversation/:conversationId/read - Mark conversation as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Mark all messages as read
    await prisma.message.updateMany({
      where: { 
        conversationId,
        isRead: false
      },
      data: { isRead: true }
    });
    
    // Reset unread count
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 }
    });
    
    res.json(conversation);
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: error.message });
  }
};

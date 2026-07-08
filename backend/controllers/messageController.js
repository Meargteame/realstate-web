const prisma = require('../config/prisma');

// GET /api/messages/conversations/:agentId - Get all conversations for an agent
exports.getConversations = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Ownership check
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { agentId: true, role: true } });
    if (agentId !== user.agentId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view these conversations' });
    }
    
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
    
    // Batch-fetch all leads in ONE query instead of one per conversation (N+1).
    const leadIds = [...new Set(conversations.map(c => c.leadId).filter(Boolean))];
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      include: { property: true }
    });
    const leadById = new Map(leads.map(l => [l.id, l]));

    const conversationsWithLeads = conversations.map(conv => ({
      ...conv,
      lead: leadById.get(conv.leadId) || null
    }));
    
    // Convert BigInt to Number
    const data = JSON.parse(JSON.stringify(conversationsWithLeads, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// GET /api/messages/conversation/:conversationId - Get messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Opt-in pagination: ?before=<ISO> and ?limit fetch the most recent page and
    // older history on scroll-up. Without params, returns the full thread (legacy).
    const rawLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : undefined;
    const before = req.query.before ? new Date(req.query.before) : undefined;

    if (limit) {
      const where = { conversationId, ...(before ? { createdAt: { lt: before } } : {}) };
      // Pull newest-first for the page, then return ascending for display.
      const page = await prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      return res.json(page.reverse());
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to process request' });
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
    res.status(500).json({ error: 'Failed to process request' });
  }
};

// PATCH /api/messages/conversation/:conversationId/read - Mark conversation as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Mark all messages as read and stamp when (powers read receipts)
    await prisma.message.updateMany({
      where: {
        conversationId,
        isRead: false
      },
      data: { isRead: true, readAt: new Date() }
    });
    
    // Reset unread count
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 }
    });
    
    res.json(conversation);
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

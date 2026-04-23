const prisma = require('../config/prisma');

// PATCH /api/leads/:id — update lead status (New → Contacted → Closed)
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, message, agentId, propertyId } = req.body;
    
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, phone, message' });
    }

    // If no agentId provided, find the first available agent to route the lead to
    let resolvedAgentId = agentId;
    if (!resolvedAgentId) {
      const firstAgent = await prisma.agent.findFirst();
      if (!firstAgent) return res.status(400).json({ error: 'No agents available to route this lead' });
      resolvedAgentId = firstAgent.id;
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        message,
        agentId: resolvedAgentId,
        propertyId: propertyId || null
      }
    });
    
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeadsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where: { agentId },
        include: { property: true },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.lead.count({ where: { agentId } })
    ]);

    res.json({ leads, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/leads/:id — update status
exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status }
    });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/leads — all leads (admin use)
exports.getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: { property: true, agent: true },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.lead.count({ where })
    ]);

    res.json({ leads, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

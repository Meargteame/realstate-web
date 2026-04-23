const prisma = require('../config/prisma');

// GET /api/opportunities - Get all opportunities (with optional filters)
exports.getOpportunities = async (req, res) => {
  try {
    const { agentId, type, status } = req.query;
    const where = {};
    
    if (agentId) where.agentId = agentId;
    if (type) where.type = type;
    if (status) where.status = status;
    
    const opportunities = await prisma.opportunity.findMany({
      where,
      include: { agent: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/opportunities - Create new opportunity
exports.createOpportunity = async (req, res) => {
  try {
    const { name, type, dealType, price, status, probability, agentId } = req.body;
    
    if (!name || !dealType || !price || !agentId) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, dealType, price, agentId' 
      });
    }
    
    const opportunity = await prisma.opportunity.create({
      data: {
        name,
        type: type || 'listing',
        dealType,
        price: parseInt(price),
        status: status || 'Cultivate',
        probability: parseInt(probability) || 20,
        agentId
      },
      include: { agent: true }
    });
    
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/opportunities/:id - Update opportunity
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, dealType, price, status, probability } = req.body;
    
    const data = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (dealType !== undefined) data.dealType = dealType;
    if (price !== undefined) data.price = parseInt(price);
    if (status !== undefined) data.status = status;
    if (probability !== undefined) data.probability = parseInt(probability);
    
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data,
      include: { agent: true }
    });
    
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/opportunities/:id - Delete opportunity
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.opportunity.delete({ where: { id } });
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

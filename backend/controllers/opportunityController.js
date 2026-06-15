const prisma = require('../config/prisma');

// GET /api/opportunities - Get all opportunities (with optional filters)
exports.getOpportunities = async (req, res) => {
  try {
    const { agentId, type, status } = req.query;
    const where = {};

    if (agentId) where.agentId = agentId;
    if (type) where.type = type;
    if (status) where.status = status;

    // Opt-in pagination (kanban view defaults to a plain array)
    const rawLimit = parseInt(req.query.limit, 10);
    const rawPage = parseInt(req.query.page, 10);
    const paginated = Number.isFinite(rawPage) && rawPage > 0;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 200) : (paginated ? 50 : undefined);
    const page = paginated ? rawPage : 1;
    const skip = paginated ? (page - 1) * limit : undefined;

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        include: { agent: true },
        orderBy: { createdAt: 'desc' },
        ...(limit !== undefined ? { take: limit } : {}),
        ...(skip !== undefined ? { skip } : {})
      }),
      paginated ? prisma.opportunity.count({ where }) : Promise.resolve(null)
    ]);

    // Convert BigInt to Number for JSON serialization
    const data = JSON.parse(JSON.stringify(opportunities, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));

    if (paginated) {
      return res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/opportunities - Create new opportunity
exports.createOpportunity = async (req, res) => {
  try {
    const { name, type, dealType, price, status, probability, agentId, leadId, expectedCloseDate, notes } = req.body;

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
        agentId,
        leadId: leadId || null,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        notes: notes || null
      },
      include: { agent: true, lead: true }
    });
    
    // Convert BigInt to Number for JSON serialization
    const data = JSON.parse(JSON.stringify(opportunity, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/opportunities/:id - Update opportunity
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, dealType, price, status, probability, leadId, expectedCloseDate, notes } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (dealType !== undefined) data.dealType = dealType;
    if (price !== undefined) data.price = parseInt(price);
    if (status !== undefined) data.status = status;
    if (probability !== undefined) data.probability = parseInt(probability);
    if (leadId !== undefined) data.leadId = leadId || null;
    if (expectedCloseDate !== undefined) data.expectedCloseDate = expectedCloseDate ? new Date(expectedCloseDate) : null;
    if (notes !== undefined) data.notes = notes;

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data,
      include: { agent: true, lead: true }
    });
    
    // Convert BigInt to Number for JSON serialization
    const result = JSON.parse(JSON.stringify(opportunity, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    res.json(result);
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

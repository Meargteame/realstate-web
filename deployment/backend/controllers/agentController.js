const prisma = require('../config/prisma');

exports.getAgents = async (req, res) => {
  const { q } = req.query;
  try {
    const where = q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } }
      ]
    } : {};

    const agents = await prisma.agent.findMany({ where });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAgentById = async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: {
        properties: true,
        leads: true
      }
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// PATCH /api/agents/:id - Update agent profile
exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, bio, location, specialties, imageUrl } = req.body;
    
    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (bio !== undefined) data.bio = bio;
    if (location !== undefined) data.location = location;
    if (specialties !== undefined) data.specialties = specialties;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    
    const agent = await prisma.agent.update({
      where: { id },
      data
    });
    
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

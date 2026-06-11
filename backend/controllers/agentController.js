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

// POST /api/agents - Create a new agent
exports.createAgent = async (req, res) => {
  try {
    const { name, email, phone, brokerage, license, languages, imageUrl } = req.body;
    
    const agent = await prisma.agent.create({
      data: {
        name: name || 'New Agent',
        email: email || 'agent@torra.com',
        phone: phone || 'Not provided',
        brokerage: brokerage || 'TORRA Commercial Real Estate Group',
        license: license || 'Pending',
        languages: languages || ['English'],
        imageUrl: imageUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
      },
      include: { properties: true, leads: true }
    });

    // If this was triggered by a logged-in user, link agent to user
    if (req.user && req.user.id) {
      try {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { agentId: agent.id }
        });
      } catch (e) {
        console.warn('Could not link agent to user:', e.message);
      }
    }

    res.status(201).json(agent);
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAgentById = async (req, res) => {
  try {
    console.log('🔍 Fetching agent:', req.params.id);
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: {
        properties: true,
        leads: true
      }
    });
    if (!agent) {
      console.log('❌ Agent not found:', req.params.id);
      return res.status(404).json({ error: 'Agent not found' });
    }
    console.log('✅ Agent found:', agent.name);
    
    // Convert BigInt to Number for JSON serialization
    const agentData = JSON.parse(JSON.stringify(agent, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    res.json(agentData);
  } catch (error) {
    console.error('❌ Error fetching agent:', error);
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

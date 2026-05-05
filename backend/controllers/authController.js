const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// POST /api/auth/register
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user'; // Default to 'user' if not specified
    
    let agentId = null;

    // If registering as an agent, create an agent record first
    if (userRole === 'agent') {
      const agent = await prisma.agent.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          phone: '',
          imageUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
          brokerage: 'Keller Williams Premier Realty',
          license: 'Pending',
          languages: ['English']
        }
      });
      agentId = agent.id;
    }

    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: userRole,
        agentId: agentId
      }
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      agentId: user.agentId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 1. Check User table
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Incorrect password. Please try again.' });

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agentId: user.agentId,
      });
    }

    // 2. Fallback: check seeded Agents table
    const agent = await prisma.agent.findFirst({ where: { email } });
    if (agent) {
      return res.json({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        role: 'agent',
        agentId: agent.id,
      });
    }

    return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

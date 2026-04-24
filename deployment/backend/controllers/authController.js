const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// POST /api/auth/register
exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

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

    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
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

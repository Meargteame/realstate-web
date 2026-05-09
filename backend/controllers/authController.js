const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST /api/auth/register
exports.register = async (req, res) => {
  console.log('🔥 REGISTER ENDPOINT HIT!');
  console.log('📦 Request body:', req.body);
  
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validate Required Fields
    if (!firstName || !lastName || !email || !password) {
      console.log('❌ Validation failed: missing fields');
      return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
    }

    const emailLower = email.toLowerCase().trim();
    console.log('📧 Creating account for:', emailLower);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: emailLower } 
    });

    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'agent' ? 'agent' : 'user'; 
    console.log('👤 Creating user with role:', userRole);
    
    let agentId = null;

    // Use Prisma transaction to ensure both user and agent are created together cleanly
    const result = await prisma.$transaction(async (tx) => {
      if (userRole === 'agent') {
        console.log('🏢 Creating agent profile...');
        const agent = await tx.agent.create({
          data: {
            name: `${firstName.trim()} ${lastName.trim()}`,
            email: emailLower,
            phone: 'Not provided', // Provide default string since phone is required
            imageUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            brokerage: 'Keller Williams',
            license: 'Pending',
            languages: ['English']
          }
        });
        agentId = agent.id;
        console.log('✅ Agent created:', agent.id);
      }

      console.log('👤 Creating user record...');
      const user = await tx.user.create({
        data: {
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: emailLower,
          password: hashedPassword,
          role: userRole,
          agentId: agentId
        }
      });
      console.log('✅ User created:', user.id);

      return user;
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.id, 
        email: result.email, 
        role: result.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Registration successful!');
    res.status(201).json({
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      agentId: result.agentId,
      token
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    res.status(500).json({ error: 'An internal server error occurred during registration.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const emailLower = email.toLowerCase().trim();
    console.log('📧 Searching for email:', emailLower);

    // Find in Users table (case-insensitive search)
    const user = await prisma.user.findFirst({ 
      where: { 
        email: {
          equals: emailLower,
          mode: 'insensitive'
        }
      } 
    });

    if (user) {
      console.log('✅ User found:', user.email);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🔑 Password match:', isMatch);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('✅ Login successful');
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agentId: user.agentId,
        token
      });
    }

    console.log('❌ User not found in User table');

    // Fallback: check standalone Agents table (for older seeded data)
    const agent = await prisma.agent.findFirst({ 
      where: { 
        email: {
          equals: emailLower,
          mode: 'insensitive'
        }
      } 
    });
    
    if (agent) {
      console.log('⚠️  Agent found but no user record');
      return res.status(401).json({ error: 'Account setup incomplete. Please register your agent email.' });
    }

    console.log('❌ No account found');
    return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({ error: 'An internal server error occurred during login.' });
  }
};

// GET /api/auth/me - Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        agentId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('[Get Current User Error]:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

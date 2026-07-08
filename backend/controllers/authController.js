const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const { JWT_SECRET } = require('../config/jwt');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validate Required Fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: emailLower } 
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'agent' ? 'agent' : 'user';

    let agentId = null;

    // Use Prisma transaction to ensure both user and agent are created together cleanly
    const result = await prisma.$transaction(async (tx) => {
      if (userRole === 'agent') {
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
      }

      const user = await tx.user.create({
        data: {
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: emailLower,
          password: hashedPassword,
          role: userRole,
          agentId: agentId
        }
      });

      return user;
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.id, 
        email: result.email, 
        role: result.role,
        agentId: result.agentId
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

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const emailLower = email.toLowerCase().trim();

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
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
      }

      // Auto-create agent profile if user doesn't have one
      let agentId = user.agentId;
      if (!agentId) {
        try {
          const agent = await prisma.agent.create({
            data: {
              name: user.name || user.email.split('@')[0],
              email: user.email,
              phone: 'Not provided',
              imageUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
              brokerage: 'TORRA Commercial Real Estate Group',
              license: 'Pending',
              languages: ['English']
            }
          });
          // Link agent to user
          await prisma.user.update({
            where: { id: user.id },
            data: { agentId: agent.id }
          });
          agentId = agent.id;
          console.log('✅ Agent profile created:', agentId);
        } catch (err) {
          console.error('⚠️ Failed to auto-create agent profile:', err.message);
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          agentId: agentId
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
        agentId: agentId,
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
        createdAt: true
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

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: { email: { equals: emailLower, mode: 'insensitive' } }
    });

    // Always respond with success to avoid leaking which emails are registered.
    const genericResponse = {
      message: 'If an account exists for that email, a password reset link has been sent.'
    };

    if (!user) {
      console.log('🔑 Password reset requested for non-existent email:', emailLower);
      return res.json(genericResponse);
    }

    // Generate a raw token for the link and store only its hash.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: tokenHash, resetTokenExpiry: expiry }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    const emailResult = await emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl
    });

    // In development, expose the link/preview so the flow is testable without email delivery.
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        ...genericResponse,
        devResetUrl: resetUrl,
        emailPreviewUrl: emailResult.previewUrl || null
      });
    }

    return res.json(genericResponse);
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ error: 'Email, token, and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: { email: { equals: emailLower, mode: 'insensitive' } }
    });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    if (
      !user ||
      !user.resetToken ||
      user.resetToken !== tokenHash ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < new Date()
    ) {
      return res.status(400).json({ error: 'This password reset link is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    console.log('✅ Password reset successful for:', user.email);
    return res.json({ message: 'Your password has been reset. You can now log in.' });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};

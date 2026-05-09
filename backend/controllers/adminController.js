const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// =====================================================
// USER MANAGEMENT
// =====================================================

// Get all users with pagination and filters
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        role ? { role } : {}
      ]
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        total: Number(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(Number(total) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        agent: {
          include: {
            properties: true,
            leads: true,
            opportunities: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const updateData = {
      name,
      email,
      role
    };

    // If password is provided, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { agent: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is an agent, delete agent record first
    if (user.agent) {
      await prisma.agent.delete({
        where: { id: user.agent.id }
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// =====================================================
// AGENT MANAGEMENT
// =====================================================

// Get all agents with stats
exports.getAllAgents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        include: {
          properties: {
            select: {
              id: true,
              status: true,
              price: true
            }
          },
          leads: {
            select: {
              id: true,
              status: true
            }
          },
          opportunities: {
            select: {
              id: true,
              price: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.agent.count({ where })
    ]);

    // Calculate stats for each agent
    const agentsWithStats = agents.map(agent => ({
      ...agent,
      status: agent.isActive ? 'active' : 'inactive', // Map isActive to status for frontend
      stats: {
        totalListings: agent.properties.length,
        activeListings: agent.properties.filter(p => p.status === 'Active').length,
        totalLeads: agent.leads.length,
        activeLeads: agent.leads.filter(l => l.status === 'new' || l.status === 'contacted').length,
        totalOpportunities: agent.opportunities.length,
        totalValue: agent.opportunities.reduce((sum, o) => sum + Number(o.price || 0), 0)
      }
    }));

    res.json({
      agents: agentsWithStats,
      pagination: {
        total: Number(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(Number(total) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
};

// Update agent status
exports.updateAgentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Map status to isActive boolean
    const isActive = status === 'active';

    const agent = await prisma.agent.update({
      where: { id },
      data: { isActive },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ ...agent, status: agent.isActive ? 'active' : 'inactive' });
  } catch (error) {
    console.error('Error updating agent status:', error);
    res.status(500).json({ error: 'Failed to update agent status' });
  }
};

// Delete agent
exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.agent.delete({
      where: { id }
    });

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
};

// =====================================================
// PROPERTY MANAGEMENT
// =====================================================

// Get all properties with filters
exports.getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      AND: [
        status ? { status } : {},
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } }
          ]
        } : {}
      ]
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.property.count({ where })
    ]);

    res.json({
      properties,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

// Update property status
exports.updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const property = await prisma.property.update({
      where: { id },
      data: { status },
      include: {
        agent: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(property);
  } catch (error) {
    console.error('Error updating property status:', error);
    res.status(500).json({ error: 'Failed to update property status' });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.property.delete({
      where: { id }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};

// =====================================================
// PLATFORM STATISTICS
// =====================================================

// Get platform statistics
exports.getPlatformStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalAgents,
      totalProperties,
      totalLeads,
      totalOpportunities,
      newUsersThisMonth,
      newAgentsThisMonth,
      activeListings,
      pendingListings,
      totalRevenue,
      recentUsers,
      recentAgents,
      recentProperties
    ] = await Promise.all([
      prisma.user.count(),
      prisma.agent.count(),
      prisma.property.count(),
      prisma.lead.count(),
      prisma.opportunity.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      }),
      prisma.agent.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      }),
      prisma.property.count({
        where: { status: 'Active' }
      }),
      prisma.property.count({
        where: { status: 'Pending' }
      }),
      prisma.property.aggregate({
        _sum: {
          price: true
        }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.agent.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    res.json({
      totalUsers,
      totalAgents,
      totalProperties,
      totalLeads,
      totalOpportunities,
      newUsersThisMonth,
      newAgentsThisMonth,
      activeListings,
      pendingListings,
      totalRevenue: totalRevenue._sum.price || 0,
      avgPropertyValue: totalProperties > 0 ? Math.round((totalRevenue._sum.price || 0) / totalProperties) : 0,
      recentActivity: {
        users: recentUsers,
        agents: recentAgents,
        properties: recentProperties
      }
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
};

// Get top performing agents
exports.getTopAgents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const agents = await prisma.agent.findMany({
      include: {
        properties: {
          select: {
            id: true,
            status: true
          }
        },
        leads: {
          select: {
            id: true
          }
        },
        opportunities: {
          select: {
            id: true,
            price: true
          }
        }
      }
    });

    // Calculate performance score for each agent
    const agentsWithScore = agents.map(agent => {
      const activeListings = agent.properties.filter(p => p.status === 'Active').length;
      const totalLeads = agent.leads.length;
      const totalValue = agent.opportunities.reduce((sum, o) => sum + Number(o.price || 0), 0);
      
      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        imageUrl: agent.imageUrl,
        phone: agent.phone,
        stats: {
          listingsCount: agent.properties.length,
          activeListings,
          leadsCount: totalLeads,
          opportunitiesCount: agent.opportunities.length,
          totalValue
        },
        performanceScore: (activeListings * 10) + (totalLeads * 5) + (totalValue / 10000)
      };
    });

    // Sort by performance score and take top N
    const topAgents = agentsWithScore
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, parseInt(limit));

    res.json(topAgents);
  } catch (error) {
    console.error('Error fetching top agents:', error);
    res.status(500).json({ error: 'Failed to fetch top agents' });
  }
};

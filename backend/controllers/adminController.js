const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const cacheService = require('../services/cacheService');

// Helper: safely serialize BigInt fields (from Prisma) to Number for JSON
const serializeBigInt = (obj) =>
  JSON.parse(JSON.stringify(obj, (_k, v) => (typeof v === 'bigint' ? Number(v) : v)));

// Invalidate cached admin aggregates after a mutation so the dashboard
// reflects changes well before the short TTL would expire.
const invalidateAdminStats = async () => {
  await cacheService.del('admin:platform-stats');
  await cacheService.del('admin:trends');
  await cacheService.delPattern('admin:top-agents:*');
};

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
    res.json(serializeBigInt(userWithoutPassword));
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

    const emailLower = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
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
        email: emailLower,
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

    await invalidateAdminStats();
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

    const emailLower = email ? email.toLowerCase().trim() : undefined;

    const updateData = {
      name,
      email: emailLower,
      role
    };

    // If password is provided, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Check if email is being updated to an already existing email
    if (emailLower) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: emailLower,
          NOT: { id }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Another user with this email already exists' });
      }
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

    // Run deletions in a transaction to prevent constraint errors
    await prisma.$transaction(async (tx) => {
      if (user.agent) {
        // 1. Delete all properties associated with the agent
        await tx.property.deleteMany({
          where: { agentId: user.agent.id }
        });
        
        // 2. Delete the agent profile
        await tx.agent.delete({
          where: { id: user.agent.id }
        });
      }

      // 3. Delete the user
      await tx.user.delete({
        where: { id }
      });
    });

    await invalidateAdminStats();
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

    res.json(serializeBigInt({
      agents: agentsWithStats,
      pagination: {
        total: Number(total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(Number(total) / parseInt(limit))
      }
    }));
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

    res.json(serializeBigInt({ ...agent, status: agent.isActive ? 'active' : 'inactive' }));
  } catch (error) {
    console.error('Error updating agent status:', error);
    res.status(500).json({ error: 'Failed to update agent status' });
  }
};

// Delete agent
exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    // Use transaction to ensure properties are deleted first to avoid FK constraints
    await prisma.$transaction([
      prisma.property.deleteMany({
        where: { agentId: id }
      }),
      prisma.agent.delete({
        where: { id }
      })
    ]);

    await invalidateAdminStats();
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

    await invalidateAdminStats();
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
    const cached = await cacheService.get('admin:platform-stats');
    if (cached) return res.json(cached);

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

    const payload = {
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
    };

    // Cache for 2 minutes (stats tolerate slight staleness, dashboard hits this often)
    await cacheService.set('admin:platform-stats', payload, 120);
    res.json(payload);
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
};

// GET /api/admin/trends - Real revenue & user-growth trends (replaces mocked charts)
exports.getPlatformTrends = async (req, res) => {
  try {
    const cached = await cacheService.get('admin:trends');
    if (cached) return res.json(cached);

    const months = 12;
    const now = new Date();
    const windowStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    // One query each, then bucket in memory (no per-month N+1).
    const [closedOpps, users] = await Promise.all([
      prisma.opportunity.findMany({
        where: { status: 'Closed', updatedAt: { gte: windowStart } },
        select: { price: true, updatedAt: true }
      }),
      prisma.user.findMany({
        select: { createdAt: true }
      })
    ]);

    const revenueByMonth = [];
    const userGrowthByMonth = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = monthStart.toLocaleDateString('en-US', { month: 'short' });

      const revenue = closedOpps
        .filter(o => { const t = new Date(o.updatedAt); return t >= monthStart && t <= monthEnd; })
        .reduce((sum, o) => sum + (o.price || 0), 0);
      revenueByMonth.push({ month: label, revenue });

      // Cumulative user count up to the end of this month.
      const cumulativeUsers = users.filter(u => new Date(u.createdAt) <= monthEnd).length;
      userGrowthByMonth.push({ month: label, users: cumulativeUsers });
    }

    // Real system health snapshot.
    const memory = process.memoryUsage();
    const systemHealth = [
      {
        name: 'API Server',
        status: 'healthy',
        uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
        detail: `${Math.round(memory.heapUsed / 1024 / 1024)}MB heap`
      },
      {
        name: 'Database',
        status: 'healthy',
        uptime: '—',
        detail: 'Connected'
      },
      {
        name: 'Cache (Redis)',
        status: cacheService.isConnected ? 'healthy' : 'warning',
        uptime: '—',
        detail: cacheService.isConnected ? 'Connected' : 'Disabled'
      }
    ];

    const payload = { revenueByMonth, userGrowthByMonth, systemHealth };
    await cacheService.set('admin:trends', payload, 300);
    res.json(payload);
  } catch (error) {
    console.error('Error fetching platform trends:', error);
    res.status(500).json({ error: 'Failed to fetch platform trends' });
  }
};

// Get top performing agents
exports.getTopAgents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const cacheKey = `admin:top-agents:${limit}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    // Aggregate per-agent metrics with grouped queries instead of loading every
    // property/lead/opportunity row into memory.
    const [agents, propsByAgent, activeByAgent, leadsByAgent, oppsByAgent] = await Promise.all([
      prisma.agent.findMany({
        select: { id: true, name: true, email: true, imageUrl: true, phone: true }
      }),
      prisma.property.groupBy({ by: ['agentId'], _count: { _all: true } }),
      prisma.property.groupBy({ by: ['agentId'], where: { status: 'Active' }, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['agentId'], _count: { _all: true } }),
      prisma.opportunity.groupBy({ by: ['agentId'], _count: { _all: true }, _sum: { price: true } })
    ]);

    const toMap = (rows, pick) => {
      const m = new Map();
      rows.forEach(r => { if (r.agentId) m.set(r.agentId, pick(r)); });
      return m;
    };
    const propCount = toMap(propsByAgent, r => r._count._all);
    const activeCount = toMap(activeByAgent, r => r._count._all);
    const leadCount = toMap(leadsByAgent, r => r._count._all);
    const oppCount = toMap(oppsByAgent, r => r._count._all);
    const oppValue = toMap(oppsByAgent, r => Number(r._sum.price || 0));

    const agentsWithScore = agents.map(agent => {
      const activeListings = activeCount.get(agent.id) || 0;
      const totalLeads = leadCount.get(agent.id) || 0;
      const totalValue = oppValue.get(agent.id) || 0;

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        imageUrl: agent.imageUrl,
        phone: agent.phone,
        stats: {
          listingsCount: propCount.get(agent.id) || 0,
          activeListings,
          leadsCount: totalLeads,
          opportunitiesCount: oppCount.get(agent.id) || 0,
          totalValue
        },
        performanceScore: (activeListings * 10) + (totalLeads * 5) + (totalValue / 10000)
      };
    });

    // Sort by performance score and take top N
    const topAgents = agentsWithScore
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, parseInt(limit));

    await cacheService.set(cacheKey, topAgents, 300);
    res.json(topAgents);
  } catch (error) {
    console.error('Error fetching top agents:', error);
    res.status(500).json({ error: 'Failed to fetch top agents' });
  }
};

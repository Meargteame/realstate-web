const prisma = require('../config/prisma');

// GET /api/analytics/agent/:agentId - Get agent performance analytics
exports.getAgentAnalytics = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Get agent data
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        properties: {
          where: dateFilter.gte ? { createdAt: dateFilter } : {}
        },
        leads: {
          where: dateFilter.gte ? { createdAt: dateFilter } : {}
        },
        opportunities: {
          where: dateFilter.gte ? { createdAt: dateFilter } : {}
        }
      }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Calculate metrics
    const totalListings = agent.properties.length;
    const activeListings = agent.properties.filter(p => p.status === 'Active').length;
    const soldListings = agent.properties.filter(p => p.status === 'Sold').length;
    
    const totalLeads = agent.leads.length;
    const newLeads = agent.leads.filter(l => l.status === 'New').length;
    const qualifiedLeads = agent.leads.filter(l => l.status === 'Qualified').length;
    const closedLeads = agent.leads.filter(l => l.status === 'Closed').length;
    
    const totalOpportunities = agent.opportunities.length;
    const totalOpportunityValue = agent.opportunities.reduce((sum, opp) => sum + opp.price, 0);
    const closedOpportunities = agent.opportunities.filter(o => o.status === 'Closed').length;
    const closedOpportunityValue = agent.opportunities
      .filter(o => o.status === 'Closed')
      .reduce((sum, opp) => sum + opp.price, 0);

    // Lead conversion rate
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads * 100).toFixed(1) : 0;

    // Average response time (mock - would need message timestamps)
    const avgResponseTime = agent.avgResponseTime || 45; // minutes

    // Sales by month (last 12 months)
    const salesByMonth = await getSalesByMonth(agentId, 12);

    // Lead sources
    const leadSources = await getLeadSources(agentId);

    // Property performance
    const propertyPerformance = agent.properties.map(p => ({
      id: p.id,
      address: p.address,
      price: p.price,
      status: p.status,
      viewCount: p.viewCount,
      leadCount: p.leadCount,
      daysOnMarket: Math.floor((new Date() - new Date(p.listedAt)) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      agent: {
        id: agent.id,
        name: agent.name,
        imageUrl: agent.imageUrl,
        rating: agent.rating,
        reviews: agent.reviews
      },
      summary: {
        totalListings,
        activeListings,
        soldListings,
        totalLeads,
        newLeads,
        qualifiedLeads,
        closedLeads,
        conversionRate: parseFloat(conversionRate),
        totalOpportunities,
        totalOpportunityValue,
        closedOpportunities,
        closedOpportunityValue,
        avgResponseTime
      },
      charts: {
        salesByMonth,
        leadSources
      },
      propertyPerformance: propertyPerformance.slice(0, 10) // Top 10
    });
  } catch (error) {
    console.error('Error fetching agent analytics:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/analytics/leads/:agentId - Get lead analytics
exports.getLeadAnalytics = async (req, res) => {
  try {
    const { agentId } = req.params;

    const leads = await prisma.lead.findMany({
      where: { agentId },
      include: { property: true }
    });

    // Lead status breakdown
    const statusBreakdown = {
      New: leads.filter(l => l.status === 'New').length,
      Contacted: leads.filter(l => l.status === 'Contacted').length,
      Qualified: leads.filter(l => l.status === 'Qualified').length,
      Closed: leads.filter(l => l.status === 'Closed').length,
      Lost: leads.filter(l => l.status === 'Lost').length
    };

    // Lead type breakdown
    const typeBreakdown = {};
    leads.forEach(lead => {
      const type = lead.type || 'General';
      typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
    });

    // Leads by month (last 6 months)
    const leadsByMonth = getLeadsByMonth(leads, 6);

    // Average time to close (mock)
    const avgTimeToClose = 14; // days

    // Top performing properties (by lead count)
    const propertyLeadCounts = {};
    leads.forEach(lead => {
      if (lead.propertyId) {
        propertyLeadCounts[lead.propertyId] = (propertyLeadCounts[lead.propertyId] || 0) + 1;
      }
    });

    res.json({
      total: leads.length,
      statusBreakdown,
      typeBreakdown,
      leadsByMonth,
      avgTimeToClose,
      conversionRate: leads.length > 0 ? (statusBreakdown.Closed / leads.length * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Error fetching lead analytics:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/analytics/properties/:agentId - Get property analytics
exports.getPropertyAnalytics = async (req, res) => {
  try {
    const { agentId } = req.params;

    const properties = await prisma.property.findMany({
      where: { agentId },
      include: {
        leads: true
      }
    });

    // Status breakdown
    const statusBreakdown = {
      Active: properties.filter(p => p.status === 'Active').length,
      Pending: properties.filter(p => p.status === 'Pending').length,
      Sold: properties.filter(p => p.status === 'Sold').length
    };

    // Average metrics
    const avgPrice = properties.length > 0 
      ? Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length)
      : 0;
    
    const avgViewCount = properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + p.viewCount, 0) / properties.length)
      : 0;

    const avgLeadCount = properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + p.leads.length, 0) / properties.length)
      : 0;

    // Calculate average days on market
    const avgDaysOnMarket = properties.length > 0
      ? Math.round(properties.reduce((sum, p) => {
          const days = Math.floor((new Date() - new Date(p.listedAt)) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / properties.length)
      : 0;

    // Price distribution
    const priceRanges = {
      'Under $200K': properties.filter(p => p.price < 200000).length,
      '$200K-$400K': properties.filter(p => p.price >= 200000 && p.price < 400000).length,
      '$400K-$600K': properties.filter(p => p.price >= 400000 && p.price < 600000).length,
      '$600K-$800K': properties.filter(p => p.price >= 600000 && p.price < 800000).length,
      'Over $800K': properties.filter(p => p.price >= 800000).length
    };

    // Top performing properties
    const topProperties = properties
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        address: p.address,
        price: p.price,
        viewCount: p.viewCount,
        leadCount: p.leads.length,
        status: p.status
      }));

    res.json({
      total: properties.length,
      statusBreakdown,
      averages: {
        price: avgPrice,
        viewCount: avgViewCount,
        leadCount: avgLeadCount,
        daysOnMarket: avgDaysOnMarket
      },
      priceRanges,
      topProperties
    });
  } catch (error) {
    console.error('Error fetching property analytics:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/analytics/sales/:agentId - Get sales reports
exports.getSalesReports = async (req, res) => {
  try {
    const { agentId } = req.params;

    const opportunities = await prisma.opportunity.findMany({
      where: { 
        agentId,
        status: 'Closed'
      }
    });

    // Total sales volume
    const totalVolume = opportunities.reduce((sum, opp) => sum + opp.price, 0);
    const totalDeals = opportunities.length;
    const avgDealSize = totalDeals > 0 ? Math.round(totalVolume / totalDeals) : 0;

    // Sales by month (last 12 months)
    const salesByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthOpps = opportunities.filter(opp => {
        const oppDate = new Date(opp.updatedAt);
        return oppDate >= monthStart && oppDate <= monthEnd;
      });

      salesByMonth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        volume: monthOpps.reduce((sum, opp) => sum + opp.price, 0),
        count: monthOpps.length
      });
    }

    // Deal type breakdown
    const dealTypeBreakdown = {
      listing: opportunities.filter(o => o.type === 'listing').length,
      buyer: opportunities.filter(o => o.type === 'buyer').length
    };

    // Commission estimate (assuming 3% commission)
    const estimatedCommission = Math.round(totalVolume * 0.03);

    res.json({
      totalVolume,
      totalDeals,
      avgDealSize,
      estimatedCommission,
      salesByMonth,
      dealTypeBreakdown
    });
  } catch (error) {
    console.error('Error fetching sales reports:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
async function getSalesByMonth(agentId, months) {
  const salesByMonth = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthOpps = await prisma.opportunity.findMany({
      where: {
        agentId,
        status: 'Closed',
        updatedAt: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });

    salesByMonth.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      value: monthOpps.reduce((sum, opp) => sum + opp.price, 0),
      count: monthOpps.length
    });
  }

  return salesByMonth;
}

async function getLeadSources(agentId) {
  const leads = await prisma.lead.findMany({
    where: { agentId }
  });

  const sources = {};
  leads.forEach(lead => {
    const source = lead.type || 'Direct';
    sources[source] = (sources[source] || 0) + 1;
  });

  return Object.entries(sources).map(([name, value]) => ({ name, value }));
}

function getLeadsByMonth(leads, months) {
  const leadsByMonth = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthLeads = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= monthStart && leadDate <= monthEnd;
    });

    leadsByMonth.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      count: monthLeads.length
    });
  }

  return leadsByMonth;
}

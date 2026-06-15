const prisma = require('../config/prisma');
const cacheService = require('../services/cacheService');

// GET /api/stats - Public platform stats for the marketing homepage.
// Returns real counts; cached briefly since the homepage is hit often.
exports.getPublicStats = async (req, res) => {
  try {
    const cached = await cacheService.get('public:stats');
    if (cached) return res.json(cached);

    const [activeListings, totalProperties, totalAgents, cities, soldProps] = await Promise.all([
      prisma.property.count({ where: { status: 'Active' } }),
      prisma.property.count(),
      prisma.agent.count({ where: { isActive: true } }),
      prisma.property.findMany({ distinct: ['city'], select: { city: true } }),
      prisma.property.findMany({
        where: { status: 'Sold' },
        select: { listedAt: true, updatedAt: true }
      })
    ]);

    // Average days on market across sold listings (fallback to a sensible default).
    let avgDaysOnMarket = 0;
    if (soldProps.length > 0) {
      const total = soldProps.reduce((sum, p) => {
        const days = (new Date(p.updatedAt) - new Date(p.listedAt)) / (1000 * 60 * 60 * 24);
        return sum + Math.max(0, days);
      }, 0);
      avgDaysOnMarket = Math.round(total / soldProps.length);
    }

    const payload = {
      activeListings,
      totalProperties,
      totalAgents,
      citiesServed: cities.filter(c => c.city).length,
      avgDaysOnMarket
    };

    await cacheService.set('public:stats', payload, 120);
    res.json(payload);
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// GET /api/stats/trending-cities - Cities ranked by active listing count (real data).
exports.getTrendingCities = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 4, 12);
    const cacheKey = `public:trending-cities:${limit}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    // Group active properties by city, ordered by count.
    const grouped = await prisma.property.groupBy({
      by: ['city', 'state'],
      where: { status: 'Active' },
      _count: { _all: true },
      orderBy: { _count: { city: 'desc' } },
      take: limit
    });

    // Grab one image per city for the card.
    const cities = await Promise.all(
      grouped.map(async (g) => {
        const sample = await prisma.property.findFirst({
          where: { city: g.city, status: 'Active' },
          select: { imageUrl: true }
        });
        return {
          name: g.state ? `${g.city}, ${g.state}` : g.city,
          city: g.city,
          state: g.state,
          count: g._count._all,
          imageUrl: sample?.imageUrl || null
        };
      })
    );

    await cacheService.set(cacheKey, cities, 300);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching trending cities:', error);
    res.status(500).json({ error: 'Failed to fetch trending cities' });
  }
};

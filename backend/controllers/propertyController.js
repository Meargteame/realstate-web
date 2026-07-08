const prisma = require('../config/prisma');
const cacheService = require('../services/cacheService');
const { businessMetrics } = require('../middleware/monitoring');

exports.getProperties = async (req, res) => {
  const { 
    q, 
    minPrice, 
    maxPrice, 
    beds, 
    baths, 
    propertyType,
    // Phase 7A: Advanced Filters
    minYear,
    maxYear,
    minLotSize,
    maxLotSize,
    minHoaFees,
    maxHoaFees,
    minGarageSpaces,
    hasPool,
    hasBasement,
    hasFireplace,
    isWaterfront,
    isPetFriendly,
    minStories,
    maxStories,
    condition,
    maxDaysOnMarket,
    city,
    state,
    zip,
    agentId,
    status
  } = req.query;
  
  try {
    console.log('🏠 Fetching properties with filters:', req.query);
    
    // Generate cache key from all filters
    const cacheKey = cacheService.generatePropertyKey(req.query);
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Returning cached properties:', cached.length);
      return res.json(cached);
    }
    
    // Build where clause with all filters
    const where = {
      AND: []
    };
    
    // Text search
    if (q) {
      where.AND.push({
        OR: [
          { city: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { zip: { contains: q, mode: 'insensitive' } },
          { propertyType: { contains: q, mode: 'insensitive' } },
          { state: { contains: q, mode: 'insensitive' } }
        ]
      });
    }
    
    // Location filters
    if (city) where.AND.push({ city: { contains: city, mode: 'insensitive' } });
    if (state) where.AND.push({ state: { contains: state, mode: 'insensitive' } });
    if (zip) where.AND.push({ zip });

    // Ownership / status filters
    if (agentId) where.AND.push({ agentId });
    if (status) where.AND.push({ status });
    
    // Price range
    if (minPrice) where.AND.push({ price: { gte: parseInt(minPrice) } });
    if (maxPrice) where.AND.push({ price: { lte: parseInt(maxPrice) } });
    
    // Beds & Baths
    if (beds) where.AND.push({ beds: { gte: parseFloat(beds) } });
    if (baths) where.AND.push({ baths: { gte: parseFloat(baths) } });
    
    // Property Type
    if (propertyType) where.AND.push({ propertyType });
    
    // Phase 7A: Advanced Filters
    
    // Year Built
    if (minYear) where.AND.push({ yearBuilt: { gte: parseInt(minYear) } });
    if (maxYear) where.AND.push({ yearBuilt: { lte: parseInt(maxYear) } });
    
    // Lot Size
    if (minLotSize) where.AND.push({ lotSize: { gte: parseInt(minLotSize) } });
    if (maxLotSize) where.AND.push({ lotSize: { lte: parseInt(maxLotSize) } });
    
    // HOA Fees
    if (minHoaFees !== undefined) where.AND.push({ hoaFees: { gte: parseInt(minHoaFees) } });
    if (maxHoaFees !== undefined) where.AND.push({ hoaFees: { lte: parseInt(maxHoaFees) } });
    
    // Garage Spaces
    if (minGarageSpaces) where.AND.push({ garageSpaces: { gte: parseInt(minGarageSpaces) } });
    
    // Boolean Features
    if (hasPool === 'true') where.AND.push({ hasPool: true });
    if (hasBasement === 'true') where.AND.push({ hasBasement: true });
    if (hasFireplace === 'true') where.AND.push({ hasFireplace: true });
    if (isWaterfront === 'true') where.AND.push({ isWaterfront: true });
    if (isPetFriendly === 'true') where.AND.push({ isPetFriendly: true });
    
    // Stories
    if (minStories) where.AND.push({ stories: { gte: parseInt(minStories) } });
    if (maxStories) where.AND.push({ stories: { lte: parseInt(maxStories) } });
    
    // Condition
    if (condition) where.AND.push({ condition });
    
    // Days on Market
    if (maxDaysOnMarket) where.AND.push({ daysOnMarket: { lte: parseInt(maxDaysOnMarket) } });
    
    // If no filters, remove AND clause
    const finalWhere = where.AND.length > 0 ? where : {};

    // Pagination (opt-in & backward-compatible):
    //  - ?limit=N        -> caps the number of rows (take)
    //  - ?page=N&limit=M -> returns an envelope { data, total, page, limit, totalPages }
    //  - neither         -> returns a plain array (legacy behaviour)
    const rawLimit = parseInt(req.query.limit, 10);
    const rawPage = parseInt(req.query.page, 10);
    const paginated = Number.isFinite(rawPage) && rawPage > 0;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : (paginated ? 20 : undefined);
    const page = paginated ? rawPage : 1;
    const skip = paginated ? (page - 1) * limit : undefined;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: finalWhere,
        include: { agent: true },
        orderBy: [{ listedAt: 'desc' }],
        ...(limit !== undefined ? { take: limit } : {}),
        ...(skip !== undefined ? { skip } : {})
      }),
      paginated ? prisma.property.count({ where: finalWhere }) : Promise.resolve(null)
    ]);

    console.log('✅ Found properties:', properties.length);

    // Convert BigInt to Number for JSON serialization
    const propertiesData = JSON.parse(JSON.stringify(properties, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));

    const payload = paginated
      ? {
          data: propertiesData,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      : propertiesData;

    // Cache (5 minutes, hot data)
    await cacheService.set(cacheKey, payload, 300);

    // Track business metric
    businessMetrics.track('property.search', {
      query: q,
      results: properties.length,
      filters: Object.keys(req.query).length
    });

    res.json(payload);
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertiesByCity = async (req, res) => {
  const { city } = req.params;
  
  try {
    // Generate cache key
    const cacheKey = cacheService.generatePropertyKey({ city });
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Cache miss - query database
    const properties = await prisma.property.findMany({
      where: {
        city: { contains: city.replace(/-/g, ' '), mode: 'insensitive' }
      },
      include: { agent: true }
    });
    
    // Convert BigInt to Number for JSON serialization
    const propertiesData = JSON.parse(JSON.stringify(properties, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));

    // Cache for 5 minutes
    await cacheService.set(cacheKey, propertiesData, 300);
    
    res.json(propertiesData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🏠 Fetching property by ID:', id);
    
    // Generate cache key
    const cacheKey = cacheService.generatePropertyIdKey(id);
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      // Track view
      businessMetrics.track('property.view', { propertyId: id });
      return res.json(cached);
    }
    
    // Cache miss - query database
    const property = await prisma.property.findUnique({
      where: { id },
      include: { agent: true }
    });
    
    if (!property) {
      console.log('❌ Property not found:', id);
      return res.status(404).json({ error: 'Property not found' });
    }
    
    console.log('✅ Property found:', property.address);
    
    // Update view count
    await prisma.property.update({
      where: { id },
      data: { 
        viewCount: { increment: 1 },
        lastViewed: new Date()
      }
    });
    
    // Convert BigInt to Number for JSON serialization
    const propertyData = JSON.parse(JSON.stringify(property, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    // Cache for 10 minutes
    await cacheService.set(cacheKey, propertyData, 600);
    
    // Track business metric
    businessMetrics.track('property.view', { propertyId: id });
    
    res.json(propertyData);
  } catch (error) {
    console.error('❌ Error fetching property:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createProperty = async (req, res) => {
  const { price, bedrooms, bathrooms, sqft, address, city, state, zip, imageUrl, status, propertyType, agentId } = req.body;

  console.log('🏠 Creating property for agent:', agentId);

  if (!price || !address || !city || !state || !zip || !agentId) {
    return res.status(400).json({ error: 'Missing required fields: price, address, city, state, zip, agentId' });
  }

  // Verify the authenticated user owns this agent (or is admin)
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { agentId: true, role: true } });
  if (agentId !== user.agentId && user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to create properties for this agent' });
  }

  try {
    const property = await prisma.property.create({
      data: {
        price: parseInt(price),
        beds: parseFloat(bedrooms || 3),
        baths: parseFloat(bathrooms || 2),
        sqft: parseInt(sqft || 1500),
        address,
        city,
        state,
        zip,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        status: status || 'Active',
        propertyType: propertyType || 'Single Family',
        agentId
      },
      include: { agent: true }
    });
    
    console.log('✅ Property created:', property.id);
    
    // Convert BigInt to Number for JSON serialization
    const propertyData = JSON.parse(JSON.stringify(property, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    res.status(201).json(propertyData);
  } catch (error) {
    console.error('❌ Error creating property:', error);
    res.status(500).json({ error: error.message });
  }
};


// PATCH /api/properties/:id - Update property
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, bedrooms, bathrooms, sqft, address, city, state, zip, imageUrl, status, propertyType } = req.body;
    
    // Ownership check
    const existing = await prisma.property.findUnique({ where: { id }, select: { agentId: true } });
    if (!existing) return res.status(404).json({ error: 'Property not found' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { agentId: true, role: true } });
    if (existing.agentId !== user.agentId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this property' });
    }
    
    const data = {};
    if (price !== undefined) data.price = parseInt(price);
    if (bedrooms !== undefined) data.beds = parseFloat(bedrooms);
    if (bathrooms !== undefined) data.baths = parseFloat(bathrooms);
    if (sqft !== undefined) data.sqft = parseInt(sqft);
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (state !== undefined) data.state = state;
    if (zip !== undefined) data.zip = zip;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (status !== undefined) data.status = status;
    if (propertyType !== undefined) data.propertyType = propertyType;
    
    const property = await prisma.property.update({
      where: { id },
      data,
      include: { agent: true }
    });
    
    // Invalidate caches
    await cacheService.del(cacheService.generatePropertyIdKey(id));
    await cacheService.delPattern('properties:*');
    
    // Convert BigInt to Number for JSON serialization
    const propertyData = JSON.parse(JSON.stringify(property, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));

    res.json(propertyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/properties/:id - Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ownership check
    const existing = await prisma.property.findUnique({ where: { id }, select: { agentId: true } });
    if (!existing) return res.status(404).json({ error: 'Property not found' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { agentId: true, role: true } });
    if (existing.agentId !== user.agentId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }
    
    await prisma.property.delete({ where: { id } });
    
    // Invalidate caches
    await cacheService.del(cacheService.generatePropertyIdKey(id));
    await cacheService.delPattern('properties:*');
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/properties/:id/similar - Get similar properties
exports.getSimilarProperties = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 4;
    
    // Get the current property
    const property = await prisma.property.findUnique({
      where: { id }
    });
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Define price range (±20%)
    const priceMin = property.price * 0.8;
    const priceMax = property.price * 1.2;
    
    // Find similar properties
    const similarProperties = await prisma.property.findMany({
      where: {
        AND: [
          { id: { not: id } }, // Exclude current property
          { status: 'Active' }, // Only active listings
          { city: property.city }, // Same city
          { price: { gte: priceMin, lte: priceMax } }, // Similar price
          {
            OR: [
              { beds: property.beds }, // Same bedrooms
              { beds: property.beds - 1 }, // One less bedroom
              { beds: property.beds + 1 }  // One more bedroom
            ]
          }
        ]
      },
      include: { agent: true },
      take: limit,
      orderBy: [
        { price: 'asc' } // Order by price similarity
      ]
    });
    
    // If not enough similar properties, get more from same city
    if (similarProperties.length < limit) {
      const additionalProperties = await prisma.property.findMany({
        where: {
          AND: [
            { id: { not: id } },
            { status: 'Active' },
            { city: property.city },
            { id: { notIn: similarProperties.map(p => p.id) } }
          ]
        },
        include: { agent: true },
        take: limit - similarProperties.length,
        orderBy: { listedAt: 'desc' }
      });
      
      similarProperties.push(...additionalProperties);
    }
    
    // Convert BigInt to Number
    const propertiesData = JSON.parse(JSON.stringify(similarProperties, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    res.json(propertiesData);
  } catch (error) {
    console.error('❌ Error fetching similar properties:', error);
    res.status(500).json({ error: error.message });
  }
};


// Phase 7D: Enhanced Property Features

// GET /api/properties/:id/price-history - Get price history
exports.getPriceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const history = await prisma.propertyPriceHistory.findMany({
      where: { propertyId: id },
      orderBy: { changedAt: 'asc' }
    });
    
    res.json(history);
  } catch (error) {
    console.error('❌ Error fetching price history:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/properties/:id/price-history - Add price change
exports.addPriceChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, changeType } = req.body;
    
    if (!price || !changeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create price history entry
    const history = await prisma.propertyPriceHistory.create({
      data: {
        propertyId: id,
        price: parseFloat(price),
        changeType
      }
    });
    
    // Update property price
    await prisma.property.update({
      where: { id },
      data: { price: parseInt(price) }
    });
    
    res.status(201).json(history);
  } catch (error) {
    console.error('❌ Error adding price change:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/properties/compare - Create property comparison
exports.createComparison = async (req, res) => {
  try {
    const { propertyIds, name } = req.body;
    const userId = req.user?.id || req.body.userId;
    
    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 properties required for comparison' });
    }
    
    if (propertyIds.length > 4) {
      return res.status(400).json({ error: 'Maximum 4 properties can be compared' });
    }
    
    const comparison = await prisma.propertyComparison.create({
      data: {
        userId,
        propertyIds,
        name: name || `Comparison ${new Date().toLocaleDateString()}`
      }
    });
    
    res.status(201).json(comparison);
  } catch (error) {
    console.error('❌ Error creating comparison:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/properties/comparisons - Get user's saved comparisons
exports.getComparisons = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    
    const comparisons = await prisma.propertyComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Fetch property details for each comparison
    const comparisonsWithProperties = await Promise.all(
      comparisons.map(async (comparison) => {
        const properties = await prisma.property.findMany({
          where: {
            id: { in: comparison.propertyIds }
          },
          include: { agent: true }
        });
        
        return {
          ...comparison,
          properties: JSON.parse(JSON.stringify(properties, (key, value) =>
            typeof value === 'bigint' ? Number(value) : value
          ))
        };
      })
    );
    
    res.json(comparisonsWithProperties);
  } catch (error) {
    console.error('❌ Error fetching comparisons:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/properties/compare/:id - Get single comparison
exports.getComparisonById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comparison = await prisma.propertyComparison.findUnique({
      where: { id }
    });
    
    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }
    
    // Fetch property details
    const properties = await prisma.property.findMany({
      where: {
        id: { in: comparison.propertyIds }
      },
      include: { agent: true }
    });
    
    const propertiesData = JSON.parse(JSON.stringify(properties, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    res.json({
      ...comparison,
      properties: propertiesData
    });
  } catch (error) {
    console.error('❌ Error fetching comparison:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/properties/compare/:id - Delete comparison
exports.deleteComparison = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.userId;
    
    // Check ownership
    const comparison = await prisma.propertyComparison.findUnique({
      where: { id }
    });
    
    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }
    
    if (comparison.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await prisma.propertyComparison.delete({
      where: { id }
    });
    
    res.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting comparison:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/properties/saved?userId=... - Properties a user has favorited/saved
exports.getSavedProperties = async (req, res) => {
  try {
    const userId = req.query.userId || (req.user && req.user.id);
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { property: { include: { agent: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const properties = favorites
      .map((f) => f.property)
      .filter(Boolean);

    // Convert BigInt to Number for JSON serialization
    const data = JSON.parse(JSON.stringify(properties, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching saved properties:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/properties/:id/share - Track a share event and increment counter
exports.trackShare = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body || {};

    const property = await prisma.property.update({
      where: { id },
      data: { shareCount: { increment: 1 } },
      select: { id: true, shareCount: true }
    });

    res.json({ shareCount: property.shareCount, platform: platform || 'unknown' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Property not found' });
    }
    console.error('❌ Error tracking share:', error);
    res.status(500).json({ error: error.message });
  }
};

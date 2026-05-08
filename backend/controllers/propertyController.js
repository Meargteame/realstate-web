const prisma = require('../config/prisma');
const cacheService = require('../services/cacheService');
const { businessMetrics } = require('../middleware/monitoring');

exports.getProperties = async (req, res) => {
  const { q } = req.query;
  
  try {
    console.log('🏠 Fetching properties, query:', q);
    
    // Generate cache key
    const cacheKey = cacheService.generatePropertyKey({ q });
    
    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('✅ Returning cached properties:', cached.length);
      return res.json(cached);
    }
    
    // Cache miss - query database
    const where = q ? {
      OR: [
        { city: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { zip: { contains: q, mode: 'insensitive' } },
        { propertyType: { contains: q, mode: 'insensitive' } },
        { state: { contains: q, mode: 'insensitive' } }
      ]
    } : {};
    
    const properties = await prisma.property.findMany({
      where,
      include: { agent: true }
    });
    
    console.log('✅ Found properties:', properties.length);
    
    // Convert BigInt to Number for JSON serialization
    const propertiesData = JSON.parse(JSON.stringify(properties, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    // Cache for 5 minutes (hot data)
    await cacheService.set(cacheKey, propertiesData, 300);
    
    // Track business metric
    businessMetrics.track('property.search', { query: q, results: properties.length });
    
    res.json(propertiesData);
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
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, properties, 300);
    
    res.json(properties);
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
    
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/properties/:id - Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
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

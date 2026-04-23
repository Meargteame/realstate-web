const prisma = require('../config/prisma');

exports.getProperties = async (req, res) => {
  const { q } = req.query;
  try {
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
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertiesByCity = async (req, res) => {
  const { city } = req.params;
  try {
    const properties = await prisma.property.findMany({
      where: {
        city: { contains: city.replace(/-/g, ' '), mode: 'insensitive' }
      },
      include: { agent: true }
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: { agent: true }
    });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProperty = async (req, res) => {
  const { price, bedrooms, bathrooms, sqft, address, city, state, zip, imageUrl, status, propertyType, agentId } = req.body;

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
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const prisma = require('../config/prisma');

// Get market data for a zip code
const getMarketData = async (req, res) => {
  try {
    const { zipCode } = req.params;

    let marketData = await prisma.marketData.findUnique({
      where: { zipCode }
    });

    // If no data exists, generate sample data
    if (!marketData) {
      marketData = await generateSampleMarketData(zipCode);
    }

    res.json(marketData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
};

// Get market trends for a city
const getCityMarketTrends = async (req, res) => {
  try {
    const { city, state } = req.params;

    // Get all zip codes for the city
    const properties = await prisma.property.findMany({
      where: {
        city: {
          equals: city,
          mode: 'insensitive'
        },
        state: {
          equals: state,
          mode: 'insensitive'
        }
      },
      select: {
        zip: true,
        price: true,
        sqft: true
      },
      distinct: ['zip']
    });

    const zipCodes = [...new Set(properties.map(p => p.zip))];

    // Get market data for all zip codes
    const marketDataPromises = zipCodes.map(async (zip) => {
      let data = await prisma.marketData.findUnique({
        where: { zipCode: zip }
      });

      if (!data) {
        data = await generateSampleMarketData(zip);
      }

      return data;
    });

    const allMarketData = await Promise.all(marketDataPromises);

    // Calculate city-wide averages
    const cityStats = {
      city,
      state,
      avgPrice: Math.round(allMarketData.reduce((sum, data) => sum + (data.avgPrice || 0), 0) / allMarketData.length),
      medianPrice: Math.round(allMarketData.reduce((sum, data) => sum + (data.medianPrice || 0), 0) / allMarketData.length),
      avgDaysOnMarket: Math.round(allMarketData.reduce((sum, data) => sum + (data.avgDaysOnMarket || 0), 0) / allMarketData.length),
      pricePerSqft: Math.round(allMarketData.reduce((sum, data) => sum + (data.pricePerSqft || 0), 0) / allMarketData.length),
      totalInventory: allMarketData.reduce((sum, data) => sum + (data.inventoryCount || 0), 0),
      totalSalesVolume: allMarketData.reduce((sum, data) => sum + (data.salesVolume || 0), 0),
      priceChange: parseFloat((allMarketData.reduce((sum, data) => sum + (data.priceChange || 0), 0) / allMarketData.length).toFixed(2)),
      zipCodes: allMarketData
    };

    res.json(cityStats);
  } catch (error) {
    console.error('Error fetching city market trends:', error);
    res.status(500).json({ error: 'Failed to fetch market trends' });
  }
};

// Compare properties
const compareProperties = async (req, res) => {
  try {
    const { propertyIds } = req.body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length < 2 || propertyIds.length > 4) {
      return res.status(400).json({ 
        error: 'Please provide 2-4 property IDs for comparison' 
      });
    }

    const properties = await prisma.property.findMany({
      where: {
        id: {
          in: propertyIds
        }
      },
      include: {
        agent: {
          select: {
            name: true,
            phone: true,
            email: true,
            brokerage: true
          }
        }
      }
    });

    if (properties.length !== propertyIds.length) {
      return res.status(404).json({ 
        error: 'One or more properties not found' 
      });
    }

    // Get market data for each property's zip code
    const propertiesWithMarketData = await Promise.all(
      properties.map(async (property) => {
        let marketData = await prisma.marketData.findUnique({
          where: { zipCode: property.zip }
        });

        if (!marketData) {
          marketData = await generateSampleMarketData(property.zip);
        }

        return {
          ...property,
          marketData,
          pricePerSqft: Math.round(property.price / property.sqft),
          priceVsMarket: property.price > marketData.avgPrice ? 'above' : 
                        property.price < marketData.avgPrice ? 'below' : 'average'
        };
      })
    );

    // Calculate comparison stats
    const comparison = {
      properties: propertiesWithMarketData,
      stats: {
        priceRange: {
          min: Math.min(...properties.map(p => p.price)),
          max: Math.max(...properties.map(p => p.price)),
          avg: Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length)
        },
        sqftRange: {
          min: Math.min(...properties.map(p => p.sqft)),
          max: Math.max(...properties.map(p => p.sqft)),
          avg: Math.round(properties.reduce((sum, p) => sum + p.sqft, 0) / properties.length)
        },
        pricePerSqftRange: {
          min: Math.min(...propertiesWithMarketData.map(p => p.pricePerSqft)),
          max: Math.max(...propertiesWithMarketData.map(p => p.pricePerSqft)),
          avg: Math.round(propertiesWithMarketData.reduce((sum, p) => sum + p.pricePerSqft, 0) / propertiesWithMarketData.length)
        }
      }
    };

    res.json(comparison);
  } catch (error) {
    console.error('Error comparing properties:', error);
    res.status(500).json({ error: 'Failed to compare properties' });
  }
};

// Get neighborhood statistics
const getNeighborhoodStats = async (req, res) => {
  try {
    const { zipCode } = req.params;

    // Get properties in the zip code
    const properties = await prisma.property.findMany({
      where: { zip: zipCode },
      select: {
        price: true,
        sqft: true,
        beds: true,
        baths: true,
        propertyType: true,
        status: true
      }
    });

    if (properties.length === 0) {
      return res.status(404).json({ 
        error: 'No properties found in this zip code' 
      });
    }

    // Calculate neighborhood statistics
    const activeProperties = properties.filter(p => p.status === 'Active');
    const soldProperties = properties.filter(p => p.status === 'Sold');

    const stats = {
      zipCode,
      totalProperties: properties.length,
      activeListings: activeProperties.length,
      soldProperties: soldProperties.length,
      avgPrice: Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length),
      medianPrice: calculateMedian(properties.map(p => p.price)),
      avgSqft: Math.round(properties.reduce((sum, p) => sum + p.sqft, 0) / properties.length),
      avgPricePerSqft: Math.round(properties.reduce((sum, p) => sum + (p.price / p.sqft), 0) / properties.length),
      propertyTypes: getPropertyTypeBreakdown(properties),
      bedroomBreakdown: getBedroomBreakdown(properties),
      priceRanges: getPriceRangeBreakdown(properties)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching neighborhood stats:', error);
    res.status(500).json({ error: 'Failed to fetch neighborhood statistics' });
  }
};

// Helper function to generate sample market data
const generateSampleMarketData = async (zipCode) => {
  try {
    // Get actual properties in this zip code for realistic data
    const properties = await prisma.property.findMany({
      where: { zip: zipCode }
    });

    let avgPrice, medianPrice, pricePerSqft;

    if (properties.length > 0) {
      avgPrice = Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length);
      medianPrice = calculateMedian(properties.map(p => p.price));
      pricePerSqft = Math.round(properties.reduce((sum, p) => sum + (p.price / p.sqft), 0) / properties.length);
    } else {
      // Generate realistic sample data
      avgPrice = Math.floor(Math.random() * 400000) + 200000; // $200k - $600k
      medianPrice = Math.floor(avgPrice * (0.9 + Math.random() * 0.2)); // ±10%
      pricePerSqft = Math.floor(avgPrice / (1500 + Math.random() * 1000)); // Realistic sqft
    }

    const marketData = await prisma.marketData.create({
      data: {
        zipCode,
        city: properties[0]?.city || 'Unknown',
        state: properties[0]?.state || 'TX',
        avgPrice,
        medianPrice,
        avgDaysOnMarket: Math.floor(Math.random() * 60) + 20, // 20-80 days
        pricePerSqft,
        inventoryCount: Math.floor(Math.random() * 50) + 10, // 10-60 properties
        salesVolume: Math.floor(Math.random() * 20) + 5, // 5-25 sales
        priceChange: parseFloat((Math.random() * 20 - 10).toFixed(2)) // -10% to +10%
      }
    });

    return marketData;
  } catch (error) {
    console.error('Error generating sample market data:', error);
    throw error;
  }
};

// Helper functions
const calculateMedian = (numbers) => {
  const sorted = numbers.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }
  
  return sorted[middle];
};

const getPropertyTypeBreakdown = (properties) => {
  const breakdown = {};
  properties.forEach(p => {
    breakdown[p.propertyType] = (breakdown[p.propertyType] || 0) + 1;
  });
  return breakdown;
};

const getBedroomBreakdown = (properties) => {
  const breakdown = {};
  properties.forEach(p => {
    const beds = Math.floor(p.beds);
    const key = beds >= 4 ? '4+' : beds.toString();
    breakdown[key] = (breakdown[key] || 0) + 1;
  });
  return breakdown;
};

const getPriceRangeBreakdown = (properties) => {
  const ranges = {
    'Under $200k': 0,
    '$200k-$400k': 0,
    '$400k-$600k': 0,
    '$600k-$800k': 0,
    'Over $800k': 0
  };

  properties.forEach(p => {
    if (p.price < 200000) ranges['Under $200k']++;
    else if (p.price < 400000) ranges['$200k-$400k']++;
    else if (p.price < 600000) ranges['$400k-$600k']++;
    else if (p.price < 800000) ranges['$600k-$800k']++;
    else ranges['Over $800k']++;
  });

  return ranges;
};

module.exports = {
  getMarketData,
  getCityMarketTrends,
  compareProperties,
  getNeighborhoodStats
};
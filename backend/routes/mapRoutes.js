const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const geocodingService = require('../services/geocodingService');
const prisma = require('../config/prisma');

/**
 * GET /api/map/properties
 * Get all properties with coordinates for map display
 */
router.get('/properties', async (req, res) => {
  try {
    const { 
      bounds, // Format: "sw_lng,sw_lat,ne_lng,ne_lat"
      zoom,
      minPrice,
      maxPrice,
      beds,
      baths,
      propertyType,
      limit = 500 // Limit for performance
    } = req.query;

    let whereClause = {
      latitude: { not: null },
      longitude: { not: null },
      geocoded: true
    };

    // Apply filters
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseInt(minPrice);
      if (maxPrice) whereClause.price.lte = parseInt(maxPrice);
    }

    if (beds) {
      whereClause.beds = { gte: parseFloat(beds) };
    }

    if (baths) {
      whereClause.baths = { gte: parseFloat(baths) };
    }

    if (propertyType) {
      whereClause.propertyType = propertyType;
    }

    // Apply bounds filter if provided
    if (bounds) {
      const [swLng, swLat, neLng, neLat] = bounds.split(',').map(parseFloat);
      
      if (swLng && swLat && neLng && neLat) {
        whereClause.latitude = {
          gte: swLat,
          lte: neLat
        };
        whereClause.longitude = {
          gte: swLng,
          lte: neLng
        };
      }
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      select: {
        id: true,
        price: true,
        beds: true,
        baths: true,
        sqft: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        imageUrl: true,
        propertyType: true,
        latitude: true,
        longitude: true,
        status: true,
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            imageUrl: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: {
        price: 'desc' // Show higher-priced properties first for better map visibility
      }
    });

    res.json({
      properties,
      count: properties.length,
      bounds: bounds || null
    });

  } catch (error) {
    console.error('Map properties error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch map properties',
      message: error.message 
    });
  }
});

/**
 * POST /api/map/search-area
 * Search properties within a drawn polygon or circle
 */
router.post('/search-area', async (req, res) => {
  try {
    const { 
      geometry, // GeoJSON geometry (polygon or circle)
      filters = {} 
    } = req.body;

    if (!geometry || !geometry.coordinates) {
      return res.status(400).json({ error: 'Invalid geometry provided' });
    }

    // Build base where clause
    let whereClause = {
      latitude: { not: null },
      longitude: { not: null },
      geocoded: true
    };

    // Apply additional filters
    if (filters.minPrice || filters.maxPrice) {
      whereClause.price = {};
      if (filters.minPrice) whereClause.price.gte = parseInt(filters.minPrice);
      if (filters.maxPrice) whereClause.price.lte = parseInt(filters.maxPrice);
    }

    if (filters.beds) {
      whereClause.beds = { gte: parseFloat(filters.beds) };
    }

    if (filters.baths) {
      whereClause.baths = { gte: parseFloat(filters.baths) };
    }

    if (filters.propertyType) {
      whereClause.propertyType = filters.propertyType;
    }

    // Get all properties that could potentially be in the area
    // We'll filter by geometry on the application side since Prisma doesn't have built-in geo queries
    const allProperties = await prisma.property.findMany({
      where: whereClause,
      select: {
        id: true,
        price: true,
        beds: true,
        baths: true,
        sqft: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        imageUrl: true,
        propertyType: true,
        latitude: true,
        longitude: true,
        status: true,
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            imageUrl: true
          }
        }
      }
    });

    // Filter properties by geometry
    const propertiesInArea = allProperties.filter(property => {
      if (!property.latitude || !property.longitude) return false;
      
      return isPointInGeometry(
        [property.longitude, property.latitude], 
        geometry
      );
    });

    res.json({
      properties: propertiesInArea,
      count: propertiesInArea.length,
      geometry
    });

  } catch (error) {
    console.error('Area search error:', error);
    res.status(500).json({ 
      error: 'Failed to search area',
      message: error.message 
    });
  }
});

/**
 * POST /api/map/geocode-properties
 * Batch geocode properties that don't have coordinates
 */
router.post('/geocode-properties', async (req, res) => {
  try {
    const { limit = 50 } = req.body;

    // Find properties without coordinates
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
          { geocoded: false }
        ]
      },
      select: {
        id: true,
        address: true,
        city: true,
        state: true,
        zip: true
      },
      take: limit
    });

    if (properties.length === 0) {
      return res.json({ 
        message: 'All properties are already geocoded',
        processed: 0 
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process properties in batches
    for (const property of properties) {
      try {
        const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
        const geocodeResult = await geocodingService.geocodeAddress(fullAddress);

        if (geocodeResult && geocodeResult.latitude && geocodeResult.longitude) {
          // Update property with coordinates
          await prisma.property.update({
            where: { id: property.id },
            data: {
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude,
              geocoded: true
            }
          });

          results.push({
            id: property.id,
            address: fullAddress,
            success: true,
            coordinates: {
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude
            },
            provider: geocodeResult.provider
          });

          successCount++;
        } else {
          results.push({
            id: property.id,
            address: fullAddress,
            success: false,
            error: 'Geocoding failed'
          });
          errorCount++;
        }

        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Geocoding error for property ${property.id}:`, error);
        results.push({
          id: property.id,
          address: `${property.address}, ${property.city}, ${property.state} ${property.zip}`,
          success: false,
          error: error.message
        });
        errorCount++;
      }
    }

    res.json({
      message: `Geocoded ${successCount} properties successfully`,
      processed: properties.length,
      successful: successCount,
      failed: errorCount,
      results
    });

  } catch (error) {
    console.error('Batch geocoding error:', error);
    res.status(500).json({ 
      error: 'Failed to geocode properties',
      message: error.message 
    });
  }
});

/**
 * GET /api/map/bounds
 * Get bounding box for all properties or filtered properties
 */
router.get('/bounds', async (req, res) => {
  try {
    const { 
      minPrice,
      maxPrice,
      beds,
      baths,
      propertyType
    } = req.query;

    let whereClause = {
      latitude: { not: null },
      longitude: { not: null },
      geocoded: true
    };

    // Apply filters
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseInt(minPrice);
      if (maxPrice) whereClause.price.lte = parseInt(maxPrice);
    }

    if (beds) whereClause.beds = { gte: parseFloat(beds) };
    if (baths) whereClause.baths = { gte: parseFloat(baths) };
    if (propertyType) whereClause.propertyType = propertyType;

    const properties = await prisma.property.findMany({
      where: whereClause,
      select: {
        latitude: true,
        longitude: true
      }
    });

    if (properties.length === 0) {
      return res.json({ bounds: null, count: 0 });
    }

    // Calculate bounds
    const lats = properties.map(p => p.latitude);
    const lngs = properties.map(p => p.longitude);

    const bounds = {
      southwest: {
        lat: Math.min(...lats),
        lng: Math.min(...lngs)
      },
      northeast: {
        lat: Math.max(...lats),
        lng: Math.max(...lngs)
      }
    };

    res.json({ bounds, count: properties.length });

  } catch (error) {
    console.error('Bounds calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate bounds',
      message: error.message 
    });
  }
});

/**
 * Helper function to check if a point is inside a geometry
 * Supports polygon and circle geometries
 */
function isPointInGeometry(point, geometry) {
  const [lng, lat] = point;

  if (geometry.type === 'Polygon') {
    return isPointInPolygon([lng, lat], geometry.coordinates[0]);
  }
  
  if (geometry.type === 'Circle') {
    // Custom circle geometry (not standard GeoJSON)
    const { center, radius } = geometry;
    const distance = calculateDistance(lat, lng, center[1], center[0]);
    return distance <= radius / 1000; // Convert radius from meters to kilometers
  }

  return false;
}

/**
 * Point-in-polygon algorithm (ray casting)
 */
function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculate distance between two points in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

module.exports = router;
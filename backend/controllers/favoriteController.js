const prisma = require('../config/prisma');

// Get user's favorites
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes auth middleware sets req.user
    
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            agent: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};

// Add property to favorites
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }
    
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Property already in favorites' });
    }
    
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId
      },
      include: {
        property: {
          include: {
            agent: true
          }
        }
      }
    });
    
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};

// Remove property from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    });
    
    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    
    await prisma.favorite.delete({
      where: {
        id: favorite.id
      }
    });
    
    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
};

// Check if property is favorited
exports.checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;
    
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    });
    
    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
};

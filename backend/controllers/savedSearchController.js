const prisma = require('../config/prisma');

/**
 * Create a new saved search
 * POST /api/saved-searches
 */
const createSavedSearch = async (req, res) => {
  try {
    const { 
      name, 
      filters, 
      emailAlerts = true, 
      frequency = 'daily' 
    } = req.body;
    
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!name || !filters) {
      return res.status(400).json({ error: 'Name and filters are required' });
    }

    // Validate frequency
    const validFrequencies = ['instant', 'daily', 'weekly'];
    if (!validFrequencies.includes(frequency)) {
      return res.status(400).json({ error: 'Invalid frequency. Must be instant, daily, or weekly' });
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        name: name.trim(),
        filters,
        emailAlerts,
        frequency,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Saved search created successfully',
      savedSearch
    });

  } catch (error) {
    console.error('Create saved search error:', error);
    res.status(500).json({ 
      error: 'Failed to create saved search',
      message: 'Failed to process request' 
    });
  }
};

/**
 * Get all saved searches for a user
 * GET /api/saved-searches
 */
const getSavedSearches = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId },
      include: {
        alerts: {
          where: {
            viewed: false
          },
          select: {
            id: true,
            propertyId: true,
            sentAt: true,
            viewed: true
          }
        },
        _count: {
          select: {
            alerts: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Add unread alert count to each search
    const searchesWithCounts = savedSearches.map(search => ({
      ...search,
      unreadAlerts: search.alerts.length,
      totalAlerts: search._count.alerts
    }));

    res.json({
      savedSearches: searchesWithCounts,
      count: savedSearches.length
    });

  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch saved searches',
      message: 'Failed to process request' 
    });
  }
};

/**
 * Get a specific saved search
 * GET /api/saved-searches/:id
 */
const getSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const savedSearch = await prisma.savedSearch.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        alerts: {
          include: {
            property: {
              select: {
                id: true,
                address: true,
                city: true,
                state: true,
                price: true,
                beds: true,
                baths: true,
                sqft: true,
                imageUrl: true,
                propertyType: true
              }
            }
          },
          orderBy: {
            sentAt: 'desc'
          }
        }
      }
    });

    if (!savedSearch) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    res.json({ savedSearch });

  } catch (error) {
    console.error('Get saved search error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch saved search',
      message: 'Failed to process request' 
    });
  }
};

/**
 * Update a saved search
 * PATCH /api/saved-searches/:id
 */
const updateSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, filters, emailAlerts, frequency, isActive } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if saved search exists and belongs to user
    const existingSearch = await prisma.savedSearch.findFirst({
      where: { id, userId }
    });

    if (!existingSearch) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    // Validate frequency if provided
    if (frequency) {
      const validFrequencies = ['instant', 'daily', 'weekly'];
      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({ error: 'Invalid frequency' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (filters !== undefined) updateData.filters = filters;
    if (emailAlerts !== undefined) updateData.emailAlerts = emailAlerts;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedSearch = await prisma.savedSearch.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Saved search updated successfully',
      savedSearch: updatedSearch
    });

  } catch (error) {
    console.error('Update saved search error:', error);
    res.status(500).json({ 
      error: 'Failed to update saved search',
      message: 'Failed to process request' 
    });
  }
};

/**
 * Delete a saved search
 * DELETE /api/saved-searches/:id
 */
const deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if saved search exists and belongs to user
    const existingSearch = await prisma.savedSearch.findFirst({
      where: { id, userId }
    });

    if (!existingSearch) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    await prisma.savedSearch.delete({
      where: { id }
    });

    res.json({ message: 'Saved search deleted successfully' });

  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({ 
      error: 'Failed to delete saved search',
      message: 'Failed to process request' 
    });
  }
};

/**
 * Execute a saved search and return matching properties
 * POST /api/saved-searches/:id/run
 */
const runSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const savedSearch = await prisma.savedSearch.findFirst({
      where: { id, userId }
    });

    if (!savedSearch) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    const filters = savedSearch.filters;
    
    // Build where clause from saved filters
    let whereClause = {
      status: 'Active' // Only show active properties
    };

    // Apply price filters
    if (filters.minPrice || filters.maxPrice) {
      whereClause.price = {};
      if (filters.minPrice) whereClause.price.gte = parseInt(filters.minPrice);
      if (filters.maxPrice) whereClause.price.lte = parseInt(filters.maxPrice);
    }

    // Apply bed/bath filters
    if (filters.beds) whereClause.beds = { gte: parseFloat(filters.beds) };
    if (filters.baths) whereClause.baths = { gte: parseFloat(filters.baths) };
    if (filters.propertyType) whereClause.propertyType = filters.propertyType;

    // Apply location filters
    if (filters.city) whereClause.city = filters.city;
    if (filters.state) whereClause.state = filters.state;

    // Apply coordinate bounds if saved
    if (filters.bounds) {
      const { southwest, northeast } = filters.bounds;
      whereClause.latitude = {
        gte: southwest.lat,
        lte: northeast.lat
      };
      whereClause.longitude = {
        gte: southwest.lng,
        lte: northeast.lng
      };
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            imageUrl: true,
            brokerage: true
          }
        }
      },
      orderBy: {
        price: 'desc'
      }
    });

    // Update last run time
    await prisma.savedSearch.update({
      where: { id },
      data: { lastRun: new Date() }
    });

    res.json({
      properties,
      count: properties.length,
      searchName: savedSearch.name,
      lastRun: new Date()
    });

  } catch (error) {
    console.error('Run saved search error:', error);
    res.status(500).json({ 
      error: 'Failed to run saved search',
      message: 'Failed to process request' 
    });
  }
};

/**
 * Mark search alerts as viewed
 * PATCH /api/saved-searches/:id/alerts/mark-viewed
 */
const markAlertsViewed = async (req, res) => {
  try {
    const { id } = req.params;
    const { alertIds } = req.body; // Optional: specific alert IDs, otherwise mark all
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify saved search belongs to user
    const savedSearch = await prisma.savedSearch.findFirst({
      where: { id, userId }
    });

    if (!savedSearch) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    let whereClause = { savedSearchId: id };
    if (alertIds && alertIds.length > 0) {
      whereClause.id = { in: alertIds };
    }

    const updatedAlerts = await prisma.searchAlert.updateMany({
      where: whereClause,
      data: { viewed: true }
    });

    res.json({
      message: 'Alerts marked as viewed',
      updatedCount: updatedAlerts.count
    });

  } catch (error) {
    console.error('Mark alerts viewed error:', error);
    res.status(500).json({ 
      error: 'Failed to mark alerts as viewed',
      message: 'Failed to process request' 
    });
  }
};

module.exports = {
  createSavedSearch,
  getSavedSearches,
  getSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  runSavedSearch,
  markAlertsViewed
};
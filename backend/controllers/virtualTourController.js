const prisma = require('../config/prisma');

// Get virtual tours for a property
const getPropertyTours = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const tours = await prisma.virtualTour.findMany({
      where: { propertyId },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    res.json(tours);
  } catch (error) {
    console.error('Error fetching virtual tours:', error);
    res.status(500).json({ error: 'Failed to fetch virtual tours' });
  }
};

// Add virtual tour to property
const addVirtualTour = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { type, url, title, description, isPrimary } = req.body;

    // Validate required fields
    if (!type || !url) {
      return res.status(400).json({ 
        error: 'Type and URL are required' 
      });
    }

    // Validate tour type
    const validTypes = ['360photo', 'matterport', 'youtube', 'video'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid tour type. Must be: 360photo, matterport, youtube, or video' 
      });
    }

    // Validate URL format based on type
    if (type === 'matterport' && !url.includes('matterport.com')) {
      return res.status(400).json({ 
        error: 'Matterport URL must be from matterport.com' 
      });
    }

    if (type === 'youtube' && !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return res.status(400).json({ 
        error: 'YouTube URL must be from youtube.com or youtu.be' 
      });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // If setting as primary, unset other primary tours
    if (isPrimary) {
      await prisma.virtualTour.updateMany({
        where: { 
          propertyId,
          isPrimary: true 
        },
        data: { isPrimary: false }
      });
    }

    const tour = await prisma.virtualTour.create({
      data: {
        propertyId,
        type,
        url,
        title,
        description,
        isPrimary: isPrimary || false
      }
    });

    res.status(201).json(tour);
  } catch (error) {
    console.error('Error adding virtual tour:', error);
    res.status(500).json({ error: 'Failed to add virtual tour' });
  }
};

// Update virtual tour
const updateVirtualTour = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, url, title, description, isPrimary } = req.body;

    const updateData = {};
    
    if (type) {
      const validTypes = ['360photo', 'matterport', 'youtube', 'video'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: 'Invalid tour type' 
        });
      }
      updateData.type = type;
    }

    if (url) updateData.url = url;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;

    // If setting as primary, unset other primary tours for this property
    if (isPrimary) {
      const tour = await prisma.virtualTour.findUnique({
        where: { id }
      });

      if (tour) {
        await prisma.virtualTour.updateMany({
          where: { 
            propertyId: tour.propertyId,
            isPrimary: true,
            id: { not: id }
          },
          data: { isPrimary: false }
        });
      }
    }

    const updatedTour = await prisma.virtualTour.update({
      where: { id },
      data: updateData
    });

    res.json(updatedTour);
  } catch (error) {
    console.error('Error updating virtual tour:', error);
    res.status(500).json({ error: 'Failed to update virtual tour' });
  }
};

// Delete virtual tour
const deleteVirtualTour = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.virtualTour.delete({
      where: { id }
    });

    res.json({ message: 'Virtual tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting virtual tour:', error);
    res.status(500).json({ error: 'Failed to delete virtual tour' });
  }
};

// Get all tours for an agent's properties
const getAgentPropertyTours = async (req, res) => {
  try {
    const { agentId } = req.params;

    const tours = await prisma.virtualTour.findMany({
      where: {
        property: {
          agentId
        }
      },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(tours);
  } catch (error) {
    console.error('Error fetching agent property tours:', error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
};

module.exports = {
  getPropertyTours,
  addVirtualTour,
  updateVirtualTour,
  deleteVirtualTour,
  getAgentPropertyTours
};
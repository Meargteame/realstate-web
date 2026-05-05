const prisma = require('../config/prisma');
const { sendEmail } = require('../services/emailService');

// Get all open houses (public)
const getOpenHouses = async (req, res) => {
  try {
    const { city, date, agentId } = req.query;
    
    const where = {
      status: 'scheduled',
      startTime: {
        gte: new Date() // Only future open houses
      }
    };

    if (city) {
      where.property = {
        city: {
          contains: city,
          mode: 'insensitive'
        }
      };
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    if (agentId) {
      where.agentId = agentId;
    }

    const openHouses = await prisma.openHouse.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
            zip: true,
            price: true,
            beds: true,
            baths: true,
            sqft: true,
            imageUrl: true,
            propertyType: true
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            imageUrl: true,
            brokerage: true
          }
        },
        _count: {
          select: {
            rsvps: {
              where: {
                status: 'confirmed'
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    res.json(openHouses);
  } catch (error) {
    console.error('Error fetching open houses:', error);
    res.status(500).json({ error: 'Failed to fetch open houses' });
  }
};

// Get agent's open houses
const getAgentOpenHouses = async (req, res) => {
  try {
    const { agentId } = req.params;

    const openHouses = await prisma.openHouse.findMany({
      where: {
        agentId
      },
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
            imageUrl: true
          }
        },
        _count: {
          select: {
            rsvps: {
              where: {
                status: 'confirmed'
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    res.json(openHouses);
  } catch (error) {
    console.error('Error fetching agent open houses:', error);
    res.status(500).json({ error: 'Failed to fetch agent open houses' });
  }
};

// Create open house
const createOpenHouse = async (req, res) => {
  try {
    const { propertyId, agentId, startTime, endTime, description } = req.body;

    // Validate required fields
    if (!propertyId || !agentId || !startTime || !endTime) {
      return res.status(400).json({ 
        error: 'Property ID, Agent ID, start time, and end time are required' 
      });
    }

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return res.status(400).json({ 
        error: 'End time must be after start time' 
      });
    }

    if (start < new Date()) {
      return res.status(400).json({ 
        error: 'Open house cannot be scheduled in the past' 
      });
    }

    // Check for conflicts
    const conflictingOpenHouse = await prisma.openHouse.findFirst({
      where: {
        agentId,
        status: 'scheduled',
        OR: [
          {
            startTime: {
              lte: end
            },
            endTime: {
              gte: start
            }
          }
        ]
      }
    });

    if (conflictingOpenHouse) {
      return res.status(400).json({ 
        error: 'Agent already has an open house scheduled during this time' 
      });
    }

    const openHouse = await prisma.openHouse.create({
      data: {
        propertyId,
        agentId,
        startTime: start,
        endTime: end,
        description
      },
      include: {
        property: {
          select: {
            address: true,
            city: true,
            state: true
          }
        },
        agent: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(openHouse);
  } catch (error) {
    console.error('Error creating open house:', error);
    res.status(500).json({ error: 'Failed to create open house' });
  }
};

// Update open house
const updateOpenHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, description, status } = req.body;

    const updateData = {};
    
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;

    // Validate times if provided
    if (updateData.startTime && updateData.endTime) {
      if (updateData.startTime >= updateData.endTime) {
        return res.status(400).json({ 
          error: 'End time must be after start time' 
        });
      }
    }

    const openHouse = await prisma.openHouse.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            address: true,
            city: true,
            state: true
          }
        },
        agent: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(openHouse);
  } catch (error) {
    console.error('Error updating open house:', error);
    res.status(500).json({ error: 'Failed to update open house' });
  }
};

// Delete open house
const deleteOpenHouse = async (req, res) => {
  try {
    const { id } = req.params;

    // Get open house with RSVPs for notification
    const openHouse = await prisma.openHouse.findUnique({
      where: { id },
      include: {
        rsvps: {
          where: {
            status: 'confirmed'
          }
        },
        property: {
          select: {
            address: true,
            city: true,
            state: true
          }
        },
        agent: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!openHouse) {
      return res.status(404).json({ error: 'Open house not found' });
    }

    // Delete the open house (cascades to RSVPs)
    await prisma.openHouse.delete({
      where: { id }
    });

    // Send cancellation emails to RSVPs
    for (const rsvp of openHouse.rsvps) {
      try {
        await sendEmail({
          to: rsvp.email,
          subject: 'Open House Cancelled',
          template: 'openHouseCancellation',
          data: {
            name: rsvp.name,
            property: openHouse.property,
            agent: openHouse.agent,
            startTime: openHouse.startTime
          }
        });
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
      }
    }

    res.json({ message: 'Open house cancelled successfully' });
  } catch (error) {
    console.error('Error deleting open house:', error);
    res.status(500).json({ error: 'Failed to cancel open house' });
  }
};

// RSVP to open house
const rsvpToOpenHouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, guests, message } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Name and email are required' 
      });
    }

    // Check if open house exists and is scheduled
    const openHouse = await prisma.openHouse.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            address: true,
            city: true,
            state: true,
            price: true
          }
        },
        agent: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!openHouse) {
      return res.status(404).json({ error: 'Open house not found' });
    }

    if (openHouse.status !== 'scheduled') {
      return res.status(400).json({ error: 'Open house is not available for RSVP' });
    }

    if (new Date(openHouse.startTime) < new Date()) {
      return res.status(400).json({ error: 'Cannot RSVP to past open house' });
    }

    // Create or update RSVP
    const rsvp = await prisma.rSVP.upsert({
      where: {
        openHouseId_email: {
          openHouseId: id,
          email
        }
      },
      update: {
        name,
        phone,
        guests: guests || 1,
        message,
        status: 'confirmed'
      },
      create: {
        openHouseId: id,
        name,
        email,
        phone,
        guests: guests || 1,
        message,
        status: 'confirmed'
      }
    });

    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: 'Open House RSVP Confirmation',
        template: 'openHouseConfirmation',
        data: {
          name,
          property: openHouse.property,
          agent: openHouse.agent,
          startTime: openHouse.startTime,
          endTime: openHouse.endTime,
          guests: guests || 1
        }
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    res.status(201).json(rsvp);
  } catch (error) {
    console.error('Error creating RSVP:', error);
    res.status(500).json({ error: 'Failed to RSVP to open house' });
  }
};

// Get RSVPs for open house
const getOpenHouseRSVPs = async (req, res) => {
  try {
    const { id } = req.params;

    const rsvps = await prisma.rSVP.findMany({
      where: {
        openHouseId: id,
        status: 'confirmed'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(rsvps);
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    res.status(500).json({ error: 'Failed to fetch RSVPs' });
  }
};

module.exports = {
  getOpenHouses,
  getAgentOpenHouses,
  createOpenHouse,
  updateOpenHouse,
  deleteOpenHouse,
  rsvpToOpenHouse,
  getOpenHouseRSVPs
};
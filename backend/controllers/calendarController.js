const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to serialize BigInt
const serializeBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};

// =====================================================
// CALENDAR EVENTS
// =====================================================

// Get all events for an agent
exports.getAgentEvents = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { startDate, endDate, eventType } = req.query;

    const where = { agentId };

    // Filter by date range
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Filter by event type
    if (eventType) {
      where.eventType = eventType;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' }
    });

    res.json(serializeBigInt(events));
  } catch (error) {
    console.error('Error fetching agent events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(serializeBigInt(event));
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Create event
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      eventType,
      allDay,
      agentId,
      leadId,
      propertyId,
      isRecurring,
      recurrenceRule,
      reminderMinutes
    } = req.body;

    // Validation
    if (!title || !startTime || !endTime || !eventType || !agentId) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, startTime, endTime, eventType, agentId' 
      });
    }

    // Validate event type
    const validEventTypes = ['showing', 'appointment', 'open_house', 'meeting', 'personal'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ 
        error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}` 
      });
    }

    // Check for conflicts
    const conflicts = await prisma.calendarEvent.findMany({
      where: {
        agentId,
        status: { not: 'cancelled' },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          }
        ]
      }
    });

    if (conflicts.length > 0) {
      return res.status(409).json({ 
        error: 'Time slot conflict',
        conflicts: serializeBigInt(conflicts)
      });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        eventType,
        allDay: allDay || false,
        agentId,
        leadId,
        propertyId,
        isRecurring: isRecurring || false,
        recurrenceRule,
        reminderMinutes: reminderMinutes || [15, 60]
      }
    });

    res.status(201).json(serializeBigInt(event));
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: updateData
    });

    res.json(serializeBigInt(event));
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.calendarEvent.delete({
      where: { id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Cancel event (soft delete)
exports.cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    res.json(serializeBigInt(event));
  } catch (error) {
    console.error('Error cancelling event:', error);
    res.status(500).json({ error: 'Failed to cancel event' });
  }
};

// =====================================================
// AVAILABILITY
// =====================================================

// Get agent availability
exports.getAvailability = async (req, res) => {
  try {
    const { agentId } = req.params;

    const availability = await prisma.availability.findMany({
      where: { agentId },
      orderBy: { dayOfWeek: 'asc' }
    });

    res.json(serializeBigInt(availability));
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

// Set agent availability
exports.setAvailability = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { schedule } = req.body; // Array of { dayOfWeek, startTime, endTime, isAvailable }

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ error: 'Schedule must be an array' });
    }

    // Delete existing availability
    await prisma.availability.deleteMany({
      where: { agentId }
    });

    // Create new availability
    const availability = await prisma.availability.createMany({
      data: schedule.map(slot => ({
        agentId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable !== false
      }))
    });

    // Fetch and return the created availability
    const created = await prisma.availability.findMany({
      where: { agentId },
      orderBy: { dayOfWeek: 'asc' }
    });

    res.json(serializeBigInt(created));
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ error: 'Failed to set availability' });
  }
};

// Get available time slots for a specific date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { date, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Get agent's availability for this day
    const availability = await prisma.availability.findMany({
      where: {
        agentId,
        dayOfWeek,
        isAvailable: true
      }
    });

    if (availability.length === 0) {
      return res.json({ slots: [] });
    }

    // Get existing events for this day
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await prisma.calendarEvent.findMany({
      where: {
        agentId,
        status: { not: 'cancelled' },
        startTime: { gte: startOfDay, lte: endOfDay }
      }
    });

    // Generate available slots
    const slots = [];
    for (const avail of availability) {
      const [startHour, startMin] = avail.startTime.split(':').map(Number);
      const [endHour, endMin] = avail.endTime.split(':').map(Number);

      let currentTime = new Date(requestedDate);
      currentTime.setHours(startHour, startMin, 0, 0);

      const endTime = new Date(requestedDate);
      endTime.setHours(endHour, endMin, 0, 0);

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);

        if (slotEnd <= endTime) {
          // Check if slot conflicts with existing events
          const hasConflict = events.some(event => {
            return (
              (currentTime >= event.startTime && currentTime < event.endTime) ||
              (slotEnd > event.startTime && slotEnd <= event.endTime) ||
              (currentTime <= event.startTime && slotEnd >= event.endTime)
            );
          });

          if (!hasConflict) {
            slots.push({
              startTime: currentTime.toISOString(),
              endTime: slotEnd.toISOString(),
              available: true
            });
          }
        }

        currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-minute intervals
      }
    }

    res.json({ slots: serializeBigInt(slots) });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
};

// =====================================================
// BOOKING REQUESTS
// =====================================================

// Get booking requests for an agent
exports.getBookingRequests = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.query;

    const where = { agentId };
    if (status) {
      where.status = status;
    }

    const requests = await prisma.bookingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(serializeBigInt(requests));
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({ error: 'Failed to fetch booking requests' });
  }
};

// Create booking request (public endpoint)
exports.createBookingRequest = async (req, res) => {
  try {
    const {
      agentId,
      leadName,
      leadEmail,
      leadPhone,
      propertyId,
      requestedDate,
      requestedTime,
      duration,
      message
    } = req.body;

    // Validation
    if (!agentId || !leadName || !leadEmail || !requestedDate || !requestedTime) {
      return res.status(400).json({ 
        error: 'Missing required fields: agentId, leadName, leadEmail, requestedDate, requestedTime' 
      });
    }

    const request = await prisma.bookingRequest.create({
      data: {
        agentId,
        leadName,
        leadEmail,
        leadPhone,
        propertyId,
        requestedDate: new Date(requestedDate),
        requestedTime,
        duration: duration || 60,
        message
      }
    });

    res.status(201).json(serializeBigInt(request));
  } catch (error) {
    console.error('Error creating booking request:', error);
    res.status(500).json({ error: 'Failed to create booking request' });
  }
};

// Confirm booking request
exports.confirmBookingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, location } = req.body;

    const bookingRequest = await prisma.bookingRequest.findUnique({
      where: { id }
    });

    if (!bookingRequest) {
      return res.status(404).json({ error: 'Booking request not found' });
    }

    // Create calendar event
    const event = await prisma.calendarEvent.create({
      data: {
        title: `Appointment with ${bookingRequest.leadName}`,
        description: bookingRequest.message,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        eventType: 'appointment',
        agentId: bookingRequest.agentId,
        propertyId: bookingRequest.propertyId
      }
    });

    // Update booking request
    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmedEventId: event.id
      }
    });

    res.json({
      bookingRequest: serializeBigInt(updated),
      event: serializeBigInt(event)
    });
  } catch (error) {
    console.error('Error confirming booking request:', error);
    res.status(500).json({ error: 'Failed to confirm booking request' });
  }
};

// Reject booking request
exports.rejectBookingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.bookingRequest.update({
      where: { id },
      data: { status: 'rejected' }
    });

    res.json(serializeBigInt(request));
  } catch (error) {
    console.error('Error rejecting booking request:', error);
    res.status(500).json({ error: 'Failed to reject booking request' });
  }
};

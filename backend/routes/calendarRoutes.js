const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticate } = require('../middleware/auth');

// =====================================================
// CALENDAR EVENTS
// =====================================================

// Get all events for an agent
router.get('/events/agent/:agentId', authenticate, calendarController.getAgentEvents);

// Get single event
router.get('/events/:id', authenticate, calendarController.getEvent);

// Create event
router.post('/events', authenticate, calendarController.createEvent);

// Update event
router.put('/events/:id', authenticate, calendarController.updateEvent);

// Delete event
router.delete('/events/:id', authenticate, calendarController.deleteEvent);

// Cancel event (soft delete)
router.patch('/events/:id/cancel', authenticate, calendarController.cancelEvent);

// =====================================================
// AVAILABILITY
// =====================================================

// Get agent availability
router.get('/availability/:agentId', calendarController.getAvailability);

// Set agent availability
router.post('/availability/:agentId', authenticate, calendarController.setAvailability);

// Get available time slots for a specific date
router.get('/availability/:agentId/slots', calendarController.getAvailableSlots);

// =====================================================
// BOOKING REQUESTS
// =====================================================

// Get booking requests for an agent
router.get('/bookings/agent/:agentId', authenticate, calendarController.getBookingRequests);

// Create booking request (public endpoint - no auth required)
router.post('/bookings', calendarController.createBookingRequest);

// Confirm booking request
router.post('/bookings/:id/confirm', authenticate, calendarController.confirmBookingRequest);

// Reject booking request
router.post('/bookings/:id/reject', authenticate, calendarController.rejectBookingRequest);

module.exports = router;

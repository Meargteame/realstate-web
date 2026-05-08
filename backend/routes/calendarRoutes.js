const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticateToken } = require('../middleware/auth');

// =====================================================
// CALENDAR EVENTS
// =====================================================

// Get all events for an agent
router.get('/events/agent/:agentId', authenticateToken, calendarController.getAgentEvents);

// Get single event
router.get('/events/:id', authenticateToken, calendarController.getEvent);

// Create event
router.post('/events', authenticateToken, calendarController.createEvent);

// Update event
router.put('/events/:id', authenticateToken, calendarController.updateEvent);

// Delete event
router.delete('/events/:id', authenticateToken, calendarController.deleteEvent);

// Cancel event (soft delete)
router.patch('/events/:id/cancel', authenticateToken, calendarController.cancelEvent);

// =====================================================
// AVAILABILITY
// =====================================================

// Get agent availability
router.get('/availability/:agentId', calendarController.getAvailability);

// Set agent availability
router.post('/availability/:agentId', authenticateToken, calendarController.setAvailability);

// Get available time slots for a specific date
router.get('/availability/:agentId/slots', calendarController.getAvailableSlots);

// =====================================================
// BOOKING REQUESTS
// =====================================================

// Get booking requests for an agent
router.get('/bookings/agent/:agentId', authenticateToken, calendarController.getBookingRequests);

// Create booking request (public endpoint - no auth required)
router.post('/bookings', calendarController.createBookingRequest);

// Confirm booking request
router.post('/bookings/:id/confirm', authenticateToken, calendarController.confirmBookingRequest);

// Reject booking request
router.post('/bookings/:id/reject', authenticateToken, calendarController.rejectBookingRequest);

module.exports = router;

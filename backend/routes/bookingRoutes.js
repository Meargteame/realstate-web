const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/bookings/user/:userId - bookings made by a user (matched by email)
router.get('/user/:userId', authenticateToken, calendarController.getUserBookings);

module.exports = router;

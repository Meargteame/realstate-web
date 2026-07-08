const express = require('express');
const router = express.Router();
const {
  getOpenHouses,
  getAgentOpenHouses,
  createOpenHouse,
  updateOpenHouse,
  deleteOpenHouse,
  rsvpToOpenHouse,
  getOpenHouseRSVPs
} = require('../controllers/openHouseController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', getOpenHouses);
router.post('/:id/rsvp', rsvpToOpenHouse);

// Agent routes
router.get('/agent/:agentId', authenticateToken, getAgentOpenHouses);
router.post('/', authenticateToken, createOpenHouse);
router.patch('/:id', authenticateToken, updateOpenHouse);
router.delete('/:id', authenticateToken, deleteOpenHouse);
router.get('/:id/rsvps', authenticateToken, getOpenHouseRSVPs);

module.exports = router;
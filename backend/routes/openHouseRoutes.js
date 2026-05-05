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

// Public routes
router.get('/', getOpenHouses);
router.post('/:id/rsvp', rsvpToOpenHouse);

// Agent routes
router.get('/agent/:agentId', getAgentOpenHouses);
router.post('/', createOpenHouse);
router.patch('/:id', updateOpenHouse);
router.delete('/:id', deleteOpenHouse);
router.get('/:id/rsvps', getOpenHouseRSVPs);

module.exports = router;
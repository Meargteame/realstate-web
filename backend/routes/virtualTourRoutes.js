const express = require('express');
const router = express.Router();
const {
  getPropertyTours,
  addVirtualTour,
  updateVirtualTour,
  deleteVirtualTour,
  getAgentPropertyTours
} = require('../controllers/virtualTourController');

// Property tour routes
router.get('/property/:propertyId', getPropertyTours);
router.post('/property/:propertyId', addVirtualTour);

// Individual tour routes
router.patch('/:id', updateVirtualTour);
router.delete('/:id', deleteVirtualTour);

// Agent routes
router.get('/agent/:agentId', getAgentPropertyTours);

module.exports = router;
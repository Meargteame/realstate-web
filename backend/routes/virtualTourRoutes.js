const express = require('express');
const router = express.Router();
const {
  getPropertyTours,
  addVirtualTour,
  updateVirtualTour,
  deleteVirtualTour,
  getAgentPropertyTours
} = require('../controllers/virtualTourController');
const { authenticateToken } = require('../middleware/auth');

// Property tour routes
router.get('/property/:propertyId', getPropertyTours);
router.post('/property/:propertyId', authenticateToken, addVirtualTour);

// Individual tour routes
router.patch('/:id', authenticateToken, updateVirtualTour);
router.delete('/:id', authenticateToken, deleteVirtualTour);

// Agent routes
router.get('/agent/:agentId', authenticateToken, getAgentPropertyTours);

module.exports = router;
const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, opportunityController.getOpportunities);
router.post('/', authenticateToken, opportunityController.createOpportunity);
router.patch('/:id', authenticateToken, opportunityController.updateOpportunity);
router.delete('/:id', authenticateToken, opportunityController.deleteOpportunity);

module.exports = router;

const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');

router.get('/', opportunityController.getOpportunities);
router.post('/', opportunityController.createOpportunity);
router.patch('/:id', opportunityController.updateOpportunity);
router.delete('/:id', opportunityController.deleteOpportunity);

module.exports = router;

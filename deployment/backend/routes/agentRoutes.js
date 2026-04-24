const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const leadController = require('../controllers/leadController');

router.get('/', agentController.getAgents);
router.get('/:id', agentController.getAgentById);
router.patch('/:id', agentController.updateAgent);
router.get('/:agentId/leads', leadController.getLeadsByAgent);

module.exports = router;

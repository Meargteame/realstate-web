const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const leadController = require('../controllers/leadController');

router.get('/', agentController.getAgents);
router.post('/', agentController.createAgent);
router.get('/:id', agentController.getAgentById);
router.patch('/:id', agentController.updateAgent);
router.patch('/:id/office-hours', agentController.updateOfficeHours);
router.patch('/:id/password', agentController.changePassword);
router.get('/:agentId/leads', leadController.getLeadsByAgent);

module.exports = router;

const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const leadController = require('../controllers/leadController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', agentController.getAgents);
router.post('/', authenticateToken, agentController.createAgent);
router.get('/:id', agentController.getAgentById);
router.patch('/:id', authenticateToken, agentController.updateAgent);
router.patch('/:id/office-hours', authenticateToken, agentController.updateOfficeHours);
router.patch('/:id/password', authenticateToken, agentController.changePassword);
router.get('/:agentId/leads', authenticateToken, leadController.getLeadsByAgent);

module.exports = router;

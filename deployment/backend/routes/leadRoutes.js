const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

router.get('/export', leadController.exportLeads);
router.post('/', leadController.createLead);
router.get('/', leadController.getAllLeads);
router.patch('/:id/status', leadController.updateLeadStatus);
router.patch('/:id/favorite', leadController.toggleFavorite);
router.patch('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createSavedSearch,
  getSavedSearches,
  getSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  runSavedSearch,
  markAlertsViewed
} = require('../controllers/savedSearchController');

router.post('/', authenticateToken, createSavedSearch);
router.get('/', authenticateToken, getSavedSearches);
router.get('/:id', authenticateToken, getSavedSearch);
router.patch('/:id', authenticateToken, updateSavedSearch);
router.delete('/:id', authenticateToken, deleteSavedSearch);
router.post('/:id/run', authenticateToken, runSavedSearch);
router.patch('/:id/alerts/mark-viewed', authenticateToken, markAlertsViewed);

module.exports = router;
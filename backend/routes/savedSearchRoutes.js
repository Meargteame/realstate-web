const express = require('express');
const router = express.Router();
const {
  createSavedSearch,
  getSavedSearches,
  getSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  runSavedSearch,
  markAlertsViewed
} = require('../controllers/savedSearchController');

// Middleware to simulate authentication (replace with real auth middleware)
const authenticateUser = (req, res, next) => {
  // For development, use a test user
  // In production, this should validate JWT tokens
  const testUser = {
    id: 'u4', // Test user from seed data
    email: 'test@example.com',
    name: 'Test User'
  };
  
  req.user = testUser;
  next();
};

/**
 * @route   POST /api/saved-searches
 * @desc    Create a new saved search
 * @access  Private
 */
router.post('/', authenticateUser, createSavedSearch);

/**
 * @route   GET /api/saved-searches
 * @desc    Get all saved searches for authenticated user
 * @access  Private
 */
router.get('/', authenticateUser, getSavedSearches);

/**
 * @route   GET /api/saved-searches/:id
 * @desc    Get a specific saved search
 * @access  Private
 */
router.get('/:id', authenticateUser, getSavedSearch);

/**
 * @route   PATCH /api/saved-searches/:id
 * @desc    Update a saved search
 * @access  Private
 */
router.patch('/:id', authenticateUser, updateSavedSearch);

/**
 * @route   DELETE /api/saved-searches/:id
 * @desc    Delete a saved search
 * @access  Private
 */
router.delete('/:id', authenticateUser, deleteSavedSearch);

/**
 * @route   POST /api/saved-searches/:id/run
 * @desc    Execute a saved search and return matching properties
 * @access  Private
 */
router.post('/:id/run', authenticateUser, runSavedSearch);

/**
 * @route   PATCH /api/saved-searches/:id/alerts/mark-viewed
 * @desc    Mark search alerts as viewed
 * @access  Private
 */
router.patch('/:id/alerts/mark-viewed', authenticateUser, markAlertsViewed);

module.exports = router;
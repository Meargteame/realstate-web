const express = require('express');
const router = express.Router();
const {
  getAgentReviews,
  submitReview,
  respondToReview,
  reportReview,
  getAgentReviewsForManagement
} = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/agent/:agentId', getAgentReviews);
router.post('/agent/:agentId', submitReview);
router.post('/:id/report', reportReview);

// Agent management routes
router.get('/agent/:agentId/manage', authenticateToken, getAgentReviewsForManagement);
router.patch('/:id/respond', authenticateToken, respondToReview);

module.exports = router;
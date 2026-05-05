const express = require('express');
const router = express.Router();
const {
  getAgentReviews,
  submitReview,
  respondToReview,
  reportReview,
  getAgentReviewsForManagement
} = require('../controllers/reviewController');

// Public routes
router.get('/agent/:agentId', getAgentReviews);
router.post('/agent/:agentId', submitReview);
router.post('/:id/report', reportReview);

// Agent management routes
router.get('/agent/:agentId/manage', getAgentReviewsForManagement);
router.patch('/:id/respond', respondToReview);

module.exports = router;
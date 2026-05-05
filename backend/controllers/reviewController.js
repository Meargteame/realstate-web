const prisma = require('../config/prisma');
const { sendEmail } = require('../services/emailService');

// Get reviews for an agent
const getAgentReviews = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { page = 1, limit = 10, transactionType } = req.query;

    const where = {
      agentId,
      status: 'published'
    };

    if (transactionType) {
      where.transactionType = transactionType;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.review.count({ where });

    // Calculate rating statistics
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        agentId,
        status: 'published'
      },
      _count: {
        rating: true
      }
    });

    const avgRating = await prisma.review.aggregate({
      where: {
        agentId,
        status: 'published'
      },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews: avgRating._count.rating || 0,
        ratingBreakdown: ratingStats.reduce((acc, stat) => {
          acc[stat.rating] = stat._count.rating;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching agent reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Submit a review
const submitReview = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { 
      reviewerName, 
      reviewerEmail, 
      rating, 
      comment, 
      transactionType 
    } = req.body;

    // Validate required fields
    if (!reviewerName || !reviewerEmail || !rating || !comment || !transactionType) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Validate transaction type
    const validTypes = ['buyer', 'seller', 'rental'];
    if (!validTypes.includes(transactionType)) {
      return res.status(400).json({ 
        error: 'Invalid transaction type' 
      });
    }

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Check for duplicate review (same email for same agent)
    const existingReview = await prisma.review.findFirst({
      where: {
        agentId,
        reviewerEmail,
        status: { not: 'removed' }
      }
    });

    if (existingReview) {
      return res.status(400).json({ 
        error: 'You have already reviewed this agent' 
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        agentId,
        reviewerName,
        reviewerEmail,
        rating,
        comment,
        transactionType,
        verified: false, // Could implement email verification
        status: 'published'
      }
    });

    // Update agent's average rating
    await updateAgentRating(agentId);

    // Send notification to agent
    try {
      await sendEmail({
        to: agent.email,
        subject: 'New Review Received',
        template: 'newReview',
        data: {
          agentName: agent.name,
          reviewerName,
          rating,
          comment,
          transactionType
        }
      });
    } catch (emailError) {
      console.error('Error sending review notification:', emailError);
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

// Agent response to review
const respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentResponse } = req.body;

    if (!agentResponse || agentResponse.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Response cannot be empty' 
      });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { agentResponse: agentResponse.trim() }
    });

    res.json(review);
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({ error: 'Failed to respond to review' });
  }
};

// Report a review
const reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ 
        error: 'Reason for reporting is required' 
      });
    }

    // Update review status to flagged
    const review = await prisma.review.update({
      where: { id },
      data: { status: 'flagged' }
    });

    // In a real app, you'd notify moderators here
    console.log(`Review ${id} flagged for: ${reason}`);

    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).json({ error: 'Failed to report review' });
  }
};

// Get agent's reviews for management
const getAgentReviewsForManagement = async (req, res) => {
  try {
    const { agentId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching agent reviews for management:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Helper function to update agent's average rating
const updateAgentRating = async (agentId) => {
  try {
    const stats = await prisma.review.aggregate({
      where: {
        agentId,
        status: 'published'
      },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        rating: stats._avg.rating || 0,
        reviews: stats._count.rating || 0
      }
    });
  } catch (error) {
    console.error('Error updating agent rating:', error);
  }
};

module.exports = {
  getAgentReviews,
  submitReview,
  respondToReview,
  reportReview,
  getAgentReviewsForManagement
};
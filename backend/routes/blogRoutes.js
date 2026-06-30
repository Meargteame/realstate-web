const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticateToken } = require('../middleware/auth');

// Admin-only check middleware
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Public routes
router.get('/', blogController.getBlogPosts);
router.get('/categories', blogController.getCategories);
router.get('/tags', blogController.getTags);
router.get('/:slug', blogController.getBlogPostBySlug);

// Protected routes — require authentication + admin role
router.post('/', authenticateToken, isAdmin, blogController.createBlogPost);
router.patch('/:id', authenticateToken, isAdmin, blogController.updateBlogPost);
router.delete('/:id', authenticateToken, isAdmin, blogController.deleteBlogPost);

module.exports = router;

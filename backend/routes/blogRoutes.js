const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Public routes
router.get('/', blogController.getBlogPosts);
router.get('/categories', blogController.getCategories);
router.get('/tags', blogController.getTags);
router.get('/:slug', blogController.getBlogPostBySlug);

// Protected routes (would need auth middleware in production)
router.post('/', blogController.createBlogPost);
router.patch('/:id', blogController.updateBlogPost);
router.delete('/:id', blogController.deleteBlogPost);

module.exports = router;

const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/:propertyId', favoriteController.removeFavorite);
router.get('/check/:propertyId', favoriteController.checkFavorite);

module.exports = router;

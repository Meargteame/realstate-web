const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', propertyController.getProperties);
router.get('/city/:city', propertyController.getPropertiesByCity);
router.get('/saved', propertyController.getSavedProperties);

// Phase 7D: Comparisons (must be before /:id to avoid route conflicts)
router.get('/comparisons', propertyController.getComparisons);
router.post('/compare', authenticateToken, propertyController.createComparison);
router.get('/compare/:id', propertyController.getComparisonById);
router.delete('/compare/:id', authenticateToken, propertyController.deleteComparison);

router.get('/:id', propertyController.getPropertyById);
router.get('/:id/similar', propertyController.getSimilarProperties);
router.get('/:id/price-history', propertyController.getPriceHistory);
router.post('/:id/price-history', authenticateToken, propertyController.addPriceChange);
router.post('/:id/share', propertyController.trackShare);
router.post('/', authenticateToken, propertyController.createProperty);
router.patch('/:id', authenticateToken, propertyController.updateProperty);
router.delete('/:id', authenticateToken, propertyController.deleteProperty);

module.exports = router;

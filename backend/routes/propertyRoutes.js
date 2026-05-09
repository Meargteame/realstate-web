const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getProperties);
router.get('/city/:city', propertyController.getPropertiesByCity);

// Phase 7D: Comparisons (must be before /:id to avoid route conflicts)
router.get('/comparisons', propertyController.getComparisons);
router.post('/compare', propertyController.createComparison);
router.get('/compare/:id', propertyController.getComparisonById);
router.delete('/compare/:id', propertyController.deleteComparison);

router.get('/:id', propertyController.getPropertyById);
router.get('/:id/similar', propertyController.getSimilarProperties);
router.get('/:id/price-history', propertyController.getPriceHistory);
router.post('/:id/price-history', propertyController.addPriceChange);
router.post('/', propertyController.createProperty);
router.patch('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;

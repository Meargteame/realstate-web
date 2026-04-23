const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getProperties);
router.get('/city/:city', propertyController.getPropertiesByCity);
router.get('/:id', propertyController.getPropertyById);
router.post('/', propertyController.createProperty);

module.exports = router;

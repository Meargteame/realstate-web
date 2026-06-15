const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Public marketing stats — no auth required.
router.get('/', statsController.getPublicStats);
router.get('/trending-cities', statsController.getTrendingCities);

module.exports = router;

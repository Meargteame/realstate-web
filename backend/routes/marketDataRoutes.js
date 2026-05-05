const express = require('express');
const router = express.Router();
const {
  getMarketData,
  getCityMarketTrends,
  compareProperties,
  getNeighborhoodStats
} = require('../controllers/marketDataController');

// Market data routes
router.get('/zip/:zipCode', getMarketData);
router.get('/city/:city/:state', getCityMarketTrends);
router.get('/neighborhood/:zipCode', getNeighborhoodStats);

// Property comparison
router.post('/compare', compareProperties);

module.exports = router;
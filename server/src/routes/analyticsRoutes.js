const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  recordProductView,
  getProductMetrics,
  getArtisanAnalytics,
  getInternGrowthView,
} = require('../controllers/analyticsController');

router.post('/products/:productId/view', recordProductView);
router.get('/products/:productId', getProductMetrics);
router.get('/artisan', requireAuth, getArtisanAnalytics);
router.get('/intern/client/:clientId', requireAuth, getInternGrowthView);

module.exports = router;

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getArtisanOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', requireAuth, createOrder);
router.get('/my', requireAuth, getMyOrders);
router.get('/artisan/my', requireAuth, getArtisanOrders);
router.get('/:id', requireAuth, getOrderById);
router.put('/:id/status', requireAuth, updateOrderStatus);

module.exports = router;

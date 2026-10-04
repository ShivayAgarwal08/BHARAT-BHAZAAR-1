const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

router.get('/', requireAuth, getCart);
router.post('/items', requireAuth, addToCart);
router.put('/items/:id', requireAuth, updateCartQuantity);
router.delete('/items/:id', requireAuth, removeFromCart);
router.delete('/', requireAuth, clearCart);

module.exports = router;

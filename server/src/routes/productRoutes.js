const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { upload, processImage } = require('../middleware/uploadMiddleware');
const productController = require('../controllers/productController');
const aiController = require('../controllers/aiController');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (Artisan only)
router.post('/generate', requireAuth, aiController.generateProduct);

router.post(
  '/',
  requireAuth,
  upload.single('image'),
  processImage,
  productController.createProduct
);

router.get('/my/products', requireAuth, productController.getMyProducts);

router.put(
  '/:id',
  requireAuth,
  upload.single('image'),
  processImage,
  productController.updateProduct
);

router.delete('/:id', requireAuth, productController.deleteProduct);

module.exports = router;

const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Serve an image by ID
router.get('/:id', imageController.getImage);

module.exports = router;

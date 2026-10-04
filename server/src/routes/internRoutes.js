const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  getAllInterns,
  getInternById,
  updateMyProfile,
} = require('../controllers/internController');

router.get('/', getAllInterns);
router.get('/:id', getInternById);
router.put('/profile', requireAuth, updateMyProfile);

module.exports = router;

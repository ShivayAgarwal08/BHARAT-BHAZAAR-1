const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const applicationController = require('../controllers/applicationController');

// Intern routes
router.post('/', requireAuth, applicationController.applyToRequest);
router.get('/my', requireAuth, applicationController.getMyApplications);

// Artisan routes
router.put('/:id/accept', requireAuth, applicationController.acceptApplication);

module.exports = router;

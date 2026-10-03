const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const requestController = require('../controllers/requestController');

// Public or Intern routes
router.get('/', requestController.getAllOpenRequests); // Anyone can see open requests
router.get('/:id', requestController.getRequestById);

// Artisan only routes
router.post('/', requireAuth, requestController.createRequest);
router.get('/my/requests', requireAuth, requestController.getMyRequests);
router.put('/:id', requireAuth, requestController.updateRequest);
router.delete('/:id', requireAuth, requestController.deleteRequest);
router.get('/:id/applications', requireAuth, requestController.getRequestApplications);

module.exports = router;

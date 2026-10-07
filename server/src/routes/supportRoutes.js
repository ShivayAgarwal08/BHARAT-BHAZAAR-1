const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const supportController = require('../controllers/supportController');

router.post('/', requireAuth, supportController.createTicket);
router.get('/my', requireAuth, supportController.getMyTickets);

module.exports = router;

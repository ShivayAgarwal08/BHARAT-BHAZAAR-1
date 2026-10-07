const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public route to submit an artisan assistance request
router.post('/artisan', async (req, res) => {
  const { name, phone, language, location, state, craft, message } = req.body;

  if (!name || !phone || !language || !location || !state || !craft) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const request = await prisma.artisanAssistanceRequest.create({
      data: {
        name,
        phone,
        language,
        location,
        state,
        craft,
        message,
      },
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error('Assistance request error:', error);
    res.status(500).json({ error: 'Failed to submit assistance request' });
  }
});

// Admin route to view all assistance requests
router.get('/admin/requests', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const requests = await prisma.artisanAssistanceRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    console.error('Fetch assistance requests error:', error);
    res.status(500).json({ error: 'Failed to fetch assistance requests' });
  }
});

// Admin route to resolve/update an assistance request status
router.put('/admin/requests/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const request = await prisma.artisanAssistanceRequest.update({
      where: { id: req.params.id },
      data: { status, notes }
    });
    res.json(request);
  } catch (error) {
    console.error('Update assistance request error:', error);
    res.status(500).json({ error: 'Failed to update assistance request' });
  }
});

module.exports = router;

const prisma = require('../prisma');

const createTicket = async (req, res) => {
  const { category, message, priority, projectId } = req.body;

  if (!category || !message) {
    return res.status(400).json({ error: 'Category and message are required' });
  }

  try {
    if (projectId) {
      // Verify project authorization
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { artisan: true, intern: true }
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      if (project.artisan.userId !== req.user.id && project.intern.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized for this project' });
      }
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.id,
        projectId: projectId || null,
        category,
        message,
        priority: priority || 'NORMAL',
        status: 'OPEN'
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTicket,
  getMyTickets
};

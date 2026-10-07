const prisma = require('../prisma');

const createRequest = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can create manager requests' });
  }

  const { title, description, category, budget, deadline } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description, and category are required' });
  }

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

    const newRequest = await prisma.managerRequest.create({
      data: {
        artisanId: artisan.id,
        title,
        description,
        category,
        budget,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyRequests = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

    const requests = await prisma.managerRequest.findMany({
      where: { 
        artisanId: artisan.id,
        category: { not: 'Direct Hire' } 
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllOpenRequests = async (req, res) => {
  try {
    const { status = 'OPEN', page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [requests, total] = await Promise.all([
      prisma.managerRequest.findMany({
        where: { status },
        skip,
        take,
        include: {
          artisan: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.managerRequest.count({
        where: { status },
      }),
    ]);

    res.json({
      data: requests,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRequestById = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await prisma.managerRequest.findUnique({
      where: { id },
      include: {
        artisan: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRequest = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { id } = req.params;
  const { title, description, category, budget, deadline } = req.body;

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    const existingReq = await prisma.managerRequest.findUnique({ where: { id } });

    if (!existingReq) return res.status(404).json({ error: 'Not found' });
    if (existingReq.artisanId !== artisan.id) return res.status(403).json({ error: 'Unauthorized' });
    if (existingReq.status !== 'OPEN') return res.status(400).json({ error: 'Can only edit open requests' });

    const updated = await prisma.managerRequest.update({
      where: { id },
      data: {
        title,
        description,
        category,
        budget,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRequest = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { id } = req.params;

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    const existingReq = await prisma.managerRequest.findUnique({ where: { id } });

    if (!existingReq) return res.status(404).json({ error: 'Not found' });
    if (existingReq.artisanId !== artisan.id) return res.status(403).json({ error: 'Unauthorized' });

    // Assuming we just set status to CANCELLED instead of deleting physically if there are applications
    await prisma.managerRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Request cancelled' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRequestApplications = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { id } = req.params;

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    const request = await prisma.managerRequest.findUnique({ where: { id } });

    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.artisanId !== artisan.id) return res.status(403).json({ error: 'Unauthorized' });

    const applications = await prisma.application.findMany({
      where: { requestId: id },
      include: {
        intern: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllOpenRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestApplications,
};

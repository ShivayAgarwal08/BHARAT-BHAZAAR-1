const prisma = require('../prisma');

const applyToRequest = async (req, res) => {
  if (req.user.role !== 'INTERN') {
    return res.status(403).json({ error: 'Only interns can apply to requests' });
  }

  const { requestId, message } = req.body;

  if (!requestId || !message) {
    return res.status(400).json({ error: 'Request ID and message are required' });
  }

  try {
    const intern = await prisma.intern.findUnique({ where: { userId: req.user.id } });
    if (!intern) return res.status(404).json({ error: 'Intern profile not found' });

    const managerReq = await prisma.managerRequest.findUnique({ where: { id: requestId } });
    if (!managerReq) return res.status(404).json({ error: 'Request not found' });
    if (managerReq.status !== 'OPEN') return res.status(400).json({ error: 'Request is no longer open' });

    const existingApp = await prisma.application.findFirst({
      where: {
        requestId,
        internId: intern.id,
      },
    });

    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied to this request' });
    }

    const application = await prisma.application.create({
      data: {
        requestId,
        internId: intern.id,
        message,
      },
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyApplications = async (req, res) => {
  if (req.user.role !== 'INTERN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const intern = await prisma.intern.findUnique({ where: { userId: req.user.id } });
    if (!intern) return res.status(404).json({ error: 'Intern profile not found' });

    const applications = await prisma.application.findMany({
      where: { internId: intern.id },
      include: {
        request: {
          select: {
            title: true,
            category: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const acceptApplication = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { id } = req.params;

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

    const application = await prisma.application.findUnique({ 
      where: { id },
      include: { request: true }
    });

    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.request.artisanId !== artisan.id) {
      return res.status(403).json({ error: 'Unauthorized: Not your request' });
    }
    if (application.request.status !== 'OPEN') {
      return res.status(400).json({ error: 'Request is already in progress or closed' });
    }
    if (application.status !== 'PENDING') {
      return res.status(400).json({ error: 'Application is not pending' });
    }

    // Transaction to safely accept intern and create project
    const result = await prisma.$transaction(async (tx) => {
      // 1. Accept this application
      const acceptedApp = await tx.application.update({
        where: { id },
        data: { status: 'ACCEPTED' }
      });

      // 2. Reject all other pending applications for this request
      await tx.application.updateMany({
        where: {
          requestId: application.requestId,
          id: { not: id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' }
      });

      // 3. Mark request as IN_PROGRESS
      await tx.managerRequest.update({
        where: { id: application.requestId },
        data: { status: 'IN_PROGRESS' }
      });

      // 4. Create Project
      const project = await tx.project.create({
        data: {
          requestId: application.requestId,
          applicationId: id,
          artisanId: artisan.id,
          internId: application.internId,
          status: 'IN_PROGRESS',
        }
      });

      return { acceptedApp, project };
    });

    res.json(result);
  } catch (error) {
    console.error('Accept application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  applyToRequest,
  getMyApplications,
  acceptApplication,
};

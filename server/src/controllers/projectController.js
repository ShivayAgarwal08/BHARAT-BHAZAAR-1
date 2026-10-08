const prisma = require('../prisma');

const getMyProjects = async (req, res) => {
  try {
    const isArtisan = req.user.role === 'ARTISAN';
    const isIntern = req.user.role === 'INTERN';

    let userProfile = null;
    let projects = [];

    if (isArtisan) {
      userProfile = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
      if (!userProfile) return res.status(404).json({ error: 'Artisan profile not found' });
      projects = await prisma.project.findMany({
        where: { artisanId: userProfile.id },
        include: {
          request: true,
          intern: { include: { user: { select: { name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else if (isIntern) {
      userProfile = await prisma.intern.findUnique({ where: { userId: req.user.id } });
      if (!userProfile) return res.status(404).json({ error: 'Intern profile not found' });
      projects = await prisma.project.findMany({
        where: { internId: userProfile.id },
        include: {
          request: true,
          artisan: { include: { user: { select: { name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      return res.status(403).json({ error: 'Admins cannot view personal projects here' });
    }

    res.json(projects);
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        request: true,
        artisan: { include: { user: { select: { name: true, id: true } } } },
        intern: { include: { user: { select: { name: true, id: true } } } },
        rating: true,
        contract: { select: { id: true } },
      },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Authorization: User must be part of the project
    const isArtisan = project.artisan.user.id === req.user.id;
    const isIntern = project.intern.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isArtisan && !isIntern && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to view this project' });
    }

    if (!project.contract) {
      let linkedContract = null;
      if (project.requestId) {
        linkedContract = await prisma.contract.findFirst({
          where: { requestId: project.requestId, projectId: null },
          orderBy: { createdAt: 'desc' }
        });
      }
      if (!linkedContract) {
        const candidateContracts = await prisma.contract.findMany({
          where: {
            artisanId: project.artisanId,
            internId: project.internId,
            projectId: null
          }
        });
        if (candidateContracts.length === 1) {
          linkedContract = candidateContracts[0];
        } else if (candidateContracts.length > 1) {
          console.warn(`Ambiguous contracts for project ${project.id}: found ${candidateContracts.length} unlinked candidates. Will not guess.`);
        }
      }

      if (linkedContract) {
        await prisma.contract.update({
          where: { id: linkedContract.id },
          data: { projectId: project.id }
        });
        project.contract = { id: linkedContract.id };
      }
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const completeProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { artisan: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Only Artisan can officially complete the project
    if (project.artisan.userId !== req.user.id) {
      return res.status(403).json({ error: 'Only the project artisan can confirm completion' });
    }

    if (project.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Project is already completed' });
    }

    if (project.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot complete a cancelled project' });
    }

    const updatedProject = await prisma.$transaction(async (tx) => {
      const proj = await tx.project.update({
        where: { id },
        data: { 
          status: 'COMPLETED',
          completionDate: new Date(),
        },
      });

      await tx.managerRequest.update({
        where: { id: project.requestId },
        data: { status: 'COMPLETED' },
      });

      return proj;
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Complete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProjectMessages = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { artisan: true, intern: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.artisan.userId !== req.user.id && project.intern.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const messages = await prisma.message.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: 'Message content required' });

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { artisan: true, intern: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.artisan.userId !== req.user.id && project.intern.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const message = await prisma.message.create({
      data: {
        projectId: id,
        senderId: req.user.id,
        content,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const rateProject = async (req, res) => {
  const { id } = req.params;
  const { score, review } = req.body;

  if (typeof score !== 'number' || score < 1 || score > 5) {
    return res.status(400).json({ error: 'Valid rating score (1-5) is required' });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { artisan: true, rating: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (project.artisan.userId !== req.user.id) {
      return res.status(403).json({ error: 'Only the artisan can rate this project' });
    }

    if (project.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Project must be completed to rate' });
    }

    if (project.rating) {
      return res.status(400).json({ error: 'Project is already rated' });
    }

    const rating = await prisma.rating.create({
      data: {
        projectId: id,
        internId: project.internId,
        score,
        review: review?.substring(0, 1000) || null, // Sanitize length
      },
    });

    res.status(201).json(rating);
  } catch (error) {
    console.error('Rate project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getInternReputation = async (req, res) => {
  const { internId } = req.params;

  try {
    const ratings = await prisma.rating.findMany({
      where: { internId },
      include: {
        project: {
          include: {
            artisan: {
              include: { user: { select: { name: true } } },
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const projectsCompleted = await prisma.project.count({
      where: { internId, status: 'COMPLETED' },
    });

    let averageRating = 0;
    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.score, 0);
      averageRating = (sum / ratings.length).toFixed(1);
    }

    res.json({
      averageRating,
      reviews: ratings.length,
      projectsCompleted,
      recentReviews: ratings.slice(0, 5),
    });
  } catch (error) {
    console.error('Get reputation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProjectReports = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { artisan: true, intern: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.artisan.userId !== req.user.id && project.intern.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const reports = await prisma.projectReport.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createProjectReport = async (req, res) => {
  const { id } = req.params;
  const { period, metric, value, notes } = req.body;

  if (!period || !metric || !value) {
    return res.status(400).json({ error: 'Period, metric, and value are required' });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { intern: true },
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.intern.userId !== req.user.id) {
      return res.status(403).json({ error: 'Only the Growth Manager can add reports' });
    }

    const report = await prisma.projectReport.create({
      data: {
        projectId: id,
        internId: project.intern.id,
        period,
        metric,
        value: String(value),
        notes: notes || '',
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const getProjectSupport = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { artisan: true, intern: true }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.artisan.userId !== req.user.id && project.intern.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const tickets = await prisma.supportTicket.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createProjectSupport = async (req, res) => {
  const { id } = req.params;
  const { category, message, priority } = req.body;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { artisan: true, intern: true }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.artisan.userId !== req.user.id && project.intern.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user.id,
        projectId: id,
        category,
        message,
        priority: priority || 'NORMAL',
        status: 'OPEN'
      }
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMyProjects,
  getProjectById,
  completeProject,
  getProjectMessages,
  createMessage,
  rateProject,
  getInternReputation,
  getProjectReports,
  createProjectReport,
  getProjectSupport,
  createProjectSupport
};

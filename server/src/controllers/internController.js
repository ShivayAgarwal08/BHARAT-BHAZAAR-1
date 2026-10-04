const prisma = require('../prisma');

const getAllInterns = async (req, res) => {
  const { tier, skill, isAvailable } = req.query;

  try {
    const where = {};
    if (tier) where.tier = tier;
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';

    const interns = await prisma.intern.findMany({
      where,
      include: {
        user: { select: { name: true, phone: true, email: true } },
        ratings: { select: { score: true } },
        _count: {
          select: {
            projects: { where: { status: 'COMPLETED' } },
            contracts: { where: { status: 'COMPLETED' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedInterns = interns.map((intern) => {
      const avgRating =
        intern.ratings.length > 0
          ? (intern.ratings.reduce((acc, r) => acc + r.score, 0) / intern.ratings.length).toFixed(1)
          : '5.0';

      return {
        id: intern.id,
        userId: intern.userId,
        name: intern.user.name,
        college: intern.college,
        course: intern.course,
        skills: intern.skills,
        experience: intern.experience,
        portfolio: intern.portfolio,
        location: intern.location,
        profileImg: intern.profileImg,
        tier: intern.tier,
        hourlyRate: intern.hourlyRate,
        projectRate: intern.projectRate,
        isAvailable: intern.isAvailable,
        bio: intern.bio,
        rating: avgRating,
        completedProjects: intern._count.projects + intern._count.contracts,
      };
    });

    // Client-side skill filter if queried
    let filtered = formattedInterns;
    if (skill) {
      filtered = filtered.filter((i) =>
        i.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('Get all interns error:', error);
    res.status(500).json({ error: 'Failed to fetch Growth Managers' });
  }
};

const getInternById = async (req, res) => {
  const { id } = req.params;

  try {
    const intern = await prisma.intern.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        ratings: {
          include: {
            project: {
              include: {
                artisan: { include: { user: { select: { name: true } } } },
              },
            },
          },
        },
        projects: {
          where: { status: 'COMPLETED' },
          include: {
            artisan: { include: { user: { select: { name: true } } } },
            request: { select: { title: true, category: true } },
          },
        },
      },
    });

    if (!intern) return res.status(404).json({ error: 'Growth Manager profile not found' });

    const avgRating =
      intern.ratings.length > 0
        ? (intern.ratings.reduce((acc, r) => acc + r.score, 0) / intern.ratings.length).toFixed(1)
        : '5.0';

    res.json({
      ...intern,
      name: intern.user.name,
      rating: avgRating,
      reviewsCount: intern.ratings.length,
      completedProjectsCount: intern.projects.length,
    });
  } catch (error) {
    console.error('Get intern by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch Growth Manager profile' });
  }
};

const updateMyProfile = async (req, res) => {
  if (req.user.role !== 'INTERN') {
    return res.status(403).json({ error: 'Only Growth Managers can update intern profiles' });
  }

  const { tier, hourlyRate, projectRate, isAvailable, bio, skills, college, course, portfolio, location } = req.body;

  try {
    const intern = await prisma.intern.findUnique({ where: { userId: req.user.id } });
    if (!intern) return res.status(404).json({ error: 'Intern profile not found' });

    const dataToUpdate = {};
    if (tier) dataToUpdate.tier = tier;
    if (hourlyRate !== undefined) dataToUpdate.hourlyRate = parseFloat(hourlyRate) || null;
    if (projectRate !== undefined) dataToUpdate.projectRate = parseFloat(projectRate) || null;
    if (isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(isAvailable);
    if (bio !== undefined) dataToUpdate.bio = bio;
    if (skills) dataToUpdate.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    if (college) dataToUpdate.college = college;
    if (course) dataToUpdate.course = course;
    if (portfolio) dataToUpdate.portfolio = portfolio;
    if (location) dataToUpdate.location = location;

    const updated = await prisma.intern.update({
      where: { id: intern.id },
      data: dataToUpdate,
      include: { user: { select: { name: true } } },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update intern profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  getAllInterns,
  getInternById,
  updateMyProfile,
};

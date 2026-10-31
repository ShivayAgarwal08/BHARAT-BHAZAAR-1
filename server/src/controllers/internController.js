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
        user: { select: { name: true } }, // STRICT: Never select phone or email
        ratings: { select: { score: true } },
        _count: {
          select: {
            projects: { where: { status: 'COMPLETED' } },
            contracts: { where: { status: 'COMPLETED' } },
          },
        },
      },
    });

    const formattedInterns = interns.map((intern) => {
      const avgRating =
        intern.ratings.length > 0
          ? (intern.ratings.reduce((acc, r) => acc + r.score, 0) / intern.ratings.length).toFixed(1)
          : '5.0';

      return {
        id: intern.id,
        userId: intern.userId,
        name: intern.user?.name || 'Growth Manager',
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
        user: { select: { name: true } }, // STRICT: Never select phone or email
        ratings: {
          select: {
            id: true,
            score: true,
            review: true,
            createdAt: true,
            project: {
              select: {
                id: true,
                artisan: { include: { user: { select: { name: true } } } },
              },
            },
          },
        },
        projects: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            status: true,
            startDate: true,
            completionDate: true,
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

    // Explicit serialization to guarantee zero private user fields leak
    const serializedIntern = {
      id: intern.id,
      userId: intern.userId,
      name: intern.user?.name || 'Growth Manager',
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
      reviewsCount: intern.ratings.length,
      completedProjectsCount: intern.projects.length,
      projects: intern.projects,
      ratings: intern.ratings,
    };

    res.json(serializedIntern);
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
    if (bio !== undefined) dataToUpdate.bio = String(bio).trim();
    if (skills) dataToUpdate.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    if (college) dataToUpdate.college = String(college).trim();
    if (course) dataToUpdate.course = String(course).trim();
    if (portfolio) dataToUpdate.portfolio = String(portfolio).trim();
    if (location) dataToUpdate.location = String(location).trim();

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

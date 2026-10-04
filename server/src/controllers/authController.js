const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const register = async (req, res) => {
  const { name, phone, email, password, role, ...roleData } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role: role || 'ARTISAN', // Default to ARTISAN if not provided
      },
    });

    if (user.role === 'ARTISAN') {
      await prisma.artisan.create({
        data: {
          userId: user.id,
          location: roleData.location || '',
          state: roleData.state || '',
          primaryLanguage: roleData.primaryLanguage || '',
          businessType: roleData.businessType || '',
        },
      });
    } else if (user.role === 'INTERN') {
      await prisma.intern.create({
        data: {
          userId: user.id,
          college: roleData.college || '',
          course: roleData.course || '',
          skills: roleData.skills || [],
          experience: roleData.experience,
          portfolio: roleData.portfolio,
          location: roleData.location || '',
          tier: roleData.tier || 'STARTER',
          hourlyRate: roleData.hourlyRate ? parseFloat(roleData.hourlyRate) : null,
          projectRate: roleData.projectRate ? parseFloat(roleData.projectRate) : null,
          bio: roleData.bio || '',
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        artisan: true,
        intern: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { register, login, getMe };

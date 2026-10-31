const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const ALLOWED_PUBLIC_ROLES = ['ARTISAN', 'INTERN', 'CUSTOMER'];

const register = async (req, res) => {
  const { name, phone, email, password, role, ...roleData } = req.body;

  try {
    const cleanPhone = phone ? phone.trim().replace(/\s+/g, '') : '';
    const cleanEmail = email?.trim().toLowerCase() || null;

    if (!cleanPhone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required', code: 'MISSING_FIELDS' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long', code: 'INVALID_PASSWORD' });
    }

    // Role validation & allowlist enforcement
    let targetRole = 'ARTISAN';
    if (role !== undefined && role !== null && String(role).trim() !== '') {
      const normalizedRole = String(role).trim().toUpperCase();
      if (normalizedRole === 'ADMIN') {
        return res.status(400).json({
          error: 'Public registration as administrator is strictly prohibited.',
          code: 'ADMIN_REGISTRATION_PROHIBITED',
        });
      }
      if (!ALLOWED_PUBLIC_ROLES.includes(normalizedRole)) {
        return res.status(400).json({
          error: `Invalid registration role. Allowed roles are: ${ALLOWED_PUBLIC_ROLES.join(', ')}`,
          code: 'INVALID_ROLE',
        });
      }
      targetRole = normalizedRole;
    }

    // Check phone uniqueness
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: phone.trim() },
        ],
      },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists', code: 'PHONE_EXISTS' });
    }

    // Check email uniqueness (only if email provided)
    if (cleanEmail) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } },
      });
      if (existingEmail) {
        return res.status(400).json({ error: 'An account with this email already exists.', code: 'EMAIL_EXISTS' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name ? name.trim() : '',
        phone: cleanPhone,
        email: cleanEmail,
        password: hashedPassword,
        role: targetRole,
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
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'An account with these details already exists.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const t0 = Date.now();
  const { phone, email, password, identifier } = req.body;

  try {
    const rawInput = (phone || email || identifier || '').trim();
    if (!rawInput || !password) {
      return res.status(400).json({ error: 'Phone number or email and password are required', code: 'MISSING_FIELDS' });
    }

    const isEmail = rawInput.includes('@');
    let user = null;

    // ---------------------------------------------------------------------------
    // DB lookup — normalise phone variants in the query itself to avoid multiple
    // round-trips. A single OR query is more efficient than sequential lookups.
    // ---------------------------------------------------------------------------
    const findUser = async () => {
      if (isEmail) {
        return prisma.user.findFirst({
          where: { email: { equals: rawInput.toLowerCase(), mode: 'insensitive' } },
          select: { id: true, name: true, email: true, phone: true, password: true, role: true },
        });
      }
      const cleanPhone = rawInput.replace(/\s+/g, '');
      const barePhone = cleanPhone.replace(/^\+91/, '');
      return prisma.user.findFirst({
        where: {
          OR: [
            { phone: rawInput },
            { phone: cleanPhone },
            { phone: barePhone },
            { phone: `+91${barePhone}` },
            { email: { equals: rawInput.toLowerCase(), mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, email: true, phone: true, password: true, role: true },
      });
    };

    const dbStart = Date.now();
    try {
      user = await findUser();
    } catch (dbErr) {
      // One retry for known transient Prisma/Neon connection errors
      if (
        dbErr.code === 'P1001' ||
        dbErr.code === 'P1002' ||
        dbErr.message?.includes('database server') ||
        dbErr.message?.includes('Engine is not running')
      ) {
        console.warn('[Auth] Transient DB connection error during login, retrying once…', dbErr.code);
        await new Promise((r) => setTimeout(r, 800));
        user = await findUser();
      } else {
        throw dbErr;
      }
    }
    console.log(`[Auth] DB lookup: ${Date.now() - dbStart}ms`);

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password', code: 'INVALID_CREDENTIALS' });
    }

    // bcrypt.compare is CPU-bound; log its duration to detect bcrypt-round misconfiguration.
    const bcryptStart = Date.now();
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`[Auth] bcrypt.compare: ${Date.now() - bcryptStart}ms`);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid phone number or password', code: 'INVALID_CREDENTIALS' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[Auth] Login total: ${Date.now() - t0}ms`);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    if (error.code && error.code.startsWith('P')) {
      return res.status(503).json({ error: 'Database service is warming up. Please retry in a moment.', code: 'DATABASE_ERROR' });
    }
    res.status(500).json({ error: 'Server error. Please try again in a moment.', code: 'SERVER_ERROR' });
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

module.exports = { register, login, getMe, ALLOWED_PUBLIC_ROLES };

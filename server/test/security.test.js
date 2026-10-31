const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-32-bytes-minimum!';

const prisma = require('../src/prisma');
const { app, server, io } = require('../src/index');
const { io: ClientSocket } = require('../../client/node_modules/socket.io-client');

let baseUrl;
let serverPort;

test.before(async () => {
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      serverPort = server.address().port;
      baseUrl = `http://127.0.0.1:${serverPort}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => io.close(resolve));
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
});

// Helper to generate auth token
function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// ─────────────────────────────────────────────────────────────
// Task A: Public Registration Security Tests
// ─────────────────────────────────────────────────────────────
test.describe('Task A: Public Registration Security & Role Allowlist', () => {
  test('rejects registration attempt with ADMIN role with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker',
        phone: '9999900001',
        password: 'password123',
        role: 'ADMIN',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.code, 'ADMIN_REGISTRATION_PROHIBITED');
    assert.match(data.error, /administrator is strictly prohibited/i);
  });

  test('rejects registration attempt with arbitrary invalid role with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker',
        phone: '9999900002',
        password: 'password123',
        role: 'SUPERUSER',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.code, 'INVALID_ROLE');
    assert.match(data.error, /Allowed roles are: ARTISAN, INTERN, CUSTOMER/);
  });

  test('rejects registration with short password (< 6 chars) with 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User',
        phone: '9999900003',
        password: '123',
        role: 'ARTISAN',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.code, 'INVALID_PASSWORD');
  });

  test('accepts registration for valid role and defaults omitted role safely', async () => {
    // Mock Prisma findFirst and create
    const originalFindFirst = prisma.user.findFirst;
    const originalUserCreate = prisma.user.create;
    const originalArtisanCreate = prisma.artisan.create;

    let createdUserRole = null;
    prisma.user.findFirst = async () => null; // No duplicate phone
    prisma.user.create = async ({ data }) => {
      createdUserRole = data.role;
      return { id: 'mock-user-1', name: data.name, phone: data.phone, role: data.role };
    };
    prisma.artisan.create = async () => ({ id: 'mock-artisan-1' });

    try {
      // Test omitted role -> defaults to ARTISAN
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Artisan Test',
          phone: '9999900004',
          password: 'password123',
        }),
      });

      const data = await res.json();
      assert.equal(res.status, 201);
      assert.equal(createdUserRole, 'ARTISAN');
      assert.equal(data.user.role, 'ARTISAN');
      assert.ok(data.token);
    } finally {
      prisma.user.findFirst = originalFindFirst;
      prisma.user.create = originalUserCreate;
      prisma.artisan.create = originalArtisanCreate;
    }
  });
});

// ─────────────────────────────────────────────────────────────
// Task C: Growth Manager Directory Privacy Tests
// ─────────────────────────────────────────────────────────────
test.describe('Task C: Growth Manager Directory PII Protection', () => {
  test('getAllInterns excludes phone and email from public response', async () => {
    const originalFindMany = prisma.intern.findMany;
    prisma.intern.findMany = async () => [
      {
        id: 'intern-1',
        userId: 'user-intern-1',
        college: 'Test College',
        course: 'Design',
        skills: ['Marketing'],
        experience: '2 years',
        portfolio: 'https://portfolio.test',
        location: 'Jaipur',
        profileImg: null,
        tier: 'STARTER',
        hourlyRate: null,
        projectRate: null,
        isAvailable: true,
        bio: 'Helping artisans grow',
        user: { name: 'Priya Sharma' },
        ratings: [{ score: 5 }],
        _count: { projects: 1, contracts: 1 },
      },
    ];

    try {
      const res = await fetch(`${baseUrl}/api/interns`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.equal(data.length, 1);

      const item = data[0];
      assert.equal(item.name, 'Priya Sharma');
      // Verify PII fields are strictly undefined / absent
      assert.equal(item.phone, undefined, 'phone must not be present in public listing');
      assert.equal(item.email, undefined, 'email must not be present in public listing');
      assert.equal(item.user, undefined, 'user relation must not be exposed');
    } finally {
      prisma.intern.findMany = originalFindMany;
    }
  });

  test('getInternById excludes phone and email from serialized public profile', async () => {
    const originalFindUnique = prisma.intern.findUnique;
    prisma.intern.findUnique = async () => ({
      id: 'intern-1',
      userId: 'user-intern-1',
      college: 'Test College',
      course: 'Design',
      skills: ['Marketing'],
      experience: '2 years',
      portfolio: 'https://portfolio.test',
      location: 'Jaipur',
      profileImg: null,
      tier: 'STARTER',
      hourlyRate: null,
      projectRate: null,
      isAvailable: true,
      bio: 'Helping artisans grow',
      user: { name: 'Priya Sharma' },
      ratings: [],
      projects: [],
    });

    try {
      const res = await fetch(`${baseUrl}/api/interns/intern-1`);
      assert.equal(res.status, 200);
      const data = await res.json();

      assert.equal(data.name, 'Priya Sharma');
      assert.equal(data.phone, undefined, 'phone must not be present in public profile');
      assert.equal(data.email, undefined, 'email must not be present in public profile');
      assert.equal(data.user, undefined, 'nested user object must not leak in profile');
    } finally {
      prisma.intern.findUnique = originalFindUnique;
    }
  });
});

// ─────────────────────────────────────────────────────────────
// Task E: Orders & Contract Authorization Tests
// ─────────────────────────────────────────────────────────────
test.describe('Task E: Orders & Contract Authorization', () => {
  test('updateOrderStatus rejects unauthorized user with 403', async () => {
    const originalOrderFindUnique = prisma.order.findUnique;
    const originalArtisanFindUnique = prisma.artisan.findUnique;

    prisma.order.findUnique = async () => ({
      id: 'order-1',
      status: 'PENDING',
      items: [{ id: 'item-1', artisanId: 'artisan-real' }],
    });
    prisma.artisan.findUnique = async () => ({ id: 'artisan-other', userId: 'user-other' });

    try {
      const token = createToken({ id: 'user-other', role: 'ARTISAN', name: 'Other Artisan' });
      const res = await fetch(`${baseUrl}/api/orders/order-1/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.code, 'FORBIDDEN');
    } finally {
      prisma.order.findUnique = originalOrderFindUnique;
      prisma.artisan.findUnique = originalArtisanFindUnique;
    }
  });

  test('updateOrderStatus rejects single artisan attempting to modify multi-artisan order with 403', async () => {
    const originalOrderFindUnique = prisma.order.findUnique;
    const originalArtisanFindUnique = prisma.artisan.findUnique;

    prisma.order.findUnique = async () => ({
      id: 'order-multi',
      status: 'PENDING',
      items: [
        { id: 'item-1', artisanId: 'artisan-1' },
        { id: 'item-2', artisanId: 'artisan-2' },
      ],
    });
    prisma.artisan.findUnique = async () => ({ id: 'artisan-1', userId: 'user-artisan-1' });

    try {
      const token = createToken({ id: 'user-artisan-1', role: 'ARTISAN', name: 'Artisan One' });
      const res = await fetch(`${baseUrl}/api/orders/order-multi/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.code, 'MULTI_ARTISAN_RESTRICTION');
      assert.match(data.error, /multi-vendor orders/i);
    } finally {
      prisma.order.findUnique = originalOrderFindUnique;
      prisma.artisan.findUnique = originalArtisanFindUnique;
    }
  });

  test('updateOrderStatus enforces valid status transitions', async () => {
    const originalOrderFindUnique = prisma.order.findUnique;
    const originalArtisanFindUnique = prisma.artisan.findUnique;

    prisma.order.findUnique = async () => ({
      id: 'order-1',
      status: 'DELIVERED',
      items: [{ id: 'item-1', artisanId: 'artisan-1' }],
    });
    prisma.artisan.findUnique = async () => ({ id: 'artisan-1', userId: 'user-artisan-1' });

    try {
      const token = createToken({ id: 'user-artisan-1', role: 'ARTISAN', name: 'Artisan One' });
      const res = await fetch(`${baseUrl}/api/orders/order-1/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'PENDING' }),
      });

      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.code, 'INVALID_TRANSITION');
    } finally {
      prisma.order.findUnique = originalOrderFindUnique;
      prisma.artisan.findUnique = originalArtisanFindUnique;
    }
  });

  test('contractController rejects non-participant from viewing contract with 403', async () => {
    const originalContractFindUnique = prisma.contract.findUnique;

    prisma.contract.findUnique = async () => ({
      id: 'contract-1',
      artisanId: 'artisan-1',
      internId: 'intern-1',
      artisan: { userId: 'user-artisan-1', user: { id: 'user-artisan-1', name: 'Artisan', phone: '9999900001' } },
      intern: { userId: 'user-intern-1', user: { id: 'user-intern-1', name: 'Intern', phone: '9999900002' } },
      tasks: [],
    });

    try {
      const token = createToken({ id: 'unrelated-user-999', role: 'ARTISAN', name: 'Stranger' });
      const res = await fetch(`${baseUrl}/api/contracts/contract-1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.code, 'UNAUTHORIZED');
    } finally {
      prisma.contract.findUnique = originalContractFindUnique;
    }
  });

  test('contractController grants legitimate participant access', async () => {
    const originalContractFindUnique = prisma.contract.findUnique;

    prisma.contract.findUnique = async () => ({
      id: 'contract-1',
      artisanId: 'artisan-1',
      internId: 'intern-1',
      title: 'Growth Partnership',
      artisan: { userId: 'user-artisan-1', user: { id: 'user-artisan-1', name: 'Artisan', phone: '9999900001' } },
      intern: { userId: 'user-intern-1', user: { id: 'user-intern-1', name: 'Intern', phone: '9999900002' } },
      tasks: [],
    });

    try {
      const token = createToken({ id: 'user-artisan-1', role: 'ARTISAN', name: 'Artisan' });
      const res = await fetch(`${baseUrl}/api/contracts/contract-1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.id, 'contract-1');
    } finally {
      prisma.contract.findUnique = originalContractFindUnique;
    }
  });
});

// ─────────────────────────────────────────────────────────────
// Task F: Security Headers, Error Handling & 404
// ─────────────────────────────────────────────────────────────
test.describe('Task F: Security Headers & Error Handling', () => {
  test('returns 404 JSON for undefined endpoints', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent-endpoint`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.code, 'NOT_FOUND');
    assert.equal(data.error, 'Endpoint not found');
  });

  test('responds with security headers (Helmet)', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  });

  test('handles malformed JSON payload with 400 and clean error', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid-json: broken',
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.code, 'INVALID_JSON');
    assert.match(data.error, /Malformed JSON payload/);
  });
});

// ─────────────────────────────────────────────────────────────
// Task B: Socket.IO Authentication & Room Authorization
// ─────────────────────────────────────────────────────────────
test.describe('Task B: Socket.IO Authentication & Authorization', () => {
  test('rejects connection without authentication token', async () => {
    await new Promise((resolve) => {
      const client = ClientSocket(baseUrl, {
        reconnection: false,
        transports: ['websocket'],
      });

      client.on('connect_error', (err) => {
        assert.match(err.message, /Authentication required/);
        client.disconnect();
        resolve();
      });

      client.on('connect', () => {
        client.disconnect();
        assert.fail('Socket should not connect without token');
      });
    });
  });

  test('rejects connection with invalid token', async () => {
    await new Promise((resolve) => {
      const client = ClientSocket(baseUrl, {
        auth: { token: 'invalid-expired-token' },
        reconnection: false,
        transports: ['websocket'],
      });

      client.on('connect_error', (err) => {
        assert.match(err.message, /Authentication failed/);
        client.disconnect();
        resolve();
      });

      client.on('connect', () => {
        client.disconnect();
        assert.fail('Socket should not connect with invalid token');
      });
    });
  });

  test('allows authenticated connection and prevents joining unauthorized project rooms', async () => {
    const originalProjectFindUnique = prisma.project.findUnique;
    prisma.project.findUnique = async () => ({
      id: 'proj-secret-1',
      artisan: { userId: 'real-artisan-id' },
      intern: { userId: 'real-intern-id' },
    });

    const token = createToken({ id: 'intruder-id', role: 'ARTISAN', name: 'Intruder' });

    try {
      await new Promise((resolve, reject) => {
        const client = ClientSocket(baseUrl, {
          auth: { token },
          reconnection: false,
          transports: ['websocket'],
        });

        client.on('connect', () => {
          client.emit('joinProject', 'proj-secret-1', (ack) => {
            assert.ok(ack.error);
            assert.match(ack.error, /Unauthorized/);
            client.disconnect();
            resolve();
          });
        });

        client.on('error', (err) => {
          assert.equal(err.code, 'UNAUTHORIZED_WORKSPACE');
          client.disconnect();
          resolve();
        });

        client.on('connect_error', (err) => {
          client.disconnect();
          reject(err);
        });
      });
    } finally {
      prisma.project.findUnique = originalProjectFindUnique;
    }
  });
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const path = require('path');
const prisma = require('./prisma');
const { generalLimiter } = require('./middleware/securityMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const requestRoutes = require('./routes/requestRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const projectRoutes = require('./routes/projectRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contractRoutes = require('./routes/contractRoutes');
const internRoutes = require('./routes/internRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const imageRoutes = require('./routes/imageRoutes');
const assistanceRoutes = require('./routes/assistanceRoutes');
const supportRoutes = require('./routes/supportRoutes');

const app = express();
const server = http.createServer(app);

// Trust first proxy on Render / cloud providers for accurate client IP resolution in rate limiting
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration supporting production, preview, and local frontend origins
const configuredClientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim() : null;
const allowedOrigins = [
  configuredClientUrl,
  'https://bharat-bhazaar-1.vercel.app',
  'http://localhost:5173',
  'http://localhost:5001',
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow mobile apps, curl, or server-to-server requests
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/bharat-bhazaar-[a-z0-9-]+-shivayagarwal08s-projects\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.use(generalLimiter);
app.use(express.json({ limit: '256kb' }));

// Serve static uploads (fallback for local files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/interns', internRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/assistance', assistanceRoutes);
app.use('/api/support', supportRoutes);

// ---------------------------------------------------------------------------
// Health check endpoints
// ---------------------------------------------------------------------------

// Lightweight liveness probe — does NOT touch the database.
// Use this for uptime monitoring / keep-alive pings to prevent cold starts.
app.get('/api/ping', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ok', service: 'bharat-bazaar-api', timestamp: new Date().toISOString() });
});

// Full readiness probe — confirms DB connectivity.
// Only call this when you need to verify the database, not for keep-alive pings.
app.get('/api/health', async (_req, res) => {
  const t0 = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      status: 'healthy',
      service: 'bharat-bazaar-api',
      database: 'connected',
      dbLatencyMs: Date.now() - t0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Health Check Failed]:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      service: 'bharat-bazaar-api',
      database: 'disconnected',
      error: 'Database ping failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Base route preserved for Render dashboard health check & status
app.get('/', (_req, res) => {
  res.send('Bharat Bazaar API is running');
});

// Catch-all 404 for undefined API endpoints
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND' });
});

// Centralized Express Error Handler
app.use((err, req, res, _next) => {
  console.error('[Unhandled Request Error]:', {
    path: req.path,
    method: req.method,
    message: err.message,
    code: err.code,
  });

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload', code: 'INVALID_JSON' });
  }

  const statusCode =
    typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
  const clientMessage =
    statusCode >= 500 ? 'Internal server error. Please try again later.' : err.message;

  res.status(statusCode).json({
    error: clientMessage,
    code: err.code || 'SERVER_ERROR',
  });
});

// Socket.IO Setup with strict CORS & Authentication
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS blocked for Socket.IO origin'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Socket.IO Handshake Authentication Middleware
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
    socket.handshake.query?.token;

  if (!token) {
    return next(new Error('Authentication required: Missing token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Authentication failed: Invalid or expired token'));
  }
});

// Socket.IO Event Handlers with Project Membership Authorization
io.on('connection', (socket) => {
  socket.on('joinProject', async (projectId, callback) => {
    try {
      if (!projectId || typeof projectId !== 'string') {
        socket.emit('error', { message: 'Invalid project ID', code: 'INVALID_PROJECT_ID' });
        if (typeof callback === 'function') callback({ error: 'Invalid project ID' });
        return;
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { artisan: true, intern: true },
      });

      if (!project) {
        socket.emit('error', { message: 'Project not found', code: 'PROJECT_NOT_FOUND' });
        if (typeof callback === 'function') callback({ error: 'Project not found' });
        return;
      }

      const isArtisan = Boolean(project.artisan && project.artisan.userId === socket.user.id);
      const isIntern = Boolean(project.intern && project.intern.userId === socket.user.id);
      const isAdmin = socket.user.role === 'ADMIN';

      if (!isArtisan && !isIntern && !isAdmin) {
        socket.emit('error', {
          message: 'Unauthorized: You are not an authorized participant in this project workspace',
          code: 'UNAUTHORIZED_WORKSPACE',
        });
        if (typeof callback === 'function') callback({ error: 'Unauthorized workspace member' });
        return;
      }

      socket.join(`project:${projectId}`);
      if (typeof callback === 'function') callback({ status: 'joined', projectId });
    } catch (err) {
      console.error('[Socket joinProject Error]:', err);
      socket.emit('error', { message: 'Internal error joining project room', code: 'SOCKET_ERROR' });
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      if (!data || typeof data !== 'object') return;
      const { projectId, message } = data;
      if (!projectId || !message) return;

      // Ensure socket is joined to this specific project room
      if (!socket.rooms.has(`project:${projectId}`)) {
        socket.emit('error', {
          message: 'Must join authorized project room before sending messages',
          code: 'NOT_IN_ROOM',
        });
        return;
      }

      // Verify that the message was canonically recorded in the database
      if (message.id) {
        const verifiedMessage = await prisma.message.findUnique({
          where: { id: message.id },
        });

        if (
          !verifiedMessage ||
          verifiedMessage.projectId !== projectId ||
          (verifiedMessage.senderId !== socket.user.id && socket.user.role !== 'ADMIN')
        ) {
          socket.emit('error', {
            message: 'Message verification failed: sender identity mismatch or non-existent message',
            code: 'MESSAGE_VERIFICATION_FAILED',
          });
          return;
        }

        io.to(`project:${projectId}`).emit('receiveMessage', verifiedMessage);
      }
    } catch (err) {
      console.error('[Socket sendMessage Error]:', err);
    }
  });

  socket.on('disconnect', () => {
    // Disconnect cleanup
  });
});

const PORT = process.env.PORT || 5002;

// Export app and server for testing
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server, io };

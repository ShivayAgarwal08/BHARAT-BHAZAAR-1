require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const requestRoutes = require('./routes/requestRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const projectRoutes = require('./routes/projectRoutes');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/projects', projectRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Bharat Bazaar API is running');
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`User joined project room: project:${projectId}`);
  });

  socket.on('sendMessage', (data) => {
    // data should have { projectId, message }
    // Note: The message is already persisted to the DB via POST /api/projects/:id/messages
    // We just emit it to everyone in the room
    io.to(`project:${data.projectId}`).emit('receiveMessage', data.message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

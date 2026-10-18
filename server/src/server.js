require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');
const setupChatSocket = require('./sockets/chatSocket');

// Route API
const routeRoutes = require('./routes/routeRoutes');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Route calculation API
app.use('/api/routes', routeRoutes);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupChatSocket(io);

// Make io accessible globally if needed in controllers
app.set('io', io);

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🚗 RAS Brother Tour & Travels Backend Server`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Socket.io: Active`);
  console.log(`====================================================`);
});
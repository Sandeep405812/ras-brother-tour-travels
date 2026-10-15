const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const offerRoutes = require('./routes/offerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Trust Proxy for Production (Cloudflare, Nginx, Render, AWS ALB)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // allow images to be accessed cross-origin
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static Folders
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/brand', express.static(path.join(__dirname, '../public/brand')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check / Company Info Root
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    company: 'RAS Brother Tour & Travels',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Production Client Static Serving & SPA Fallback
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/brand')) {
    return next();
  }
  res.sendFile(path.resolve(clientDistPath, 'index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;

const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getTicketById,
  addTicketMessage,
  getAllTicketsAdmin,
  updateTicketAdmin,
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware so guests can submit tickets too, but if token present, user is attached
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ras_secret_jwt_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // ignore invalid token for public ticket creation
    }
  }
  next();
};

// Public & Authenticated Ticket Creation
router.post('/tickets', optionalAuth, createTicket);

// Authenticated User Routes (Customers & Owners)
router.get('/my-tickets', protect, getMyTickets);
router.get('/tickets/:id', protect, getTicketById);
router.post('/tickets/:id/message', protect, addTicketMessage);
router.post('/tickets/:id/reply', protect, addTicketMessage);

// Admin-Only Routes
router.get('/admin/tickets', protect, authorize('admin'), getAllTicketsAdmin);
router.put('/admin/tickets/:id', protect, authorize('admin'), updateTicketAdmin);

module.exports = router;

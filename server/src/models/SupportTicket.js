const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  userRole: {
    type: String,
    enum: ['customer', 'owner', 'guest'],
    default: 'customer',
  },
  category: {
    type: String,
    enum: [
      'Booking Issue',
      'Payment & Refund Problem',
      'Payment / Refund',
      'Car Owner KYC & Documents',
      'Account / KYC',
      'Driver / Vehicle Issue',
      'Vehicle Issue',
      'Chauffeur / Driver Dispute',
      'Fraud & Security Concern',
      'Fraud / Safety Concern',
      'Other Problem / Query',
      'Other',
      'General Inquiry',
    ],
    default: 'Booking Issue',
  },
  subject: {
    type: String,
    required: [true, 'Problem subject is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  bookingId: {
    type: String,
    trim: true,
    default: '',
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
  },
  attachments: [
    {
      type: String,
    },
  ],
  adminResponse: {
    type: String,
    default: '',
  },
  adminRespondedAt: {
    type: Date,
  },
  adminRespondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      senderName: {
        type: String,
        default: 'User',
      },
      senderRole: {
        type: String,
        enum: ['customer', 'owner', 'admin', 'system'],
        default: 'customer',
      },
      message: {
        type: String,
        required: true,
      },
      attachment: {
        type: String,
        default: '',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

supportTicketSchema.index({ user: 1, status: 1 });
supportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

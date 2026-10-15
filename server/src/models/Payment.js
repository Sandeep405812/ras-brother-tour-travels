const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    default: '',
  },
  razorpaySignature: {
    type: String,
    default: '',
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  type: {
    type: String,
    enum: ['advance', 'remaining', 'full'],
    default: 'advance',
  },
  status: {
    type: String,
    enum: ['created', 'captured', 'failed', 'refunded'],
    default: 'created',
  },
  method: {
    type: String,
    default: 'UPI / Card / NetBanking',
  },
  receipt: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);

const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  offerId: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  customerOffer: {
    type: Number,
    required: true,
  },
  ownerCounterOffer: {
    type: Number,
    default: null,
  },
  finalAgreedPrice: {
    type: Number,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'countered', 'rejected', 'booked'],
    default: 'pending',
  },
  eventType: {
    type: String,
    default: 'Wedding Car Booking',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  pickupLocation: {
    type: String,
    default: '',
  },
  history: [{
    by: {
      type: String,
      enum: ['customer', 'owner'],
      required: true,
    },
    action: {
      type: String,
      enum: ['offer', 'counter', 'accept', 'reject'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Offer', offerSchema);

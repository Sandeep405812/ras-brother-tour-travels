const mongoose = require('mongoose');

const ownerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: [true, 'Business/Agency name is required'],
    trim: true,
  },
  bio: {
    type: String,
    default: 'Premium local car rental and chauffeur service partner.',
  },
  address: {
    type: String,
    required: [true, 'Business address is required'],
  },
  city: {
    type: String,
    default: 'Delhi NCR',
  },
  serviceRadiusKm: {
    type: Number,
    default: 50,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [77.2090, 28.6139],
    },
  },
  rating: {
    type: Number,
    default: 4.9,
    min: 1,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  totalBookings: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    bankName: { type: String, default: '' },
    upiId: { type: String, default: '' },
  },
  wallet: {
    availableBalance: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    payoutHistory: [
      {
        amount: Number,
        method: { type: String, default: 'UPI' },
        upiId: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        requestedAt: { type: Date, default: Date.now },
        processedAt: Date,
        utr: { type: String, default: '' },
      },
    ],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ownerProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('OwnerProfile', ownerProfileSchema);

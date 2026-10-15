const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
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
  ratings: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    carCondition: { type: Number, default: 5, min: 1, max: 5 },
    cleanliness: { type: Number, default: 5, min: 1, max: 5 },
    punctuality: { type: Number, default: 5, min: 1, max: 5 },
    service: { type: Number, default: 5, min: 1, max: 5 },
  },
  comment: {
    type: String,
    required: true,
  },
  responseFromOwner: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reviewSchema.index({ car: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

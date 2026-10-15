const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    unique: true,
  },
  state: {
    type: String,
    required: true,
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
  radiusKm: {
    type: Number,
    default: 50,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

serviceAreaSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('ServiceArea', serviceAreaSchema);

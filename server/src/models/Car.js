const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ownerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OwnerProfile',
  },
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true,
  },
  brand: {
    type: String,
    default: 'Standard',
    trim: true,
  },
  model: {
    type: String,
    default: 'Latest',
    trim: true,
  },
  variant: {
    type: String,
    default: '',
  },
  year: {
    type: Number,
    default: 2024,
  },
  color: {
    type: String,
    default: 'White',
  },
  seatingCapacity: {
    type: Number,
    default: 5,
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
    default: 'Diesel',
  },
  fuelIncluded: {
    type: Boolean,
    default: true, // true = Fuel Included, false = Fuel Extra Charge
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual'],
    default: 'Manual',
  },
  isAC: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    default: 'Sedan',
  },
  description: {
    type: String,
    default: 'Well maintained, verified chauffeur driven car.',
  },
  features: [{
    type: String,
  }],
  images: {
    main: { type: String, required: true },
    front: { type: String, default: '' },
    rear: { type: String, default: '' },
    side: { type: String, default: '' },
    interior: { type: String, default: '' },
    dashboard: { type: String, default: '' },
    gallery: [{ type: String }],
  },
  videoUrl: {
    type: String,
    default: '',
  },
  pricing: {
    perKm: { type: Number, default: 20 }, // ₹20/km
    basePrice: { type: Number, default: 1000 },
    perHour: { type: Number, default: 0 },
    perDay: { type: Number, default: 2000 },
    extraKmRate: { type: Number, default: 20 },
    driverCharges: { type: Number, default: 0 },
    nightCharges: { type: Number, default: 300 },
    decorationCharges: { type: Number, default: 0 },
    additionalServices: [{
      name: String,
      price: Number,
    }],
  },
  advancePayment: {
    type: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'percentage',
    },
    value: {
      type: Number,
      default: 20, // 20% or ₹1,000 fixed
    },
  },
  paymentMethods: {
    type: [String],
    default: ['cod', 'online'],
  },
  unavailableDates: [{
    type: String, // format: 'YYYY-MM-DD'
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      default: [77.2090, 28.6139],
    },
    address: {
      type: String,
      default: 'New Delhi, India',
    },
    city: {
      type: String,
      default: 'New Delhi',
    },
  },
  serviceRadiusKm: {
    type: Number,
    default: 100,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  ratingsAverage: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  weddingSpecial: {
    type: Boolean,
    default: false,
  },
  vipChauffeur: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

carSchema.index({ location: '2dsphere' });
carSchema.index({ category: 1, isAvailable: 1, active: 1 });

module.exports = mongoose.model('Car', carSchema);

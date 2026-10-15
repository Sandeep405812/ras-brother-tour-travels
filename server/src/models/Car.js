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
    required: [true, 'Brand is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
  },
  variant: {
    type: String,
    default: '',
  },
  year: {
    type: Number,
    required: [true, 'Manufacturing year is required'],
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
  },
  seatingCapacity: {
    type: Number,
    required: [true, 'Seating capacity is required'],
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
    default: 'Petrol',
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual'],
    default: 'Automatic',
  },
  isAC: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    enum: ['Luxury', 'Premium', 'Sedan', 'SUV', 'Vintage', 'Wedding Special', 'Party Car', 'Budget'],
    required: [true, 'Car category is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
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
    basePrice: { type: Number, required: true },
    perHour: { type: Number, default: 0 },
    perDay: { type: Number, required: true },
    extraKmRate: { type: Number, default: 15 },
    driverCharges: { type: Number, default: 500 },
    nightCharges: { type: Number, default: 300 },
    decorationCharges: { type: Number, default: 1500 },
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
    default: 50,
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

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
  },
  bulkBookingId: {
    type: String,
    default: null,
    index: true,
  },
  isBulkBooking: {
    type: Boolean,
    default: false,
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
  eventType: {
    type: String,
    enum: [
      'Wedding Car Booking',
      'Wedding Special',
      'Marriage & Reception Cars',
      'Party Cars',
      'Luxury Cars',
      'Corporate Travel',
      'Airport Transfers',
      'Local Tours',
      'Outstation Tours',
      'Photoshoot Cars',
      'Event Transportation',
      'Special Event',
      'Other'
    ],
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
  startTime: {
    type: String,
    default: '10:00 AM',
  },
  endTime: {
    type: String,
    default: '06:00 PM',
  },
  durationHours: {
    type: Number,
    default: 8,
  },
  durationDays: {
    type: Number,
    default: 1,
  },
  pickupLocation: {
    address: { type: String, required: true },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      default: [77.2090, 28.6139],
    },
  },
  destinationAddress: {
    type: String,
    default: '',
  },
  destinationCoordinates: {
    type: [Number], // [lng, lat]
    default: [],
  },
  distanceKm: {
    type: Number,
    default: 0,
  },
  offlineCustomer: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  decorationRequired: {
    type: Boolean,
    default: false,
  },
  decorationType: {
    type: String,
    default: 'None',
  },
  decorationPackage: {
    id: { type: String, default: 'none' },
    title: { type: String, default: 'Standard Vehicle (No Decoration)' },
    price: { type: Number, default: 0 },
    image: { type: String, default: '' },
  },
  startOtp: {
    type: String,
    default: () => Math.floor(1000 + Math.random() * 9000).toString(),
  },
  rideStartedAt: {
    type: Date,
  },
  rideCompletedAt: {
    type: Date,
  },
  chauffeur: {
    name: { type: String, default: 'RAS Uniformed Chauffeur' },
    phone: { type: String, default: '+91 98765 43210' },
    vehiclePlate: { type: String, default: 'DL 1C AA 2026' },
    assignedAt: { type: Date, default: Date.now },
  },
  remainingCollected: {
    status: { type: Boolean, default: false },
    method: { type: String, enum: ['cash', 'upi', 'online', 'none'], default: 'none' },
    amount: { type: Number, default: 0 },
    collectedAt: Date,
  },
  gstDetails: {
    customerGstin: { type: String, default: '' },
    businessName: { type: String, default: '' },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
  },
  paymentScreenshot: {
    type: String,
    default: '',
  },
  utrNumber: {
    type: String,
    default: '',
  },
  paymentVerificationStatus: {
    type: String,
    enum: ['pending_verification', 'verified', 'rejected', 'none'],
    default: 'none',
  },
  driverRequired: {
    type: Boolean,
    default: true,
  },
  specialRequests: {
    type: String,
    default: '',
  },
  pricing: {
    baseAmount: { type: Number, required: true },
    driverCharges: { type: Number, default: 0 },
    decorationCharges: { type: Number, default: 0 },
    nightCharges: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    platformCommission: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    advanceAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'advance_paid', 'fully_paid', 'refunded'],
    default: 'pending',
  },
  cancellationReason: {
    type: String,
    default: '',
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'owner', 'admin', 'none'],
    default: 'none',
  },
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.index({ car: 1, startDate: 1, endDate: 1, status: 1 });
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);

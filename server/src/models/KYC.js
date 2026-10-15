const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ownerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OwnerProfile',
  },
  idType: {
    type: String,
    enum: ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Passport', 'Driving License'],
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
    trim: true,
  },
  documentFront: {
    type: String,
    required: true,
  },
  documentBack: {
    type: String,
    default: '',
  },
  drivingLicense: {
    type: String,
    default: '',
  },
  vehicleRegistrationRc: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  adminFeedback: {
    type: String,
    default: '',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('KYC', kycSchema);

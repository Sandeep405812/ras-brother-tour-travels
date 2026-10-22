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
  legalName: {
    type: String,
    required: [true, 'Legal name as per Govt ID is required'],
    trim: true,
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
  panNumber: {
    type: String,
    trim: true,
    default: '',
  },
  panDocument: {
    type: String,
    default: '',
  },
  drivingLicenseNumber: {
    type: String,
    trim: true,
    default: '',
  },
  drivingLicense: {
    type: String,
    default: '',
  },
  rcNumber: {
    type: String,
    trim: true,
    default: '',
  },
  vehicleRegistrationRc: {
    type: String,
    default: '',
  },
  // Bank details for payout and fraud prevention (admin checks if bank account name matches legalName)
  bankAccountName: {
    type: String,
    trim: true,
    default: '',
  },
  bankAccountNumber: {
    type: String,
    trim: true,
    default: '',
  },
  bankIfsc: {
    type: String,
    trim: true,
    default: '',
  },
  bankName: {
    type: String,
    trim: true,
    default: '',
  },
  upiId: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['not_submitted', 'pending', 'verified', 'rejected'],
    default: 'pending',
  },
  adminFeedback: {
    type: String,
    default: '',
  },
  // Admin detail-matching audit trail to verify each piece of info
  adminAudit: {
    nameMatched: { type: Boolean, default: false },
    idVerified: { type: Boolean, default: false },
    bankMatched: { type: Boolean, default: false },
    rcVerified: { type: Boolean, default: false },
    dlVerified: { type: Boolean, default: false },
    verifiedByAdminName: { type: String, default: '' },
    verificationNotes: { type: String, default: '' },
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: {
    type: Date,
  },
});

kycSchema.index({ user: 1 });
kycSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('KYC', kycSchema);


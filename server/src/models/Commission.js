const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  platformRatePercentage: {
    type: Number,
    required: true,
    default: 10, // 10% commission
  },
  fixedBookingFee: {
    type: Number,
    default: 199,
  },
  taxPercentage: {
    type: Number,
    default: 5, // 5% GST
  },
  active: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Commission', commissionSchema);

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // ============================================================
    // BOOKING IDENTIFICATION
    // ============================================================

    bookingId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    bulkBookingId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },

    isBulkBooking: {
      type: Boolean,
      default: false,
    },

    // ============================================================
    // USERS
    // ============================================================

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

    // ============================================================
    // EVENT
    // ============================================================

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
        'Other',
      ],

      default: 'Wedding Car Booking',
    },

    // Purpose of Booking: 1. Wedding, 2. Party, 3. Travel
    bookingPurpose: {
      type: String,
      enum: ['Wedding', 'Party', 'Travel'],
      default: 'Wedding',
    },

    // Trip Direction: 1-way or 2-way (Round Trip)
    tripType: {
      type: String,
      enum: ['1-way', '2-way'],
      default: '1-way',
    },

    // Total hours requested for 2-way / round trip
    totalHours: {
      type: Number,
      default: 8,
      min: 1,
    },

    // ============================================================
    // DATE & TIME
    // ============================================================

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
      min: 0,
    },

    durationDays: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ============================================================
    // PICKUP LOCATION
    // GeoJSON format = [longitude, latitude]
    // ============================================================

    pickupLocation: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      coordinates: {
        type: [Number],

        required: [
          true,
          'Pickup location coordinates are required',
        ],

        validate: {
          validator: function (coordinates) {
            if (
              !Array.isArray(coordinates) ||
              coordinates.length !== 2
            ) {
              return false;
            }

            const lng = Number(coordinates[0]);
            const lat = Number(coordinates[1]);

            return (
              Number.isFinite(lng) &&
              Number.isFinite(lat) &&
              lng >= -180 &&
              lng <= 180 &&
              lat >= -90 &&
              lat <= 90
            );
          },

          message:
            'Valid pickup coordinates [longitude, latitude] are required.',
        },
      },
    },

    // ============================================================
    // DESTINATION
    // ============================================================

    destinationAddress: {
      type: String,
      default: '',
      trim: true,
    },

    destinationCoordinates: {
      type: [Number],

      default: [],

      validate: {
        validator: function (coordinates) {
          // Destination is optional for old/existing records.
          if (
            !Array.isArray(coordinates) ||
            coordinates.length === 0
          ) {
            return true;
          }

          if (coordinates.length !== 2) {
            return false;
          }

          const lng = Number(coordinates[0]);
          const lat = Number(coordinates[1]);

          return (
            Number.isFinite(lng) &&
            Number.isFinite(lat) &&
            lng >= -180 &&
            lng <= 180 &&
            lat >= -90 &&
            lat <= 90
          );
        },

        message:
          'Valid destination coordinates [longitude, latitude] are required.',
      },
    },

    // ============================================================
    // ACTUAL ROAD DISTANCE
    // Calculated by Google Routes API on backend
    // ============================================================

    distanceKm: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============================================================
    // OFFLINE / DIRECT CUSTOMER
    // ============================================================

    offlineCustomer: {
      name: {
        type: String,
        default: '',
        trim: true,
      },

      phone: {
        type: String,
        default: '',
        trim: true,
      },

      notes: {
        type: String,
        default: '',
        trim: true,
      },
    },

    // ============================================================
    // DECORATION
    // ============================================================

    decorationRequired: {
      type: Boolean,
      default: false,
    },

    decorationType: {
      type: String,
      default: 'None',
      trim: true,
    },

    decorationPackage: {
      id: {
        type: String,
        default: 'none',
        trim: true,
      },

      title: {
        type: String,
        default:
          'Standard Vehicle (No Decoration)',
        trim: true,
      },

      price: {
        type: Number,
        default: 0,
        min: 0,
      },

      image: {
        type: String,
        default: '',
      },
    },

    // ============================================================
    // RIDE OTP
    // ============================================================

    startOtp: {
      type: String,

      default: () =>
        Math.floor(
          1000 + Math.random() * 9000
        ).toString(),

      minlength: 4,
      maxlength: 4,
    },

    rideStartedAt: {
      type: Date,
    },

    rideCompletedAt: {
      type: Date,
    },

    // ============================================================
    // CHAUFFEUR
    // No fake phone/vehicle defaults
    // ============================================================

    chauffeur: {
      name: {
        type: String,
        default: '',
        trim: true,
      },

      phone: {
        type: String,
        default: '',
        trim: true,
      },

      vehiclePlate: {
        type: String,
        default: '',
        trim: true,
      },

      assignedAt: {
        type: Date,
      },
    },

    // ============================================================
    // REMAINING PAYMENT COLLECTION
    // ============================================================

    remainingCollected: {
      status: {
        type: Boolean,
        default: false,
      },

      method: {
        type: String,

        enum: [
          'cash',
          'upi',
          'online',
          'none',
        ],

        default: 'none',
      },

      amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      collectedAt: {
        type: Date,
      },
    },

    // ============================================================
    // GST
    // ============================================================

    gstDetails: {
      customerGstin: {
        type: String,
        default: '',
        trim: true,
      },

      businessName: {
        type: String,
        default: '',
        trim: true,
      },

      cgstAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      sgstAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // ============================================================
    // PAYMENT PROOF
    // ============================================================

    paymentScreenshot: {
      type: String,
      default: '',
    },

    utrNumber: {
      type: String,
      default: '',
      trim: true,
    },

    paymentVerificationStatus: {
      type: String,

      enum: [
        'pending_verification',
        'verified',
        'rejected',
        'none',
      ],

      default: 'none',
    },

    // ============================================================
    // DRIVER
    // ============================================================

    driverRequired: {
      type: Boolean,
      default: true,
    },

    specialRequests: {
      type: String,
      default: '',
      trim: true,
    },

    // ============================================================
    // PRICING
    // Final amount calculated by backend
    // ============================================================

    pricing: {
      baseAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      driverCharges: {
        type: Number,
        default: 0,
        min: 0,
      },

      decorationCharges: {
        type: Number,
        default: 0,
        min: 0,
      },

      nightCharges: {
        type: Number,
        default: 0,
        min: 0,
      },

      discountAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      platformCommission: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      advanceAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      remainingAmount: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    // ============================================================
    // BOOKING STATUS
    // ============================================================

    status: {
      type: String,

      enum: [
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'rejected',
      ],

      default: 'pending',
    },

    // ============================================================
    // PAYMENT METHOD
    // ============================================================

    paymentMethod: {
      type: String,

      enum: [
        'cash',
        'cod',
        'online',
        'upi',
        'razorpay',
      ],

      default: 'cash',
    },

    paymentStatus: {
      type: String,

      enum: [
        'pending',
        'advance_paid',
        'fully_paid',
        'refunded',
        'pay_on_pickup',
      ],

      default: 'pending',
    },

    // ============================================================
    // CANCELLATION
    // ============================================================

    cancellationReason: {
      type: String,
      default: '',
      trim: true,
    },

    cancelledBy: {
      type: String,

      enum: [
        'customer',
        'owner',
        'admin',
        'none',
      ],

      default: 'none',
    },

    // ============================================================
    // OFFER
    // ============================================================

    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
    },

    // ============================================================
    // NOTES
    // ============================================================

    notes: {
      type: String,
      default: '',
      trim: true,
    },

    // ============================================================
    // CREATED AT
    // ============================================================

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);


// ============================================================
// INDEXES (Optimized for Sub-millisecond Execution & Low Storage Footprint)
// ============================================================

bookingSchema.index({
  car: 1,
  startDate: 1,
  endDate: 1,
  status: 1,
});

bookingSchema.index({
  customer: 1,
  status: 1,
  createdAt: -1,
});

bookingSchema.index({
  owner: 1,
  status: 1,
  createdAt: -1,
});

bookingSchema.index({
  status: 1,
  startDate: 1,
});


// ============================================================
// EXPORT
// ============================================================

module.exports =
  mongoose.model(
    'Booking',
    bookingSchema
  );
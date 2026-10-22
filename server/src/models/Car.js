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

  registrationNumber: {
    type: String,
    trim: true,
    uppercase: true,
    default: '',
  },

  rcDocument: {
    type: String,
    default: '',
  },

  insuranceDocument: {
    type: String,
    default: '',
  },

  insuranceValidTill: {
    type: Date,
  },

  isVerifiedByAdmin: {
    type: Boolean,
    default: true,
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
    default: true,
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

  features: [
    {
      type: String,
    },
  ],

  images: {
    main: {
      type: String,
      required: true,
    },

    front: {
      type: String,
      default: '',
    },

    rear: {
      type: String,
      default: '',
    },

    side: {
      type: String,
      default: '',
    },

    interior: {
      type: String,
      default: '',
    },

    dashboard: {
      type: String,
      default: '',
    },

    gallery: [
      {
        type: String,
      },
    ],
  },

  videoUrl: {
    type: String,
    default: '',
  },

  // ==========================================================
  // PRICING
  // Owner must provide perKm rate.
  // No hard-coded ₹20/km.
  // ==========================================================
  pricing: {
    perKm: {
      type: Number,
      required: [true, 'Per kilometer rate is required'],
      min: [0.01, 'Per kilometer rate must be greater than 0'],
    },

    basePrice: {
      type: Number,
      default: 1000,
    },

    perHour: {
      type: Number,
      default: 0,
    },

    perDay: {
      type: Number,
      default: 2000,
    },

    weddingRate: {
      type: Number,
      default: 0,
    },

    partyRate: {
      type: Number,
      default: 0,
    },

    extraKmRate: {
      type: Number,
      min: [0.01, 'Extra kilometer rate must be greater than 0'],
    },

    driverCharges: {
      type: Number,
      default: 0,
    },

    nightCharges: {
      type: Number,
      default: 300,
    },

    decorationCharges: {
      type: Number,
      default: 0,
    },

    additionalServices: [
      {
        name: String,
        price: Number,
      },
    ],
  },

  // ==========================================================
  // ADVANCE PAYMENT
  // ==========================================================
  advancePayment: {
    type: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'percentage',
    },

    value: {
      type: Number,
      default: 20,
    },
  },

  paymentMethods: {
    type: [String],
    default: ['cod', 'online'],
  },

  unavailableDates: [
    {
      type: String,
    },
  ],

  // ==========================================================
  // VEHICLE LOCATION
  // Owner must provide actual coordinates.
  // GeoJSON format: [longitude, latitude]
  // ==========================================================
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },

    coordinates: {
      type: [Number],
      required: [true, 'Vehicle location coordinates are required'],

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
          'Valid location coordinates [longitude, latitude] are required.',
      },
    },

    address: {
      type: String,
      required: [true, 'Vehicle location address is required'],
      trim: true,
    },

    city: {
      type: String,
      required: [true, 'Vehicle city is required'],
      trim: true,
    },
  },

  // ==========================================================
  // SERVICE RADIUS
  // ==========================================================
  serviceRadiusKm: {
    type: Number,
    default: 100,
    min: [1, 'Service radius must be at least 1 KM'],
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

// ============================================================
// GEO & SPEED INDEXES (Fast Geospatial & Filter Execution)
// ============================================================
carSchema.index({
  location: '2dsphere',
});

carSchema.index({
  owner: 1,
  active: 1,
});

carSchema.index({
  isAvailable: 1,
  active: 1,
  createdAt: -1,
});

carSchema.index({
  category: 1,
  isAvailable: 1,
  active: 1,
});

module.exports = mongoose.model(
  'Car',
  carSchema
);
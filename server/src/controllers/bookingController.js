const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const OwnerProfile = require('../models/OwnerProfile');
const { generateInvoicePDF } = require('../services/invoiceService');

// ============================================================
// Helper to generate unique booking ID
// ============================================================

const generateBookingId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `RAS-BK-${randomNum}`;
};

// ============================================================
// Calculate REAL ROAD DISTANCE using Google Routes API
// Backend does NOT trust frontend distance.
// ============================================================

const calculateServerRoadDistance = async (origin, destination) => {
  if (
    !Array.isArray(origin) ||
    origin.length !== 2 ||
    !Array.isArray(destination) ||
    destination.length !== 2
  ) {
    throw new Error(
      'Valid pickup and destination coordinates are required.'
    );
  }

  // GeoJSON format = [longitude, latitude]
  const originLng = Number(origin[0]);
  const originLat = Number(origin[1]);

  const destinationLng = Number(destination[0]);
  const destinationLat = Number(destination[1]);

  const validCoordinates =
    Number.isFinite(originLng) &&
    Number.isFinite(originLat) &&
    Number.isFinite(destinationLng) &&
    Number.isFinite(destinationLat) &&
    originLng >= -180 &&
    originLng <= 180 &&
    originLat >= -90 &&
    originLat <= 90 &&
    destinationLng >= -180 &&
    destinationLng <= 180 &&
    destinationLat >= -90 &&
    destinationLat <= 90;

  if (!validCoordinates) {
    throw new Error(
      'Invalid pickup or destination coordinates.'
    );
  }

  // Fallback Haversine road calculation helper
  const calculateHaversineRoad = () => {
    const R = 6371; // Earth radius in km
    const dLat = ((destinationLat - originLat) * Math.PI) / 180;
    const dLon = ((destinationLng - originLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((originLat * Math.PI) / 180) *
        Math.cos((destinationLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Multiply by 1.25 to account for real road curves
    const km = Math.max(5, Math.round(R * c * 1.25 * 10) / 10);
    return {
      distanceKm: km,
      distanceMeters: Math.round(km * 1000),
    };
  };

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return calculateHaversineRoad();
  }

  try {
    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: originLat,
                longitude: originLng,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: destinationLat,
                longitude: destinationLng,
              },
            },
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          computeAlternativeRoutes: false,
          languageCode: 'en-IN',
          units: 'METRIC',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.routes?.length) {
      console.warn('Google Routes API returned error/no routes, using realistic road fallback:', data);
      return calculateHaversineRoad();
    }

    const distanceMeters = Number(data.routes[0].distanceMeters || 0);
    if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) {
      return calculateHaversineRoad();
    }

    return {
      distanceKm: Number((distanceMeters / 1000).toFixed(2)),
      distanceMeters,
    };
  } catch (err) {
    console.warn('Google Routes API fetch exception, using realistic road fallback:', err.message);
    return calculateHaversineRoad();
  }
};


// ============================================================
// CREATE NEW BOOKING
// ============================================================

// @desc Create New Booking
// @route POST /api/bookings

exports.createBooking = async (req, res, next) => {
  try {
    const {
      carId,

      eventType,

      bookingPurpose = 'Wedding',

      tripType = '1-way',

      totalHours = 8,

      startDate,

      endDate,

      startTime = '10:00 AM',

      endTime = '06:00 PM',

      pickupLocation,

      destinationAddress,

      destinationCoordinates,

      distanceKm = 0,

      offlineCustomerName,

      offlineCustomerPhone,

      isDirectBooking = false,

      decorationRequired = false,

      decorationType = 'None',

      driverRequired = true,

      specialRequests = '',

      couponCode,

      offerId,

      customTotalAmount,

      customPrice,

      paymentScreenshot = '',

      utrNumber = '',

      paymentMethod = 'cash',

      decorationPackage,

      gstDetails,
    } = req.body;


    // ========================================================
    // GET CAR
    // ========================================================

    const car = await Car
      .findById(carId)
      .populate('owner');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
    }


    // ========================================================
    // CAR AVAILABILITY
    // ========================================================

    if (!car.isAvailable || !car.active) {
      return res.status(400).json({
        success: false,
        message:
          'Vehicle is currently unavailable for bookings.',
      });
    }


    // ========================================================
    // DATE VALIDATION
    // ========================================================

    const start = new Date(startDate);

    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking dates.',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message:
          'End date cannot be prior to start date.',
      });
    }


    const startStr =
      start.toISOString().split('T')[0];

    const endStr =
      end.toISOString().split('T')[0];


    // ========================================================
    // OWNER UNAVAILABLE DATES
    // ========================================================

    if (
      Array.isArray(car.unavailableDates) &&
      car.unavailableDates.length > 0
    ) {
      const isBlocked =
        car.unavailableDates.some(
          (d) =>
            d >= startStr &&
            d <= endStr
        );

      if (isBlocked) {
        return res.status(409).json({
          success: false,

          message:
            `This car has been marked NOT AVAILABLE by the owner on ${startStr}. Please choose another date or car.`,
        });
      }
    }


    // ========================================================
    // DOUBLE BOOKING PREVENTION
    // ========================================================

    const existingConflict =
      await Booking.findOne({
        car: carId,

        status: {
          $in: [
            'confirmed',
            'in_progress',
            'pending',
          ],
        },

        $or: [
          {
            startDate: {
              $lte: end,
            },

            endDate: {
              $gte: start,
            },
          },
        ],
      });


    if (existingConflict) {
      return res.status(409).json({
        success: false,

        message:
          `This car is ALREADY BOOKED for ${startStr}. Please choose another date or browse a different car.`,
      });
    }


    // ========================================================
    // DURATION
    // ========================================================

    const diffTime =
      Math.abs(end - start);

    const durationDays =
      Math.max(
        1,
        Math.ceil(
          diffTime /
            (1000 * 60 * 60 * 24)
        )
      );


    // ========================================================
    // SECURE LOCATION VALIDATION
    // ========================================================

    const pickupCoordinates =
      pickupLocation?.coordinates;

    const destinationCoords =
      destinationCoordinates;


    if (
      !Array.isArray(pickupCoordinates) ||
      pickupCoordinates.length !== 2 ||

      !Array.isArray(destinationCoords) ||
      destinationCoords.length !== 2
    ) {
      return res.status(400).json({
        success: false,

        message:
          'Valid pickup and destination locations are required.',
      });
    }


    // ========================================================
    // OWNER PER KM RATE (Fallback to extraKmRate or standard ₹20/km)
    // ========================================================

    const perKmRate =
      Number(car.pricing?.perKm || car.pricing?.extraKmRate || 20);

    if (
      !Number.isFinite(perKmRate) ||
      perKmRate <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'This vehicle does not have a valid per-kilometer rate set by the owner.',
      });
    }


    // ========================================================
    // GOOGLE ROUTES API
    // SERVER CALCULATES ACTUAL ROAD DISTANCE
    // ========================================================

    let routeResult;

    try {
      routeResult =
        await calculateServerRoadDistance(
          pickupCoordinates,
          destinationCoords
        );
    } catch (routeError) {
      console.error(
        'Server route calculation failed:',
        routeError
      );

      return res.status(400).json({
        success: false,

        message:
          routeError.message ||
          'Unable to calculate road distance.',
      });
    }


    // IMPORTANT:
    // Frontend distanceKm is NOT used.
    // Google backend distance is used.

    const distNum =
      routeResult.distanceKm;


    // ========================================================
    // FINAL NORMAL FARE
    //
    // Road Distance × Owner Per KM Rate
    // ========================================================

    const isTwoWay = tripType === '2-way';
    const effectiveDistance = isTwoWay ? distNum * 2 : distNum;

    const distanceFare =
      Math.round(
        effectiveDistance * perKmRate
      );

    // If 2-way round trip, calculate total hours rental / waiting
    const hourlyRate = Number(car.pricing?.perHour) || 150;
    const hoursCharges = isTwoWay ? (Number(totalHours) || 8) * hourlyRate : 0;

    let baseAmount =
      distanceFare + hoursCharges;

    // Apply wedding or party rate if set by owner
    if (bookingPurpose === 'Wedding' && car.pricing?.weddingRate > 0) {
      baseAmount = Math.max(baseAmount, car.pricing.weddingRate);
    } else if (bookingPurpose === 'Party' && car.pricing?.partyRate > 0) {
      baseAmount = Math.max(baseAmount, car.pricing.partyRate);
    }

    let driverCharges = 0;

    let decorationCharges = 0;

    let discountAmount = 0;


    // ========================================================
    // COUPON
    // ========================================================

    if (couponCode) {
      const coupon =
        await Coupon.findOne({
          code:
            couponCode.toUpperCase(),

          active: true,
        });

      if (
        coupon &&
        coupon.expiryDate > new Date()
      ) {
        if (
          coupon.discountType ===
          'percentage'
        ) {
          discountAmount =
            Math.min(
              (baseAmount *
                coupon.discountValue) /
                100,

              coupon.maxDiscount ||
                5000
            );
        } else {
          discountAmount =
            Math.min(
              coupon.discountValue,

              coupon.maxDiscount ||
                5000
            );
        }
      }
    }


    // ========================================================
    // NORMAL TOTAL
    // ========================================================

    let totalAmount =
      baseAmount +
      driverCharges +
      decorationCharges -
      discountAmount;


    // ========================================================
    // DIRECT / NEGOTIATED BOOKING
    //
    // Customer cannot manipulate custom amount.
    // Only owner/admin direct booking or valid offer.
    // ========================================================

    const isOwnerOrAdmin =
      req.user.role === 'owner' ||
      req.user.role === 'admin';


    const isDirect =
      Boolean(
        isDirectBooking &&
        isOwnerOrAdmin
      );


    const finalCustomAmount =
      customTotalAmount ||
      customPrice;


    const hasValidCustomAmount =
      finalCustomAmount !==
        undefined &&
      finalCustomAmount !==
        null &&
      finalCustomAmount !== '' &&
      Number.isFinite(
        Number(finalCustomAmount)
      ) &&
      Number(finalCustomAmount) > 0;


    if (
      hasValidCustomAmount &&
      (isDirect ||
        Boolean(offerId))
    ) {
      totalAmount =
        Number(finalCustomAmount);
    }


    // ========================================================
    // ADVANCE PAYMENT
    // ========================================================

    let advanceAmount = 0;


    if (
      car.advancePayment?.type ===
      'percentage'
    ) {
      const pct =
        car.advancePayment.value ||
        20;

      advanceAmount =
        Math.round(
          (totalAmount * pct) /
            100
        );
    } else {
      advanceAmount =
        Math.min(
          totalAmount,

          car.advancePayment?.value ||
            1000
        );
    }


    const remainingAmount =
      Math.max(
        0,
        totalAmount -
          advanceAmount
      );


    // ========================================================
    // BOOKING ID
    // ========================================================

    const bookingId =
      generateBookingId();


    // ========================================================
    // PAYMENT
    // ========================================================

    const isOnlinePayment =
      paymentMethod === 'online' ||
      paymentMethod === 'upi';


    const hasProof =
      Boolean(
        paymentScreenshot ||
        (
          utrNumber &&
          utrNumber.trim().length > 0
        )
      );


    // ========================================================
    // CREATE BOOKING
    // ========================================================

    const booking =
      await Booking.create({
        bookingId,

        customer:
          req.user.id,

        owner:
          car.owner?._id || car.owner,

        car:
          car._id,

        eventType:
          eventType ||
          'Wedding Car Booking',

        bookingPurpose:
          bookingPurpose ||
          'Wedding',

        tripType:
          tripType ||
          '1-way',

        totalHours:
          totalHours ? Number(totalHours) : 8,

        startDate:
          start,

        endDate:
          end,

        startTime,

        endTime,

        durationDays,

        // SERVER CALCULATED DISTANCE
        distanceKm:
          distNum,

        pickupLocation: {
          address:
            pickupLocation?.address ||
            'Pickup location not specified',

          coordinates:
            pickupCoordinates,
        },

        destinationAddress:
          destinationAddress || '',

        destinationCoordinates:
          destinationCoords,

        offlineCustomer:
          isDirect
            ? {
                name:
                  offlineCustomerName ||
                  'Walk-in / Direct Client',

                phone:
                  offlineCustomerPhone ||
                  'N/A',
              }
            : undefined,

        decorationRequired,

        decorationType,

        decorationPackage:
          decorationPackage ||
          undefined,

        gstDetails:
          gstDetails ||
          undefined,

        paymentScreenshot:
          paymentScreenshot || '',

        utrNumber:
          utrNumber || '',

        paymentMethod:
          isOnlinePayment
            ? 'online'
            : 'cash',

        paymentVerificationStatus:
          isOnlinePayment &&
          hasProof
            ? 'pending_verification'
            : 'none',

        driverRequired,

        specialRequests,

        pricing: {
          baseAmount,

          driverCharges,

          decorationCharges,

          discountAmount,

          platformCommission:
            Math.round(
              totalAmount * 0.1
            ),

          totalAmount,

          advanceAmount,

          remainingAmount,
        },

        status:
          isDirect
            ? 'confirmed'
            : 'pending',

        paymentStatus:
          isDirect
            ? 'advance_paid'
            : (
                paymentMethod ===
                  'cash' ||
                paymentMethod ===
                  'cod'
              )
            ? 'pay_on_pickup'
            : (
                hasProof
                  ? 'advance_paid'
                  : 'pending'
              ),

        offerId:
          offerId ||
          undefined,
      });


    // ========================================================
    // OWNER NOTIFICATION
    // ========================================================

    if (!isDirect) {
      const notifMsg =
        paymentScreenshot
          ? `Customer uploaded advance payment receipt for ${car.brand} ${car.name} (UTR: ${utrNumber || 'N/A'}). Please verify screenshot to confirm booking.`

          : `You received a booking request (${bookingId}) for ${car.brand} ${car.name} for ${booking.eventType}.`;


      await Notification.create({
        user:
          car.owner._id,

        title:
          paymentScreenshot
            ? 'Payment Receipt Uploaded 📸'
            : 'New Booking Request',

        message:
          notifMsg,

        type:
          'booking',

        link:
          '/owner/bookings',
      });
    }


    // ========================================================
    // RESPONSE
    // ========================================================

    res.status(201).json({
      success: true,

      message:
        isDirect
          ? 'Direct reservation booked and confirmed successfully!'
          : 'Booking request placed successfully. Please proceed with advance payment to confirm.',

      booking,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET CUSTOMER BOOKINGS
// ============================================================

// @desc Get Customer's Bookings
// @route GET /api/bookings/my-bookings

exports.getMyBookings =
  async (req, res, next) => {
    try {
      const bookings =
        await Booking.find({
          customer:
            req.user.id,
        })
          .populate('car')
          .populate(
            'owner',
            'name phone email avatar'
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      res.json({
        success: true,

        count:
          bookings.length,

        bookings,
      });

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// GET OWNER BOOKINGS
// ============================================================

// @desc Get Owner's Bookings
// @route GET /api/bookings/owner-bookings

exports.getOwnerBookings =
  async (req, res, next) => {
    try {
      const ownerCars = await Car.find({ owner: req.user.id }).select('_id').lean();
      const ownerCarIds = ownerCars.map((c) => c._id);

      const bookings =
        await Booking.find({
          $or: [
            { owner: req.user.id },
            { car: { $in: ownerCarIds } },
          ],
        })
          .populate('car')
          .populate(
            'customer',
            'name phone email avatar'
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      res.json({
        success: true,

        count:
          bookings.length,

        bookings,
      });

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// GET SINGLE BOOKING
// ============================================================

// @desc Get Single Booking
// @route GET /api/bookings/:id

exports.getBookingById =
  async (req, res, next) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        )
          .populate('car')
          .populate(
            'customer',
            'name phone email avatar address'
          )
          .populate(
            'owner',
            'name phone email avatar'
          );


      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            'Booking not found.',
        });
      }


      // Auth check

      const isOwner =
        booking.owner?._id?.toString() ===
        req.user.id;


      const isCustomer =
        booking.customer?._id?.toString() ===
        req.user.id;


      const isAdmin =
        req.user.role === 'admin';


      if (
        !isOwner &&
        !isCustomer &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,

          message:
            'Not authorized to view this booking.',
        });
      }


      res.json({
        success: true,

        booking,
      });

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// UPDATE BOOKING STATUS
// ============================================================

// @desc Update Booking Status
// @route PUT /api/bookings/:id/status

exports.updateBookingStatus =
  async (req, res, next) => {
    try {
      const {
        status,
        cancellationReason,
      } = req.body;


      const booking =
        await Booking.findById(
          req.params.id
        )
          .populate('car')
          .populate('customer');


      if (!booking) {
        return res.status(404).json({
          success: false,

          message:
            'Booking not found.',
        });
      }


      const isOwner =
        booking.owner.toString() ===
        req.user.id;


      const isCustomer =
        booking.customer._id.toString() ===
        req.user.id;


      const isAdmin =
        req.user.role === 'admin';


      if (
        !isOwner &&
        !isAdmin &&
        !(
          isCustomer &&
          status === 'cancelled'
        )
      ) {
        return res.status(403).json({
          success: false,

          message:
            'Not authorized to modify booking status.',
        });
      }


      booking.status =
        status;


      if (
        status === 'cancelled'
      ) {
        booking.cancellationReason =
          cancellationReason ||
          'Cancelled by user';

        booking.cancelledBy =
          isCustomer
            ? 'customer'
            : (
                isOwner
                  ? 'owner'
                  : 'admin'
              );
      }


      await booking.save();


      // If completed, update owner total bookings and earnings

      if (
        status === 'completed'
      ) {
        await OwnerProfile.findOneAndUpdate(
          {
            user:
              booking.owner,
          },

          {
            $inc: {
              totalBookings: 1,

              totalEarnings:
                booking.pricing.totalAmount,
            },
          }
        );
      }


      // Notification

      const targetUserId =
        isOwner
          ? booking.customer._id
          : booking.owner;


      await Notification.create({
        user:
          targetUserId,

        title:
          `Booking Status: ${status.toUpperCase()}`,

        message:
          `Booking #${booking.bookingId} has been marked as ${status}.`,

        type:
          'booking',

        link:
          `/bookings/${booking._id}`,
      });


      res.json({
        success: true,

        message:
          `Booking marked as ${status}.`,

        booking,
      });

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// DOWNLOAD INVOICE
// ============================================================

// @desc Download Booking Invoice PDF
// @route GET /api/bookings/:id/invoice

exports.downloadInvoice =
  async (req, res, next) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        )
          .populate('car')
          .populate(
            'customer',
            'name email phone address'
          )
          .populate(
            'owner',
            'name email phone'
          );


      if (!booking) {
        return res.status(404).json({
          success: false,

          message:
            'Booking not found.',
        });
      }


      await generateInvoicePDF(
        booking,
        res
      );

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// START RIDE WITH OTP
// ============================================================

// @desc Verify Start OTP & Begin Ride
// @route PUT /api/bookings/:id/start-ride

exports.startRideWithOtp =
  async (req, res, next) => {
    try {
      const { otp } =
        req.body;


      const booking =
        await Booking.findById(
          req.params.id
        )
          .populate('car')
          .populate('customer');


      if (!booking) {
        return res.status(404).json({
          success: false,

          message:
            'Booking not found.',
        });
      }


      const isOwner =
        booking.owner.toString() ===
        req.user.id;


      const isAdmin =
        req.user.role === 'admin';


      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,

          message:
            'Only assigned owner or admin can start the ride.',
        });
      }


      // Check that ride is being started on scheduled date
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const todayIST = new Date(now.getTime() + istOffset).toISOString().split('T')[0];
      const startIST = new Date(new Date(booking.startDate).getTime() + istOffset).toISOString().split('T')[0];

      if (todayIST < startIST) {
        return res.status(400).json({
          success: false,
          message: `Ride can only be started on the scheduled date (${new Date(booking.startDate).toLocaleDateString('en-IN')}). OTP will unlock on that day!`,
        });
      }

      if (
        String(otp).trim() !==
        String(
          booking.startOtp
        ).trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            'Invalid 4-digit OTP provided by customer.',
        });
      }


      booking.status =
        'in_progress';

      booking.rideStartedAt =
        new Date();


      await booking.save();


      await Notification.create({
        user:
          booking.customer._id,

        title:
          'Chauffeur Ride Started!',

        message:
          `Your ride for booking #${booking.bookingId} (${booking.car.brand} ${booking.car.name}) has commenced. Have a wonderful celebration!`,

        type:
          'booking',

        link:
          `/bookings/${booking._id}`,
      });


      res.json({
        success: true,

        message:
          'OTP verified successfully! Ride has officially started.',

        booking,
      });

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// COMPLETE RIDE
// ============================================================

// @desc Complete Ride & Record Balance Payment Collection
// @route PUT /api/bookings/:id/complete-ride

exports.completeRide =
  async (req, res, next) => {
    try {
      const {
        collectionMethod = 'cash',
        notes = '',
      } = req.body;


      const booking =
        await Booking.findById(
          req.params.id
        )
          .populate('car')
          .populate('customer');


      if (!booking) {
        return res.status(404).json({
          success: false,

          message:
            'Booking not found.',
        });
      }


      const isOwner =
        booking.owner.toString() ===
        req.user.id;


      const isAdmin =
        req.user.role === 'admin';


      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,

          message:
            'Not authorized to complete this ride.',
        });
      }


      booking.status =
        'completed';

      booking.paymentStatus =
        'fully_paid';

      booking.rideCompletedAt =
        new Date();


      booking.remainingCollected = {
        status:
          true,

        method:
          collectionMethod,

        amount:
          booking.pricing?.remainingAmount ||
          0,

        collectedAt:
          new Date(),
      };


      if (notes) {
        booking.notes =
          notes;
      }


      await booking.save();

      // Automatically restore car availability so it shows back in fleet immediately!
      try {
        await Car.findByIdAndUpdate(booking.car._id, {
          isAvailable: true,
          paused: false,
        });

        const carDoc = await Car.findById(booking.car._id);
        if (carDoc && carDoc.unavailableDates?.length) {
          const bookedDay = new Date(booking.startDate).toISOString().split('T')[0];
          carDoc.unavailableDates = carDoc.unavailableDates.filter(
            (d) => new Date(d).toISOString().split('T')[0] !== bookedDay
          );
          await carDoc.save();
        }
      } catch (err) {
        console.warn('Car availability restoration notice:', err);
      }


      // Credit owner profile earnings & available wallet balance
      // after 10% platform commission

      const netOwnerCredit =
        Math.round(
          (
            booking.pricing?.totalAmount ||
            0
          ) * 0.9
        );


      await OwnerProfile.findOneAndUpdate(
        {
          user:
            booking.owner,
        },

        {
          $inc: {
            totalBookings: 1,

            totalEarnings:
              booking.pricing?.totalAmount ||
              0,

            'wallet.availableBalance':
              netOwnerCredit,
          },
        }
      );


      await Notification.create({
        user:
          booking.customer._id,

        title:
          'Booking Completed! Thank you',

        message:
          `Your event booking #${booking.bookingId} is marked complete. We hope you loved RAS Brother Tour & Travels service! Please share your review.`,

        type:
          'booking',

        link:
          `/bookings/${booking._id}`,
      });


      res.json({
        success: true,

        message:
          'Trip completed and balance collection recorded successfully!',

        booking,
      });

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// ASSIGN CHAUFFEUR
// ============================================================

// @desc Assign Chauffeur & Vehicle Plate
// @route PUT /api/bookings/:id/chauffeur

exports.assignChauffeur =
  async (req, res, next) => {
    try {
      const {
        chauffeurName,
        chauffeurPhone,
        vehiclePlate,
      } = req.body;


      const booking =
        await Booking.findById(
          req.params.id
        );


      if (!booking) {
        return res.status(404).json({
          success: false,

          message:
            'Booking not found.',
        });
      }


      booking.chauffeur = {
        name:
          chauffeurName ||
          booking.chauffeur?.name,

        phone:
          chauffeurPhone ||
          booking.chauffeur?.phone,

        vehiclePlate:
          vehiclePlate ||
          booking.chauffeur?.vehiclePlate,

        assignedAt:
          new Date(),
      };


      await booking.save();


      res.json({
        success: true,

        message:
          'Chauffeur details updated successfully!',

        chauffeur:
          booking.chauffeur,
      });

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// VERIFY PAYMENT
// ============================================================

// @desc Verify Customer Payment Screenshot
// @route PUT /api/bookings/:id/verify-payment

exports.verifyPaymentAndConfirmBooking =
  async (req, res, next) => {
    try {
      const {
        action = 'verify',
      } = req.body;


      const booking =
        await Booking.findById(
          req.params.id
        )
          .populate(
            'car',
            'brand name'
          )
          .populate(
            'customer',
            'name phone email'
          );


      if (!booking) {
        return res.status(404).json({
          success: false,

          message:
            'Booking not found.',
        });
      }


      if (
        action === 'verify'
      ) {
        booking.paymentVerificationStatus =
          'verified';

        booking.paymentStatus =
          'advance_paid';

        booking.status =
          'confirmed';


        await booking.save();


        // Notify customer

        if (booking.customer?._id) {
          await Notification.create({
            user:
              booking.customer._id,

            title:
              'Advance Payment Verified & Booking Confirmed! 🎉',

            message:
              `Your advance payment for ${booking.car?.brand} ${booking.car?.name} has been verified and confirmed. Start Ride OTP: ${booking.startOtp}.`,

            type:
              'booking',

            link:
              '/customer/bookings',
          });
        }


        return res.json({
          success: true,

          message:
            'Payment verified and booking confirmed successfully!',

          booking,
        });

      } else {
        booking.paymentVerificationStatus =
          'rejected';


        await booking.save();


        if (booking.customer?._id) {
          await Notification.create({
            user:
              booking.customer._id,

            title:
              'Payment Receipt Mismatch ⚠️',

            message:
              'The fleet owner could not match your advance payment screenshot. Please check transaction UTR or re-upload.',

            type:
              'booking',

            link:
              '/customer/bookings',
          });
        }


        return res.json({
          success: true,

          message:
            'Payment verification marked as rejected.',

          booking,
        });
      }

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// BULK BOOKING
// ============================================================

// @desc Create Bulk Car Booking
// @route POST /api/bookings/bulk

exports.createBulkBooking =
  async (req, res, next) => {
    try {
      const {
        cars = [],

        eventType =
          'Wedding Car Booking',

        startDate,

        endDate,

        startTime =
          '09:00 AM',

        endTime =
          '06:00 PM',

        pickupLocation,

        destinationAddress,

        distanceKm = 0,

        paymentScreenshot =
          '',

        utrNumber =
          '',

        paymentMethod =
          'cash',

        specialRequests =
          '',
      } = req.body;


      if (
        !cars ||
        cars.length === 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            'No vehicles provided for bulk booking.',
        });
      }


      const randomBulk =
        Math.floor(
          100000 +
          Math.random() *
          900000
        );


      const bulkBookingId =
        `RAS-BULK-${randomBulk}`;


      const createdBookings = [];

      let totalFleetPrice = 0;

      let totalFleetAdvance = 0;


      for (
        const item of cars
      ) {
        const car =
          await Car.findById(
            item.carId
          ).populate('owner');


        if (!car) {
          continue;
        }


        const randomNum =
          Math.floor(
            100000 +
            Math.random() *
            900000
          );


        const bookingId =
          `RAS-BK-${randomNum}`;


        const s =
          new Date(startDate);

        const e =
          new Date(endDate);


        const diffTime =
          Math.abs(e - s);


        const durationDays =
          Math.max(
            1,

            Math.ceil(
              diffTime /
                (
                  1000 *
                  60 *
                  60 *
                  24
                )
            ) || 1
          );


        // No hardcoded 5000
        const basePerDay =
          Number(
            car.pricing?.perDay ||
            car.pricing?.basePrice ||
            0
          );


        const baseAmount =
          basePerDay *
          durationDays;


        const driverCharges =
          item.driverRequired !== false
            ? Number(
                car.pricing?.driverCharges ||
                0
              ) * durationDays

            : 0;


        const decorationCharges =
          item.decorationPackageId &&
          item.decorationPackageId !==
            'none'

            ? Number(
                car.pricing
                  ?.decorationCharges ||
                0
              )

            : 0;


        const extraKmRate =
          Number(
            car.pricing?.extraKmRate ||
            car.pricing?.perKm ||
            0
          );


        const safeDistance =
          Number(distanceKm) || 0;


        const extraKmCost =
          safeDistance > 80 &&
          extraKmRate > 0

            ? (
                safeDistance -
                80
              ) * extraKmRate

            : 0;


        const itemTotal =
          item.customTotal ||
          (
            baseAmount +
            driverCharges +
            decorationCharges +
            extraKmCost
          );


        const advanceType =
          car.advancePayment?.type ||
          'percentage';


        const advanceValue =
          car.advancePayment?.value ||
          20;


        const itemAdvance =
          advanceType ===
          'percentage'

            ? Math.round(
                (
                  itemTotal *
                  advanceValue
                ) / 100
              )

            : advanceValue;


        const itemRemaining =
          Math.max(
            0,
            itemTotal -
              itemAdvance
          );


        totalFleetPrice +=
          itemTotal;


        totalFleetAdvance +=
          itemAdvance;


        const startOtp =
          Math.floor(
            1000 +
            Math.random() *
            9000
          ).toString();


        const booking =
          await Booking.create({
            bookingId,

            bulkBookingId,

            isBulkBooking:
              true,

            customer:
              req.user.id,

            owner:
              car.owner._id ||
              car.owner,

            car:
              car._id,

            eventType,

            startDate:
              s,

            endDate:
              e,

            startTime,

            endTime,

            durationDays,

            pickupLocation:
              typeof pickupLocation ===
              'object'

                ? pickupLocation

                : {
                    address:
                      pickupLocation ||
                      '',
                  },

            destinationAddress:
              destinationAddress ||
              '',

            distanceKm:
              safeDistance,

            driverRequired:
              item.driverRequired !==
              false,

            decorationRequired:
              Boolean(
                decorationCharges > 0
              ),

            decorationPackage:
              item.decorationPackageId
                ? {
                    id:
                      item.decorationPackageId,

                    name:
                      item.decorationPackageName ||
                      'Wedding Floral',
                  }

                : undefined,

            specialRequests,

            pricing: {
              baseAmount,

              driverCharges,

              decorationCharges,

              nightCharges:
                0,

              discountAmount:
                0,

              platformCommission:
                Math.round(
                  itemTotal * 0.1
                ),

              totalAmount:
                itemTotal,

              advanceAmount:
                itemAdvance,

              remainingAmount:
                itemRemaining,
            },

            paymentScreenshot,

            utrNumber,

            paymentMethod:
              paymentMethod ===
                'online' ||
              paymentMethod ===
                'upi'

                ? 'online'

                : 'cash',

            paymentStatus:
              (
                paymentMethod ===
                  'cash' ||
                paymentMethod ===
                  'cod'
              )

                ? 'pay_on_pickup'

                : (
                    paymentScreenshot
                      ? 'advance_paid'
                      : 'pending'
                  ),

            paymentVerificationStatus:
              (
                paymentMethod ===
                  'online' ||
                paymentMethod ===
                  'upi'
              ) &&
              paymentScreenshot

                ? 'pending_verification'

                : 'none',

            startOtp,

            status:
              'pending',
          });


        createdBookings.push(
          booking
        );


        if (car.owner) {
          await Notification.create({
            user:
              car.owner._id ||
              car.owner,

            title:
              'New Bulk Wedding Fleet Booking Received! 🚗💨',

            message:
              `Your ${car.brand} ${car.name} was booked as part of Wedding Convoy #${bulkBookingId}. Please verify advance receipt.`,

            type:
              'booking',

            link:
              '/owner/bookings',
          });
        }
      }


      await Notification.create({
        user:
          req.user.id,

        title:
          'Wedding Convoy Bulk Booking Placed! 🎉',

        message:
          `Your convoy order #${bulkBookingId} with ${createdBookings.length} vehicles has been placed. Fleet owners are verifying the advance payment.`,

        type:
          'booking',

        link:
          '/customer/bookings',
      });


      res.status(201).json({
        success: true,

        message:
          `Bulk booking for ${createdBookings.length} vehicles placed successfully.`,

        bulkBookingId,

        totalFleetPrice,

        totalFleetAdvance,

        count:
          createdBookings.length,

        bookings:
          createdBookings,
      });

    } catch (error) {
      next(error);
    }
  };


// ============================================================
// BOOKING QUERY
// ============================================================

// @desc Customer Car Booking Inquiry
// @route POST /api/bookings/query

exports.createBookingQuery =
  async (req, res, next) => {
    try {
      const {
        carId,
        name,
        phone,
        message,
        date,
      } = req.body;


      let carName =
        'Car Rental Service';


      if (carId) {
        const car =
          await Car.findById(
            carId
          );


        if (car) {
          carName =
            `${car.brand || ''} ${car.name}`;
        }
      }


      // Notify all Admins

      const admins =
        await User.find({
          role:
            'admin',
        });


      const notifications =
        admins.map(
          (admin) => ({
            user:
              admin._id,

            title:
              `📞 Booking Query: ${name || 'Customer'}`,

            message:
              `Customer Inquiry from ${name || 'User'} (${phone || 'N/A'}) for ${carName} on ${date || 'Flexible Date'}: "${message || 'Customer requested car information / pricing'}"`,

            type:
              'query',

            link:
              '/admin',
          })
        );


      if (
        notifications.length > 0
      ) {
        await Notification.insertMany(
          notifications
        );
      }


      res.json({
        success: true,

        message:
          'Your query has been sent to the Admin team. We will call/contact you shortly!',
      });

    } catch (error) {
      next(error);
    }
  };
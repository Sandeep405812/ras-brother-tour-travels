const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const OwnerProfile = require('../models/OwnerProfile');
const { generateInvoicePDF } = require('../services/invoiceService');

// Helper to generate unique booking ID
const generateBookingId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `RAS-BK-${randomNum}`;
};

// @desc Create New Booking (with Double Booking Prevention)
// @route POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const {
      carId,
      eventType,
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
      paymentScreenshot = '',
      utrNumber = '',
      decorationPackage,
      gstDetails,
    } = req.body;

    const car = await Car.findById(carId).populate('owner');
    if (!car) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    if (!car.isAvailable || !car.active) {
      return res.status(400).json({ success: false, message: 'Vehicle is currently unavailable for bookings.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be prior to start date.' });
    }

    // Backend-level Double Booking Prevention (Collision Detection)
    const existingConflict = await Booking.findOne({
      car: carId,
      status: { $in: ['confirmed', 'in_progress'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: `This vehicle is already reserved for the selected date range (${new Date(existingConflict.startDate).toLocaleDateString()} to ${new Date(existingConflict.endDate).toLocaleDateString()}). Please choose alternate dates or browse another premium car.`,
      });
    }

    // Calculate Duration in Days
    const diffTime = Math.abs(end - start);
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Distance Fare Calculation (Ola/Uber style)
    const distNum = Number(distanceKm) || 0;
    const includedKmPerDay = 80;
    const totalIncludedKm = includedKmPerDay * durationDays;
    const extraKm = Math.max(0, distNum - totalIncludedKm);
    const extraKmCharge = extraKm * (car.pricing?.extraKmRate || 15);

    // Pricing calculation
    let baseAmount = (car.pricing.perDay || car.pricing.basePrice) * durationDays + extraKmCharge;
    let driverCharges = driverRequired ? (car.pricing.driverCharges || 500) * durationDays : 0;
    let decorationCharges = decorationRequired ? (car.pricing.decorationCharges || 1500) : 0;
    let discountAmount = 0;

    // Check Coupon if applied
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && coupon.expiryDate > new Date()) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.min((baseAmount * coupon.discountValue) / 100, coupon.maxDiscount || 5000);
        } else {
          discountAmount = Math.min(coupon.discountValue, coupon.maxDiscount || 5000);
        }
      }
    }

    let totalAmount = baseAmount + driverCharges + decorationCharges - discountAmount;
    
    // If negotiated via "Make an Offer"
    if (customTotalAmount && !isNaN(customTotalAmount) && Number(customTotalAmount) > 0) {
      totalAmount = Number(customTotalAmount);
    }

    // Advance amount calculation (fixed or percentage)
    let advanceAmount = 0;
    if (car.advancePayment?.type === 'percentage') {
      const pct = car.advancePayment.value || 20;
      advanceAmount = Math.round((totalAmount * pct) / 100);
    } else {
      advanceAmount = Math.min(totalAmount, car.advancePayment?.value || 1000);
    }
    const remainingAmount = Math.max(0, totalAmount - advanceAmount);

    const bookingId = generateBookingId();
    const isOwnerOrAdmin = req.user.role === 'owner' || req.user.role === 'admin';
    const isDirect = Boolean(isDirectBooking && isOwnerOrAdmin);

    const booking = await Booking.create({
      bookingId,
      customer: req.user.id,
      owner: car.owner._id,
      car: car._id,
      eventType: eventType || 'Wedding Car Booking',
      startDate: start,
      endDate: end,
      startTime,
      endTime,
      durationDays,
      distanceKm: distNum,
      pickupLocation: {
        address: pickupLocation?.address || 'Pickup location not specified',
        coordinates: pickupLocation?.coordinates || car.location.coordinates,
      },
      destinationAddress: destinationAddress || '',
      destinationCoordinates: destinationCoordinates || [],
      offlineCustomer: isDirect ? {
        name: offlineCustomerName || 'Walk-in / Direct Client',
        phone: offlineCustomerPhone || 'N/A',
      } : undefined,
      decorationRequired,
      decorationType,
      decorationPackage: decorationPackage || undefined,
      gstDetails: gstDetails || undefined,
      paymentScreenshot: paymentScreenshot || '',
      utrNumber: utrNumber || '',
      paymentVerificationStatus: paymentScreenshot ? 'pending_verification' : 'none',
      driverRequired,
      specialRequests,
      pricing: {
        baseAmount,
        driverCharges,
        decorationCharges,
        discountAmount,
        platformCommission: Math.round(totalAmount * 0.1),
        totalAmount,
        advanceAmount,
        remainingAmount,
      },
      status: isDirect ? 'confirmed' : 'pending',
      paymentStatus: isDirect ? 'advance_paid' : (paymentScreenshot ? 'pending' : 'pending'),
      offerId: offerId || undefined,
    });

    // Notify Owner if not booked by owner themselves
    if (!isDirect) {
      const notifMsg = paymentScreenshot
        ? `Customer uploaded advance payment receipt for ${car.brand} ${car.name} (UTR: ${utrNumber || 'N/A'}). Please verify screenshot to confirm booking.`
        : `You received a booking request (${bookingId}) for ${car.brand} ${car.name} for ${booking.eventType}.`;

      await Notification.create({
        user: car.owner._id,
        title: paymentScreenshot ? 'Payment Receipt Uploaded 📸' : 'New Booking Request',
        message: notifMsg,
        type: 'booking',
        link: `/owner/bookings`,
      });
    }

    res.status(201).json({
      success: true,
      message: isDirect
        ? 'Direct reservation booked and confirmed successfully!'
        : 'Booking request placed successfully. Please proceed with advance payment to confirm.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Customer's Bookings
// @route GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('car')
      .populate('owner', 'name phone email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Owner's Bookings
// @route GET /api/bookings/owner-bookings
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate('car')
      .populate('customer', 'name phone email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Single Booking
// @route GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('customer', 'name phone email avatar address')
      .populate('owner', 'name phone email avatar');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Auth check
    const isOwner = booking.owner?._id?.toString() === req.user.id;
    const isCustomer = booking.customer?._id?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isCustomer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking.' });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update Booking Status (Accept / Reject / Complete / Progress)
// @route PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('car').populate('customer');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isOwner = booking.owner.toString() === req.user.id;
    const isCustomer = booking.customer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin && !(isCustomer && status === 'cancelled')) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify booking status.' });
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancellationReason = cancellationReason || 'Cancelled by user';
      booking.cancelledBy = isCustomer ? 'customer' : (isOwner ? 'owner' : 'admin');
    }

    await booking.save();

    // If completed, update owner total bookings and earnings
    if (status === 'completed') {
      await OwnerProfile.findOneAndUpdate(
        { user: booking.owner },
        {
          $inc: {
            totalBookings: 1,
            totalEarnings: booking.pricing.totalAmount,
          },
        }
      );
    }

    // Notification
    const targetUserId = isOwner ? booking.customer._id : booking.owner;
    await Notification.create({
      user: targetUserId,
      title: `Booking Status: ${status.toUpperCase()}`,
      message: `Booking #${booking.bookingId} has been marked as ${status}.`,
      type: 'booking',
      link: `/bookings/${booking._id}`,
    });

    res.json({
      success: true,
      message: `Booking marked as ${status}.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Download Booking Invoice PDF
// @route GET /api/bookings/:id/invoice
exports.downloadInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('customer', 'name email phone address')
      .populate('owner', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    await generateInvoicePDF(booking, res);
  } catch (error) {
    next(error);
  }
};

// @desc Verify Start OTP & Begin Ride
// @route PUT /api/bookings/:id/start-ride
exports.startRideWithOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('customer');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isOwner = booking.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only assigned owner or admin can start the ride.' });
    }

    if (String(otp).trim() !== String(booking.startOtp).trim()) {
      return res.status(400).json({ success: false, message: 'Invalid 4-digit OTP provided by customer.' });
    }

    booking.status = 'in_progress';
    booking.rideStartedAt = new Date();
    await booking.save();

    await Notification.create({
      user: booking.customer._id,
      title: 'Chauffeur Ride Started!',
      message: `Your ride for booking #${booking.bookingId} (${booking.car.brand} ${booking.car.name}) has commenced. Have a wonderful celebration!`,
      type: 'booking',
      link: `/bookings/${booking._id}`,
    });

    res.json({
      success: true,
      message: 'OTP verified successfully! Ride has officially started.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Complete Ride & Record Balance Payment Collection
// @route PUT /api/bookings/:id/complete-ride
exports.completeRide = async (req, res, next) => {
  try {
    const { collectionMethod = 'cash', notes = '' } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('customer');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isOwner = booking.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this ride.' });
    }

    booking.status = 'completed';
    booking.paymentStatus = 'fully_paid';
    booking.rideCompletedAt = new Date();
    booking.remainingCollected = {
      status: true,
      method: collectionMethod,
      amount: booking.pricing?.remainingAmount || 0,
      collectedAt: new Date(),
    };
    if (notes) booking.notes = notes;
    await booking.save();

    // Credit owner profile earnings & available wallet balance (after 10% platform commission)
    const netOwnerCredit = Math.round((booking.pricing?.totalAmount || 0) * 0.9);
    await OwnerProfile.findOneAndUpdate(
      { user: booking.owner },
      {
        $inc: {
          totalBookings: 1,
          totalEarnings: booking.pricing?.totalAmount || 0,
          'wallet.availableBalance': netOwnerCredit,
        },
      }
    );

    await Notification.create({
      user: booking.customer._id,
      title: 'Booking Completed! Thank you',
      message: `Your event booking #${booking.bookingId} is marked complete. We hope you loved RAS Brother Tour & Travels service! Please share your review.`,
      type: 'booking',
      link: `/bookings/${booking._id}`,
    });

    res.json({
      success: true,
      message: 'Trip completed and balance collection recorded successfully!',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Assign Chauffeur & Vehicle Plate
// @route PUT /api/bookings/:id/chauffeur
exports.assignChauffeur = async (req, res, next) => {
  try {
    const { chauffeurName, chauffeurPhone, vehiclePlate } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.chauffeur = {
      name: chauffeurName || booking.chauffeur?.name,
      phone: chauffeurPhone || booking.chauffeur?.phone,
      vehiclePlate: vehiclePlate || booking.chauffeur?.vehiclePlate,
      assignedAt: new Date(),
    };
    await booking.save();

    res.json({
      success: true,
      message: 'Chauffeur details updated successfully!',
      chauffeur: booking.chauffeur,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Verify Customer Payment Screenshot & Match UTR to Confirm Booking
// @route PUT /api/bookings/:id/verify-payment
exports.verifyPaymentAndConfirmBooking = async (req, res, next) => {
  try {
    const { action = 'verify' } = req.body; // 'verify' | 'reject'
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'brand name')
      .populate('customer', 'name phone email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (action === 'verify') {
      booking.paymentVerificationStatus = 'verified';
      booking.paymentStatus = 'advance_paid';
      booking.status = 'confirmed';
      await booking.save();

      // Notify customer that booking is confirmed
      if (booking.customer?._id) {
        await Notification.create({
          user: booking.customer._id,
          title: 'Advance Payment Verified & Booking Confirmed! 🎉',
          message: `Your advance payment for ${booking.car?.brand} ${booking.car?.name} has been verified and confirmed. Start Ride OTP: ${booking.startOtp}.`,
          type: 'booking',
          link: '/customer/bookings',
        });
      }

      return res.json({
        success: true,
        message: 'Payment verified and booking confirmed successfully!',
        booking,
      });
    } else {
      booking.paymentVerificationStatus = 'rejected';
      await booking.save();

      if (booking.customer?._id) {
        await Notification.create({
          user: booking.customer._id,
          title: 'Payment Receipt Mismatch ⚠️',
          message: `The fleet owner could not match your advance payment screenshot. Please check transaction UTR or re-upload.`,
          type: 'booking',
          link: '/customer/bookings',
        });
      }

      return res.json({
        success: true,
        message: 'Payment verification marked as rejected.',
        booking,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Create Bulk Car Booking (Wedding Fleet / Add to Cart)
// @route POST /api/bookings/bulk
exports.createBulkBooking = async (req, res, next) => {
  try {
    const {
      cars = [],
      eventType = 'Wedding Car Booking',
      startDate,
      endDate,
      startTime = '09:00 AM',
      endTime = '06:00 PM',
      pickupLocation,
      destinationAddress,
      distanceKm = 0,
      paymentScreenshot = '',
      utrNumber = '',
      specialRequests = '',
    } = req.body;

    if (!cars || cars.length === 0) {
      return res.status(400).json({ success: false, message: 'No vehicles provided for bulk booking.' });
    }

    const randomBulk = Math.floor(100000 + Math.random() * 900000);
    const bulkBookingId = `RAS-BULK-${randomBulk}`;

    const createdBookings = [];
    let totalFleetPrice = 0;
    let totalFleetAdvance = 0;

    for (const item of cars) {
      const car = await Car.findById(item.carId).populate('owner');
      if (!car) continue;

      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const bookingId = `RAS-BK-${randomNum}`;

      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffTime = Math.abs(e - s);
      const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1);

      const basePerDay = car.pricing?.perDay || car.pricing?.basePrice || 5000;
      const baseAmount = basePerDay * durationDays;
      const driverCharges = item.driverRequired !== false ? (car.pricing?.driverCharges || 500) * durationDays : 0;
      const decorationCharges = item.decorationPackageId && item.decorationPackageId !== 'none'
        ? (car.pricing?.decorationCharges || 1500)
        : 0;
      const extraKmCost = distanceKm > 80 ? (distanceKm - 80) * (car.pricing?.extraKmRate || 15) : 0;

      const itemTotal = item.customTotal || (baseAmount + driverCharges + decorationCharges + extraKmCost);
      const advanceType = car.advancePayment?.type || 'percentage';
      const advanceValue = car.advancePayment?.value || 20;
      const itemAdvance = advanceType === 'percentage'
        ? Math.round((itemTotal * advanceValue) / 100)
        : advanceValue;
      const itemRemaining = Math.max(0, itemTotal - itemAdvance);

      totalFleetPrice += itemTotal;
      totalFleetAdvance += itemAdvance;

      const startOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const booking = await Booking.create({
        bookingId,
        bulkBookingId,
        isBulkBooking: true,
        customer: req.user.id,
        owner: car.owner._id || car.owner,
        car: car._id,
        eventType,
        startDate: s,
        endDate: e,
        startTime,
        endTime,
        durationDays,
        pickupLocation: typeof pickupLocation === 'object' ? pickupLocation : { address: pickupLocation || 'New Delhi' },
        destinationAddress: destinationAddress || '',
        distanceKm: Number(distanceKm) || 0,
        driverRequired: item.driverRequired !== false,
        decorationRequired: Boolean(decorationCharges > 0),
        decorationPackage: item.decorationPackageId ? { id: item.decorationPackageId, name: item.decorationPackageName || 'Wedding Floral' } : undefined,
        specialRequests,
        pricing: {
          baseAmount,
          driverCharges,
          decorationCharges,
          nightCharges: 0,
          discountAmount: 0,
          platformCommission: Math.round(itemTotal * 0.1),
          totalAmount: itemTotal,
          advanceAmount: itemAdvance,
          remainingAmount: itemRemaining,
        },
        paymentScreenshot,
        utrNumber,
        paymentVerificationStatus: paymentScreenshot || utrNumber ? 'pending_verification' : 'none',
        startOtp,
        status: 'pending',
      });

      createdBookings.push(booking);

      if (car.owner) {
        await Notification.create({
          user: car.owner._id || car.owner,
          title: 'New Bulk Wedding Fleet Booking Received! 🚗💨',
          message: `Your ${car.brand} ${car.name} was booked as part of Wedding Convoy #${bulkBookingId}. Please verify advance receipt.`,
          type: 'booking',
          link: '/owner/bookings',
        });
      }
    }

    await Notification.create({
      user: req.user.id,
      title: 'Wedding Convoy Bulk Booking Placed! 🎉',
      message: `Your convoy order #${bulkBookingId} with ${createdBookings.length} vehicles has been placed. Fleet owners are verifying the advance payment.`,
      type: 'booking',
      link: '/customer/bookings',
    });

    res.status(201).json({
      success: true,
      message: `Bulk booking for ${createdBookings.length} vehicles placed successfully.`,
      bulkBookingId,
      totalFleetPrice,
      totalFleetAdvance,
      count: createdBookings.length,
      bookings: createdBookings,
    });
  } catch (error) {
    next(error);
  }
};

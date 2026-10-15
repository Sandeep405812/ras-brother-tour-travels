const OwnerProfile = require('../models/OwnerProfile');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const KYC = require('../models/KYC');
const Review = require('../models/Review');

// @desc Get Owner Dashboard Metrics & Analytics
// @route GET /api/owners/dashboard
exports.getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const profile = await OwnerProfile.findOne({ user: ownerId });

    const totalCars = await Car.countDocuments({ owner: ownerId });
    const pendingBookings = await Booking.countDocuments({ owner: ownerId, status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ owner: ownerId, status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ owner: ownerId, status: 'completed' });

    // Calculate total revenue from completed/confirmed bookings
    const bookings = await Booking.find({
      owner: ownerId,
      status: { $in: ['confirmed', 'in_progress', 'completed'] },
    });

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

    // Initialize or auto-sync wallet for owner
    if (!profile) {
      profile = await OwnerProfile.create({
        user: ownerId,
        businessName: (req.user.name || 'Fleet Owner') + ' Travels',
        totalEarnings,
        wallet: {
          availableBalance: totalEarnings > 0 ? Math.round(totalEarnings * 0.9) : 0,
          pendingPayout: 0,
          totalWithdrawn: 0,
          payoutHistory: [],
        },
      });
    } else if (!profile.wallet || (!profile.wallet.availableBalance && totalEarnings > 0 && !profile.wallet.totalWithdrawn)) {
      if (!profile.wallet) profile.wallet = {};
      profile.wallet.availableBalance = Math.round(totalEarnings * 0.9);
      profile.wallet.pendingPayout = profile.wallet.pendingPayout || 0;
      profile.wallet.totalWithdrawn = profile.wallet.totalWithdrawn || 0;
      profile.wallet.payoutHistory = profile.wallet.payoutHistory || [];
      await profile.save();
    }

    // Upcoming events / bookings
    const upcomingBookings = await Booking.find({
      owner: ownerId,
      startDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
    })
      .populate('car', 'name brand category images')
      .populate('customer', 'name phone email avatar')
      .sort({ startDate: 1 })
      .limit(10);

    // Recent reviews
    const recentReviews = await Review.find({ owner: ownerId })
      .populate('car', 'name brand')
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // KYC info
    const kyc = await KYC.findOne({ user: ownerId }).sort({ submittedAt: -1 });

    res.json({
      success: true,
      stats: {
        totalCars,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalEarnings,
        rating: profile ? profile.rating : 5.0,
        totalReviews: profile ? profile.totalReviews : 0,
        kycStatus: kyc ? kyc.status : 'not_submitted',
      },
      profile,
      upcomingBookings,
      recentReviews,
      kyc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Submit KYC Verification Document
// @route POST /api/owners/kyc
exports.submitKYC = async (req, res, next) => {
  try {
    const { idType, idNumber, documentFront, documentBack, drivingLicense, vehicleRegistrationRc } = req.body;

    const profile = await OwnerProfile.findOne({ user: req.user.id });

    let kyc = await KYC.findOne({ user: req.user.id });
    if (kyc) {
      kyc.idType = idType || kyc.idType;
      kyc.idNumber = idNumber || kyc.idNumber;
      if (documentFront) kyc.documentFront = documentFront;
      if (documentBack) kyc.documentBack = documentBack;
      if (drivingLicense) kyc.drivingLicense = drivingLicense;
      if (vehicleRegistrationRc) kyc.vehicleRegistrationRc = vehicleRegistrationRc;
      kyc.status = 'pending';
      kyc.adminFeedback = '';
      kyc.submittedAt = new Date();
      await kyc.save();
    } else {
      kyc = await KYC.create({
        user: req.user.id,
        ownerProfile: profile ? profile._id : undefined,
        idType,
        idNumber,
        documentFront,
        documentBack,
        drivingLicense,
        vehicleRegistrationRc,
        status: 'pending',
      });
    }

    if (profile) {
      profile.kycStatus = 'pending';
      await profile.save();
    }

    res.status(201).json({
      success: true,
      message: 'KYC documents submitted successfully. Admin review typically completes within 24 hours.',
      kyc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Owner KYC Status
// @route GET /api/owners/kyc
exports.getMyKYC = async (req, res, next) => {
  try {
    const kyc = await KYC.findOne({ user: req.user.id });
    res.json({
      success: true,
      kyc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update Owner Profile & Bank Details
// @route PUT /api/owners/profile
exports.updateOwnerProfile = async (req, res, next) => {
  try {
    const { businessName, bio, address, city, serviceRadiusKm, bankDetails, isAvailable, coordinates } = req.body;

    const updates = {};
    if (businessName) updates.businessName = businessName;
    if (bio) updates.bio = bio;
    if (address) updates.address = address;
    if (city) updates.city = city;
    if (serviceRadiusKm) updates.serviceRadiusKm = serviceRadiusKm;
    if (bankDetails) updates.bankDetails = bankDetails;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (coordinates) {
      updates.location = {
        type: 'Point',
        coordinates,
      };
    }

    const profile = await OwnerProfile.findOneAndUpdate(
      { user: req.user.id },
      updates,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Owner profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Request Wallet Payout (UPI or Bank)
// @route POST /api/owners/payout
exports.requestPayout = async (req, res, next) => {
  try {
    const { amount, method = 'UPI', upiId, bankDetails } = req.body;
    let profile = await OwnerProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Owner profile not found.' });
    }

    const withdrawAmount = Number(amount);
    const available = profile.wallet?.availableBalance || profile.totalEarnings || 0;

    if (!withdrawAmount || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid payout amount.' });
    }

    if (withdrawAmount > available && available > 0) {
      return res.status(400).json({
        success: false,
        message: `Requested amount exceeds available balance (₹${available.toLocaleString('en-IN')})`,
      });
    }

    if (!profile.wallet) {
      profile.wallet = { availableBalance: available, pendingPayout: 0, totalWithdrawn: 0, payoutHistory: [] };
    }

    profile.wallet.availableBalance = Math.max(0, (profile.wallet.availableBalance || available) - withdrawAmount);
    profile.wallet.pendingPayout = (profile.wallet.pendingPayout || 0) + withdrawAmount;
    profile.wallet.payoutHistory.push({
      amount: withdrawAmount,
      method,
      upiId: upiId || profile.bankDetails?.upiId || 'owner@upi',
      status: 'pending',
      requestedAt: new Date(),
    });

    await profile.save();

    res.json({
      success: true,
      message: `Payout request of ₹${withdrawAmount.toLocaleString('en-IN')} submitted! Payout will be processed within 24 hours.`,
      wallet: profile.wallet,
    });
  } catch (error) {
    next(error);
  }
};

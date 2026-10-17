const User = require('../models/User');
const OwnerProfile = require('../models/OwnerProfile');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const KYC = require('../models/KYC');
const Coupon = require('../models/Coupon');
const Commission = require('../models/Commission');
const CompanySettings = require('../models/CompanySettings');
const Notification = require('../models/Notification');

// @desc Get Comprehensive Admin Dashboard Stats
// @route GET /api/admin/stats
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingKYC = await KYC.countDocuments({ status: 'pending' });

    const payments = await Payment.find({ status: 'captured' });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const estimatedCommission = Math.round(totalRevenue * 0.1);

    const recentBookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('car', 'brand name category')
      .populate('owner', 'name phone')
      .sort({ createdAt: -1 })
      .limit(8);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(6);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalOwners,
        totalCars,
        totalBookings,
        totalRevenue,
        commission: estimatedCommission,
        pendingKYC,
        complaints: 0,
      },
      recentBookings,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get All Users with enriched Customer & Owner metrics
// @route GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    const ownerProfiles = await OwnerProfile.find().lean();
    const cars = await Car.find().select('owner name category pricing').lean();
    const bookings = await Booking.find().select('customer owner status pricing').lean();

    const ownerProfileMap = new Map();
    ownerProfiles.forEach((op) => ownerProfileMap.set(op.user.toString(), op));

    const carCountMap = new Map();
    cars.forEach((c) => {
      const ownerId = c.owner?.toString();
      carCountMap.set(ownerId, (carCountMap.get(ownerId) || 0) + 1);
    });

    const customerBookingMap = new Map();
    const customerSpendMap = new Map();
    bookings.forEach((b) => {
      const custId = b.customer?.toString();
      if (custId) {
        customerBookingMap.set(custId, (customerBookingMap.get(custId) || 0) + 1);
        customerSpendMap.set(custId, (customerSpendMap.get(custId) || 0) + (b.pricing?.totalAmount || 0));
      }
    });

    const enrichedUsers = users.map((u) => {
      const uId = u._id.toString();
      return {
        ...u,
        ownerProfile: ownerProfileMap.get(uId) || null,
        carsCount: carCountMap.get(uId) || 0,
        bookingsCount: customerBookingMap.get(uId) || 0,
        totalSpent: customerSpendMap.get(uId) || 0,
      };
    });

    res.json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update User Role / Status
// @route PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get All KYC Records
// @route GET /api/admin/kyc
exports.getAllKYC = async (req, res, next) => {
  try {
    const kycRecords = await KYC.find()
      .populate('user', 'name email phone')
      .populate('ownerProfile', 'businessName address')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: kycRecords.length,
      kycRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Approve / Reject KYC
// @route PUT /api/admin/kyc/:id
exports.updateKYCStatus = async (req, res, next) => {
  try {
    const { status, adminFeedback } = req.body;
    const kyc = await KYC.findById(req.params.id);

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found.' });
    }

    kyc.status = status;
    kyc.adminFeedback = adminFeedback || '';
    if (status === 'verified') {
      kyc.verifiedAt = new Date();
    }
    await kyc.save();

    // Update OwnerProfile status
    await OwnerProfile.findOneAndUpdate(
      { user: kyc.user },
      { kycStatus: status }
    );

    // Notify user
    await Notification.create({
      user: kyc.user,
      title: `KYC Document ${status === 'verified' ? 'Approved' : 'Rejected'}`,
      message: status === 'verified'
        ? 'Congratulations! Your vendor KYC has been verified. You can now accept car bookings on RAS Brother Tour & Travels.'
        : `Your KYC was not approved: ${adminFeedback || 'Please check and re-upload clear documents.'}`,
      type: 'system',
      link: '/owner/kyc',
    });

    res.json({
      success: true,
      message: `KYC status updated to ${status}.`,
      kyc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Manage Company Settings / Branding
// @route GET /api/admin/company-settings
exports.getCompanySettings = async (req, res, next) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'RAS Brother Tour & Travels',
      });
    }
    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update Company Settings / Logo / Contact Info
// @route PUT /api/admin/company-settings
exports.updateCompanySettings = async (req, res, next) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = new CompanySettings(req.body);
    } else {
      Object.assign(settings, req.body);
      settings.updatedAt = new Date();
    }
    await settings.save();

    res.json({
      success: true,
      message: 'Company settings and branding for RAS Brother Tour & Travels updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Coupons Management
// @route GET /api/admin/coupons
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc Create Coupon
// @route POST /api/admin/coupons
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon });
  } catch (error) {
    next(error);
  }
};

// @desc Delete Coupon
// @route DELETE /api/admin/coupons/:id
exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc Commission Settings
// @route GET /api/admin/commission
exports.getCommission = async (req, res, next) => {
  try {
    let commission = await Commission.findOne();
    if (!commission) {
      commission = await Commission.create({ platformRatePercentage: 10 });
    }
    res.json({ success: true, commission });
  } catch (error) {
    next(error);
  }
};

// @desc Update Commission
// @route PUT /api/admin/commission
exports.updateCommission = async (req, res, next) => {
  try {
    let commission = await Commission.findOne();
    if (!commission) {
      commission = new Commission(req.body);
    } else {
      Object.assign(commission, req.body);
      commission.updatedAt = new Date();
    }
    await commission.save();
    res.json({ success: true, message: 'Commission rates updated.', commission });
  } catch (error) {
    next(error);
  }
};

// @desc Get All Bookings for Admin Live Fleet Monitoring
// @route GET /api/admin/bookings
exports.getAllBookingsForAdmin = async (req, res, next) => {
  try {
    const { status, search, eventType, dateFrom, dateTo } = req.query;
    let query = {};

    if (status && status !== 'All') {
      if (status === 'pending_verification') {
        query.paymentVerificationStatus = 'pending_verification';
      } else {
        query.status = status;
      }
    }

    if (eventType && eventType !== 'All') {
      query.eventType = eventType;
    }

    if (dateFrom || dateTo) {
      query.startDate = {};
      if (dateFrom) query.startDate.$gte = new Date(dateFrom);
      if (dateTo) query.startDate.$lte = new Date(dateTo);
    }

    let bookings = await Booking.find(query)
      .populate('customer', 'name email phone avatar address')
      .populate('car', 'brand name model category color images pricing licensePlate location')
      .populate('owner', 'name email phone avatar')
      .populate('chauffeur')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      bookings = bookings.filter((b) => {
        const cName = (b.customer?.name || b.offlineCustomer?.name || '').toLowerCase();
        const cPhone = (b.customer?.phone || b.offlineCustomer?.phone || '').toLowerCase();
        const carName = `${b.car?.brand || ''} ${b.car?.name || ''}`.toLowerCase();
        const oName = (b.owner?.name || '').toLowerCase();
        const bId = (b.bookingId || '').toLowerCase();
        const bulkId = (b.bulkBookingId || '').toLowerCase();
        const utr = (b.utrNumber || '').toLowerCase();
        return cName.includes(s) || cPhone.includes(s) || carName.includes(s) || oName.includes(s) || bId.includes(s) || bulkId.includes(s) || utr.includes(s);
      });
    }

    // Live Metrics for admin
    const totalCount = await Booking.countDocuments();
    const confirmedCount = await Booking.countDocuments({ status: 'confirmed' });
    const inProgressCount = await Booking.countDocuments({ status: 'in_progress' });
    const completedCount = await Booking.countDocuments({ status: 'completed' });
    const pendingVerificationsCount = await Booking.countDocuments({ paymentVerificationStatus: 'pending_verification' });

    res.json({
      success: true,
      count: bookings.length,
      metrics: {
        totalCount,
        confirmedCount,
        inProgressCount,
        completedCount,
        pendingVerificationsCount,
      },
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Override / Update Booking Status & Security OTP
// @route PUT /api/admin/bookings/:id/status
exports.updateBookingStatusByAdmin = async (req, res, next) => {
  try {
    const { status, note, action } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'brand name')
      .populate('customer', 'name phone email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (action === 'verify_payment') {
      booking.paymentVerificationStatus = 'verified';
      booking.paymentStatus = 'advance_paid';
      booking.status = 'confirmed';
    } else if (status) {
      booking.status = status;
      if (status === 'confirmed') {
        booking.paymentVerificationStatus = 'verified';
        booking.paymentStatus = 'advance_paid';
      }
    }

    if (note) {
      booking.notes = (booking.notes ? booking.notes + ' | ' : '') + `[Admin: ${note}]`;
    }

    await booking.save();

    if (booking.customer?._id) {
      await Notification.create({
        user: booking.customer._id,
        title: `Booking #${booking.bookingId} Status Updated by HQ`,
        message: `Admin has updated your reservation for ${booking.car?.brand} ${booking.car?.name} to ${booking.status}. Start OTP: ${booking.startOtp}.`,
        type: 'booking',
        link: '/customer/bookings',
      });
    }

    res.json({
      success: true,
      message: `Booking #${booking.bookingId} successfully updated to ${booking.status}.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Full Database JSON Backup (Weekly Backup & Export)
// @route GET /api/admin/backup
exports.getDatabaseBackup = async (req, res, next) => {
  try {
    const [users, owners, cars, bookings, payments, kyc, settings] = await Promise.all([
      User.find().select('-password').lean(),
      OwnerProfile.find().lean(),
      Car.find().lean(),
      Booking.find().lean(),
      Payment.find().lean(),
      KYC.find().lean(),
      CompanySettings.findOne().lean(),
    ]);

    const backupData = {
      meta: {
        application: 'RAS Brother Tour & Travels',
        version: '1.0.0',
        backupType: 'Full Database Snapshot',
        generatedAt: new Date().toISOString(),
        totalCollections: 7,
        totalRecords: users.length + owners.length + cars.length + bookings.length + payments.length + kyc.length,
        schedule: 'Weekly Automated Sunday 00:00 UTC',
      },
      counts: {
        users: users.length,
        owners: owners.length,
        cars: cars.length,
        bookings: bookings.length,
        payments: payments.length,
        kyc: kyc.length,
      },
      data: {
        users,
        ownerProfiles: owners,
        cars,
        bookings,
        payments,
        kycRecords: kyc,
        companySettings: settings,
      },
    };

    res.json({
      success: true,
      backup: backupData,
    });
  } catch (error) {
    next(error);
  }
};


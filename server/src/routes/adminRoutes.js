const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAllKYC,
  updateKYCStatus,
  getCompanySettings,
  updateCompanySettings,
  toggleKycRequired,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getCommission,
  updateCommission,
  getAllBookingsForAdmin,
  updateBookingStatusByAdmin,
  getDatabaseBackup,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public settings route for getting company info
router.get('/company-settings/public', getCompanySettings);

// Admin-only routes
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/kyc', getAllKYC);
router.put('/kyc/:id', updateKYCStatus);
router.put('/kyc-toggle', toggleKycRequired);
router.get('/company-settings', getCompanySettings);
router.put('/company-settings', updateCompanySettings);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.get('/commission', getCommission);
router.put('/commission', updateCommission);
router.get('/bookings', getAllBookingsForAdmin);
router.put('/bookings/:id/status', updateBookingStatusByAdmin);
router.get('/backup', getDatabaseBackup);

module.exports = router;

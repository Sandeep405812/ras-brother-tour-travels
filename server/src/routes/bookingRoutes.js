const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getBookingById,
  updateBookingStatus,
  downloadInvoice,
  startRideWithOtp,
  completeRide,
  assignChauffeur,
  verifyPaymentAndConfirmBooking,
  createBulkBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.post('/bulk', protect, createBulkBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/owner-bookings', protect, authorize('owner', 'admin'), getOwnerBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/start-ride', protect, authorize('owner', 'admin'), startRideWithOtp);
router.put('/:id/complete-ride', protect, authorize('owner', 'admin'), completeRide);
router.put('/:id/chauffeur', protect, authorize('owner', 'admin'), assignChauffeur);
router.put('/:id/verify-payment', protect, authorize('owner', 'admin'), verifyPaymentAndConfirmBooking);
router.get('/:id/invoice', downloadInvoice); // Public/Authenticated invoice download

module.exports = router;

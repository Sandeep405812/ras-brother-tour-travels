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
  createBookingQuery,
  getDriverTripPass,
  driverStartRideWithOtp,
  driverCompleteRide,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Driver Mobile Duty Pass & Direct OTP Start (Public access via unique Booking ID)
router.get('/driver-pass/:bookingId', getDriverTripPass);
router.put('/driver-pass/:bookingId/start-ride', driverStartRideWithOtp);
router.put('/driver-pass/:bookingId/complete-ride', driverCompleteRide);

router.post('/', protect, createBooking);
router.post('/bulk', protect, createBulkBooking);
router.post('/query', createBookingQuery); // Query / Information Inquiry
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

const express = require('express');
const router = express.Router();
const {
  getOwnerDashboard,
  submitKYC,
  getMyKYC,
  updateOwnerProfile,
  requestPayout,
} = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('owner', 'admin'), getOwnerDashboard);
router.post('/kyc', protect, authorize('owner'), submitKYC);
router.get('/kyc', protect, authorize('owner'), getMyKYC);
router.put('/profile', protect, authorize('owner'), updateOwnerProfile);
router.post('/payout', protect, authorize('owner'), requestPayout);

module.exports = router;

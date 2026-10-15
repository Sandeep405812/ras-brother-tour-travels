const express = require('express');
const router = express.Router();
const {
  createOffer,
  getCustomerOffers,
  getOwnerOffers,
  respondToOffer,
  customerAcceptCounter,
} = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOffer);
router.get('/my-offers', protect, getCustomerOffers);
router.get('/owner-offers', protect, authorize('owner', 'admin'), getOwnerOffers);
router.put('/:id/respond', protect, authorize('owner', 'admin'), respondToOffer);
router.put('/:id/customer-accept', protect, customerAcceptCounter);

module.exports = router;

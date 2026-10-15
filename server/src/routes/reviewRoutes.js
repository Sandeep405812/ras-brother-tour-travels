const express = require('express');
const router = express.Router();
const {
  createReview,
  getCarReviews,
  replyToReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/car/:carId', getCarReviews);
router.post('/', protect, createReview);
router.put('/:id/response', protect, authorize('owner'), replyToReview);

module.exports = router;

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const OwnerProfile = require('../models/OwnerProfile');

// @desc Add Review for Completed Booking
// @route POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const {
      bookingId,
      overall,
      carCondition = 5,
      cleanliness = 5,
      punctuality = 5,
      service = 5,
      comment,
    } = req.body;

    const booking = await Booking.findById(bookingId).populate('car');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the customer of this booking can leave a review.' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ booking: booking._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking.' });
    }

    const review = await Review.create({
      booking: booking._id,
      car: booking.car._id,
      customer: req.user.id,
      owner: booking.owner,
      ratings: {
        overall: Number(overall) || 5,
        carCondition: Number(carCondition) || 5,
        cleanliness: Number(cleanliness) || 5,
        punctuality: Number(punctuality) || 5,
        service: Number(service) || 5,
      },
      comment,
      isVerified: true,
    });

    // Update Car average rating
    const carReviews = await Review.find({ car: booking.car._id });
    const avgCarRating = carReviews.reduce((acc, item) => acc + item.ratings.overall, 0) / carReviews.length;

    await Car.findByIdAndUpdate(booking.car._id, {
      ratingsAverage: Number(avgCarRating.toFixed(1)),
      ratingsQuantity: carReviews.length,
    });

    // Update Owner profile average rating
    const ownerReviews = await Review.find({ owner: booking.owner });
    const avgOwnerRating = ownerReviews.reduce((acc, item) => acc + item.ratings.overall, 0) / ownerReviews.length;

    await OwnerProfile.findOneAndUpdate(
      { user: booking.owner },
      {
        rating: Number(avgOwnerRating.toFixed(1)),
        totalReviews: ownerReviews.length,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Reviews for a Car
// @route GET /api/reviews/car/:carId
exports.getCarReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ car: req.params.carId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Owner Response to Review
// @route PUT /api/reviews/:id/response
exports.replyToReview = async (req, res, next) => {
  try {
    const { responseFromOwner } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this review.' });
    }

    review.responseFromOwner = responseFromOwner;
    await review.save();

    res.json({
      success: true,
      message: 'Response posted successfully.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

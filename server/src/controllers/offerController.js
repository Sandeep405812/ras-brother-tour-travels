const Offer = require('../models/Offer');
const Car = require('../models/Car');
const Notification = require('../models/Notification');

// Generate Unique Offer ID
const generateOfferId = () => {
  return `RAS-OFF-${Math.floor(10000 + Math.random() * 90000)}`;
};

// @desc Customer Makes an Offer
// @route POST /api/offers
exports.createOffer = async (req, res, next) => {
  try {
    const {
      carId,
      customerOffer,
      message,
      eventType = 'Wedding Car Booking',
      startDate,
      endDate,
      pickupLocation,
    } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const originalPrice = car.pricing.perDay || car.pricing.basePrice;

    if (!customerOffer || Number(customerOffer) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid offer amount.' });
    }

    const offer = await Offer.create({
      offerId: generateOfferId(),
      customer: req.user.id,
      owner: car.owner,
      car: car._id,
      originalPrice,
      customerOffer: Number(customerOffer),
      status: 'pending',
      eventType,
      startDate: new Date(startDate || Date.now()),
      endDate: new Date(endDate || Date.now() + 86400000),
      pickupLocation: pickupLocation || car.location.address,
      history: [
        {
          by: 'customer',
          action: 'offer',
          amount: Number(customerOffer),
          message: message || `Customer offered ₹${customerOffer} for ${car.brand} ${car.name}.`,
          createdAt: new Date(),
        },
      ],
    });

    // Notify Owner
    await Notification.create({
      user: car.owner,
      title: 'New Price Offer Received',
      message: `A customer offered ₹${customerOffer} (Standard: ₹${originalPrice}) for ${car.brand} ${car.name}.`,
      type: 'offer',
      link: '/owner/offers',
    });

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully to the car owner. You will be notified once they respond.',
      offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Customer's Offers
// @route GET /api/offers/my-offers
exports.getCustomerOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ customer: req.user.id })
      .populate('car')
      .populate('owner', 'name phone email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Owner's Received Offers
// @route GET /api/offers/owner-offers
exports.getOwnerOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ owner: req.user.id })
      .populate('car')
      .populate('customer', 'name phone email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Owner Responds to Offer (Accept, Counter-Offer, Reject)
// @route PUT /api/offers/:id/respond
exports.respondToOffer = async (req, res, next) => {
  try {
    const { action, counterAmount, message } = req.body;
    // action: 'accept' | 'counter' | 'reject'

    const offer = await Offer.findById(req.params.id)
      .populate('car')
      .populate('customer');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this offer.' });
    }

    if (action === 'accept') {
      offer.status = 'accepted';
      offer.finalAgreedPrice = offer.ownerCounterOffer || offer.customerOffer;
      offer.history.push({
        by: 'owner',
        action: 'accept',
        amount: offer.finalAgreedPrice,
        message: message || 'Owner accepted the offer. Customer can now proceed to advance payment.',
        createdAt: new Date(),
      });

      await Notification.create({
        user: offer.customer._id,
        title: 'Offer Accepted by Owner!',
        message: `Great news! The owner accepted your offer of ₹${offer.finalAgreedPrice} for ${offer.car.brand} ${offer.car.name}. Proceed to pay advance to confirm your booking.`,
        type: 'offer',
        link: `/cars/${offer.car._id}?offerId=${offer._id}&price=${offer.finalAgreedPrice}`,
      });
    } else if (action === 'counter') {
      if (!counterAmount || Number(counterAmount) <= 0) {
        return res.status(400).json({ success: false, message: 'Please provide counter offer amount.' });
      }
      offer.status = 'countered';
      offer.ownerCounterOffer = Number(counterAmount);
      offer.history.push({
        by: 'owner',
        action: 'counter',
        amount: Number(counterAmount),
        message: message || `Owner proposed a counter offer of ₹${counterAmount}.`,
        createdAt: new Date(),
      });

      await Notification.create({
        user: offer.customer._id,
        title: 'Counter Offer Received',
        message: `Owner sent a counter-offer of ₹${counterAmount} for ${offer.car.brand} ${offer.car.name}.`,
        type: 'offer',
        link: '/customer/offers',
      });
    } else if (action === 'reject') {
      offer.status = 'rejected';
      offer.history.push({
        by: 'owner',
        action: 'reject',
        amount: offer.customerOffer,
        message: message || 'Offer was declined by owner.',
        createdAt: new Date(),
      });

      await Notification.create({
        user: offer.customer._id,
        title: 'Offer Declined',
        message: `Your offer for ${offer.car.brand} ${offer.car.name} was declined.`,
        type: 'offer',
        link: '/customer/offers',
      });
    }

    await offer.save();

    res.json({
      success: true,
      message: `Offer ${action}ed successfully.`,
      offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Customer Accepts Owner Counter-Offer
// @route PUT /api/offers/:id/customer-accept
exports.customerAcceptCounter = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('car');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (offer.status !== 'countered') {
      return res.status(400).json({ success: false, message: 'There is no active counter-offer to accept.' });
    }

    offer.status = 'accepted';
    offer.finalAgreedPrice = offer.ownerCounterOffer;
    offer.history.push({
      by: 'customer',
      action: 'accept',
      amount: offer.ownerCounterOffer,
      message: 'Customer accepted the owner counter offer.',
      createdAt: new Date(),
    });

    await offer.save();

    await Notification.create({
      user: offer.owner,
      title: 'Counter Offer Accepted!',
      message: `The customer accepted your counter-offer of ₹${offer.finalAgreedPrice} for ${offer.car.brand} ${offer.car.name}.`,
      type: 'offer',
      link: '/owner/offers',
    });

    res.json({
      success: true,
      message: 'Counter offer accepted. You may now book with this agreed price.',
      offer,
    });
  } catch (error) {
    next(error);
  }
};

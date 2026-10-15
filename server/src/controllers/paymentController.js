const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const OwnerProfile = require('../models/OwnerProfile');

// Initialize Razorpay instance if keys exist
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('Razorpay init warning:', err.message);
  }
}

// @desc Create Razorpay Order for Advance or Remaining payment
// @route POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId, type = 'advance' } = req.body;

    const booking = await Booking.findById(bookingId).populate('car').populate('customer');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    let amountToPay = 0;
    if (type === 'advance') {
      amountToPay = booking.pricing.advanceAmount;
    } else {
      amountToPay = booking.pricing.remainingAmount;
    }

    if (amountToPay <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount.' });
    }

    const orderReceipt = `rcpt_${booking.bookingId}_${Date.now()}`;
    let razorpayOrderId = `order_${Date.now()}`;

    // Try real Razorpay order creation if client configured
    if (razorpayInstance && process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('mock')) {
      try {
        const rzpOrder = await razorpayInstance.orders.create({
          amount: Math.round(amountToPay * 100), // in paise
          currency: 'INR',
          receipt: orderReceipt,
          notes: {
            bookingId: booking._id.toString(),
            customBookingCode: booking.bookingId,
            type,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        console.warn('Razorpay live order creation failed, fallback to simulated order:', err.message);
      }
    }

    const payment = await Payment.create({
      paymentId: `PAY-${Date.now()}`,
      razorpayOrderId,
      booking: booking._id,
      user: req.user.id,
      amount: amountToPay,
      currency: 'INR',
      type,
      status: 'created',
      receipt: orderReceipt,
    });

    res.json({
      success: true,
      order: {
        id: razorpayOrderId,
        amount: amountToPay * 100,
        currency: 'INR',
        receipt: orderReceipt,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_rasbrother2026',
        paymentRecordId: payment._id,
        bookingDetails: {
          bookingId: booking.bookingId,
          carName: `${booking.car.brand} ${booking.car.name}`,
          advanceAmount: booking.pricing.advanceAmount,
          remainingAmount: booking.pricing.remainingAmount,
          totalAmount: booking.pricing.totalAmount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Verify Razorpay Payment Signature
// @route POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentRecordId,
      bookingId,
    } = req.body;

    let payment = null;
    if (paymentRecordId) {
      payment = await Payment.findById(paymentRecordId);
    } else if (razorpayOrderId) {
      payment = await Payment.findOne({ razorpayOrderId });
    }

    const booking = await Booking.findById(bookingId || payment?.booking).populate('car').populate('owner');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Associated booking not found.' });
    }

    // Verify signature if secret is active
    let isValidSignature = true;
    if (process.env.RAZORPAY_KEY_SECRET && razorpaySignature && !process.env.RAZORPAY_KEY_SECRET.includes('mock')) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isValidSignature = generatedSignature === razorpaySignature;
    }

    if (!isValidSignature) {
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update payment record
    if (payment) {
      payment.status = 'captured';
      payment.razorpayPaymentId = razorpayPaymentId || `pay_${Date.now()}`;
      payment.razorpaySignature = razorpaySignature || 'simulated_sig';
      await payment.save();
    } else {
      payment = await Payment.create({
        paymentId: `PAY-${Date.now()}`,
        razorpayOrderId: razorpayOrderId || `order_${Date.now()}`,
        razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
        razorpaySignature: razorpaySignature || 'simulated_sig',
        booking: booking._id,
        user: req.user.id,
        amount: booking.pricing.advanceAmount,
        type: 'advance',
        status: 'captured',
      });
    }

    // Update Booking status
    if (payment.type === 'advance') {
      booking.paymentStatus = 'advance_paid';
      booking.status = 'confirmed';
    } else {
      booking.paymentStatus = 'fully_paid';
    }
    await booking.save();

    // Notify Customer
    await Notification.create({
      user: booking.customer,
      title: 'Booking Confirmed!',
      message: `Advance payment of ₹${payment.amount} for booking #${booking.bookingId} (${booking.car.brand} ${booking.car.name}) was successful. Your car is reserved!`,
      type: 'payment',
      link: `/bookings/${booking._id}`,
    });

    // Notify Owner
    await Notification.create({
      user: booking.owner._id || booking.owner,
      title: 'Advance Payment Received',
      message: `Advance payment of ₹${payment.amount} received for booking #${booking.bookingId}. Vehicle is confirmed.`,
      type: 'payment',
      link: `/owner/bookings`,
    });

    res.json({
      success: true,
      message: 'Payment verified successfully. Booking is now confirmed!',
      booking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Payment History
// @route GET /api/payments/history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate({
        path: 'booking',
        populate: { path: 'car', select: 'name brand category images' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

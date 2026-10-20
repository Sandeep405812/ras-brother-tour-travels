/**
 * WhatsApp Formatted Message Utility for RAS Brother Tour & Travels
 */

export function openWhatsAppMessage(phoneNumber, messageText) {
  const cleanPhone = (phoneNumber || '').replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const encodedText = encodeURIComponent(messageText);
  const url = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function formatBookingWhatsAppMessage(booking, company = {}) {
  const dateStr = new Date(booking.startDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const carName = booking.car?.brand ? `${booking.car.brand} ${booking.car.name}` : booking.car?.name || 'Luxury Vehicle';
  const purpose = booking.bookingPurpose || booking.eventType || 'Car Booking';
  const tripType = booking.tripType === '2-way' ? `2-Way (${booking.totalHours || 8} Hours)` : '1-Way Direct';

  return (
    `🚗 *RAS BROTHER TOUR & TRAVELS - BOOKING CONFIRMED!*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Booking ID:* #${booking.bookingId}\n` +
    `🚘 *Vehicle:* ${carName}\n` +
    `🎯 *Event Purpose:* ${purpose} • ${tripType}\n` +
    `📅 *Date:* ${dateStr} at ${booking.startTime || '10:00 AM'}\n` +
    `📍 *Pickup:* ${booking.pickupLocation?.address || 'Pickup Point'}\n` +
    `🏁 *Destination:* ${booking.destinationAddress || 'Event Venue'}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *Total Amount:* ₹${booking.pricing?.totalAmount?.toLocaleString('en-IN') || 0}\n` +
    `✅ *Advance Paid:* ₹${booking.pricing?.advanceAmount?.toLocaleString('en-IN') || 0}\n` +
    `💵 *Balance at Arrival:* ₹${booking.pricing?.remainingAmount?.toLocaleString('en-IN') || 0}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📞 *24/7 Hotlines:* ${company.phone || '+91 9918272164'}\n` +
    `Thank you for trusting RAS Brother Tour & Travels!`
  );
}

export function formatDriverWhatsAppMessage(booking, chauffeur) {
  return (
    `Namaste ${booking.customer?.name || 'Customer'}! \n\n` +
    `Your Chauffeur has been assigned for RAS Brother Booking #${booking.bookingId} (${booking.car?.name || 'Vehicle'}):\n` +
    `👨‍✈️ *Chauffeur:* ${chauffeur.name}\n` +
    `📞 *Mobile:* ${chauffeur.phone}\n` +
    `🚗 *Plate:* ${chauffeur.vehiclePlate || 'Confirmed'}\n\n` +
    `The chauffeur will arrive on time at your pickup location. For support: +91 9918272164.`
  );
}

export function formatDriverDutySlipWhatsAppMessage(booking, chauffeur = {}, company = {}) {
  const dateStr = new Date(booking.startDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const carName = booking.car?.brand
    ? `${booking.car.brand} ${booking.car.name}`
    : booking.car?.name || 'Assigned Car';
  const customerName = booking.customer?.name || booking.offlineCustomer?.name || 'Valued Customer';
  const customerPhone = booking.customer?.phone || booking.offlineCustomer?.phone || 'N/A';
  const balance = booking.pricing?.remainingAmount || 0;
  const plate = chauffeur.vehiclePlate || booking.car?.licensePlate || 'Assigned Vehicle';
  const pickupAddr = booking.pickupLocation?.address || 'Pickup Point';
  const dropAddr = booking.destinationAddress || 'As per booking route';
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://rasbrothertravels.com';
  const driverPassUrl = `${origin}/driver-pass?id=${booking.bookingId}`;

  return (
    `👨‍✈️ *RAS BROTHER TOUR & TRAVELS - DRIVER TRIP DUTY SLIP*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Booking ID:* #${booking.bookingId}\n` +
    `🚘 *Vehicle:* ${carName}\n` +
    `🔢 *Number Plate:* ${plate}\n` +
    `📅 *Reporting Date:* ${dateStr}\n` +
    `⏰ *Reporting Time:* ${booking.startTime || '10:00 AM'} sharp\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Customer Name:* ${customerName}\n` +
    `📞 *Customer Mobile:* ${customerPhone}\n` +
    `📍 *Pickup Address:* ${pickupAddr}\n` +
    `🗺️ *Maps Navigation:* ${mapsLink}\n` +
    `🏁 *Destination:* ${dropAddr}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💵 *Balance to Collect from Customer:* ₹${balance.toLocaleString('en-IN')} (Cash/UPI upon arrival)\n` +
    `🔑 *Security OTP:* Ask customer for the 4-digit Ride Start OTP to verify trip.\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📲 *Open Driver Mobile Pass & Enter OTP:*\n` +
    `${driverPassUrl}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏢 *Office Helpline:* ${company.phone || '+91 9918272164'}\n` +
    `⚠️ *Instructions:* Please wear uniform, reach 20-30 mins prior to reporting time, and keep vehicle clean.`
  );
}


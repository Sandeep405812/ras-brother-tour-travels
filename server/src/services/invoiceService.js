const PDFDocument = require('pdfkit');
const CompanySettings = require('../models/CompanySettings');

exports.generateInvoicePDF = async (booking, res) => {
  const company = (await CompanySettings.findOne()) || {
    companyName: 'RAS Brother Tour & Travels',
    tagline: 'Premium Local Car Rental & Event Transportation Marketplace',
    email: 'contact@rasbrothertravels.com',
    phone: '+91 98765 43210',
    address: 'Shop 14, Main Market, Sector 18, Noida, Uttar Pradesh 201301',
    website: 'https://rasbrothertravels.com',
    gstNumber: '07AAAAA0000A1Z5',
  };

  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Invoice-${booking.bookingId || 'RAS-BK'}.pdf`
  );

  doc.pipe(res);

  // Header Banner
  doc
    .rect(0, 0, 600, 90)
    .fill('#0B132B');

  // Company Brand Name & Tagline
  doc
    .fillColor('#F59E0B')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(company.companyName, 40, 25);

  doc
    .fillColor('#CBD5E1')
    .fontSize(10)
    .font('Helvetica')
    .text(company.tagline || 'Official Booking Invoice & Tax Receipt', 40, 55);

  doc
    .fillColor('#FFFFFF')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 460, 30, { align: 'right' })
    .fontSize(9)
    .font('Helvetica')
    .text(`Booking: ${booking.bookingId}`, 460, 48, { align: 'right' })
    .text(`Date: ${new Date(booking.createdAt).toLocaleDateString('en-IN')}`, 460, 62, { align: 'right' });

  // Company and Customer Details Grid
  doc.moveDown(4);
  const startY = 110;

  // Company Details
  doc
    .fillColor('#1E293B')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Service Provider:', 40, startY);

  doc
    .fillColor('#475569')
    .fontSize(9)
    .font('Helvetica')
    .text(company.companyName, 40, startY + 16)
    .text(company.address, 40, startY + 28, { width: 220 })
    .text(`Phone: ${company.phone}`, 40, startY + 54)
    .text(`Email: ${company.email}`, 40, startY + 66)
    .text(`GSTIN: ${company.gstNumber || '07AAAAA0000A1Z5'}`, 40, startY + 78);

  // Customer Details
  doc
    .fillColor('#1E293B')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Billed To (Customer):', 320, startY);

  const customerName = booking.customer?.name || 'Valued Customer';
  const customerEmail = booking.customer?.email || 'N/A';
  const customerPhone = booking.customer?.phone || 'N/A';

  doc
    .fillColor('#475569')
    .fontSize(9)
    .font('Helvetica')
    .text(customerName, 320, startY + 16)
    .text(`Phone: ${customerPhone}`, 320, startY + 28)
    .text(`Email: ${customerEmail}`, 320, startY + 40)
    .text(`Pickup: ${booking.pickupLocation?.address || 'Designated Pickup Location'}`, 320, startY + 52, { width: 230 });

  // Event & Car Summary Box
  const boxY = startY + 105;
  doc
    .rect(40, boxY, 520, 65)
    .fillAndStroke('#F8FAFC', '#E2E8F0');

  const carName = booking.car ? `${booking.car.brand} ${booking.car.name || booking.car.model}` : 'Reserved Vehicle';
  const carCategory = booking.car?.category || 'Special Fleet';

  doc
    .fillColor('#0F172A')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Event Type:', 50, boxY + 10)
    .font('Helvetica')
    .text(booking.eventType, 130, boxY + 10)
    .font('Helvetica-Bold')
    .text('Vehicle:', 300, boxY + 10)
    .font('Helvetica')
    .text(`${carName} (${carCategory})`, 360, boxY + 10);

  doc
    .font('Helvetica-Bold')
    .text('Event Date:', 50, boxY + 26)
    .font('Helvetica')
    .text(`${new Date(booking.startDate).toLocaleDateString('en-IN')} to ${new Date(booking.endDate).toLocaleDateString('en-IN')}`, 130, boxY + 26)
    .font('Helvetica-Bold')
    .text('Timings:', 300, boxY + 26)
    .font('Helvetica')
    .text(`${booking.startTime || '10:00 AM'} - ${booking.endTime || '06:00 PM'}`, 360, boxY + 26);

  doc
    .font('Helvetica-Bold')
    .text('Chauffeur Included:', 50, boxY + 42)
    .font('Helvetica')
    .text(booking.driverRequired ? 'Yes (Verified Chauffeur)' : 'Self/Not Required', 160, boxY + 42)
    .font('Helvetica-Bold')
    .text('Decoration:', 300, boxY + 42)
    .font('Helvetica')
    .text(booking.decorationRequired ? 'Floral / Ribbon Package Included' : 'Standard Clean', 370, boxY + 42);

  // Invoice Items Table
  const tableY = boxY + 80;

  // Header row
  doc
    .rect(40, tableY, 520, 24)
    .fill('#1E293B');

  doc
    .fillColor('#FFFFFF')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('DESCRIPTION', 50, tableY + 7)
    .text('EVENT DURATION', 280, tableY + 7)
    .text('RATE (INR)', 380, tableY + 7)
    .text('AMOUNT (INR)', 470, tableY + 7, { align: 'right' });

  // Rows
  let currentY = tableY + 28;

  const addItemRow = (desc, duration, rate, amount) => {
    doc
      .fillColor('#334155')
      .fontSize(9)
      .font('Helvetica')
      .text(desc, 50, currentY)
      .text(duration, 280, currentY)
      .text(`₹${rate.toLocaleString('en-IN')}`, 380, currentY)
      .text(`₹${amount.toLocaleString('en-IN')}`, 470, currentY, { align: 'right' });

    currentY += 20;
    doc
      .moveTo(40, currentY - 5)
      .lineTo(560, currentY - 5)
      .strokeColor('#F1F5F9')
      .stroke();
  };

  const pricing = booking.pricing || {
    baseAmount: 5000,
    driverCharges: 500,
    decorationCharges: 0,
    discountAmount: 0,
    totalAmount: 5500,
    advanceAmount: 1100,
    remainingAmount: 4400,
  };

  addItemRow(`Car Rental Charge - ${carName}`, `${booking.durationDays || 1} Day(s)`, pricing.baseAmount, pricing.baseAmount);

  if (pricing.driverCharges > 0) {
    addItemRow('Chauffeur & Uniformed Driver Charges', 'Included', pricing.driverCharges, pricing.driverCharges);
  }
  if (pricing.decorationCharges > 0) {
    addItemRow('Event Flower & Ribbon Decoration Package', '1 Package', pricing.decorationCharges, pricing.decorationCharges);
  }
  if (pricing.discountAmount > 0) {
    addItemRow('Promotional Coupon Discount', 'Applied', `-${pricing.discountAmount}`, -pricing.discountAmount);
  }

  // Summary Totals Box
  currentY += 10;
  const summaryX = 340;

  doc
    .fillColor('#475569')
    .fontSize(9)
    .font('Helvetica')
    .text('Total Booking Value:', summaryX, currentY)
    .text(`₹${pricing.totalAmount.toLocaleString('en-IN')}`, 470, currentY, { align: 'right' });

  currentY += 18;
  doc
    .fillColor('#059669')
    .font('Helvetica-Bold')
    .text('Advance Amount Paid:', summaryX, currentY)
    .text(`₹${pricing.advanceAmount.toLocaleString('en-IN')}`, 470, currentY, { align: 'right' });

  currentY += 18;
  doc
    .fillColor('#DC2626')
    .font('Helvetica-Bold')
    .text('Balance Due at Pickup:', summaryX, currentY)
    .text(`₹${pricing.remainingAmount.toLocaleString('en-IN')}`, 470, currentY, { align: 'right' });

  // Status Badge
  currentY += 30;
  doc
    .rect(40, currentY, 200, 34)
    .fillAndStroke(booking.paymentStatus === 'advance_paid' || booking.paymentStatus === 'fully_paid' ? '#ECFDF5' : '#FEF3C7', '#A7F3D0');

  doc
    .fillColor(booking.paymentStatus === 'advance_paid' || booking.paymentStatus === 'fully_paid' ? '#065F46' : '#92400E')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(`Payment Status: ${booking.paymentStatus.toUpperCase().replace('_', ' ')}`, 50, currentY + 11);

  // Footer / Terms
  const footerY = 730;
  doc
    .rect(40, footerY - 10, 520, 1)
    .fill('#E2E8F0');

  doc
    .fillColor('#64748B')
    .fontSize(8)
    .font('Helvetica')
    .text('Thank you for booking with RAS Brother Tour & Travels.', 40, footerY, { align: 'center' })
    .text('For customer support, 24/7 assistance or rescheduling: call +91 98765 43210 or email contact@rasbrothertravels.com', 40, footerY + 12, { align: 'center' })
    .text('© RAS Brother Tour & Travels. All Rights Reserved.', 40, footerY + 24, { align: 'center' });

  doc.end();
};

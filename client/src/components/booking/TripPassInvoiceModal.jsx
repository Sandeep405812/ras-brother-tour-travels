import React from 'react';
import {
  X,
  Printer,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  Phone,
  Key,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  QrCode,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import RasLogo from '../brand/RasLogo';
import { useCompany } from '../../context/CompanyContext';
import { useLanguage } from '../../context/LanguageContext';

export default function TripPassInvoiceModal({
  booking,
  isOpen,
  onClose,
  onOpenChat = null,
}) {
  const { company } = useCompany();
  const { t } = useLanguage();

  if (!isOpen || !booking) return null;

  const car = booking.car || {};
  const customer = booking.customer || {};
  const chauffeur = booking.chauffeur || {};
  const pricing = booking.pricing || {};

  // Check if ride is today (IST time)
  const isRideToday = () => {
    try {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const todayIST = new Date(now.getTime() + istOffset).toISOString().split('T')[0];
      const rideIST = new Date(new Date(booking.startDate).getTime() + istOffset)
        .toISOString()
        .split('T')[0];
      return todayIST === rideIST;
    } catch (e) {
      return false;
    }
  };

  const isToday = isRideToday();

  // Print invoice handler
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Share handler
  const handleShareWhatsApp = () => {
    const rideDateFormatted = new Date(booking.startDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const purposeText = booking.bookingPurpose || booking.eventType || 'Car Booking';
    const tripTypeText = booking.tripType === '2-way' ? `2-Way Round Trip (${booking.totalHours || 8} hrs)` : '1-Way Trip';
    const driverText = chauffeur.name ? `${chauffeur.name} (${chauffeur.phone || 'N/A'})` : 'To be assigned';

    const text = encodeURIComponent(
      `🚗 *RAS BROTHER TOUR & TRAVELS - DIGITAL TRIP PASS*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *Booking ID:* #${booking.bookingId}\n` +
      `🚙 *Vehicle:* ${car.brand || ''} ${car.name || 'Luxury Car'}\n` +
      `🎯 *Purpose:* ${purposeText} • ${tripTypeText}\n` +
      `📅 *Date:* ${rideDateFormatted} at ${booking.startTime || '10:00 AM'}\n` +
      `📍 *Pickup:* ${booking.pickupLocation?.address || 'Pickup Point'}\n` +
      `🏁 *Drop:* ${booking.destinationAddress || 'Destination'}\n` +
      `👨‍✈️ *Chauffeur:* ${driverText}\n` +
      (isToday && booking.startOtp ? `🔑 *Start OTP:* ${booking.startOtp}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total Fare:* ₹${pricing.totalAmount?.toLocaleString('en-IN') || 0}\n` +
      `✅ *Advance Paid:* ₹${pricing.advanceAmount?.toLocaleString('en-IN') || 0}\n` +
      `💵 *Balance at Arrival:* ₹${pricing.remainingAmount?.toLocaleString('en-IN') || 0}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📞 24x7 Helpline: ${company.phone || '+91 9918272164'}\n` +
      `🌐 rasbrother.com`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Verification QR data
  const qrData = encodeURIComponent(
    `RAS-VERIFY|${booking.bookingId}|${car.name || 'CAR'}|${customer.name || 'GUEST'}|₹${pricing.totalAmount || 0}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-slate-200 print:border-none print:shadow-none print:max-w-none print:rounded-none">
        
        {/* ================= Top Action Bar (Hidden in Print) ================= */}
        <div className="bg-slate-900 px-5 sm:px-6 py-3.5 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-sm sm:text-base font-heading">
              {t('Digital Trip Pass & GST Invoice', 'डिजिटल ट्रिप पास व रसीद')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow"
              title="Share Pass on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('PDF / Print', 'प्रिंट / PDF')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= Printable Pass & Invoice Content ================= */}
        <div id="printable-trip-pass" className="p-5 sm:p-8 space-y-6 text-slate-900 bg-white">
          
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <RasLogo variant="light" size="sm" showTagline={true} />
              <p className="text-[11px] text-slate-500 max-w-sm pt-1 leading-relaxed">
                {company.address || 'Civil Lines, Gorakhpur / Deoria & Sector 18, Noida'} • 📞 {company.phone || '+91 9918272164'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                GSTIN: {company.gstin || '09AAECR4058L1ZZ'} • Government Registered Luxury Travel Partner
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                booking.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : booking.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : booking.status === 'confirmed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                ● {booking.status === 'in_progress' ? 'ON-ROAD LIVE' : booking.status?.toUpperCase()}
              </span>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PASS NO.</span>
                <span className="text-sm font-black font-mono text-slate-900">#{booking.bookingId}</span>
              </div>
            </div>
          </div>

          {/* QR Verification & Trip Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center text-center p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <img src={qrUrl} alt="QR Code" className="w-24 h-24 object-contain" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">Official Digital Pass</span>
            </div>

            {/* Trip Specs */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-500 text-slate-950 uppercase">
                  {booking.bookingPurpose || booking.eventType || 'Wedding'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-800">
                  {booking.tripType === '2-way' ? `🔁 2-Way (${booking.totalHours || 8} Hours)` : '➡️ 1-Way Direct'}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 font-heading">
                {car.brand || ''} {car.name || 'Reserved Luxury Car'}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">TRAVEL DATE</span>
                  <span className="font-bold text-slate-900">
                    {new Date(booking.startDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">REPORTING TIME</span>
                  <span className="font-bold text-slate-900">{booking.startTime || '10:00 AM'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route & Destination */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                A
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">PICKUP LOCATION</span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
                  {booking.pickupLocation?.address || 'Pickup Point'}
                </p>
              </div>
            </div>

            <div className="h-4 border-l-2 border-dashed border-slate-300 ml-3" />

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                B
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">DESTINATION / EVENT VENUE</span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
                  {booking.destinationAddress || 'Drop Location'}
                </p>
              </div>
            </div>

            {booking.distanceKm > 0 && (
              <div className="pt-1 text-[11px] font-bold text-amber-700">
                🛣️ Total Road Distance: {booking.distanceKm} km {booking.tripType === '2-way' ? '(Round Trip)' : ''}
              </div>
            )}
          </div>

          {/* Chauffeur & Live OTP Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chauffeur Card */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Assigned Chauffeur
              </span>
              <div>
                <h4 className="text-sm font-black text-white">
                  {chauffeur.name || 'Chauffeur Dispatch Pending'}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {chauffeur.phone ? `📞 ${chauffeur.phone}` : 'Driver will be assigned 2 hrs before trip'}
                </p>
                {chauffeur.vehiclePlate && (
                  <p className="text-[11px] font-mono text-amber-300 mt-1">
                    🚗 Plate: {chauffeur.vehiclePlate}
                  </p>
                )}
              </div>

              {chauffeur.phone && (
                <div className="flex items-center gap-2 pt-1 print:hidden">
                  <a
                    href={`tel:${chauffeur.phone}`}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition"
                  >
                    Call Chauffeur
                  </a>
                  <a
                    href={`https://wa.me/91${chauffeur.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold rounded-lg transition"
                  >
                    WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* Same-Day OTP Security Card */}
            <div className={`p-4 rounded-2xl flex flex-col justify-between ${
              isToday
                ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 border-2 border-amber-300 shadow-md'
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 text-slate-800">
                  <Key className="w-3.5 h-3.5" /> Ride Security OTP
                </span>
                
                {isToday ? (
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono tracking-widest block text-slate-950">
                      {booking.startOtp || '****'}
                    </span>
                    <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                      ✓ Active for today. Share with chauffeur upon vehicle arrival to begin ride.
                    </p>
                  </div>
                ) : (
                  <div className="my-2">
                    <span className="text-sm font-black text-slate-800 block">
                      🔒 Locked until ride day
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      OTP will automatically unlock on{' '}
                      <strong>{new Date(booking.startDate).toLocaleDateString('en-IN')}</strong> to prevent early ride initiation.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 print:text-[8px]">
                Verify vehicle & driver identity before starting ride.
              </div>
            </div>
          </div>

          {/* Detailed Tax Invoice & Billing Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 font-black text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Itemized Fare & Tax Invoice</span>
              <span className="font-mono text-[10px] text-slate-500">Currency: INR (₹)</span>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">
                  Base Vehicle Rental ({car.name || 'Vehicle'} • {booking.tripType === '2-way' ? '2-Way' : '1-Way'})
                </span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{(pricing.baseAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              {pricing.driverCharges > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Uniformed Chauffeur Allowance</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{pricing.driverCharges.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {pricing.decorationCharges > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-amber-700">
                  <span>🌸 Wedding Flower Ribbon Decoration</span>
                  <span className="font-mono font-bold">
                    +₹{pricing.decorationCharges.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {pricing.discountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                  <span>Promo Coupon Discount</span>
                  <span className="font-mono font-bold">
                    -₹{pricing.discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-2 text-sm font-black text-slate-950 border-t border-slate-300">
                <span>Total Trip Fare</span>
                <span className="font-mono text-base text-slate-950">
                  ₹{(pricing.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">ADVANCE PAID</span>
                  <span className="font-black text-emerald-800 text-base font-mono">
                    ₹{(pricing.advanceAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">BALANCE AT ARRIVAL</span>
                  <span className="font-black text-amber-900 text-base font-mono">
                    ₹{(pricing.remainingAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Terms & Helpline */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              <p>Thank you for choosing <strong>RAS Brother Tour & Travels</strong>.</p>
              <p className="text-[10px] text-slate-400">Emergency 24x7 Roadside Dispatch: {company.phone || '+91 9918272164'}</p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              {onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat({ user: booking.owner, bookingRef: booking.bookingId });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat with Dispatch</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

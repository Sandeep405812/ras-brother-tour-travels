import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  calculateHaversineDistance,
  resolveCoordinates,
  computeTripFare,
  POPULAR_LOCATIONS,
} from '../../utils/distanceCalculator';
import LocationAutocomplete from '../common/LocationAutocomplete';
import {
  X,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  Check,
  CreditCard,
  Navigation,
  ArrowRight,
  Route,
  UserCheck,
  Phone,
  User,
  Info,
  QrCode,
  Upload,
  Copy,
  Image as ImageIcon,
} from 'lucide-react';
import { uploadSingleFile } from '../../utils/imageUpload';

export default function BookingModal({
  car,
  isOpen,
  onClose,
  onBookingConfirmed,
  prefilledPrice,
  prefilledOfferId,
  isOwnerDirect = false,
  initialDetails = null,
  onNavigate = null,
}) {
  const { user, token, isAuthenticated, role } = useAuth();
  const { showToast } = useNotification();

  const [eventType, setEventType] = useState(
    initialDetails?.eventType || 'Wedding Car Booking'
  );
  const [startDate, setStartDate] = useState(
    initialDetails?.startDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('06:00 PM');

  // Source & Destination (Ola / Uber style)
  const [sourceAddress, setSourceAddress] = useState(
    initialDetails?.sourceAddress || 'Sector 18, Noida'
  );
  const [destinationAddress, setDestinationAddress] = useState(
    initialDetails?.destinationAddress || 'Connaught Place, New Delhi'
  );
  const [sourceCoords, setSourceCoords] = useState(
    initialDetails?.sourceCoords || [77.3244, 28.5708]
  );
  const [destCoords, setDestCoords] = useState(
    initialDetails?.destCoords || [77.2195, 28.6315]
  );
  const [calculatedDistance, setCalculatedDistance] = useState(
    initialDetails?.calculatedDistance || 24.5
  );
  const [detectingGps, setDetectingGps] = useState(false);

  // Decoration Packages & GST
  const [selectedDecorId, setSelectedDecorId] = useState(
    car?.category === 'Wedding Special' ? 'ribbon_rose' : 'none'
  );
  const [needGstInvoice, setNeedGstInvoice] = useState(false);
  const [customerGstin, setCustomerGstin] = useState('');
  const [gstBusinessName, setGstBusinessName] = useState('');

  const decorationPackages = [
    {
      id: 'none',
      title: 'Standard (Clean Car)',
      tag: 'Sanitized Car',
      price: 0,
      icon: '🚗',
      desc: 'Spotless luxury vehicle with uniformed chauffeur, no flower work.',
    },
    {
      id: 'ribbon_rose',
      title: 'Fresh Red Rose Bonnet Garland',
      tag: 'Most Popular',
      price: car?.pricing?.decorationCharges || 1500,
      icon: '🌹',
      desc: 'V-shape fresh Dutch red roses garland on bonnet + door ribbons.',
    },
    {
      id: 'royal_orchid',
      title: 'Royal Exotic Orchid Wrap',
      tag: 'Wedding Special',
      price: 3500,
      icon: '🌸',
      desc: 'Imported purple orchids, carnations, roof trail & side sash.',
    },
    {
      id: 'groom_entry',
      title: 'Maharaja Groom Extravaganza',
      tag: 'VIP Dulha Entry',
      price: 5000,
      icon: '👑',
      desc: 'Full floral canopy, fairy LED glow lights, trunk bouquet & gold ribbons.',
    },
  ];

  const activeDecor = decorationPackages.find((d) => d.id === selectedDecorId) || decorationPackages[0];

  // Add-ons & Offline Customer Details
  const [decorationRequired, setDecorationRequired] = useState(car?.category === 'Wedding Special');
  const [driverRequired, setDriverRequired] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');

  // Owner/Admin Direct Reservation Toggle
  const isOwnerOrAdmin = role === 'owner' || role === 'admin';
  const [directBookingMode, setDirectBookingMode] = useState(isOwnerDirect || false);
  const [offlineName, setOfflineName] = useState('');
  const [offlinePhone, setOfflinePhone] = useState('');

  const [loading, setLoading] = useState(false);

  // UPI QR Code & Payment Receipt State
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const handleUploadScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);

    try {
      const result = await uploadSingleFile(file, token);
      if (result && result.url) {
        setPaymentScreenshot(result.url);
        showToast('Payment screenshot attached successfully!', 'success');
      } else {
        showToast('Screenshot upload failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Upload error: ' + (err.message || 'Failed to upload screenshot'), 'error');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  // Recalculate distance whenever source or destination changes
  useEffect(() => {
    const sCoords = resolveCoordinates(sourceAddress);
    const dCoords = resolveCoordinates(destinationAddress);
    setSourceCoords(sCoords);
    setDestCoords(dCoords);

    const dist = calculateHaversineDistance(sCoords, dCoords);
    setCalculatedDistance(dist > 0 ? dist : 15);
  }, [sourceAddress, destinationAddress]);

  useEffect(() => {
    if (initialDetails) {
      if (initialDetails.sourceAddress) setSourceAddress(initialDetails.sourceAddress);
      if (initialDetails.destinationAddress) setDestinationAddress(initialDetails.destinationAddress);
      if (initialDetails.sourceCoords) setSourceCoords(initialDetails.sourceCoords);
      if (initialDetails.destCoords) setDestCoords(initialDetails.destCoords);
      if (initialDetails.calculatedDistance) setCalculatedDistance(initialDetails.calculatedDistance);
      if (initialDetails.eventType) setEventType(initialDetails.eventType);
      if (initialDetails.startDate) setStartDate(initialDetails.startDate);
    }
  }, [initialDetails]);

  if (!isOpen || !car) return null;

  // Duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end - start);
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Coupon discount calculation
  let discountVal = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountVal = Math.min(((car.pricing?.perDay || 5000) * appliedCoupon.val) / 100, 3000);
    } else {
      discountVal = appliedCoupon.val;
    }
  }

  // Compute Trip Fare like Ola/Uber
  const fareBreakdown = computeTripFare({
    car,
    distanceKm: calculatedDistance,
    durationDays,
    driverRequired,
    decorationRequired: activeDecor.id !== 'none',
    customDecorationCharge: activeDecor.price,
    couponDiscount: discountVal,
  });

  const grandTotal = prefilledPrice ? Number(prefilledPrice) : fareBreakdown.grandTotal;
  const advanceAmount = prefilledPrice
    ? Math.round((Number(prefilledPrice) * (car.advancePayment?.value || 20)) / 100)
    : fareBreakdown.advanceAmount;
  const remainingAmount = Math.max(0, grandTotal - advanceAmount);

  // Use Browser Geolocation for Source
  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported by this browser', 'error');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        setSourceCoords(coords);
        setSourceAddress('GPS: My Current Location');
        const dist = calculateHaversineDistance(coords, destCoords);
        setCalculatedDistance(dist);
        setDetectingGps(false);
        showToast('GPS Location detected!', 'success');
      },
      (err) => {
        showToast('Could not detect GPS location: ' + err.message, 'error');
        setDetectingGps(false);
      }
    );
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'RASWEDDING') {
      setAppliedCoupon({ code: 'RASWEDDING', type: 'percentage', val: 15 });
      showToast('15% Wedding discount applied!', 'success');
    } else if (code === 'WELCOME500') {
      setAppliedCoupon({ code: 'WELCOME500', type: 'flat', val: 500 });
      showToast('₹500 Welcome discount applied!', 'success');
    } else if (code === 'FESTIVE10') {
      setAppliedCoupon({ code: 'FESTIVE10', type: 'percentage', val: 10 });
      showToast('10% Festive discount applied!', 'success');
    } else {
      showToast('Invalid coupon. Try RASWEDDING or WELCOME500', 'error');
    }
  };

  const handleProceedBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please login to complete reservation', 'error');
      return;
    }

    if (!directBookingMode) {
      if (!utrNumber || utrNumber.trim().length < 4) {
        showToast('Please enter your UPI UTR / Transaction Reference Number', 'error');
        return;
      }
      if (!paymentScreenshot) {
        showToast('Please upload your payment screenshot after scanning the UPI QR code', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      // Step 1: Create Booking Record (with Source, Destination, Distance & Collision check)
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: car._id,
          eventType,
          startDate,
          endDate,
          startTime,
          endTime,
          pickupLocation: {
            address: sourceAddress,
            coordinates: sourceCoords,
          },
          destinationAddress,
          destinationCoordinates: destCoords,
          distanceKm: calculatedDistance,
          decorationRequired: activeDecor.id !== 'none',
          decorationType: activeDecor.title,
          decorationPackage: activeDecor,
          driverRequired,
          specialRequests,
          couponCode: appliedCoupon?.code,
          offerId: prefilledOfferId,
          customTotalAmount: grandTotal,
          isDirectBooking: directBookingMode && isOwnerOrAdmin,
          offlineCustomerName: offlineName,
          offlineCustomerPhone: offlinePhone,
          gstDetails: needGstInvoice ? {
            customerGstin,
            businessName: gstBusinessName,
          } : undefined,
          paymentScreenshot: directBookingMode ? '' : paymentScreenshot,
          utrNumber: directBookingMode ? '' : utrNumber.trim(),
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok || !bookingData.success) {
        throw new Error(bookingData.message || 'Reservation failed');
      }

      const createdBooking = bookingData.booking;

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E5A93B', '#10B981', '#3B82F6', '#EF4444'],
      });

      if (directBookingMode && isOwnerOrAdmin) {
        showToast(`Car reserved successfully for ${offlineName || 'Client'}!`, 'success');
      } else {
        showToast(`Advance payment screenshot submitted! Booking #${createdBooking.bookingId} placed. Fleet owner will verify screenshot and confirm your order.`, 'success');
      }

      if (onBookingConfirmed) onBookingConfirmed(createdBooking);
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">
              RAS BROTHER TOUR &amp; TRAVELS
            </span>
            <h3 className="font-extrabold text-lg font-heading">
              {directBookingMode ? 'Direct Fleet Reservation' : `Reserve ${car.brand} ${car.name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleProceedBooking} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Guest User Callout */}
          {!isAuthenticated && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Booking as <strong>Guest</strong>. You can review fares; login to secure your instant reservation.
                </span>
              </div>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('login');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          )}

          {/* Vehicle Snapshot */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              src={car.images?.main}
              alt={car.name}
              className="w-20 h-14 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-amber-600">{car.category}</div>
              <div className="font-bold text-sm text-slate-900 truncate">
                {car.brand} {car.name} ({car.year})
              </div>
              <div className="text-xs text-slate-500">
                ₹{car.pricing?.perDay?.toLocaleString('en-IN')}/day • {car.seatingCapacity} Seats • {car.fuelType}
              </div>
            </div>
          </div>

          {/* Owner/Admin Mode Switcher */}
          {isOwnerOrAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-amber-950">Direct / Walk-In Customer Booking</div>
                  <div className="text-amber-800 text-[11px]">Book offline customer without online gateway</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={directBookingMode}
                  onChange={(e) => setDirectBookingMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          )}

          {/* Offline Customer Info if Direct Booking */}
          {directBookingMode && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Customer / Client Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required={directBookingMode}
                    placeholder="e.g. Ramesh Kumar"
                    value={offlineName}
                    onChange={(e) => setOfflineName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 pl-8"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Customer Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required={directBookingMode}
                    placeholder="+91 98..."
                    value={offlinePhone}
                    onChange={(e) => setOfflinePhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 pl-8"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          )}

          {/* SOURCE & DESTINATION WITH OLA/UBER STYLE DISTANCE BADGE */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Route className="w-4 h-4 text-amber-600" /> Source &amp; Destination Route
              </span>
              <button
                type="button"
                onClick={handleUseCurrentGps}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 underline"
              >
                <Navigation className="w-3.5 h-3.5" />
                {detectingGps ? 'Detecting...' : 'Use Current GPS'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pickup / Source Autocomplete */}
              <div>
                <LocationAutocomplete
                  label="Pickup Location (Source)"
                  value={sourceAddress}
                  allowGps={true}
                  iconColor="text-emerald-500"
                  placeholder="Type or select pickup place, hotel, airport..."
                  inputClassName="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={(val) => {
                    setSourceAddress(val);
                    const c = resolveCoordinates(val);
                    setSourceCoords(c);
                  }}
                  onSelectCoords={(coords) => {
                    setSourceCoords(coords);
                  }}
                />
              </div>

              {/* Destination / Drop Autocomplete */}
              <div>
                <LocationAutocomplete
                  label="Drop / Venue (Destination)"
                  value={destinationAddress}
                  allowGps={false}
                  iconColor="text-rose-500"
                  placeholder="Type or select event venue, farmhouse, hotel..."
                  inputClassName="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={(val) => {
                    setDestinationAddress(val);
                    const c = resolveCoordinates(val);
                    setDestCoords(c);
                  }}
                  onSelectCoords={(coords) => {
                    setDestCoords(coords);
                  }}
                />
              </div>
            </div>

            {/* OLA/UBER STYLE DISTANCE & ETA BANNER */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  🚗
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">
                    Est. Route Distance: <span className="text-amber-800 text-sm">{calculatedDistance} KM</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Calculated via GPS coordinates • Approx. {Math.round(calculatedDistance * 1.5)} mins drive
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Daily Package</span>
                <span className="font-bold text-slate-800">{80 * durationDays} KM Included</span>
              </div>
            </div>
          </div>

          {/* Event & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
            <div>
              <label className="text-slate-700 mb-1 block">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option>Wedding Car Booking</option>
                <option>Marriage &amp; Reception Cars</option>
                <option>Party Cars</option>
                <option>Luxury Cars</option>
                <option>Corporate Travel</option>
                <option>Airport Transfers</option>
                <option>Local Tours</option>
                <option>Outstation Tours</option>
                <option>Photoshoot Cars</option>
                <option>Event Transportation</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 mb-1 block">Event Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-slate-700 mb-1 block">Event End Date ({durationDays} Day(s))</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-slate-700 mb-1 block">Reporting Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* VISUAL CAR FLORAL DECORATION PACKAGE SELECTOR */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Car Floral Decoration Styling
                </span>
                <p className="text-[11px] text-slate-500">
                  Select handcrafted floral decoration for Groom entry, Baraat or Reception
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Fresh Flowers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {decorationPackages.map((pkg) => {
                const isSelected = selectedDecorId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setSelectedDecorId(pkg.id);
                      setDecorationRequired(pkg.id !== 'none');
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{pkg.icon}</span>
                        <div>
                          <div className="font-extrabold text-xs text-slate-900 leading-tight">
                            {pkg.title}
                          </div>
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                            {pkg.tag}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900">
                          {pkg.price === 0 ? 'Free' : `+₹${pkg.price.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {pkg.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chauffeur Add-on & GST Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={driverRequired}
                onChange={(e) => setDriverRequired(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Uniformed Chauffeur
                </div>
                <div className="text-slate-500 text-[11px]">
                  Included: Chauffeur in formal uniform + white gloves
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={needGstInvoice}
                onChange={(e) => setNeedGstInvoice(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  📄 GST Tax Invoice (5%)
                </div>
                <div className="text-slate-500 text-[11px]">
                  Claim ITC for corporate &amp; business travel
                </div>
              </div>
            </label>
          </div>

          {/* GSTIN Input Fields if selected */}
          {needGstInvoice && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. ABC Enterprises Pvt Ltd"
                  value={gstBusinessName}
                  onChange={(e) => setGstBusinessName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">GSTIN (15 Digits)</label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="07AAAAA0000A1Z5"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold uppercase"
                />
              </div>
            </div>
          )}

          {/* Coupon Section (Only in Customer Mode) */}
          {!directBookingMode && (
            <div className="pt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon: 'RASWEDDING' or 'WELCOME500'"
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs uppercase font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Coupon applied! Saved ₹{discountVal.toLocaleString('en-IN')}.
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC FARE BREAKDOWN (Ola / Uber Style) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
            <div className="font-black text-amber-900 uppercase text-[11px] tracking-wider pb-1 border-b border-amber-200/60">
              Transparent Fare Calculation ({calculatedDistance} KM Trip)
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Base Day Rental ({durationDays} day(s)):</span>
              <span className="font-bold text-slate-900">₹{fareBreakdown.baseRental.toLocaleString('en-IN')}</span>
            </div>

            {fareBreakdown.extraKmCost > 0 && (
              <div className="flex justify-between text-amber-800 font-semibold">
                <span>Extra Distance ({fareBreakdown.extraKm} KM @ ₹{car.pricing?.extraKmRate || 15}/KM):</span>
                <span>+₹{fareBreakdown.extraKmCost.toLocaleString('en-IN')}</span>
              </div>
            )}

            {driverRequired && (
              <div className="flex justify-between text-slate-600">
                <span>Chauffeur Service:</span>
                <span className="font-bold text-slate-900">₹{fareBreakdown.driverTotal.toLocaleString('en-IN')}</span>
              </div>
            )}

            {decorationRequired && (
              <div className="flex justify-between text-slate-600">
                <span>Floral &amp; Ribbon Kit:</span>
                <span className="font-bold text-slate-900">₹{fareBreakdown.decorationCharges.toLocaleString('en-IN')}</span>
              </div>
            )}

            {discountVal > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Discount:</span>
                <span>-₹{discountVal.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="border-t border-amber-200 pt-2 flex justify-between text-sm font-black text-slate-900">
              <span>Total Estimated Fare:</span>
              <span className="text-amber-800 text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-emerald-800">Advance Due</div>
                <div className="text-base font-black text-emerald-900">₹{advanceAmount.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-600">Balance at Pickup</div>
                <div className="text-base font-black text-slate-800">₹{remainingAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* Fixed UPI QR Code & Payment Receipt Upload */}
          {!directBookingMode && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white border-2 border-amber-400 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-amber-400/20">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Scan Official UPI QR to Pay Advance</h4>
                    <p className="text-[11px] text-amber-300">Advance Amount: ₹{advanceAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400 text-slate-950">
                  Instant UPI QR
                </span>
              </div>

              {/* QR Image & Merchant Info */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-white/5 p-4 rounded-2xl border border-white/10">
                {/* Fixed QR Code */}
                <div className="p-3 bg-white rounded-2xl shrink-0 shadow-lg flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=rasbrother@upi&pn=RAS%20Brother%20Tour%20and%20Travels&am=${advanceAmount}&cu=INR`)}`}
                    alt="RAS Brother UPI QR Code"
                    className="w-36 h-36 object-contain"
                  />
                  <span className="text-[10px] font-black uppercase text-slate-900 mt-1.5 tracking-wider">
                    RAS BROTHER UPI
                  </span>
                </div>

                <div className="space-y-2.5 text-xs flex-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Official Business UPI ID</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-bold text-amber-300 bg-black/60 px-3 py-1.5 rounded-xl border border-amber-400/30 text-sm">
                        rasbrother@upi
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('rasbrother@upi');
                          showToast('UPI ID copied to clipboard!', 'success');
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div>✓ Scan with <strong>Google Pay, PhonePe, Paytm, or BHIM</strong>.</div>
                    <div>✓ Pay exact advance: <strong className="text-emerald-400 font-mono">₹{advanceAmount.toLocaleString('en-IN')}</strong>.</div>
                    <div>✓ Enter 12-digit UTR reference number and upload screenshot below.</div>
                  </div>
                </div>
              </div>

              {/* UTR & Screenshot Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                <div>
                  <label className="block text-slate-300 mb-1">
                    UPI Transaction UTR / Ref No. <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required={!directBookingMode}
                    placeholder="e.g. 428941092831 (12 digits)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    Payment Receipt Screenshot <span className="text-amber-400">*</span>
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-amber-400/80 bg-amber-400/10 hover:bg-amber-400/20 cursor-pointer transition text-amber-300">
                    <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-xs truncate">
                      {uploadingScreenshot ? 'Uploading...' : paymentScreenshot ? '✓ Screenshot Uploaded' : '📁 Upload Screenshot'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadScreenshot}
                    />
                  </label>
                </div>
              </div>

              {paymentScreenshot && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-3">
                  <img src={paymentScreenshot} alt="Receipt preview" className="w-12 h-12 object-cover rounded-lg border border-emerald-400 shrink-0" />
                  <div className="text-[11px] text-emerald-300 font-medium">
                    <strong className="block text-emerald-400 font-bold">Screenshot Attached Successfully!</strong>
                    The fleet owner will review this receipt and confirm your reservation.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {loading
                ? 'Processing...'
                : directBookingMode
                ? `Confirm Direct Reservation (₹${grandTotal.toLocaleString('en-IN')})`
                : `Submit Payment Receipt & Place Order (₹${advanceAmount.toLocaleString('en-IN')})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useCart } from '../../context/CartContext';
import LocationAutocomplete from '../common/LocationAutocomplete';
import { resolveCoordinates, calculateHaversineDistance } from '../../utils/distanceCalculator';
import {
  X,
  Car,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Copy,
  Upload,
  ShieldCheck,
  Sparkles,
  Check,
  CheckCircle2,
  Users,
  Route,
  ArrowRight,
  Info,
  CreditCard,
} from 'lucide-react';
import { uploadSingleFile } from '../../utils/imageUpload';

export default function BulkBookingModal({ onNavigate }) {
  const { user, token } = useAuth();
  const { showToast } = useNotification();
  const {
    cartItems,
    removeFromCart,
    clearCart,
    cartCount,
    totalAmount,
    totalAdvance,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'
  const [pickupAddress, setPickupAddress] = useState('Noida Sector 18');
  const [destinationAddress, setDestinationAddress] = useState('The Grand Palace, New Delhi');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('09:00 AM');
  const [specialRequests, setSpecialRequests] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isCartOpen) return null;

  // Calculate route distance
  const c1 = resolveCoordinates(pickupAddress);
  const c2 = resolveCoordinates(destinationAddress);
  const calculatedDistance = calculateHaversineDistance(c1, c2) || 25;

  const remainingBalance = Math.max(0, totalAmount - totalAdvance);

  // Upload screenshot receipt
  const handleUploadScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    try {
      const result = await uploadSingleFile(file, token);
      if (result && result.url) {
        setPaymentScreenshot(result.url);
        showToast('Payment receipt screenshot attached!', 'success');
      } else {
        showToast('Screenshot upload failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error uploading receipt', 'error');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please login to complete your wedding fleet booking.', 'error');
      setIsCartOpen(false);
      if (onNavigate) onNavigate('login');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your wedding fleet is empty. Please add cars first.', 'error');
      return;
    }

    if (paymentMethod === 'online') {
      if (!utrNumber.trim()) {
        showToast('Please enter the 12-digit UPI UTR / Transaction Reference Number.', 'error');
        return;
      }

      if (!paymentScreenshot) {
        showToast('Please upload payment receipt screenshot for verification.', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        cars: cartItems.map((item) => ({
          carId: item.car._id,
          driverRequired: item.driverRequired,
          decorationPackageId: item.decorationPackageId,
          decorationPackageName: item.decorationPackageName,
          customTotal: item.customTotal,
        })),
        eventType: 'Wedding Car Booking',
        startDate,
        endDate,
        startTime,
        endTime: '07:00 PM',
        pickupLocation: {
          address: pickupAddress,
          city: 'Delhi NCR',
          coordinates: c1,
        },
        destinationAddress,
        distanceKm: calculatedDistance,
        paymentMethod: paymentMethod === 'cod' ? 'cash' : 'online',
        paymentScreenshot: paymentMethod === 'cod' ? '' : paymentScreenshot,
        utrNumber: paymentMethod === 'cod' ? '' : utrNumber.trim(),
        specialRequests,
      };

      const res = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (paymentMethod === 'cod') {
          showToast(
            `🎉 Bulk Booking Confirmed for ${cartItems.length} Cars with Cash on Delivery (Pay on Pickup)! Convoy ID: ${data.bulkBookingId}`,
            'success'
          );
        } else {
          showToast(
            `🎉 Bulk Booking Confirmed for ${cartItems.length} Cars! Convoy ID: ${data.bulkBookingId}`,
            'success'
          );
        }
        clearCart();
        setIsCartOpen(false);
        if (onNavigate) onNavigate('customer-dashboard');
      } else {
        showToast(data.message || 'Failed to place bulk booking.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating bulk booking.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-8 space-y-4 sm:space-y-6 border border-slate-200 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-lg sm:text-xl shadow-md shrink-0">
              🛒
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-heading">
                  Wedding Convoy &amp; Fleet Cart
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-amber-100 text-amber-900">
                  {cartCount} Cars
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">
                Book multiple wedding cars together with a single advance payment.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleBulkSubmit} className="flex-1 overflow-y-auto space-y-5 sm:space-y-6 pr-1">
          {/* List of Cars in Convoy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                Fleet Vehicles ({cartCount})
              </span>
              {cartCount > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-2xl p-6">
                <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                No cars added to your wedding fleet yet.
                <p className="text-slate-500 mt-1">Browse cars and click "+ Add to Fleet" to build your convoy.</p>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {cartItems.map((item, idx) => (
                  <div
                    key={item.car._id}
                    className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span className="font-mono text-slate-400 font-bold shrink-0">#{idx + 1}</span>
                      <img
                        src={item.car.images?.main}
                        alt={item.car.name}
                        className="w-14 h-11 sm:w-16 sm:h-12 rounded-xl object-cover shrink-0 shadow-sm"
                      />
                      <div className="min-w-0">
                        <div className="font-black text-sm text-slate-900 truncate">
                          {item.car.brand} {item.car.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            {item.car.category}
                          </span>
                          <span>{item.car.seatingCapacity} Seater</span>
                          <span className="hidden sm:inline">• {item.car.location?.address || 'NCR'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <div className="text-left sm:text-right">
                        <span className="text-slate-400 text-[10px] block">Standard Rate</span>
                        <span className="font-black text-slate-900 text-sm">
                          ₹{(item.customTotal || item.car.pricing?.perDay || 5000).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.car._id)}
                        className="p-1.5 sm:p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                        title="Remove vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wedding Event & Route Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <span className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              <Route className="w-4 h-4 text-amber-600" /> Wedding Event &amp; Venue Details (Shared for all fleet)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <LocationAutocomplete
                  label="Pickup / Groom House / Hotel Venue"
                  value={pickupAddress}
                  allowGps={true}
                  iconColor="text-emerald-500"
                  placeholder="e.g. Sector 18 Noida"
                  inputClassName="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  onChange={setPickupAddress}
                />
              </div>

              <div>
                <LocationAutocomplete
                  label="Marriage Hall / Reception Venue"
                  value={destinationAddress}
                  allowGps={false}
                  iconColor="text-rose-500"
                  placeholder="e.g. Radisson Blu Greater Noida"
                  inputClassName="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  onChange={setDestinationAddress}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Event Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setEndDate(e.target.value);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 pl-8 font-semibold"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Fleet Reporting Time</label>
                <div className="relative">
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 pl-8 font-semibold bg-white"
                  >
                    <option>07:00 AM (Early Baraat)</option>
                    <option>09:00 AM (Morning Wedding)</option>
                    <option>11:00 AM (Afternoon Function)</option>
                    <option>04:00 PM (Evening Reception)</option>
                    <option>07:00 PM (Grand Night Wedding)</option>
                  </select>
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Special Convoy Instructions (Optional)</label>
              <textarea
                rows="2"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Lead car should lead the baraat procession; all drivers in white safari uniform..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Total Fleet Vehicles:</span>
              <span className="font-bold text-slate-900">{cartCount} Cars</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Combined Total Fleet Cost:</span>
              <span className="font-black text-slate-900 text-sm">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-amber-200">
              <span>Combined Advance Due (20%):</span>
              <span className="font-black text-emerald-700 text-base">₹{totalAdvance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-amber-900 font-bold">
              <span>Balance to Collect at Venue:</span>
              <span className="font-mono text-sm">₹{remainingBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment Method Choice (COD vs Online) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-500" /> Select Payment Preference
                </label>
                <p className="text-[11px] text-slate-500">
                  Choose Cash on Delivery (Pay to Chauffeur) or Instant Online Advance
                </p>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                COD Available
              </span>
            </div>

            {/* COD and Online Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Cash on Delivery (COD) */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">💵</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        paymentMethod === 'cod' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Zero Advance
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 leading-tight">
                    Cash on Delivery (COD)
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Zero advance required right now. Pay the full convoy balance of ₹{totalAmount.toLocaleString('en-IN')} in cash or UPI directly to your assigned lead chauffeur upon vehicle reporting at the venue.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Pay at Venue / Pickup:</span>
                  <span className="text-sm font-black text-emerald-700">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* 2. Online Advance Payment */}
              <div
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'online'
                    ? 'border-amber-500 bg-amber-50/90 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">⚡</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        paymentMethod === 'online' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Instant Fleet Lock
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 leading-tight">
                    UPI QR / Online Advance
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    Lock all {cartCount} cars instantly by paying the 20% advance of ₹{totalAdvance.toLocaleString('en-IN')} via UPI QR. Remaining balance payable at reporting.
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Advance Due Now:</span>
                  <span className="text-sm font-black text-amber-700">₹{totalAdvance.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* COD Reassurance Note */}
            {paymentMethod === 'cod' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                <span className="text-xl shrink-0">✅</span>
                <div>
                  <strong className="block font-bold text-emerald-950 mb-0.5">Pay to Driver on Reporting Confirmed</strong>
                  No advance payment required right now. All {cartCount} vehicles in your convoy will be reserved, and fleet lead chauffeur contacts will be shared prior to the event.
                </div>
              </div>
            )}

            {/* Fixed UPI QR Code for Bulk Advance */}
            {paymentMethod === 'online' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white border-2 border-amber-400 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-amber-400/20">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Scan Official UPI QR for Fleet Advance</h4>
                      <p className="text-[11px] text-amber-300">Single Advance: ₹{totalAdvance.toLocaleString('en-IN')} for all {cartCount} vehicles</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-400 text-slate-950">
                    Official UPI
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="p-3 bg-white rounded-2xl shrink-0 shadow-lg flex flex-col items-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                        `upi://pay?pa=rasbrother@upi&pn=RAS%20Brother%20Tour%20and%20Travels&am=${totalAdvance}&cu=INR`
                      )}`}
                      alt="RAS Brother UPI QR"
                      className="w-32 h-32 object-contain"
                    />
                    <span className="text-[9px] font-black uppercase text-slate-900 mt-1 tracking-wider">
                      RAS BROTHER UPI
                    </span>
                  </div>

                  <div className="space-y-2 text-xs flex-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Official Business UPI ID</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-bold text-amber-300 bg-black/60 px-3 py-1 rounded-xl border border-amber-400/30 text-xs">
                          rasbrother@upi
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('rasbrother@upi');
                            showToast('UPI ID copied to clipboard!', 'success');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div>✓ Scan with <strong>GPay, PhonePe, Paytm, or BHIM</strong>.</div>
                      <div>✓ Pay exact advance: <strong className="text-emerald-400 font-mono">₹{totalAdvance.toLocaleString('en-IN')}</strong>.</div>
                      <div>✓ Upload the screenshot below to confirm all {cartCount} cars together.</div>
                    </div>
                  </div>
                </div>

                {/* UTR & Screenshot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-300 mb-1">
                      UPI Transaction UTR / Ref No. <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 428941092831 (12 digits)"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      Payment Screenshot <span className="text-amber-400">*</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-amber-400/80 bg-amber-400/10 hover:bg-amber-400/20 cursor-pointer transition text-amber-300">
                      <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-bold text-xs truncate">
                        {uploadingScreenshot
                          ? 'Uploading...'
                          : paymentScreenshot
                          ? '✓ Screenshot Attached'
                          : '📁 Upload Receipt'}
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
                    <img
                      src={paymentScreenshot}
                      alt="Receipt preview"
                      className="w-10 h-10 object-cover rounded-lg border border-emerald-400 shrink-0"
                    />
                    <div className="text-[11px] text-emerald-300 font-medium">
                      <strong className="block text-emerald-400 font-bold">Screenshot Attached Successfully!</strong>
                      Owners will match UTR and confirm all {cartCount} vehicles.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition text-center"
            >
              Continue Shopping
            </button>

            <button
              type="submit"
              disabled={submitting || cartItems.length === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Placing Bulk Order...'
              ) : paymentMethod === 'cod' ? (
                <>
                  <Check className="w-4 h-4" />
                  Confirm Convoy Booking (Pay ₹{totalAmount.toLocaleString('en-IN')} on Pickup)
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Book All {cartCount} Vehicles (Pay ₹{totalAdvance.toLocaleString('en-IN')} Adv)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

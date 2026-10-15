import React, { useState, useEffect } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Download,
  Star,
  HandCoins,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  User,
  Shield,
  LogOut,
  Share2,
  Printer,
  Key,
  Copy,
  Sparkles,
  Phone,
  QrCode,
  Check,
} from 'lucide-react';

export default function CustomerDashboard({ onOpenChat, onBookCar, onNavigate, onLogout }) {
  const { user, token } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'offers' | 'payments' | 'profile'
  const [bookings, setBookings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // VIP Event Pass Modal state
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleShareWhatsApp = (b) => {
    const text = `🚗 *RAS BROTHER TOUR & TRAVELS — OFFICIAL BOOKING PASS*\n\n` +
      `*Booking ID:* #${b.bookingId}\n` +
      `*Vehicle:* ${b.car?.brand} ${b.car?.name} (${b.car?.category})\n` +
      `*Event Type:* ${b.eventType}\n` +
      `*Event Date:* ${new Date(b.startDate).toLocaleDateString()} (${b.startTime || '10:00 AM'})\n` +
      `*Reporting Time:* ${b.startTime || '10:00 AM'}\n` +
      `*Chauffeur:* ${b.chauffeur?.name || 'RAS Uniformed Driver'} (${b.chauffeur?.phone || '+91 98765 43210'})\n` +
      `*Car Plate:* ${b.chauffeur?.vehiclePlate || 'DL 1C AA 2026'}\n` +
      `*Pickup Venue:* ${b.pickupLocation?.address}\n` +
      (b.startOtp ? `*Start Ride OTP:* ${b.startOtp}\n` : '') +
      `*Advance Paid:* ₹${b.pricing?.advanceAmount?.toLocaleString('en-IN')}\n` +
      `*Balance at Arrival:* ₹${b.pricing?.remainingAmount?.toLocaleString('en-IN')}\n\n` +
      `*RAS Brother Tour & Travels — Premium Event Fleet*`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. My Bookings
      const bkRes = await fetch('/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bkData = await bkRes.json();
      if (bkData.success) setBookings(bkData.bookings || []);

      // 2. My Offers
      const offRes = await fetch('/api/offers/my-offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const offData = await offRes.json();
      if (offData.success) setOffers(offData.offers || []);

      // 3. Payments
      const payRes = await fetch('/api/payments/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payData = await payRes.json();
      if (payData.success) setPayments(payData.payments || []);
    } catch (err) {
      console.error('Customer dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  // Customer accepts owner's counter offer
  const handleAcceptCounterOffer = async (offerId) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/customer-accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Counter-offer accepted! You can now book at this agreed price.', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: selectedBookingForReview._id,
          overall: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Review submitted successfully!', 'success');
        setReviewModalOpen(false);
        setReviewComment('');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Customer Portal Top Bar (clean replacement for global navbar) */}
        <div className="flex flex-row items-center justify-between gap-2 bg-white p-3.5 sm:p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <RasLogo variant="light" size="sm" showTagline={false} />
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 truncate hidden sm:inline">
              Customer Portal
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onNavigate && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                >
                  <span className="hidden sm:inline">🏠 Home &amp; Route</span>
                  <span className="sm:hidden">🏠 Home</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('cars')}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1 shadow-sm"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Search &amp; Book Cars</span>
                  <span className="sm:hidden">Cars</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Customer Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-5 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center shrink-0">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
                Customer Concierge Panel
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-heading">{user?.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px] sm:max-w-none">{user?.email} • {user?.phone}</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none whitespace-nowrap shrink-0">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
                activeTab === 'bookings'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              My Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
                activeTab === 'offers'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Price Offers ({offers.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
                activeTab === 'payments'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Receipts
            </button>
          </div>
        </div>

        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 font-heading">
              Your Reserved Vehicles &amp; Status
            </h2>

            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No bookings made yet</h3>
                <p className="text-xs text-slate-500 mt-1">Browse our fleet and book a luxury car for your event.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          #{b.bookingId}
                        </span>
                        <span
                          className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : b.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      {/* Car Details */}
                      <div className="flex items-center gap-4 mt-4">
                        <img
                          src={b.car?.images?.main}
                          alt={b.car?.name}
                          className="w-20 h-16 rounded-2xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-amber-600 uppercase">
                            {b.eventType}
                          </span>
                          <h4 className="font-extrabold text-base text-slate-900 truncate">
                            {b.car?.brand} {b.car?.name}
                          </h4>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Floral Decoration package if chosen */}
                      {b.decorationPackage && b.decorationPackage.id !== 'none' && (
                        <div className="mt-3 text-xs flex items-center justify-between text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                            {b.decorationPackage.name}
                          </span>
                          <span className="font-mono font-bold">+₹{b.decorationPackage.price?.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {/* Pickup & Payment status */}
                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 text-xs space-y-1.5 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{b.pickupLocation?.address}</span>
                        </div>
                        {b.destinationAddress && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span className="text-[10px] font-bold uppercase text-slate-400">To:</span>
                            <span className="truncate">{b.destinationAddress}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                          <span>Total: ₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                          <span className="text-emerald-700">Advance Paid: ₹{b.pricing?.advanceAmount?.toLocaleString('en-IN')}</span>
                        </div>
                        {b.pricing?.remainingAmount > 0 && (
                          <div className="flex justify-between text-[11px] font-semibold text-amber-800">
                            <span>Balance at Arrival:</span>
                            <span className="font-mono">₹{b.pricing?.remainingAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      {/* UPI Advance Payment Verification Status */}
                      {b.paymentVerificationStatus === 'pending_verification' && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                          <div>
                            <span className="text-xs font-black text-amber-950 block">
                              Advance Payment Verification Pending
                            </span>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                              Payment screenshot &amp; UTR (<strong className="font-mono">{b.utrNumber || 'Submitted'}</strong>) are currently being verified by the fleet owner. Your Start Ride OTP &amp; VIP Pass will unlock immediately upon verification.
                            </p>
                          </div>
                        </div>
                      )}

                      {b.paymentVerificationStatus === 'verified' && (
                        <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                          <span className="flex items-center gap-1.5 font-bold">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> Advance Paid &amp; Verified (UTR: {b.utrNumber})
                          </span>
                          <span className="font-bold text-[10px] uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Order Confirmed
                          </span>
                        </div>
                      )}

                      {b.paymentVerificationStatus === 'rejected' && (
                        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Payment Receipt Mismatch</span>
                            <p className="text-[11px] text-rose-700">The fleet owner could not match your UTR / receipt. Please contact the owner or verify your payment reference.</p>
                          </div>
                        </div>
                      )}

                      {/* Assigned Chauffeur & Vehicle details */}
                      {b.chauffeur?.name ? (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">Assigned Chauffeur</span>
                            <span className="font-extrabold text-slate-900">{b.chauffeur.name}</span>
                            <span className="font-mono text-slate-600 ml-1.5">({b.chauffeur.vehiclePlate || 'Car Plate Ready'})</span>
                          </div>
                          {b.chauffeur.phone && (
                            <a
                              href={`tel:${b.chauffeur.phone}`}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-700 transition"
                            >
                              <Phone className="w-3 h-3" /> Call
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 text-[11px] text-slate-400 italic">
                          Uniformed chauffeur will be assigned 2 hours before reporting time.
                        </div>
                      )}

                      {/* Start Ride OTP Box */}
                      {b.startOtp && (b.status === 'confirmed' || b.status === 'in_progress') && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block flex items-center gap-1">
                              <Key className="w-3 h-3 text-amber-600" /> Start Ride OTP
                            </span>
                            <span className="font-mono text-xl font-black text-amber-950 tracking-widest">
                              {b.startOtp}
                            </span>
                          </div>
                          <div className="text-[10px] font-semibold text-amber-800 max-w-[160px] text-right">
                            Tell driver this OTP when car arrives to start trip.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* VIP Event Pass Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookingForPass(b);
                            setPassModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center gap-1.5 shadow-sm transition"
                        >
                          <QrCode className="w-3.5 h-3.5" /> VIP Pass
                        </button>

                        {/* WhatsApp Share Button */}
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(b)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 transition"
                          title="Share Booking & Driver on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/bookings/${b._id}/invoice`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1 transition"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </a>

                        {onOpenChat && b.owner && (
                          <button
                            onClick={() => onOpenChat(b.owner)}
                            className="p-1.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200"
                            title="Chat with Owner"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {b.status === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedBookingForReview(b);
                              setReviewModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" /> Rate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Offers */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 font-heading">
              Active Negotiations &amp; Offers
            </h2>

            {offers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <HandCoins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No price offers made</h3>
                <p className="text-xs text-slate-500 mt-1">Use the "Make an Offer" button on any car to negotiate prices.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {offers.map((off) => (
                  <div
                    key={off._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {off.offerId}
                      </span>
                      <span
                        className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                          off.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : off.status === 'countered'
                            ? 'bg-purple-100 text-purple-800'
                            : off.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {off.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <img
                        src={off.car?.images?.main}
                        alt={off.car?.name}
                        className="w-16 h-14 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {off.car?.brand} {off.car?.name}
                        </h4>
                        <div className="text-xs text-slate-500">
                          Original Price: ₹{off.originalPrice?.toLocaleString('en-IN')}/day
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Your Offer:</span>
                        <span className="font-black text-slate-900">₹{off.customerOffer?.toLocaleString('en-IN')}</span>
                      </div>
                      {off.ownerCounterOffer && (
                        <div className="flex justify-between text-purple-700 font-bold">
                          <span>Owner Counter-Offer:</span>
                          <span>₹{off.ownerCounterOffer?.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions if countered or accepted */}
                    {off.status === 'countered' && (
                      <button
                        onClick={() => handleAcceptCounterOffer(off._id)}
                        className="w-full py-2.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white shadow-md transition"
                      >
                        Accept Counter Offer (₹{off.ownerCounterOffer?.toLocaleString('en-IN')})
                      </button>
                    )}

                    {off.status === 'accepted' && (
                      <button
                        onClick={() => onBookCar(off.car, off.finalAgreedPrice, off._id)}
                        className="w-full py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
                      >
                        Proceed to Pay Advance (Agreed ₹{off.finalAgreedPrice?.toLocaleString('en-IN')})
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payments */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 font-heading">
              Advance &amp; Payment Receipts
            </h2>

            {payments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No payment transactions recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="pb-3">Payment ID</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p._id} className="font-medium text-slate-700">
                        <td className="py-3 font-mono font-bold text-slate-900">{p.paymentId}</td>
                        <td className="py-3 font-black text-emerald-600">₹{p.amount?.toLocaleString('en-IN')}</td>
                        <td className="py-3 capitalize">{p.type}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 text-slate-500">{p.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Review Modal */}
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
              <h3 className="font-extrabold text-base text-slate-900">
                Rate Your Experience with RAS Brother
              </h3>
              <p className="text-xs text-slate-500">
                Booking: #{selectedBookingForReview?.bookingId}
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Overall Rating (1-5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl transition ${
                          star <= reviewRating ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Review</label>
                  <textarea
                    rows="3"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    placeholder="Describe vehicle cleanliness, driver punctuality, and overall trip..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIP Event Pass Modal */}
        {passModalOpen && selectedBookingForPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in print:p-0 print:bg-white">
            <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border-2 border-amber-400 print:border-none print:shadow-none print:max-w-none">
              {/* Pass Header Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-6 text-white border-b-2 border-amber-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RasLogo variant="light" size="sm" showTagline={false} />
                    <div className="h-6 w-px bg-amber-400/40" />
                    <div>
                      <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block">
                        OFFICIAL VENUE CLEARANCE &amp; DISPATCH
                      </span>
                      <h3 className="font-extrabold text-lg text-white font-heading">
                        VIP Event &amp; Chauffeur Security Pass
                      </h3>
                    </div>
                  </div>
                  <div className="text-right print:hidden">
                    <button
                      onClick={() => setPassModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs pt-3 border-t border-amber-400/20">
                  <span className="font-mono text-amber-300 font-bold">
                    PASS NO: #{selectedBookingForPass.bookingId}
                  </span>
                  <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                    {selectedBookingForPass.eventType} PASS
                  </span>
                  <span className="text-slate-300">
                    Date: {new Date(selectedBookingForPass.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Pass Body */}
              <div className="p-6 space-y-5 text-xs text-slate-700">
                {/* 2-Column Details: Guest & Vehicle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Guest Information */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      VIP Guest Information
                    </span>
                    <div className="font-extrabold text-base text-slate-900">
                      {user?.name || selectedBookingForPass.customer?.name}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {user?.phone || selectedBookingForPass.customer?.phone || '+91 98765 43210'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Email: {user?.email || selectedBookingForPass.customer?.email}
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                      Authorized Event Vehicle
                    </span>
                    <div className="font-extrabold text-base text-slate-950">
                      {selectedBookingForPass.car?.brand} {selectedBookingForPass.car?.name}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-800">
                      Vehicle Plate: {selectedBookingForPass.chauffeur?.vehiclePlate || 'DL 1C AA 2026 (Commercial Plate)'}
                    </div>
                    <div className="text-[11px] text-amber-900">
                      Category: {selectedBookingForPass.car?.category || 'Wedding Luxury Fleet'}
                    </div>
                  </div>
                </div>

                {/* Chauffeur & Security Reporting Details */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                        Uniformed Chauffeur Dispatch
                      </span>
                      <div className="text-sm font-extrabold text-white mt-0.5">
                        {selectedBookingForPass.chauffeur?.name || 'RAS Senior Uniformed Chauffeur'}
                      </div>
                    </div>
                    {selectedBookingForPass.chauffeur?.phone && (
                      <a
                        href={`tel:${selectedBookingForPass.chauffeur.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-amber-400"
                      >
                        <Phone className="w-3.5 h-3.5" /> {selectedBookingForPass.chauffeur.phone}
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Reporting Time</span>
                      <span className="font-bold text-white">
                        {selectedBookingForPass.startTime || '10:00 AM (Sharp)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Dress Code</span>
                      <span className="font-bold text-white">White Safari Uniform</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Security Clearance</span>
                      <span className="font-bold text-emerald-400">✓ Police Verified</span>
                    </div>
                  </div>
                </div>

                {/* Ride Start OTP Banner (for Verification) */}
                {selectedBookingForPass.startOtp && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center justify-between shadow-md">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 block flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" /> SECURITY TRIP START OTP
                      </span>
                      <span className="font-mono text-2xl font-black tracking-widest">
                        {selectedBookingForPass.startOtp}
                      </span>
                    </div>
                    <div className="text-right text-[11px] font-bold text-slate-900 max-w-[200px]">
                      Share this OTP with driver on car arrival to unlock security trip clearance.
                    </div>
                  </div>
                )}

                {/* Route & Floral Info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Venue</span>
                      <span className="font-semibold text-slate-800">{selectedBookingForPass.pickupLocation?.address}</span>
                    </div>
                  </div>
                  {selectedBookingForPass.destinationAddress && (
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Drop / Event Venue</span>
                        <span className="font-semibold text-slate-800">{selectedBookingForPass.destinationAddress}</span>
                      </div>
                    </div>
                  )}
                  {selectedBookingForPass.decorationPackage && selectedBookingForPass.decorationPackage.id !== 'none' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-rose-700 font-bold">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      <span>Floral Styling: {selectedBookingForPass.decorationPackage.name}</span>
                    </div>
                  )}
                </div>

                {/* Payment Breakdown & Barcode simulation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 border border-slate-200">
                  <div className="w-full sm:w-auto space-y-1">
                    <div className="text-slate-500 text-[11px]">
                      Total Event Package: <span className="font-bold text-slate-900">₹{selectedBookingForPass.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-emerald-700 font-bold">
                      Advance Confirmed: ₹{selectedBookingForPass.pricing?.advanceAmount?.toLocaleString('en-IN')} (Paid)
                    </div>
                    {selectedBookingForPass.pricing?.remainingAmount > 0 && (
                      <div className="text-amber-800 font-bold">
                        Balance to Collect at Venue: ₹{selectedBookingForPass.pricing?.remainingAmount?.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  <div className="text-center font-mono text-[10px] text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-300 pt-2 sm:pt-0 sm:pl-4">
                    <div className="tracking-widest font-bold text-slate-800 text-xs">||| | |||| | ||| || |||</div>
                    <span className="tracking-widest">RAS-SEC-{selectedBookingForPass.bookingId}</span>
                  </div>
                </div>
              </div>

              {/* Pass Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setPassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                >
                  Close Pass
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(selectedBookingForPass)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 transition shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Security Pass
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

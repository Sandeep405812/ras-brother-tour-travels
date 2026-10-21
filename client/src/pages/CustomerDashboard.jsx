import React, { useState, useEffect } from 'react';
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
  Plus,
  Send,
  Eye,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useCompany } from '../context/CompanyContext';
import TripPassInvoiceModal from '../components/booking/TripPassInvoiceModal';
import {
  openSupportTicketWhatsApp,
  openWhatsAppMessage,
  formatSupportTicketWhatsAppMessage,
} from '../utils/whatsappHelper';

export default function CustomerDashboard({ onOpenChat, onBookCar, onNavigate, onLogout, initialTab }) {
  const { user, token } = useAuth();
  const { showToast } = useNotification();
  const { lang, t } = useLanguage();
  const { company } = useCompany();

  const VALID_CUSTOMER_TABS = ['bookings', 'offers', 'payments', 'profile', 'support'];
  const [activeTab, setActiveTab] = useState(
    VALID_CUSTOMER_TABS.includes(initialTab) ? initialTab : 'bookings'
  );

  useEffect(() => {
    if (initialTab && VALID_CUSTOMER_TABS.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [bookings, setBookings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customerTickets, setCustomerTickets] = useState([]);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [selectedTicketForView, setSelectedTicketForView] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [sendingTicketReply, setSendingTicketReply] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    category: 'Booking Issue',
    subject: '',
    description: '',
    priority: 'medium',
    bookingId: '',
  });
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || 'New Delhi',
    address: user?.address || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || 'New Delhi',
        address: user.address || '',
      }));
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
    }

    setProfileSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          city: profileForm.city,
          address: profileForm.address,
          password: profileForm.newPassword ? profileForm.newPassword : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Profile and details updated successfully!', 'success');
        localStorage.setItem('ras_user', JSON.stringify(data.user));
        setProfileForm((prev) => ({
          ...prev,
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        showToast(data.message || 'Profile update failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // VIP Event Pass Modal state
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleShareWhatsApp = (b) => {
    const isHi = lang === 'hi';
    const text = isHi
      ? `🚗 *RAS BROTHER TOUR & TRAVELS — बुकिंग रसीद*\n\n` +
        `🆔 *बुकिंग आईडी:* #${b.bookingId}\n` +
        `🚘 *गाड़ी:* ${b.car?.brand || ''} ${b.car?.name || 'Car'}\n` +
        `📅 *तारीख:* ${new Date(b.startDate).toLocaleDateString('hi-IN')} (${b.startTime || '10:00 AM'})\n` +
        `🟢 *पिकअप जगह:* ${b.pickupLocation?.address || 'N/A'}\n` +
        (b.destinationAddress ? `🔴 *ड्रॉप जगह:* ${b.destinationAddress}\n` : '') +
        (b.distanceKm ? `📏 *कुल दूरी:* ${b.distanceKm} km\n` : '') +
        `💰 *कुल किराया:* ₹${b.pricing?.totalAmount?.toLocaleString('en-IN')}\n` +
        `💳 *एडवांस जमा:* ₹${b.pricing?.advanceAmount?.toLocaleString('en-IN')}\n` +
        `💵 *बाकी रकम:* ₹${(b.pricing?.remainingAmount || 0)?.toLocaleString('en-IN')}\n` +
        (b.startOtp ? `🔑 *राइड शुरू करने का OTP:* *${b.startOtp}* (गाड़ी आने पर ड्राइवर को बताएं)\n` : '') +
        `\n✨ *RAS Brother Tour & Travels — सुरक्षित और आरामदायक यात्रा*`
      : `🚗 *RAS BROTHER TOUR & TRAVELS — BOOKING RECEIPT*\n\n` +
        `🆔 *Booking ID:* #${b.bookingId}\n` +
        `🚘 *Vehicle:* ${b.car?.brand || ''} ${b.car?.name || 'Car'}\n` +
        `📅 *Date:* ${new Date(b.startDate).toLocaleDateString('en-US')} (${b.startTime || '10:00 AM'})\n` +
        `🟢 *Pickup Location:* ${b.pickupLocation?.address || 'N/A'}\n` +
        (b.destinationAddress ? `🔴 *Drop Location:* ${b.destinationAddress}\n` : '') +
        (b.distanceKm ? `📏 *Distance:* ${b.distanceKm} km\n` : '') +
        `💰 *Total Fare:* ₹${b.pricing?.totalAmount?.toLocaleString('en-IN')}\n` +
        `💳 *Advance Paid:* ₹${b.pricing?.advanceAmount?.toLocaleString('en-IN')}\n` +
        `💵 *Balance on Arrival:* ₹${(b.pricing?.remainingAmount || 0)?.toLocaleString('en-IN')}\n` +
        (b.startOtp ? `🔑 *Start Ride OTP:* *${b.startOtp}* (Share with chauffeur upon arrival)\n` : '') +
        `\n✨ *RAS Brother Tour & Travels — Safe & Comfortable Travel*`;
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

      // 4. Support Tickets
      const tktRes = await fetch('/api/support/my-tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tktData = await tktRes.json();
      if (tktData.success) setCustomerTickets(tktData.tickets || []);
    } catch (err) {
      console.error('Customer dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit Support Problem Ticket handler (Flipkart-Style)
  const handleCreateSupportTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      showToast(t('Please enter subject and description', 'कृपया विषय और समस्या का विवरण भरें'), 'error');
      return;
    }

    try {
      setSubmittingTicket(true);
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user?.name || 'Customer',
          phone: user?.phone || '',
          email: user?.email || '',
          category: newTicketForm.category,
          subject: newTicketForm.subject.trim(),
          description: newTicketForm.description.trim(),
          priority: newTicketForm.priority,
          bookingId: newTicketForm.bookingId ? newTicketForm.bookingId.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          t(
            `Support Ticket #${data.ticket?.ticketId} registered! Admin has been alerted.`,
            `सपोर्ट टिकट #${data.ticket?.ticketId} दर्ज हो गया है! एडमिन को सूचित कर दिया गया है।`
          ),
          'success'
        );
        setTicketModalOpen(false);
        setNewTicketForm({
          category: 'Booking Issue',
          subject: '',
          description: '',
          priority: 'medium',
          bookingId: '',
        });
        fetchDashboardData();
        if (data.whatsAppShareUrl) {
          window.open(data.whatsAppShareUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        showToast(data.message || 'Failed to submit problem query', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Send Follow-up Message to Support Ticket
  const handleSendTicketReply = async (ticketId) => {
    if (!ticketReplyText.trim()) return;
    setSendingTicketReply(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: ticketReplyText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(t('Message sent to admin', 'संदेश एडमिन को भेज दिया गया'), 'success');
        setTicketReplyText('');
        setSelectedTicketForView(data.ticket);
        fetchDashboardData();
      } else {
        showToast(data.message || 'Failed to send reply', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSendingTicketReply(false);
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
        {/* Customer Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-5 sm:p-7 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
                {t('Customer Concierge Panel', 'कस्टमर पैनल')}
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-heading text-white">{user?.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px] sm:max-w-none">{user?.email} {user?.phone ? `• 📞 ${user.phone}` : ''}</p>
            </div>
          </div>

          {onNavigate && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('cars')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Car className="w-4 h-4" />
                <span>🚗 {t('Book Your Car', 'गाड़ी बुक करें')}</span>
              </button>
            </div>
          )}
        </div>

        {/* 🎛️ CUSTOMER NAVIGATION TABS BAR */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-slate-900 text-white font-black shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>{t('My Bookings & Trips', 'मेरी बुकिंग्स व ट्रिप')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              {bookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-slate-900 text-white font-black shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <HandCoins className="w-4 h-4 text-amber-500" />
            <span>{t('Price Offers', 'रेट ऑफर्स')}</span>
            {offers.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'offers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {offers.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-slate-900 text-white font-black shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span>{t('Payment Receipts', 'पेमेंट रसीदें')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'support'
                ? 'bg-slate-900 text-white font-black shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span>{t('Help & Problem Desk', 'समस्या व सहायता')}</span>
            {customerTickets.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                {customerTickets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white font-black shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <User className="w-4 h-4 text-amber-500" />
            <span>{t('My Profile', 'मेरी प्रोफाइल')}</span>
          </button>
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
                        <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">Assigned Chauffeur / Driver</span>
                            <span className="font-extrabold text-slate-900 text-sm">{b.chauffeur.name}</span>
                            <span className="font-mono text-slate-600 ml-1.5 font-bold">({b.chauffeur.vehiclePlate || 'Vehicle Ready'})</span>
                          </div>
                          {b.chauffeur.phone && (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${b.chauffeur.phone}`}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-700 transition shadow-sm"
                              >
                                <Phone className="w-3 h-3" /> Call
                              </a>
                              <a
                                href={`https://wa.me/91${b.chauffeur.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${b.chauffeur.name}, I am your passenger for booking #${b.bookingId}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-200 transition"
                              >
                                💬 WhatsApp
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 text-[11px] text-slate-400 italic">
                          Uniformed chauffeur will be assigned by owner before reporting time.
                        </div>
                      )}

                      {/* Same-day Ride Verification OTP Box */}
                      {b.startOtp && !['cancelled', 'rejected', 'completed'].includes(b.status) && (() => {
                        if (b.status === 'in_progress') {
                          return (
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-2xl flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                                <div>
                                  <span className="text-xs font-black uppercase tracking-wider text-blue-900 block flex items-center gap-1.5">
                                    🚗💨 {t('Trip In-Progress (Live)', 'सफ़र जारी है (लाइव)')}
                                  </span>
                                  <span className="text-[11px] text-blue-700 font-medium">
                                    {t('OTP verified by chauffeur. Have a safe & enjoyable ride!', 'ओटीपी ड्राइवर द्वारा सत्यापित हो चुका है। सुरक्षित यात्रा!')}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-full shrink-0">
                                {t('ON ROAD', 'सफ़र में')}
                              </span>
                            </div>
                          );
                        }

                        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
                        const rideDayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(b.startDate));
                        const isToday = todayStr === rideDayStr;

                        return isToday ? (
                          <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/70 border-2 border-emerald-400 rounded-2xl flex items-center justify-between shadow-sm">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <Key className="w-3.5 h-3.5 text-emerald-700" /> Active Ride OTP (Today)
                              </span>
                              <span className="font-mono text-3xl font-black text-emerald-950 tracking-widest">
                                {b.startOtp}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-emerald-800 max-w-[170px] text-right">
                              Share this OTP with your chauffeur today to verify and begin your trip.
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-slate-600">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                🔒
                              </div>
                              <div>
                                <span className="text-xs font-black text-slate-800 block">
                                  OTP Unlocks on Ride Day ({new Date(b.startDate).toLocaleDateString()})
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Same-day security OTP verification unlocks strictly on scheduled date.
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full shrink-0">
                              Locked
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* VIP Event Pass & Professional Invoice Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookingForPass(b);
                            setPassModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center gap-1.5 shadow-sm transition"
                        >
                          <QrCode className="w-3.5 h-3.5" /> 📄 Pass &amp; Invoice
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
                        {onOpenChat && b.owner && (
                          <button
                            onClick={() => onOpenChat(b.owner)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition shadow-sm"
                            title="Chat with Owner"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                            <span>Chat Owner</span>
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

        {/* Tab 4: Profile & Personal Details */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6 max-w-3xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-heading">
                  {t('My Profile & Booking Details', 'मेरी प्रोफाइल व विवरण')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('Update your name, phone, operating city, and address for seamless bookings', 'अपनी जानकारी व डिफ़ॉल्ट पिकअप पता अपडेट करें')}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/30 rounded-xl text-xs font-bold">
                VIP Customer
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5">{t('Full Name *', 'पूरा नाम *')}</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5">{t('Registered Email', 'ईमेल पता')}</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-emerald-600 mt-1 block">✓ Verified Email Account</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5">{t('Phone Number *', 'मोबाइल नंबर *')}</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5">{t('City / Home Base *', 'शहर / बेस *')}</label>
                  <input
                    type="text"
                    required
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">{t('Default Home / Pickup Address', 'डिफ़ॉल्ट पिकअप पता')}</label>
                <textarea
                  rows="2"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="e.g. House No. 24, Civil Lines, Gorakhpur / Sector 18, Noida"
                  className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Password Change Box */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">{t('Security & Password', 'सुरक्षा व पासवर्ड')}</h3>
                  <span className="text-[11px] text-slate-400">{t('Leave blank if you do not want to change password', 'पासवर्ड न बदलना हो तो खाली छोड़ें')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-1.5">{t('New Password', 'नया पासवर्ड')}</label>
                    <input
                      type={showProfilePassword ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1.5">{t('Confirm Password', 'पासवर्ड दोहराएँ')}</label>
                    <input
                      type={showProfilePassword ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Repeat password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPass"
                    checked={showProfilePassword}
                    onChange={(e) => setShowProfilePassword(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <label htmlFor="showPass" className="text-xs text-slate-600 cursor-pointer">
                    {t('Show Password', 'पासवर्ड दिखाएं')}
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {profileSaving ? (
                    <span>{t('Saving Changes...', 'सेव हो रहा है...')}</span>
                  ) : (
                    <>
                      <span>{t('Save Profile Changes', 'बदलाव सेव करें')}</span>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Flipkart-Style Customer Helpdesk & Problem Queries */}
        {activeTab === 'support' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <MessageSquare className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                      {t('Flipkart-Style 24/7 Problem Desk', '24/7 कस्टमर समस्या केंद्र')}
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                      Direct Admin Attention
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
                    {t('Customer Support & Problem Resolution', 'सहायता व समस्या निवारण')}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    {t(
                      'Have an issue with your ride arrival, driver behavior, booking cancellation, or advance refund? Submit a ticket below. Admin will review and provide an official resolution.',
                      'सफ़र, ड्राइवर, बुकिंग रद्दीकरण या रिफंड से जुड़ी किसी भी समस्या के लिए टिकट दर्ज करें। एडमिन तुरंत समाधान करेंगे।'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{t('+ Raise Problem Query', '+ नई समस्या दर्ज करें')}</span>
                </button>
              </div>
            </div>

            {/* Quick Helpline Hotline Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${company.phone || '9918272164'}`}
                className="bg-white border border-slate-200 hover:border-amber-400 p-4 rounded-2xl flex items-center gap-3.5 transition group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t('24/7 Customer Hotline', '24/7 कस्टमर हेल्पलाइन')}</span>
                  <p className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition">
                    {company.phone || '+91 9918272164'}
                  </p>
                </div>
              </a>

              <button
                type="button"
                onClick={() =>
                  openWhatsAppMessage(
                    company.phone || '9918272164',
                    `Namaste RAS Brother Admin, I am customer ${user?.name || ''} (Phone: ${user?.phone || ''}). I need assistance regarding my ride booking.`
                  )
                }
                className="bg-white border border-slate-200 hover:border-emerald-400 p-4 rounded-2xl flex items-center gap-3.5 transition group shadow-sm text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t('WhatsApp Concierge', 'व्हाट्सएप सपोर्ट')}</span>
                  <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition">
                    {t('Chat Directly with RAS Admin Desk', 'एडमिन से सीधे व्हाट्सएप पर बात करें')}
                  </p>
                </div>
              </button>
            </div>

            {/* Customer Tickets List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>{t('Your Raised Problem Queries', 'आपकी दर्ज की गई समस्याएं')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-mono font-bold">
                    {customerTickets.length}
                  </span>
                </h3>
              </div>

              {customerTickets.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-slate-800">{t('No Problem Queries Logged', 'कोई समस्या दर्ज नहीं है')}</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {t(
                      'All your trips and bookings are running smoothly! If you ever face an issue, click the button below to raise a problem query.',
                      'आपकी सभी यात्राएं सुरक्षित और बढ़िया चल रही हैं। कोई परेशानी हो तो यहाँ नया टिकट बनाएं।'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setTicketModalOpen(true)}
                    className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                  >
                    {t('Raise Problem Query', 'समस्या दर्ज करें')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md space-y-4"
                    >
                      {/* Ticket Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                            #{ticket.ticketId}
                          </span>
                          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-xl">
                            {ticket.category}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              ticket.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : ticket.priority === 'high'
                                ? 'bg-orange-100 text-orange-800 border-orange-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                              ticket.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : ticket.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : ticket.status === 'closed'
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            }`}
                          >
                            {ticket.status}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Subject & Description */}
                      <div className="space-y-1.5">
                        <h4 className="text-base font-black text-slate-900">{ticket.subject}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {ticket.description}
                        </p>
                        {ticket.bookingId && (
                          <div className="pt-1">
                            <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              📋 Linked Booking: #{ticket.bookingId}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Official Admin Resolution */}
                      {ticket.adminResponse?.message && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-emerald-800 font-black">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>{t('Official Resolution by Admin Desk', 'एडमिन द्वारा समाधान')}</span>
                            </span>
                            <span className="text-[10px] text-emerald-600 font-normal">
                              {ticket.adminResponse.resolvedAt
                                ? new Date(ticket.adminResponse.resolvedAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                  })
                                : ''}
                            </span>
                          </div>
                          <p className="text-emerald-900 font-semibold leading-relaxed">
                            {ticket.adminResponse.message}
                          </p>
                          {ticket.adminResponse.resolvedBy && (
                            <span className="text-[10px] text-emerald-700 block pt-1">
                              — {ticket.adminResponse.resolvedBy}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedTicketForView(ticket)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>
                            {t('Discussion Thread', 'चर्चा देखें')} ({ticket.messages?.length || 0})
                          </span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openSupportTicketWhatsApp(ticket, company.phone || '9918272164', company)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{t('WhatsApp Admin', 'व्हाट्सएप पर भेजें')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: 🎧 CUSTOMER PROBLEM QUERY SUBMISSION */}
        {ticketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg">
                      {t('Raise a Problem Query', 'समस्या का टिकट दर्ज करें')}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {t('Admin gets notified instantly like Flipkart helpdesk', 'एडमिन को तुरंत सूचना जाएगी')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSupportTicket} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1">
                      {t('Problem Category *', 'समस्या की श्रेणी *')}
                    </label>
                    <select
                      value={newTicketForm.category}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Booking Issue">{t('Ride Arrival / Chauffeur Delay', 'गाड़ी आने में देरी')}</option>
                      <option value="Payment / Refund">{t('Payment / Refund Dispute', 'पेमेंट या रिफंड समस्या')}</option>
                      <option value="Vehicle Issue">{t('Vehicle Condition / AC Problem', 'गाड़ी या AC की समस्या')}</option>
                      <option value="Chauffeur / Driver Dispute">{t('Chauffeur Conduct Concern', 'ड्राइवर से जुड़ी समस्या')}</option>
                      <option value="Fraud / Safety Concern">{t('Safety & Security Concern', 'सुरक्षा संबंधी चिंता')}</option>
                      <option value="Other">{t('Other Inquiry', 'अन्य प्रश्न')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1">
                      {t('Urgency Priority *', 'प्राथमिकता *')}
                    </label>
                    <select
                      value={newTicketForm.priority}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="urgent">🚨 {t('Urgent (Ride Currently Active)', 'अति आवश्यक (सफ़र जारी है)')}</option>
                      <option value="high">🔴 {t('High Priority', 'उच्च')}</option>
                      <option value="medium">🟡 {t('Medium Priority', 'सामान्य')}</option>
                      <option value="low">⚪ {t('Low Priority', 'कम')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1">
                    {t('Subject / Problem Title *', 'समस्या का शीर्षक *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('e.g. Car arrived 30 mins late or AC was not working', 'उदा. गाड़ी देर से पहुंची या AC नहीं चला')}
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1">
                    {t('Linked Booking ID (Optional)', 'संबंधित बुकिंग आईडी (वैकल्पिक)')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 260842"
                    value={newTicketForm.bookingId}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, bookingId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1">
                    {t('Describe Problem in Detail *', 'पूरी समस्या का विवरण लिखें *')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t('Explain clearly what happened and how we can help resolve it...', 'विस्तार से बताएं कि क्या समस्या आई...')}
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                  />
                </div>

                <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                  <span className="text-emerald-700 font-black">📲 Immediate Alert:</span>
                  <span>{t('Ticket ID will be generated and you will be connected directly with Admin on WhatsApp.', 'टिकट दर्ज होते ही एडमिन को व्हाट्सएप व सिस्टम अलर्ट मिल जाएगा।')}</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {submittingTicket ? (
                      <span>{t('Registering Problem Query...', 'टिकट दर्ज हो रहा है...')}</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 stroke-[2.5]" />
                        <span>{t('Register Ticket & Alert Admin', 'समस्या दर्ज करें व एडमिन को अलर्ट भेजें')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: 💬 CUSTOMER TICKET DISCUSSION */}
        {selectedTicketForView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        #{selectedTicketForView.ticketId}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          selectedTicketForView.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : selectedTicketForView.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {selectedTicketForView.status}
                      </span>
                    </div>
                    <h3 className="font-black text-base text-slate-900 truncate max-w-sm">
                      {selectedTicketForView.subject}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicketForView(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* Problem Description */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {t('Problem Description', 'समस्या का विवरण')}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedTicketForView.description}
                </p>
              </div>

              {/* Admin Resolution */}
              {selectedTicketForView.adminResponse?.message && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-800 font-black">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{t('Official Resolution by Admin Desk', 'एडमिन समाधान')}</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-normal">
                      {selectedTicketForView.adminResponse.resolvedAt
                        ? new Date(selectedTicketForView.adminResponse.resolvedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-emerald-900 font-semibold leading-relaxed">
                    {selectedTicketForView.adminResponse.message}
                  </p>
                </div>
              )}

              {/* Messages Thread */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-800 block">
                  {t('Discussion History', 'संदेश इतिहास')} ({selectedTicketForView.messages?.length || 0})
                </span>

                {(!selectedTicketForView.messages || selectedTicketForView.messages.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    {t('No follow-up messages yet.', 'अभी कोई अतिरिक्त संदेश नहीं है।')}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedTicketForView.messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          msg.senderRole === 'admin'
                            ? 'bg-amber-50 border border-amber-200 text-amber-950 mr-6'
                            : 'bg-slate-100 text-slate-800 ml-6'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[10px]">
                          <span className={msg.senderRole === 'admin' ? 'text-amber-800' : 'text-slate-600'}>
                            {msg.senderRole === 'admin' ? '👑 Admin Desk' : msg.senderName || 'You (Customer)'}
                          </span>
                          <span className="text-slate-400">
                            {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Send Reply Box */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('Type a message to admin...', 'एडमिन को संदेश लिखें...')}
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendTicketReply(selectedTicketForView._id);
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTicketReply(selectedTicketForView._id)}
                    disabled={sendingTicketReply || !ticketReplyText.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => openSupportTicketWhatsApp(selectedTicketForView, company.phone || '9918272164', company)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('Open in WhatsApp with Admin', 'एडमिन से व्हाट्सएप पर बात करें')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTicketForView(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    {t('Close', 'बंद करें')}
                  </button>
                </div>
              </div>
            </div>
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

        {/* VIP Event Pass & Professional 1-Click PDF Invoice Modal */}
        {passModalOpen && selectedBookingForPass && (
          <TripPassInvoiceModal
            isOpen={passModalOpen}
            onClose={() => setPassModalOpen(false)}
            booking={selectedBookingForPass}
          />
        )}

        {false && (
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

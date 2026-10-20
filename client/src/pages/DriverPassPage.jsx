import React, { useState, useEffect } from 'react';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Key,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  User,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import RasLogo from '../components/brand/RasLogo';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { useCompany } from '../context/CompanyContext';

export default function DriverPassPage({ initialBookingId = null }) {
  const { t } = useLanguage();
  const { showToast } = useNotification();
  const { company } = useCompany();

  const [bookingId, setBookingId] = useState(() => {
    if (initialBookingId) return initialBookingId;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('id') || params.get('bookingId') || '';
    }
    return '';
  });

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // OTP Form State
  const [otpInput, setOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Complete Ride State
  const [collectionMethod, setCollectionMethod] = useState('cash');
  const [completingRide, setCompletingRide] = useState(false);

  const fetchTripDetails = async () => {
    if (!bookingId) {
      setError(t('No Booking ID provided in URL', 'URL में बुकिंग आईडी नहीं मिली'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/bookings/driver-pass/${encodeURIComponent(bookingId)}`);
      const data = await res.json();
      if (res.ok && data.success && data.trip) {
        setTrip(data.trip);
      } else {
        setError(data.message || t('Trip not found or expired', 'ट्रिप नहीं मिली या लिंक अमान्य है'));
      }
    } catch (err) {
      setError(err.message || t('Failed to connect to server', 'सर्वर से संपर्क नहीं हो पाया'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [bookingId]);

  // Handler: Start Ride with Customer OTP
  const handleStartRide = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 4) {
      showToast(t('Please enter 4-digit OTP provided by customer', 'कृपया कस्टमर द्वारा दिया गया 4-अंकों का OTP दर्ज करें'), 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch(`/api/bookings/driver-pass/${encodeURIComponent(bookingId)}/start-ride`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(t('OTP verified successfully! Ride started.', 'OTP सत्यापित हो गया! सफर शुरू हो गया है।'), 'success');
        setOtpInput('');
        fetchTripDetails();
      } else {
        showToast(data.message || t('Invalid OTP. Please ask customer to verify.', 'गलत OTP! कृपया कस्टमर से दोबारा पूछें।'), 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error verifying OTP', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handler: Complete Ride
  const handleCompleteRide = async (e) => {
    e.preventDefault();
    setCompletingRide(true);
    try {
      const res = await fetch(`/api/bookings/driver-pass/${encodeURIComponent(bookingId)}/complete-ride`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionMethod }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(t('Trip marked as completed! Thank you for safe driving.', 'ट्रिप पूरी हो गई! सुरक्षित ड्राइविंग के लिए धन्यवाद।'), 'success');
        fetchTripDetails();
      } else {
        showToast(data.message || t('Could not complete ride', 'राइड पूरी नहीं हो पाई'), 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error completing trip', 'error');
    } finally {
      setCompletingRide(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 animate-bounce">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black font-heading mb-1 text-amber-400">
          RAS Brother Tour & Travels
        </h2>
        <p className="text-sm text-slate-400 animate-pulse">
          {t('Loading Chauffeur Duty Pass...', 'ड्राइवर ट्रिप पास लोड हो रहा है...')}
        </p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black mb-2 text-white">
          {t('Trip Duty Pass Not Available', 'ट्रिप पास उपलब्ध नहीं है')}
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          {error || t('Invalid booking reference. Please check your WhatsApp link or contact fleet support.', 'गलत बुकिंग लिंक। कृपया फ्लीट सपोर्ट से संपर्क करें।')}
        </p>
        <a
          href={`tel:${company.phone || '+919918272164'}`}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" />
          <span>{t('Call Fleet Dispatch Hotline', 'फ्लीट हेल्पलाइन पर कॉल करें')}</span>
        </a>
      </div>
    );
  }

  const car = trip.car || {};
  const customer = trip.customer || {};
  const pricing = trip.pricing || {};
  const isTripInProgress = trip.status === 'in_progress';
  const isTripConfirmed = trip.status === 'confirmed';
  const isTripCompleted = trip.status === 'completed';

  const customerPhoneClean = (customer.phone || '').replace(/[^0-9]/g, '');
  const pickupAddress = trip.pickupLocation?.address || 'Pickup Point';
  const mapsNavigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pickupAddress)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-4 px-3 sm:px-6 max-w-lg mx-auto pb-24">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                {t('Chauffeur Mobile Duty Pass', 'ड्राइवर मोबाइल ड्यूटी पास')}
              </span>
              <h1 className="text-sm font-extrabold text-white">
                Booking #{trip.bookingId}
              </h1>
            </div>
          </div>

          {/* Status Badge */}
          {isTripConfirmed && (
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Ready for OTP
            </span>
          )}
          {isTripInProgress && (
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              On-Road Live
            </span>
          )}
          {isTripCompleted && (
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
              ✓ Completed
            </span>
          )}
        </div>

        {/* Vehicle & Date Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white font-heading">
                {car.brand} {car.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-amber-400 font-mono text-xs font-bold border border-slate-700">
                  🚗 {trip.chauffeur?.vehiclePlate || car.licensePlate || 'Confirmed Vehicle'}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {trip.bookingPurpose || 'Event Travel'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {t('Reporting Time', 'रिपोर्टिंग समय')}
              </span>
              <span className="text-base font-black text-amber-400 font-mono">
                {trip.startTime || '10:00 AM'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {new Date(trip.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: CUSTOMER CONTACT (Call & WhatsApp) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4 shadow-xl space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-400" />
          {t('Customer / Passenger Details', 'कस्टमर व सवारी विवरण')}
        </span>

        <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div>
            <h3 className="font-extrabold text-white text-base">
              {customer.name || 'Valued Customer'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {customer.phone || 'Phone number on request'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {customerPhoneClean && (
              <>
                <a
                  href={`tel:${customerPhoneClean}`}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('Call', 'कॉल')}</span>
                </a>
                <a
                  href={`https://wa.me/91${customerPhoneClean}?text=${encodeURIComponent(
                    `Hello ${customer.name || ''}, I am your chauffeur from RAS Brother Tour & Travels for booking #${trip.bookingId}. I am reporting for your trip.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center gap-1 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: PICKUP VENUE & GOOGLE MAPS NAVIGATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-4 shadow-xl space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          {t('Route & Navigation', 'मार्ग व नेविगेशन')}
        </span>

        <div className="space-y-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
              📍 {t('Pickup Location (गाड़ी पहुँचने का स्थान):', 'पिकअप स्थान:')}
            </span>
            <p className="font-bold text-white text-sm leading-snug">
              {pickupAddress}
            </p>
          </div>

          <a
            href={mapsNavigationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>{t('Open Google Maps Navigation', 'गूगल मैप्स नेविगेशन चालू करें')}</span>
          </a>

          {trip.destinationAddress && (
            <div className="pt-2 border-t border-slate-850">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                🏁 {t('Destination / Event Venue:', 'गंतव्य स्थल:')}
              </span>
              <p className="font-semibold text-slate-200">
                {trip.destinationAddress}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: BALANCE PAYMENT COLLECTION */}
      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/20 border-2 border-amber-500/30 rounded-3xl p-5 mb-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
              💵 {t('Balance to Collect from Customer', 'ग्राहक से बाकी रकम लें')}
            </span>
            <span className="text-3xl font-black text-white font-mono mt-1 block">
              ₹{(pricing.remainingAmount || 0).toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-amber-200/80 mt-1">
              {trip.remainingCollected?.status ? (
                <span className="text-emerald-400 font-bold">
                  ✓ {t('Payment Already Collected', 'पेमेंट प्राप्त हो चुकी है')} ({trip.remainingCollected.method})
                </span>
              ) : (
                t('Collect via Cash or UPI upon vehicle arrival', 'गाड़ी पहुँचने पर नकद या UPI द्वारा प्राप्त करें')
              )}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xl">
            ₹
          </div>
        </div>
      </div>

      {/* SECTION 4: ACTION CENTER (OTP START OR COMPLETE) */}

      {/* ACTION A: START RIDE WITH 4-DIGIT CUSTOMER OTP */}
      {isTripConfirmed && (
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 mb-4 shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
              <Key className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-lg text-white font-heading">
              {t('Enter Customer OTP to Start Ride', 'सफ़र शुरू करने का OTP डालें')}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {t(
                'Ask customer for the 4-digit Ride Start OTP shown in their phone to verify & begin.',
                'ग्राहक से उनके फोन में दिख रहा 4-अंकों का OTP पूछें और यहाँ दर्ज करें।'
              )}
            </p>
          </div>

          <form onSubmit={handleStartRide} className="space-y-4">
            <div className="flex justify-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                required
                placeholder="• • • •"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-48 text-center font-mono tracking-widest text-3xl font-black bg-slate-950 border-2 border-amber-500 rounded-2xl py-3.5 text-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={verifyingOtp || otpInput.length !== 4}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyingOtp ? (
                <span>{t('Verifying OTP...', 'सत्यापन हो रहा है...')}</span>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>{t('Verify OTP & Start Ride', 'OTP सत्यापित करें व सफर शुरू करें')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ACTION B: COMPLETE RIDE */}
      {isTripInProgress && (
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 mb-4 shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-pulse">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-lg text-white font-heading">
              {t('Complete Trip & Finish', 'सफ़र पूरा करें')}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {t(
                'Collect the balance payment before marking the trip complete.',
                'ग्राहक को गंतव्य पर छोड़ने और बाकी रकम प्राप्त करने के बाद यहाँ क्लिक करें।'
              )}
            </p>
          </div>

          <form onSubmit={handleCompleteRide} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-bold text-center">
                {t('How was remaining payment received?', 'बाकी पेमेंट कैसे प्राप्त हुई?')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCollectionMethod('cash')}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    collectionMethod === 'cash'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  💵 {t('Cash (नकद)', 'नकद')}
                </button>
                <button
                  type="button"
                  onClick={() => setCollectionMethod('online')}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    collectionMethod === 'online'
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  📱 {t('UPI / Online', 'ऑनलाइन')}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={completingRide}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {completingRide ? (
                <span>{t('Completing Trip...', 'सफर पूरा हो रहा है...')}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('Finish Trip & Confirm Payment', 'सफ़र पूरा करें')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ACTION C: COMPLETED SUMMARY */}
      {isTripCompleted && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-5 mb-4 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="font-extrabold text-base text-emerald-200">
            {t('Trip Successfully Completed! 🎉', 'सफ़र सफलतापूर्वक पूरा हो चुका है! 🎉')}
          </h3>
          <p className="text-xs text-emerald-300/80 leading-relaxed">
            {t('Thank you for providing excellent service to our passengers. Drive safely back to your garage/base.', 'यात्रियों को बेहतरीन सेवा देने के लिए धन्यवाद। कृपया सुरक्षित अपने बेस लौटें।')}
          </p>
        </div>
      )}

      {/* Support Helpline Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 text-center text-xs text-slate-400 space-y-1">
        <p>
          {t('Emergency / Fleet Support Helpline:', 'आपातकालीन फ्लीट सहायता:')}{' '}
          <a
            href={`tel:${company.phone || '+919918272164'}`}
            className="text-amber-400 font-bold underline"
          >
            {company.phone || '+91 9918272164'}
          </a>
        </p>
        <p className="text-[10px] text-slate-500">
          RAS Brother Tour & Travels • Verified Chauffeur Operations
        </p>
      </div>
    </div>
  );
}

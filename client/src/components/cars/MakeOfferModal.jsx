import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { X, HandCoins, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

export default function MakeOfferModal({ car, isOpen, onClose, onOfferSuccess }) {
  const { user, token, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const standardPrice = car?.pricing?.perDay || car?.pricing?.basePrice || 5000;
  const [offerAmount, setOfferAmount] = useState(Math.round(standardPrice * 0.85));
  const [eventType, setEventType] = useState('Wedding Car Booking');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !car) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please login to make a negotiation offer', 'error');
      return;
    }

    if (offerAmount <= 0) {
      showToast('Offer amount must be greater than zero', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: car._id,
          customerOffer: Number(offerAmount),
          eventType,
          startDate,
          endDate,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit offer');
      }

      showToast(`Offer of ₹${Number(offerAmount).toLocaleString('en-IN')} submitted successfully!`, 'success');
      if (onOfferSuccess) onOfferSuccess(data.offer);
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const discountPercent = Math.round(((standardPrice - offerAmount) / standardPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-heading">Make a Price Offer</h3>
              <p className="text-xs text-slate-300">Negotiate directly with {car.owner?.name || 'Car Owner'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Car summary */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <img
              src={car.images?.main}
              alt={car.name}
              className="w-16 h-12 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900 truncate">
                {car.brand} {car.name}
              </h4>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Standard Rate:</span>
                <span className="font-extrabold text-slate-900">₹{standardPrice.toLocaleString('en-IN')}/day</span>
              </div>
            </div>
          </div>

          {/* Offer Amount Input & Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Your Proposed Price (₹/day)
              </label>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                discountPercent > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {discountPercent > 0 ? `${discountPercent}% lower than listed` : 'At or above listed price'}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
              <input
                type="number"
                min="500"
                step="100"
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                required
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-300 font-black text-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <input
              type="range"
              min={Math.round(standardPrice * 0.5)}
              max={standardPrice * 1.2}
              step="100"
              value={offerAmount}
              onChange={(e) => setOfferAmount(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Event Type & Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
              >
                <option>Wedding Car Booking</option>
                <option>Marriage &amp; Reception Cars</option>
                <option>Party Cars</option>
                <option>Luxury Cars</option>
                <option>Corporate Travel</option>
                <option>Airport Transfers</option>
                <option>Photoshoot Cars</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Note to Owner */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Message to Owner (Optional)
            </label>
            <textarea
              rows="2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Booking for a 1-day wedding procession in Noida. Need chauffeur in formal attire."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-tight">
            * Once the owner accepts or proposes a counter-offer, you can finalize your reservation with an advance payment.
          </p>

          {/* Actions */}
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
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Send Offer to Owner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useCompany } from '../context/CompanyContext';
import {
  CheckCircle,
  Download,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Phone,
} from 'lucide-react';

export default function BookingConfirmationPage({ booking, onNavigate, onOpenChat }) {
  const { company } = useCompany();

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">No booking details available</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-300 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce-short">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black tracking-widest text-amber-600 uppercase">
              RESERVATION SUCCESSFUL
            </span>
            <h1 className="text-3xl font-black text-slate-900 font-heading">
              Thank you for booking with {company.companyName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Your advance payment has been received and verified. Your car and chauffeur are securely reserved for your special event.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase">Booking Reference</span>
              <span className="font-mono font-black text-base text-slate-900">#{booking.bookingId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Vehicle Reserved</span>
                <span className="font-extrabold text-sm text-slate-900">
                  {booking.car?.brand} {booking.car?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Event Occasion</span>
                <span className="font-extrabold text-sm text-amber-700">{booking.eventType}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Event Schedule</span>
                <span className="font-bold text-slate-800">
                  {new Date(booking.startDate).toLocaleDateString()} ({booking.startTime || '10:00 AM'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Pickup Destination</span>
                <span className="font-bold text-slate-800 truncate block">
                  {booking.pickupLocation?.address}
                </span>
              </div>
            </div>

            {/* Financial Details */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Total Booking Value:</span>
                <span className="font-bold text-slate-900">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 font-bold block">Advance Paid Now:</span>
                <span className="font-black text-emerald-800 text-base">₹{booking.pricing?.advanceAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`/api/bookings/${booking._id}/invoice`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Download className="w-4 h-4 text-amber-400" /> Download Tax Invoice (PDF)
            </a>

            {onOpenChat && booking.owner && (
              <button
                onClick={() => onOpenChat(booking.owner, booking)}
                className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition"
              >
                Chat with Car Owner
              </button>
            )}

            <button
              onClick={() => onNavigate('customer-dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Support Info */}
          <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
            Need emergency assistance or route updates? Contact <strong>{company.companyName}</strong> concierge at{' '}
            <a href={`tel:${company.phone}`} className="text-amber-600 font-bold">
              {company.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

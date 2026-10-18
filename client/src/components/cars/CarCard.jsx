import React from 'react';
import { Star, ShieldCheck, Users, Fuel, Sparkles, MapPin, Tag, PhoneCall, Check, Zap, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function CarCard({ car, onBook, onAskQuery, onViewDetails, routeDetails = null }) {
  const { lang, t } = useLanguage();
  const perKmRate = Number(car.pricing?.perKm ?? car.pricing?.extraKmRate) || 20;
  const hasPerKmRate = Number.isFinite(perKmRate) && perKmRate > 0;

  // Calculate fare only when both live route distance and owner's DB rate exist.
  const distanceKm = Number(routeDetails?.calculatedDistance);
  const hasDistance = Number.isFinite(distanceKm) && distanceKm > 0;
  const calculatedFare = hasDistance && hasPerKmRate
    ? Math.round(distanceKm * perKmRate)
    : null;

  const isUnavailable = Boolean(car.isUnavailableOnDate);
  const unavailableReason = car.unavailableReason || (lang === 'hi' ? 'इस तारीख पर पहले से बुक है' : 'Already Booked on this date');

  return (
    <div className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col group ${
      isUnavailable ? 'border-red-200/80 opacity-90' : 'border-slate-200 hover:shadow-xl hover:border-amber-400/50'
    }`}>
      {/* Car Image Area */}
      <div 
        className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer" 
        onClick={() => onViewDetails && onViewDetails(car)}
      >
        <img
          src={car.images?.main || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status / Availability Overlay Badge */}
        {isUnavailable ? (
          <div className="absolute top-3 left-3 bg-red-600/95 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            {unavailableReason}
          </div>
        ) : (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {car.category || 'Sedan'}
            </span>
          </div>
        )}

        {/* Fuel Badge on Photo */}
        <div className="absolute bottom-3 left-3">
          {car.fuelIncluded !== false ? (
            <span className="bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t('Fuel Included', 'तेल शामिल है')}
            </span>
          ) : (
            <span className="bg-amber-950/90 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {t('Fuel Extra Charge', 'तेल अलग से')}
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 text-xs font-bold text-slate-800">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{car.ratingsAverage ? car.ratingsAverage.toFixed(1) : '4.9'}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Brand */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                {car.brand || 'Standard'}
              </span>
              <h3
                onClick={() => onViewDetails && onViewDetails(car)}
                className="text-lg font-bold text-slate-900 leading-snug cursor-pointer hover:text-amber-600 transition"
              >
                {car.name}
              </h3>
            </div>
          </div>

          {/* Location & Proximity Distance */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mt-2.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{car.location?.address || 'Deoria'}</span>
            </div>
            {car.distanceKm !== null && car.distanceKm !== undefined && (
              <span className="font-extrabold text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0 flex items-center gap-1">
                📍 {car.distanceKm} {t('km from pickup', 'किमी दूर')}
              </span>
            )}
          </div>

          {/* Description if present */}
          {car.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
              {car.description}
            </p>
          )}

          {/* Specs: Seats & Fuel */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-slate-600 text-xs font-medium">
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl justify-center">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{car.seatingCapacity || 5} {t('Seats', 'सीटें')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl justify-center">
              <Fuel className="w-3.5 h-3.5 text-slate-400" />
              <span>{car.fuelType || 'Diesel'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>{car.transmission || 'Manual'}</span>
            </div>
          </div>
        </div>

        {/* Transparent Live KM & Fare Breakdown if route calculated */}
        {hasDistance && hasPerKmRate && (
          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-2.5 mt-3 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="text-[11px] text-emerald-800">{t('Estimated Fare:', 'कुल अनुमानित किराया:')}</span>
              <span className="text-emerald-700 font-black text-sm">₹{calculatedFare.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px] text-emerald-700 flex items-center justify-between pt-0.5 border-t border-emerald-200/60">
              <span>{t(`Calculation: ${distanceKm} km × ₹${perKmRate}/km`, `दूरी हिसाब: ${distanceKm} km × ₹${perKmRate}/km`)}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                {t('✓ No Hidden Charges', '✓ कोई छुपा चार्ज नहीं')}
              </span>
            </div>
          </div>
        )}

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">{t('Rate', 'किराया')}</div>
            <div className="text-lg font-black text-slate-900 leading-none">
              {hasPerKmRate ? `₹${perKmRate}` : 'Rate not set'}
              {hasPerKmRate && <span className="text-xs font-semibold text-slate-500">/km</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* WhatsApp 1-Click Direct Chat / Booking Button */}
            {(() => {
              const targetPhone = (car.owner?.phone || '9876543210').replace(/\D/g, '');
              const cleanPhone = targetPhone.startsWith('91') ? targetPhone : `91${targetPhone}`;
              const waMessage = encodeURIComponent(
                lang === 'hi'
                  ? `नमस्ते RAS Brother Travels, मुझे यह गाड़ी बुक करनी है:\n🚗 गाड़ी: ${car.brand || ''} ${car.name}\n💰 रेट: ₹${perKmRate}/km\n📍 जगह: ${car.location?.address || 'Deoria'}${distanceKm ? `\n📏 दूरी: ${distanceKm} km (अनुमानित किराया: ₹${calculatedFare})` : ''}\nकृपया बुकिंग की पुष्टि करें।`
                  : `Hello RAS Brother Travels, I want to book:\n🚗 Car: ${car.brand || ''} ${car.name}\n💰 Rate: ₹${perKmRate}/km\n📍 Location: ${car.location?.address || 'Deoria'}${distanceKm ? `\n📏 Distance: ${distanceKm} km (Estimated Fare: ₹${calculatedFare})` : ''}\nPlease confirm booking details.`
              );
              const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

              return (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-sm active:scale-95"
                  title={t('Chat or book on WhatsApp', 'व्हाट्सएप पर बात या बुकिंग करें')}
                >
                  <span>📱 WhatsApp</span>
                </a>
              );
            })()}

            {/* Ask Query / Contact Admin Button */}
            <button
              type="button"
              onClick={() => onAskQuery && onAskQuery(car)}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1"
              title={t('Ask a query', 'गाड़ी के बारे में सवाल पूछें')}
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{t('Query', 'पूछताछ')}</span>
            </button>

            {/* Book Now Button */}
            {isUnavailable ? (
              <button
                type="button"
                disabled
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
              >
                {t('Unavailable', 'उपलब्ध नहीं')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onBook && onBook(car, calculatedFare, null, routeDetails)}
                className="px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 active:scale-95 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md"
              >
                {hasDistance ? t('Book Now', 'बुक करें') : t('Book / Set Route', 'गाड़ी बुक करें')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

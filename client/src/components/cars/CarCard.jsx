import React from 'react';
import { Star, ShieldCheck, Users, Fuel, Sparkles, MapPin, Tag, ShoppingCart, Check, Zap } from 'lucide-react';
import { computeTripFare } from '../../utils/distanceCalculator';
import { useCart } from '../../context/CartContext';

export default function CarCard({ car, onBook, onMakeOffer, onViewDetails, routeDetails = null }) {
  const { addToCart, removeFromCart, isCarInCart } = useCart();
  const inCart = isCarInCart(car._id);
  const pricePerDay = car.pricing?.perDay || car.pricing?.basePrice || 5000;

  const tripFare = routeDetails?.calculatedDistance
    ? computeTripFare({
        car,
        distanceKm: routeDetails.calculatedDistance,
        durationDays: 1,
        driverRequired: true,
        decorationRequired: routeDetails?.eventType?.includes('Wedding'),
      })
    : null;

  const advanceText = tripFare
    ? `Pay ₹${tripFare.advanceAmount.toLocaleString('en-IN')} Advance`
    : car.advancePayment?.type === 'percentage'
    ? `${car.advancePayment.value}% Advance (₹${Math.round((pricePerDay * car.advancePayment.value) / 100).toLocaleString('en-IN')})`
    : `₹${car.advancePayment?.value?.toLocaleString('en-IN') || '1,000'} Fixed Advance`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Car Image Area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onViewDetails && onViewDetails(car)}>
        <img
          src={car.images?.main || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            {car.category}
          </span>
          {car.weddingSpecial && (
            <span className="bg-rose-900/90 backdrop-blur-md text-rose-200 border border-rose-600/40 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-300" /> Wedding Choice
            </span>
          )}
        </div>

        {/* Advance Pay Tag */}
        <div className="absolute bottom-3 left-3 bg-emerald-950/90 backdrop-blur-md border border-emerald-600/50 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
          <Tag className="w-3 h-3 text-emerald-400" />
          {advanceText}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 text-xs font-bold text-slate-800">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{car.ratingsAverage ? car.ratingsAverage.toFixed(1) : '5.0'}</span>
          <span className="text-[10px] text-slate-400 font-normal">({car.ratingsQuantity || 12})</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Brand */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                {car.brand}
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
          <div className="flex items-center justify-between gap-2 mt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{car.location?.address || 'Delhi NCR Region'}</span>
            </div>
            {car.distanceKm !== null && car.distanceKm !== undefined && (
              <div className="flex items-center gap-1 shrink-0">
                {car.distanceKm <= 15 && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" /> Near Venue
                  </span>
                )}
                <span className="font-black text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm flex items-center gap-1">
                  📍 {car.distanceKm} km from venue
                </span>
              </div>
            )}
          </div>

          {/* Specs Pills */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-slate-600 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{car.seatingCapacity} Seats</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
              <Fuel className="w-3.5 h-3.5 text-slate-400" />
              <span>{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{car.transmission}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            {tripFare ? (
              <div>
                <div className="text-[10px] text-amber-600 uppercase font-black tracking-wider flex items-center gap-1">
                  <span>📍 {routeDetails.calculatedDistance} KM Route Fare</span>
                </div>
                <div className="text-xl font-black text-slate-900 leading-none mt-0.5">
                  ₹{tripFare.grandTotal.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-bold text-emerald-600 mt-1">
                  Pay ₹{tripFare.advanceAmount.toLocaleString('en-IN')} Adv
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Standard Rate</div>
                <div className="text-xl font-black text-slate-900 leading-none mt-0.5">
                  ₹{pricePerDay.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-500">/day</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Add to Wedding Convoy / Cart Button */}
            <button
              type="button"
              onClick={() => {
                if (inCart) {
                  removeFromCart(car._id);
                } else {
                  addToCart(car, { customTotal: tripFare ? tripFare.grandTotal : pricePerDay });
                }
              }}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                inCart
                  ? 'bg-amber-100 border-amber-300 text-amber-950 font-black'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title={inCart ? 'Remove from Wedding Fleet' : 'Add to Wedding Fleet for Bulk Booking'}
            >
              {inCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> In Fleet
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-600" /> + Fleet
                </>
              )}
            </button>

            {onMakeOffer && (
              <button
                onClick={() => onMakeOffer(car)}
                className="px-2.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300/60 transition hidden sm:inline-block"
                title="Negotiate & Make an Offer"
              >
                Offer
              </button>
            )}

            {onBook && (
              <button
                onClick={() => onBook(car, tripFare ? tripFare.grandTotal : null, null, routeDetails)}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition-all duration-200"
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

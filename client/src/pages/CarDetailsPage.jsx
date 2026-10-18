import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Star,
  ShieldCheck,
  MapPin,
  Users,
  Fuel,
  Sparkles,
  Phone,
  MessageSquare,
  HandCoins,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
} from 'lucide-react';

export default function CarDetailsPage({
  carId,
  onBack,
  onBook,
  onMakeOffer,
  onOpenChat,
}) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`/api/cars/${carId}`);
        const data = await res.json();
        if (data.success && data.car) {
          setCar(data.car);
          setActiveImage(data.car.images?.main);
        }

        const revRes = await fetch(`/api/reviews/car/${carId}`);
        const revData = await revRes.json();
        if (revData.success) {
          setReviews(revData.reviews || []);
        }
      } catch (err) {
        console.error('Car fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (carId) fetchCar();
  }, [carId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-slate-50 p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Car not found</h2>
        <button
          onClick={onBack}
          className="mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const pricePerDay = car.pricing?.perDay || car.pricing?.basePrice || 5000;
  const advanceValue =
    car.advancePayment?.type === 'percentage'
      ? `${car.advancePayment.value}% Advance (₹${Math.round((pricePerDay * car.advancePayment.value) / 100).toLocaleString('en-IN')})`
      : `₹${car.advancePayment?.value?.toLocaleString('en-IN') || '1,000'} Fixed Advance`;

  const allImages = [
    car.images?.main,
    car.images?.front,
    car.images?.rear,
    car.images?.side,
    car.images?.interior,
    car.images?.dashboard,
    ...(car.images?.gallery || []),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Button & Breadcrumbs */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Fleet
          </button>
          <div className="text-xs text-slate-400">
            RAS Brother Tour &amp; Travels &gt; {car.category} &gt; {car.brand} {car.name}
          </div>
        </div>

        {/* Top Section: Photo Gallery & Quick Reserve Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Photos (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {/* Main Stage Image */}
            <div className="aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative group">
              <img
                src={activeImage}
                alt={car.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
                  {car.category}
                </span>
                {car.weddingSpecial && (
                  <span className="bg-rose-900/90 text-rose-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Wedding Special
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails Row */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition ${
                    activeImage === img ? 'border-amber-500 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Booking Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-6 sticky top-28">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  {car.brand}
                </span>
                <h1 className="text-2xl font-black text-slate-900 font-heading leading-tight">
                  {car.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {car.location?.address}
                </p>
              </div>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                <div className="text-[11px] text-slate-400 uppercase font-bold">Standard Day Rate</div>
                <div className="text-3xl font-black text-amber-400">
                  ₹{pricePerDay.toLocaleString('en-IN')}
                  <span className="text-xs text-slate-300 font-normal"> / day</span>
                </div>
                <div className="text-xs text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                  ⚡ Pay only {advanceValue} to reserve
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    const defaultRoute = {
                      sourceAddress: car.location?.address || 'Sector 18, Noida',
                      destinationAddress: 'Connaught Place, New Delhi',
                      sourceCoords: car.location?.coordinates || [77.3244, 28.5708],
                      destCoords: [77.2195, 28.6315],
                      calculatedDistance: 25,
                      startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    };
                    onBook(car, null, null, defaultRoute);
                  }}
                  className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  Book Now (Pay Advance)
                </button>

                <button
                  onClick={() => onMakeOffer(car)}
                  className="w-full py-3 rounded-2xl font-bold text-xs bg-amber-50 text-amber-800 border border-amber-300/60 hover:bg-amber-100 flex items-center justify-center gap-2 transition"
                >
                  <HandCoins className="w-4 h-4" />
                  Make an Offer / Negotiate Price
                </button>
              </div>

              {/* Owner Snapshot */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center">
                    {car.owner?.name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      {car.ownerProfile?.businessName || car.owner?.name}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ★ {car.ownerProfile?.rating || 4.9} ({car.ownerProfile?.totalReviews || 24} reviews)
                    </div>
                  </div>
                </div>

                {onOpenChat && (
                  <button
                    onClick={() => onOpenChat(car.owner)}
                    className="p-2.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    title="Direct Chat with Owner"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Features */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 font-heading">
            Vehicle Specifications &amp; Features
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">Year / Model</span>
              <span className="text-sm font-extrabold text-slate-900">{car.year}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">Seating</span>
              <span className="text-sm font-extrabold text-slate-900">{car.seatingCapacity} Passengers</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">Transmission</span>
              <span className="text-sm font-extrabold text-slate-900">{car.transmission}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">Fuel</span>
              <span className="text-sm font-extrabold text-slate-900">{car.fuelType}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">Color</span>
              <span className="text-sm font-extrabold text-slate-900">{car.color}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold block">Climate Control</span>
              <span className="text-sm font-extrabold text-slate-900">{car.isAC ? 'Powerful AC' : 'Non-AC'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-sm text-slate-800 mb-2">About This Vehicle</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
              {car.description}
            </p>
          </div>

          {/* Features pills */}
          {car.features && car.features.length > 0 && (
            <div>
              <h3 className="font-bold text-sm text-slate-800 mb-3">Included Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verified Reviews Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                Customer Reviews &amp; Ratings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified reviews from completed bookings on RAS Brother Tour &amp; Travels
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              <span className="text-xl font-black text-slate-900">{car.ratingsAverage || '5.0'}</span>
              <span className="text-xs text-slate-400">({reviews.length} reviews)</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No reviews yet for this vehicle. Be the first to book!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                        {rev.customer?.name?.charAt(0) || 'U'}
                      </div>
                      {rev.customer?.name}
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Verified Booking
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      {'★'.repeat(rev.ratings?.overall || 5)}
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{rev.comment}</p>

                  {rev.responseFromOwner && (
                    <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 text-slate-600">
                      <strong className="text-slate-800">Owner Response:</strong> {rev.responseFromOwner}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

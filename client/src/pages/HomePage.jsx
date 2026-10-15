import React, { useState, useEffect } from 'react';
import RasLogo from '../components/brand/RasLogo';
import CarCard from '../components/cars/CarCard';
import MapFleetView from '../components/cars/MapFleetView';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import WeddingConvoyBuilder from '../components/cars/WeddingConvoyBuilder';
import { resolveCoordinates, calculateHaversineDistance, computeTripFare } from '../utils/distanceCalculator';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Shield,
  Award,
  Users,
  Compass,
  ChevronRight,
  Heart,
  Navigation,
  Car,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Route,
} from 'lucide-react';

export default function HomePage({ onNavigate, onBookCar, onMakeOfferCar, onViewCarDetails }) {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [weddingFleet, setWeddingFleet] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [selectedRouteCategory, setSelectedRouteCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showLiveMap, setShowLiveMap] = useState(false);

  // Search Panel state
  const [eventType, setEventType] = useState('Wedding Car Booking');
  const [location, setLocation] = useState('New Delhi');
  const [destination, setDestination] = useState('Noida Sector 18');
  const [sourceCoords, setSourceCoords] = useState([77.2090, 28.6139]);
  const [destCoords, setDestCoords] = useState([77.3244, 28.5708]);
  const [estimatedKm, setEstimatedKm] = useState(24);
  const [userCoords, setUserCoords] = useState([28.6139, 77.2090]);
  const [detectingGps, setDetectingGps] = useState(false);
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [duration, setDuration] = useState('1 Day');
  const [budget, setBudget] = useState('Any Budget');

  // Recalculate distance dynamically between pickup and destination
  useEffect(() => {
    const c1 = sourceCoords || resolveCoordinates(location);
    const c2 = destCoords || resolveCoordinates(destination);
    const km = calculateHaversineDistance(c1, c2);
    setEstimatedKm(km > 0 ? km : 15);
  }, [location, destination, sourceCoords, destCoords]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const [featRes, allRes] = await Promise.all([
          fetch('/api/cars/featured'),
          fetch('/api/cars?limit=50'),
        ]);
        const featData = await featRes.json();
        const allData = await allRes.json();
        if (featData.success) {
          setFeaturedCars(featData.featured || []);
          setWeddingFleet(featData.weddingFleet || []);
        }
        if (allData.success && allData.cars) {
          setAllCars(allData.cars);
        }
      } catch (err) {
        console.error('Error fetching cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Browser Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setLocation('GPS: Current Detected Location');
        setDetectingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setDetectingGps(false);
      }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const section = document.getElementById('route-fleet-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('cars', {
        eventType,
        location,
        destination,
        estimatedKm,
        lat: userCoords[0],
        lng: userCoords[1],
        date,
        budget,
      });
    }
  };

  const routeFleet = allCars.length > 0 ? allCars : featuredCars;
  const filteredRouteCars = routeFleet.filter((car) => {
    if (selectedRouteCategory !== 'All' && car.category !== selectedRouteCategory) {
      return false;
    }
    const perDay = car.pricing?.perDay || car.pricing?.basePrice || 5000;
    if (budget === 'Under ₹5k' && perDay > 5000) return false;
    if (budget === '₹5k - ₹15k' && (perDay <= 5000 || perDay > 15000)) return false;
    if (budget === '₹15k+ Luxury' && perDay <= 15000) return false;
    return true;
  });

  const servicesList = [
    { title: 'Wedding Car Booking', desc: 'Decorated luxury sedans & vintage cruisers with formal chauffeurs.', icon: '💍', category: 'Wedding Special' },
    { title: 'Marriage & Reception Cars', desc: 'Grand groom entry cars, Rolls-Royce, and bridal motorcades.', icon: '👑', category: 'Wedding Special' },
    { title: 'Party Cars', desc: 'Open-top Mahindra Thar, convertibles, and booming bass audio setups.', icon: '🎉', category: 'Party Car' },
    { title: 'Luxury Cars', desc: 'Mercedes S-Class, BMW 7 Series, Audi luxury sedans for VIP guests.', icon: '✨', category: 'Luxury' },
    { title: 'Corporate Travel', desc: 'Punctual, executive fleet for delegates, summits, and business heads.', icon: '💼', category: 'Premium' },
    { title: 'Airport Transfers', desc: 'Reliable flight tracking, meet-and-greet, and generous luggage space.', icon: '✈️', category: 'Sedan' },
    { title: 'Local Tours', desc: 'Explore historical monuments, shopping hubs, and city highlights in AC comfort.', icon: '🏙️', category: 'Budget' },
    { title: 'Outstation Tours', desc: 'Smooth highway trips to Jaipur, Agra, Chandigarh, and hill stations.', icon: '🌄', category: 'SUV' },
    { title: 'Photoshoot Cars', desc: 'Vintage classics & exotic convertibles for cinematic pre-wedding shoots.', icon: '📸', category: 'Vintage' },
    { title: 'Event Transportation', desc: '7-to-12 seater luxury vans & tempo travellers for large wedding families.', icon: '🚐', category: 'Premium' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Background Decorative Gradients & Grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#E5A93B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Pill */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>RAS Brother Tour &amp; Travels — Official Event Marketplace</span>
            </div>
          </div>

          {/* Hero Headings */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-white leading-tight">
              Book the Perfect Car for Your <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Special Event</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              Find trusted cars near you for weddings, parties, corporate events, tours and special occasions.
            </p>
          </div>

          {/* Interactive Search Panel */}
          <div className="mt-10 max-w-5xl mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-slate-950/60">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  {/* Event Type */}
                  <div className="lg:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Event Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
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

                  {/* Pickup Location (Source) Autocomplete */}
                  <div className="lg:col-span-2">
                    <LocationAutocomplete
                      label="Pickup (Source)"
                      value={location}
                      allowGps={true}
                      iconColor="text-emerald-400"
                      placeholder="Pickup Area (e.g. Sector 18, Noida)"
                      inputClassName="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      onChange={(val) => {
                        setLocation(val);
                        setSourceCoords(resolveCoordinates(val));
                      }}
                      onSelectCoords={(coords) => {
                        setSourceCoords(coords);
                        setUserCoords([coords[1], coords[0]]);
                      }}
                    />
                  </div>

                  {/* Drop / Event Venue (Destination) Autocomplete */}
                  <div className="lg:col-span-2">
                    <LocationAutocomplete
                      label="Drop / Venue (Destination)"
                      value={destination}
                      allowGps={false}
                      iconColor="text-rose-400"
                      placeholder="Venue / City (e.g. Connaught Place)"
                      inputClassName="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      onChange={(val) => {
                        setDestination(val);
                        setDestCoords(resolveCoordinates(val));
                      }}
                      onSelectCoords={(coords) => {
                        setDestCoords(coords);
                      }}
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option>4 Hours</option>
                      <option>8 Hours (1 Day)</option>
                      <option>12 Hours</option>
                      <option>2 Days</option>
                      <option>3+ Days</option>
                    </select>
                  </div>

                  {/* Live Distance Indicator */}
                  <div className="lg:col-span-2 flex items-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    <span className="font-bold">
                      📍 Estimated Trip Distance: <strong className="text-white font-black text-sm">{estimatedKm} KM</strong> (~{Math.round(estimatedKm * 1.5)} mins drive)
                    </span>
                  </div>
                </div>

                {/* Second row: Budget & Find Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs text-slate-400 font-semibold shrink-0">Budget:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Any Budget', 'Under ₹5k', '₹5k - ₹15k', '₹15k+ Luxury'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBudget(b)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            budget === b
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Search className="w-4 h-4" />
                    Find Cars
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Direct Route Fleet Options (Ola / Uber Style) */}
          <div id="route-fleet-section" className="mt-12 pt-8 border-t border-slate-800">
            {/* Route Summary Bar */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 sm:p-6 mb-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    <Route className="w-3.5 h-3.5" />
                    <span>Instant Route Fares • Direct Car Selection</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex flex-wrap items-center gap-2">
                    <span>{location || 'Pickup Location'}</span>
                    <span className="text-amber-400">➔</span>
                    <span>{destination || 'Destination'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span>📍 Distance: <strong className="text-white font-bold">{estimatedKm} KM</strong></span>
                    <span>⏱️ Drive Time: <strong className="text-white font-bold">~{Math.round(estimatedKm * 1.5)} mins</strong></span>
                    <span>🗓️ Date: <strong className="text-white font-bold">{date}</strong></span>
                    <span>✨ Event: <strong className="text-amber-400 font-bold">{eventType}</strong></span>
                  </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 lg:justify-end">
                  {['All', 'Wedding Special', 'Luxury', 'Sedan', 'SUV', 'Vintage', 'Party Car'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedRouteCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedRouteCategory === cat
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/70'
                      }`}
                    >
                      {cat} {cat === 'All' ? `(${routeFleet.length})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cars List / Grid */}
            {filteredRouteCars.length === 0 ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
                <Car className="w-12 h-12 mx-auto text-amber-500/60 mb-3" />
                <h3 className="font-extrabold text-white text-lg">No cars found for "{selectedRouteCategory}" in this budget</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Try changing the category or budget filter above to view all vehicles available for this route.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRouteCategory('All');
                    setBudget('Any Budget');
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                >
                  Show All Available Vehicles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRouteCars.slice(0, 9).map((car) => {
                  const fare = computeTripFare({
                    car,
                    distanceKm: estimatedKm,
                    durationDays: 1,
                    driverRequired: true,
                    decorationRequired: eventType.includes('Wedding'),
                  });

                  return (
                    <div
                      key={car._id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                    >
                      {/* Image + Header Tags */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                        <img
                          src={car.images?.main || '/brand/car-placeholder.jpg'}
                          alt={car.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-transparent" />

                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow">
                            {car.category}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/90 backdrop-blur-md text-amber-300 border border-slate-700">
                            ⭐ {car.ratingsAverage || '4.9'}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="text-xs font-bold text-amber-400">
                            {car.brand}
                          </div>
                          <div className="text-lg font-black text-white leading-tight">
                            {car.name} <span className="text-xs font-semibold text-slate-300">({car.year || '2023'})</span>
                          </div>
                        </div>
                      </div>

                      {/* Details & Live Route Fare */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        {/* Specs Pills */}
                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 font-semibold">
                          <div className="bg-slate-800/80 rounded-xl p-2 text-center border border-slate-700/50">
                            👥 {car.seatingCapacity} Seats
                          </div>
                          <div className="bg-slate-800/80 rounded-xl p-2 text-center border border-slate-700/50">
                            ⛽ {car.fuelType || 'Petrol'}
                          </div>
                          <div className="bg-slate-800/80 rounded-xl p-2 text-center border border-slate-700/50">
                            ❄️ {car.ac ? 'Dual AC' : 'AC'}
                          </div>
                        </div>

                        {/* Route Fare Breakdown Card */}
                        <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                Route Fare ({estimatedKm} KM)
                              </span>
                              <div className="text-2xl font-black text-white">
                                ₹{fare.grandTotal.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                Advance Today
                              </span>
                              <div className="text-base font-extrabold text-emerald-300">
                                ₹{fare.advanceAmount.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-slate-300">
                            <span>Balance at arrival: <strong className="text-white">₹{fare.remainingBalance.toLocaleString('en-IN')}</strong></span>
                            <span className="text-amber-300 font-medium">Chauffeur Included</span>
                          </div>
                        </div>

                        {/* Action CTA Buttons */}
                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              onBookCar(car, null, null, {
                                sourceAddress: location,
                                destinationAddress: destination,
                                sourceCoords,
                                destCoords,
                                calculatedDistance: estimatedKm,
                                eventType,
                                startDate: date,
                              })
                            }
                            className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 transform active:scale-[0.98]"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Book Now • Pay ₹{fare.advanceAmount.toLocaleString('en-IN')} Adv
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => onMakeOfferCar(car)}
                              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 hover:border-amber-500/40 transition flex items-center justify-center gap-1.5"
                            >
                              💬 Make an Offer
                            </button>
                            <button
                              type="button"
                              onClick={() => onViewCarDetails(car)}
                              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition flex items-center justify-center gap-1.5"
                            >
                              View Details <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Link to Full Catalog */}
            <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-800 gap-3">
              <span>
                Showing {Math.min(filteredRouteCars.length, 9)} of {filteredRouteCars.length} cars available for your pickup location.
              </span>
              <button
                type="button"
                onClick={() =>
                  onNavigate('cars', {
                    location,
                    destination,
                    estimatedKm,
                    eventType,
                    category: selectedRouteCategory !== 'All' ? selectedRouteCategory : undefined,
                  })
                }
                className="inline-flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 transition"
              >
                Browse Full Catalog with GPS Live Map <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Wedding Convoy / Multi-Car Motorcade Packages */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WeddingConvoyBuilder onNavigate={onNavigate} />
      </section>

      {/* Company Services Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-black tracking-widest uppercase text-amber-600">
              COMPANY SERVICES
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-1">
              Specialized Occasion Transportation
            </h2>
          </div>
          <p className="text-slate-500 text-sm max-w-md mt-2 md:mt-0">
            Handcrafted luxury experiences tailored for life's most unforgettable milestones across Delhi NCR, Jaipur, Agra and North India.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {servicesList.map((srv, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('cars', { category: srv.category })}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {srv.icon}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-600 transition">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                Explore Cars <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Fleet Showcase */}
      <section className="py-16 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-black tracking-widest uppercase text-amber-600">
                ROYAL FLEET
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
                Top Rated Wedding &amp; Event Cars
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLiveMap(!showLiveMap)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition flex items-center gap-2 ${
                  showLiveMap
                    ? 'bg-slate-900 text-amber-400 border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4" />
                {showLiveMap ? 'Hide GPS Map' : 'View on Live Map'}
              </button>

              <button
                onClick={() => onNavigate('cars')}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1.5"
              >
                View Full Fleet <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Optional Live Map Fleet View */}
          {showLiveMap && (
            <div className="mb-10">
              <MapFleetView
                cars={featuredCars}
                userCenter={userCoords}
                onSelectCar={(car) => onViewCarDetails(car)}
                height="450px"
              />
            </div>
          )}

          {/* Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.slice(0, 8).map((car) => (
              <CarCard
                key={car._id}
                car={car}
                onBook={onBookCar}
                onMakeOffer={onMakeOfferCar}
                onViewDetails={onViewCarDetails}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-black tracking-widest uppercase text-amber-600">
            SIMPLE &amp; TRANSPARENT
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-1">
            How RAS Brother Tour &amp; Travels Works
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Rent verified luxury vehicles in 4 easy steps without paying the full amount upfront.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {[
            {
              step: '01',
              title: 'Search & Pick Location',
              desc: 'Use your GPS or select your event venue, dates, and browse verified cars nearby.',
              icon: '📍',
            },
            {
              step: '02',
              title: 'Book or Make an Offer',
              desc: 'Book instantly or propose your custom price with our "Make an Offer" feature.',
              icon: '💬',
            },
            {
              step: '03',
              title: 'Pay Advance Amount',
              desc: 'Pay only the nominal advance fee via Razorpay. The balance is paid at vehicle arrival.',
              icon: '💳',
            },
            {
              step: '04',
              title: 'Grand Event Arrival',
              desc: 'Your uniformed chauffeur arrives on time with a decorated car for your celebration.',
              icon: '👑',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <span className="text-4xl font-black text-amber-200/70 font-heading">
                  {item.step}
                </span>
                <div className="text-3xl my-3">{item.icon}</div>
                <h3 className="font-extrabold text-lg text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Become a Partner Callout */}
      <section className="py-16 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 sm:p-12">
            <div className="space-y-3 max-w-xl text-center lg:text-left">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                Fleet Owner Opportunities
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-heading text-white">
                Own a Luxury or Vintage Car? List It on RAS Brother Tour &amp; Travels
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Connect with verified high-budget wedding and corporate customers. Define your own advance rate, accept or counter negotiate offers, and earn up to ₹2,50,000/month.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('partner')}
                className="px-8 py-3.5 rounded-2xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5"
              >
                Become a Partner
              </button>
              <button
                onClick={() => onNavigate('cars')}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Browse Fleet
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

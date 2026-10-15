import React, { useState, useEffect } from 'react';
import CarCard from '../components/cars/CarCard';
import MapFleetView from '../components/cars/MapFleetView';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import WeddingConvoyBuilder from '../components/cars/WeddingConvoyBuilder';
import { resolveCoordinates, calculateHaversineDistance } from '../utils/distanceCalculator';
import {
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  Compass,
  LayoutGrid,
  Map,
  X,
  Sparkles,
  Users,
  Navigation,
  Calendar,
  Clock,
  Route,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function CarsPage({
  initialFilters = {},
  onBookCar,
  onMakeOfferCar,
  onViewCarDetails,
}) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [detectingGps, setDetectingGps] = useState(false);
  const [showConvoyBuilder, setShowConvoyBuilder] = useState(false);

  // Route Search State (Source to Destination)
  const [sourceAddress, setSourceAddress] = useState(initialFilters.location || 'New Delhi');
  const [destinationAddress, setDestinationAddress] = useState(initialFilters.destination || 'Noida Sector 18');
  const [sourceCoords, setSourceCoords] = useState(
    initialFilters.lat && initialFilters.lng
      ? [initialFilters.lng, initialFilters.lat]
      : resolveCoordinates(initialFilters.location || 'New Delhi')
  );
  const [destCoords, setDestCoords] = useState(
    resolveCoordinates(initialFilters.destination || 'Noida Sector 18')
  );
  const [estimatedKm, setEstimatedKm] = useState(initialFilters.estimatedKm || 24);
  const [eventType, setEventType] = useState(initialFilters.eventType || 'Wedding Car Booking');
  const [tripDate, setTripDate] = useState(
    initialFilters.date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [tripDuration, setTripDuration] = useState('8 Hours (1 Day)');

  // Recalculate distance dynamically between pickup and destination & auto-suggest nearest cars
  useEffect(() => {
    const c1 = sourceCoords || resolveCoordinates(sourceAddress);
    const c2 = destCoords || resolveCoordinates(destinationAddress);
    const km = calculateHaversineDistance(c1, c2);
    setEstimatedKm(km > 0 ? km : 24);

    if (c1 && Array.isArray(c1) && c1.length === 2) {
      setLng(c1[0]);
      setLat(c1[1]);
      setSort('nearest');
    }
  }, [sourceAddress, destinationAddress, sourceCoords, destCoords]);

  // Filters State
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || 'All');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || 50000);
  const [seatingCapacity, setSeatingCapacity] = useState('All');
  const [fuelType, setFuelType] = useState('All');
  const [sort, setSort] = useState(initialFilters.lat ? 'nearest' : 'rating');
  const [weddingSpecial, setWeddingSpecial] = useState(false);
  const [radius, setRadius] = useState(100);
  const [lat, setLat] = useState(initialFilters.lat || null);
  const [lng, setLng] = useState(initialFilters.lng || null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setSort('nearest');
        setDetectingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Fallback default coordinates
        setLat(28.6139);
        setLng(77.2090);
        setSort('nearest');
        setDetectingGps(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const categories = [
    'All',
    'Luxury',
    'Premium',
    'Sedan',
    'SUV',
    'Vintage',
    'Wedding Special',
    'Party Car',
    'Budget',
  ];

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (seatingCapacity && seatingCapacity !== 'All') params.append('seatingCapacity', seatingCapacity);
      if (fuelType && fuelType !== 'All') params.append('fuelType', fuelType);
      if (sort) params.append('sort', sort);
      if (weddingSpecial) params.append('weddingSpecial', 'true');
      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
        params.append('radius', radius);
      }

      const res = await fetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCars(data.cars || []);
      }
    } catch (err) {
      console.error('Error fetching filtered cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [category, maxPrice, seatingCapacity, fuelType, sort, weddingSpecial, radius, lat, lng]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setMaxPrice(50000);
    setSeatingCapacity('All');
    setFuelType('All');
    setSort('rating');
    setWeddingSpecial(false);
    setLat(null);
    setLng(null);
  };

  const currentRouteDetails = {
    sourceAddress,
    destinationAddress,
    sourceCoords,
    destCoords,
    calculatedDistance: estimatedKm,
    eventType,
    startDate: tripDate,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-black tracking-widest uppercase text-amber-600">
              FLEET INVENTORY
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
              Local Car Rental &amp; Event Fleet
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Found {cars.length} verified cars available for your dates.
            </p>
          </div>

          {/* View Mode Toggle, Near Me & Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleFindNearMe}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm border ${
                lat && lng && sort === 'nearest'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-500" />
              <span>{detectingGps ? 'Locating...' : 'Cars Near Me'}</span>
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-slate-300 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"
            >
              <option value="nearest">Nearest to Me (GPS)</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newly Listed</option>
            </select>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`lg:hidden px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm border ${
                mobileFiltersOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                  : 'bg-white text-slate-800 border-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>{mobileFiltersOpen ? 'Hide Filters' : 'Filters'}</span>
              {(category !== 'All' || search || weddingSpecial || maxPrice < 50000) && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </button>

            <div className="flex bg-slate-200 p-1 rounded-2xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Map View"
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Route Search & Instant Fare Panel (Ola / Uber Style) */}
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-1.5">
                <Route className="w-3.5 h-3.5" />
                <span>Search Route &amp; Instant Fare Calculator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                Search Your Route to Book Cars ({sourceAddress.split(',')[0]} <span className="text-amber-400">➔</span> {destinationAddress.split(',')[0]})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your pickup and destination below. All car cards will automatically display trip fares calculated for your route!
              </p>
            </div>

            {/* Live Distance Pill */}
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-2xl text-xs text-amber-300">
              <span className="font-bold">
                📍 Trip Distance: <strong className="text-white font-black text-sm">{estimatedKm} KM</strong> (~{Math.round(estimatedKm * 1.5)} mins drive)
              </span>
            </div>
          </div>

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

              {/* Pickup Location Autocomplete */}
              <div className="lg:col-span-2">
                <LocationAutocomplete
                  label="Pickup (Source)"
                  value={sourceAddress}
                  allowGps={true}
                  iconColor="text-emerald-400"
                  placeholder="Pickup Area (e.g. Sector 18, Noida)"
                  inputClassName="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={(val) => {
                    setSourceAddress(val);
                    setSourceCoords(resolveCoordinates(val));
                  }}
                  onSelectCoords={(coords) => {
                    setSourceCoords(coords);
                    setLat(coords[1]);
                    setLng(coords[0]);
                  }}
                />
              </div>

              {/* Destination Autocomplete */}
              <div className="lg:col-span-2">
                <LocationAutocomplete
                  label="Drop / Venue (Destination)"
                  value={destinationAddress}
                  allowGps={false}
                  iconColor="text-rose-400"
                  placeholder="Drop / Venue (e.g. Connaught Place)"
                  inputClassName="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={(val) => {
                    setDestinationAddress(val);
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
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Duration
                </label>
                <select
                  value={tripDuration}
                  onChange={(e) => setTripDuration(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option>4 Hours</option>
                  <option>8 Hours (1 Day)</option>
                  <option>12 Hours</option>
                  <option>2 Days</option>
                  <option>3+ Days</option>
                </select>
              </div>

              {/* Instant Action CTA */}
              <div className="lg:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition"
                >
                  <Search className="w-4 h-4" />
                  Update Route &amp; Calculate Fares
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setShowConvoyBuilder(!showConvoyBuilder)}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm ${
              showConvoyBuilder
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 ring-2 ring-amber-400 scale-105'
                : 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 border border-amber-300 hover:brightness-95'
            }`}
          >
            👑 Multi-Car Wedding Convoys {showConvoyBuilder ? '✕' : '➔'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-slate-900 text-amber-400 shadow-md scale-105'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Wedding Convoy Showcase (if toggled or category is Wedding Special) */}
        {(showConvoyBuilder || category === 'Wedding Special') && (
          <div className="mb-8">
            <WeddingConvoyBuilder />
          </div>
        )}

        {/* Main Layout: Filters Sidebar + Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Filters Sidebar (Collapsible on Mobile) */}
          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block lg:col-span-1 space-y-6 animate-fade-in`}>
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" /> Filters
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-amber-600 hover:underline font-semibold"
                >
                  Reset All
                </button>
              </div>

              {/* Text Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search car, brand, model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>

              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Max Budget / Day</span>
                  <span className="text-amber-600 font-black">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Seating Capacity */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Minimum Seating</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['All', '4', '5', '7'].map((seat) => (
                    <button
                      key={seat}
                      type="button"
                      onClick={() => setSeatingCapacity(seat)}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        seatingCapacity === seat
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {seat === 'All' ? 'Any' : `${seat}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                >
                  <option value="All">All Fuels</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              {/* Wedding Special Checkbox */}
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weddingSpecial}
                  onChange={(e) => setWeddingSpecial(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded"
                />
                <div className="text-xs">
                  <div className="font-bold text-rose-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" /> Wedding Choice Only
                  </div>
                  <div className="text-rose-700 text-[11px]">Decorated &amp; VIP entry ready</div>
                </div>
              </label>

              {/* Search Radius for GPS */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Search Radius</span>
                  <span className="text-amber-600 font-black">{radius} km</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 25, 50].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadius(r)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition ${
                        radius === r
                          ? 'bg-slate-900 text-amber-400'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r}km
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            {/* Proximity Nearest to Venue Banner */}
            {sourceAddress && (
              <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-50 via-white to-emerald-50 rounded-2xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                    📍
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Showing Cars Nearest to Wedding Venue:</span>
                      <span className="font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">
                        {sourceAddress}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Route: {sourceAddress} → {destinationAddress} ({estimatedKm} KM Trip) • Nearest vehicles listed first
                    </div>
                  </div>
                </div>
                <span className="shrink-0 font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1">
                  ✓ Near Me Matched
                </span>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-3xl h-80 animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : viewMode === 'map' ? (
              <div className="space-y-4">
                <MapFleetView
                  cars={cars}
                  onSelectCar={(car) => onViewCarDetails(car)}
                  height="650px"
                />
              </div>
            ) : cars.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-2xl mb-4">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-slate-900">No cars found matching filters</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try broadening your search budget, selecting 'All' categories, or clearing selected filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <CarCard
                    key={car._id}
                    car={car}
                    routeDetails={currentRouteDetails}
                    onBook={onBookCar}
                    onMakeOffer={onMakeOfferCar}
                    onViewDetails={onViewCarDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

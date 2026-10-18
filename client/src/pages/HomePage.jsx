import React, { useState, useEffect } from 'react';
import CarCard from '../components/cars/CarCard';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import RouteMapPicker from '../components/common/RouteMapPicker';
import { calculateHaversineDistance, getRoadDistance } from '../utils/distanceCalculator';
import {
  Search,
  MapPin,
  Calendar,
  Navigation,
  PhoneCall,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Car,
  ArrowRight,
  ShieldCheck,
  Zap,
  Map,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function HomePage({
  onNavigate,
  onBookCar,
  onViewCarDetails,
}) {
  const { showToast } = useNotification();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Route Search State (Source to Destination)
  const [sourceAddress, setSourceAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [estimatedKm, setEstimatedKm] = useState(null);
  const [estimatedDuration, setEstimatedDuration] = useState(null);
  const [tripDate, setTripDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [showMap, setShowMap] = useState(false);

  // Direct Query Modal State
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [selectedCarForQuery, setSelectedCarForQuery] = useState(null);
  const [queryForm, setQueryForm] = useState({ name: '', phone: '', message: '' });
  const [submittingQuery, setSubmittingQuery] = useState(false);

  // Recalculate distance dynamically using Google Routes API
  useEffect(() => {
    if (!sourceCoords || !destCoords) {
      setEstimatedKm(null);
      setEstimatedDuration(null);
      return;
    }

    const instantKm = calculateHaversineDistance(sourceCoords, destCoords);
    setEstimatedKm(instantKm > 0 ? instantKm : null);

    let cancelled = false;

    getRoadDistance(sourceCoords, destCoords).then((result) => {
      if (!cancelled && result?.distanceKm > 0) {
        setEstimatedKm(result.distanceKm);
        setEstimatedDuration(result.durationMin || null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sourceCoords, destCoords]);

  // GPS Location Detector
  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSourceCoords([pos.coords.longitude, pos.coords.latitude]);
        setSourceAddress('Current GPS Location');
        setDetectingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setSourceCoords(null);
        setSourceAddress('');
        setDetectingGps(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Fetch cars strictly within 100 KM of source coordinates
  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tripDate) params.append('date', tripDate);

      if (sourceCoords && Array.isArray(sourceCoords) && sourceCoords.length === 2) {
        params.append('lng', sourceCoords[0]);
        params.append('lat', sourceCoords[1]);
        params.append('radius', 100); // 100 KM limit
      }

      const res = await fetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let carList = data.cars || [];
        // Strictly filter cars within 100 km
        carList = carList.filter(
          (c) => c.distanceKm === null || c.distanceKm === undefined || c.distanceKm <= 100
        );
        setCars(carList);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [tripDate, sourceCoords]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (!sourceCoords) {
      showToast(
        'Please select a valid pickup location from Google suggestions or the map.',
        'error'
      );
      return;
    }

    fetchCars();
  };

  // Query to Admin
  const handleOpenQueryModal = (car) => {
    setSelectedCarForQuery(car);
    setQueryForm({
      name: '',
      phone: '',
      message: `I would like to inquire about booking ${car ? car.name : 'a car'}.`,
    });
    setQueryModalOpen(true);
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!queryForm.name || !queryForm.phone) {
      showToast('Please enter your name and phone number', 'error');
      return;
    }

    setSubmittingQuery(true);
    try {
      const res = await fetch('/api/bookings/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: selectedCarForQuery?._id,
          name: queryForm.name,
          phone: queryForm.phone,
          message: queryForm.message,
          sourceAddress,
          destinationAddress,
          travelDate: tripDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Your query has been sent to Admin! We will contact you shortly.', 'success');
        setQueryModalOpen(false);
      } else {
        showToast(data.message || 'Failed to submit query', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingQuery(false);
    }
  };

  const currentRouteDetails = {
    sourceAddress,
    destinationAddress,
    sourceCoords,
    destCoords,
    calculatedDistance: estimatedKm,
    startDate: tripDate,
  };

  const filteredCars = cars.filter((c) => {
    if (selectedCategory === 'All') return true;
    return c.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Clean Hero & Route Search Bar */}
      <section className="bg-slate-950 text-white pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Header Title */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3">
              RAS BROTHER TOUR &amp; TRAVELS
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight">
              Book Verified Cars <span className="text-amber-400">Nearest to You</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Transparent ₹20/km pricing • Nearest cars within 100 KM suggested • Cash on Delivery &amp; Online QR payment
            </p>
          </div>

          {/* Simple Clean Search Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-w-5xl mx-auto">
            {/* Top Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs sm:text-sm font-bold text-amber-400">
                  Select Pickup &amp; Drop to Find Available Cars
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-bold">
                  📍 Est. Distance: <strong className="text-amber-400 font-black text-sm">{estimatedKm !== null ? `${estimatedKm} KM` : 'Select pickup & drop'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border ${
                    showMap
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>{showMap ? 'Hide Map' : 'Interactive Map'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleFindNearMe}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{detectingGps ? 'Locating...' : 'Use GPS'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              {/* Pickup Location */}
              <div className="md:col-span-4">
                <LocationAutocomplete
                  label="Pickup Location (Source)"
                  value={sourceAddress}
                  allowGps={true}
                  onOpenMap={() => setShowMap(true)}
                  iconColor="text-emerald-400"
                  placeholder="Enter Pickup Location"
                  inputClassName="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={(val) => {
                    setSourceAddress(val);
                    setSourceCoords(null);
                  }}
                  onSelectCoords={(coords) => {
                    if (Array.isArray(coords) && coords.length >= 2) {
                      setSourceCoords([Number(coords[1]), Number(coords[0])]);
                    } else {
                      setSourceCoords(null);
                    }
                  }}
                />
              </div>

              {/* Destination Location */}
              <div className="md:col-span-4">
                <LocationAutocomplete
                  label="Drop Location (Destination)"
                  value={destinationAddress}
                  allowGps={false}
                  onOpenMap={() => setShowMap(true)}
                  iconColor="text-rose-400"
                  placeholder="Enter Drop Destination"
                  inputClassName="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  onChange={(val) => {
                    setDestinationAddress(val);
                    setDestCoords(null);
                  }}
                  onSelectCoords={(coords) => {
                    if (Array.isArray(coords) && coords.length >= 2) {
                      setDestCoords([Number(coords[1]), Number(coords[0])]);
                    } else {
                      setDestCoords(null);
                    }
                  }}
                />
              </div>

              {/* Travel Date */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" /> Travel Date
                </label>
                <input
                  type="date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Find Cars Button */}
              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg flex items-center justify-center gap-1.5 transition transform active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  Find Cars
                </button>
              </div>
            </form>

            {/* Interactive OpenStreetMap & Leaflet Route Picker */}
            {showMap ? (
              <div className="mt-5 pt-4 border-t border-slate-800 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      🗺️ OpenStreetMap &amp; Leaflet Interactive Route
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      • Tap on map to set pin, or drag markers to adjust
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMap(false)}
                    className="text-xs font-bold text-slate-400 hover:text-white transition px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 self-start sm:self-auto"
                  >
                    ✕ Close Map
                  </button>
                </div>

                <RouteMapPicker
                  pickupCoords={sourceCoords}
                  dropCoords={destCoords}
                  pickupAddress={sourceAddress}
                  dropAddress={destinationAddress}
                  onPickupChange={({ address, coords }) => {
                    setSourceAddress(address);
                    setSourceCoords(coords);
                  }}
                  onDropChange={({ address, coords }) => {
                    setDestinationAddress(address);
                    setDestCoords(coords);
                  }}
                  height="380px"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="mt-4 w-full py-2.5 px-4 rounded-2xl border border-dashed border-slate-700 hover:border-amber-400/80 text-slate-400 hover:text-amber-400 text-xs font-bold transition flex items-center justify-center gap-2 bg-slate-800/30 hover:bg-slate-800/60"
              >
                <Map className="w-4 h-4 text-amber-400" />
                <span>Need exact location or village? <strong>Tap here to open Interactive Map &amp; drop pins</strong></span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Available Cars Section (Within 100 KM) */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              Available Cars Nearest to You {loading ? '(Searching fleet...)' : ''}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {sourceAddress
                ? `Showing cars within 100 KM of "${sourceAddress}" • Sorted by closest distance`
                : 'Verified premium fleet cars ready for wedding, tour & event booking across India'}
            </p>
          </div>

          {/* Quick Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Budget', 'Sedan', 'SUV', 'Luxury'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl h-80 animate-pulse border border-slate-200 shadow-sm"
              />
            ))}
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm space-y-3">
            <AlertCircle className="w-14 h-14 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">
              No cars available {sourceAddress ? `within 100 KM of "${sourceAddress}"` : 'in this category'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {sourceAddress
                ? `No active vehicle was found within 100 KM of "${sourceAddress}". Please try another nearby pickup area or submit a booking query directly to Admin.`
                : 'No vehicles match the selected category. Try selecting "All" or browse our full fleet.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={async () => {
                  setSelectedCategory('All');
                  setSourceCoords(null);
                  setSourceAddress('');
                  setLoading(true);
                  try {
                    const res = await fetch('/api/cars');
                    const data = await res.json();
                    if (data.success) {
                      setCars(data.cars || []);
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow transition inline-flex items-center gap-2"
              >
                🚗 Browse All Fleet Cars
              </button>
              <button
                type="button"
                onClick={() => handleOpenQueryModal(null)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow transition inline-flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                Contact Admin / Custom Ride
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <CarCard
                key={car._id}
                car={car}
                routeDetails={currentRouteDetails}
                onBook={(c) => onBookCar(c, null, null, currentRouteDetails)}
                onAskQuery={(c) => handleOpenQueryModal(c)}
                onViewDetails={(c) => onViewCarDetails(c)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Car Owner Callout */}
      <section className="py-12 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8">
            <div className="text-center sm:text-left">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                Fleet Partner Program
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Are You a Car Owner?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                List your vehicle with your own ₹20/km rate, location, and photos. Accept ride bookings with cash or UPI payments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('partner')}
              className="px-6 py-3 rounded-2xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition whitespace-nowrap shrink-0"
            >
              List Your Car
            </button>
          </div>
        </div>
      </section>

      {/* Query Modal */}
      {queryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Car Booking Inquiry
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCarForQuery ? `Inquiring about ${selectedCarForQuery.name}` : 'Submit custom trip inquiry'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQueryModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuery} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={queryForm.name}
                  onChange={(e) => setQueryForm({ ...queryForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phone Number (Calling / WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={queryForm.phone}
                  onChange={(e) => setQueryForm({ ...queryForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Trip Route &amp; Questions
                </label>
                <textarea
                  rows={3}
                  value={queryForm.message}
                  onChange={(e) => setQueryForm({ ...queryForm, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
                <div>📍 <strong>Route:</strong> {sourceAddress} ➔ {destinationAddress} ({estimatedKm !== null ? `${estimatedKm} KM` : 'Distance not calculated'})</div>
                <div>🗓️ <strong>Date:</strong> {tripDate}</div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQueryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuery}
                  className="px-5 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingQuery ? 'Sending...' : 'Submit Query'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
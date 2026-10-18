import React, { useState, useEffect } from 'react';
import CarCard from '../components/cars/CarCard';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import RouteMapPicker from '../components/common/RouteMapPicker';
import { resolveCoordinates, calculateHaversineDistance } from '../utils/distanceCalculator';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Route,
  Navigation,
  PhoneCall,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Map,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function CarsPage({
  initialFilters = {},
  onBookCar,
  onViewCarDetails,
}) {
  const { showToast } = useNotification();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);

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
  const [estimatedKm, setEstimatedKm] = useState(initialFilters.estimatedKm || 25);
  const [tripDate, setTripDate] = useState(
    initialFilters.date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [showMap, setShowMap] = useState(false);

  // Query Modal State
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [selectedCarForQuery, setSelectedCarForQuery] = useState(null);
  const [queryForm, setQueryForm] = useState({ name: '', phone: '', message: '' });
  const [submittingQuery, setSubmittingQuery] = useState(false);

  // Recalculate distance dynamically between pickup and destination
  useEffect(() => {
    const c1 = sourceCoords || resolveCoordinates(sourceAddress);
    const c2 = destCoords || resolveCoordinates(destinationAddress);
    const km = calculateHaversineDistance(c1, c2);
    setEstimatedKm(km > 0 ? km : 25);
  }, [sourceAddress, destinationAddress, sourceCoords, destCoords]);

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
        setSourceCoords([77.2090, 28.6139]);
        setSourceAddress('New Delhi');
        setDetectingGps(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tripDate) params.append('date', tripDate);

      if (sourceCoords && Array.isArray(sourceCoords) && sourceCoords.length === 2) {
        params.append('lng', sourceCoords[0]);
        params.append('lat', sourceCoords[1]);
        params.append('radius', 100); // 100 km limit
      }

      const res = await fetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let carList = data.cars || [];
        // Strictly ensure no car beyond 100 km is shown
        carList = carList.filter((c) => c.distanceKm === null || c.distanceKm === undefined || c.distanceKm <= 100);
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
    fetchCars();
  };

  const handleOpenQueryModal = (car) => {
    setSelectedCarForQuery(car);
    setQueryForm({ name: '', phone: '', message: `I would like to inquire about booking ${car.name}.` });
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

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simple Clean Header */}
        <div className="mb-6">
          <div className="text-xs font-black tracking-widest uppercase text-amber-600">
            RAS BROTHER TOUR &amp; TRAVELS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Book Nearest Cab &amp; Travel Cars
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Choose your pickup and drop location. Only cars within 100 KM of your pickup are suggested.
          </p>
        </div>

        {/* Route Search & Fare Calculation Bar */}
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-amber-400">Route &amp; Distance Calculator</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-bold">
                📍 Est. Distance: <strong className="text-amber-400 font-black text-sm">{estimatedKm} KM</strong>
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

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Pickup Location */}
            <div className="md:col-span-4">
              <LocationAutocomplete
                label="Pickup Location (Source)"
                value={sourceAddress}
                allowGps={true}
                onOpenMap={() => setShowMap(true)}
                iconColor="text-emerald-400"
                placeholder="Enter Pickup Location"
                inputClassName="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                onChange={(val) => {
                  setSourceAddress(val);
                  setSourceCoords(resolveCoordinates(val));
                }}
                onSelectCoords={(coords) => {
                  setSourceCoords(coords);
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
                inputClassName="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                onChange={(val) => {
                  setDestinationAddress(val);
                  setDestCoords(resolveCoordinates(val));
                }}
                onSelectCoords={(coords) => {
                  setDestCoords(coords);
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
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Search Button */}
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg flex items-center justify-center gap-1.5 transition"
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

        {/* Cars List / Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Available Cars Nearest to You {loading ? '(Searching fleet...)' : `(${cars.length} Found within 100 KM)`}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-72 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No cars found within 100 KM of your pickup location</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active fleet was found within 100 KM of "{sourceAddress}". Please try selecting a nearby city, browse all vehicles, or contact admin.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
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
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  🚗 Browse All Fleet Cars
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCarForQuery(null);
                    setQueryForm({ name: '', phone: '', message: `Looking for a car near ${sourceAddress} to ${destinationAddress} on ${tripDate}` });
                    setQueryModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                >
                  📞 Contact Admin for Custom Ride
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard
                  key={car._id}
                  car={car}
                  routeDetails={currentRouteDetails}
                  onBook={onBookCar}
                  onAskQuery={handleOpenQueryModal}
                  onViewDetails={onViewCarDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Inquiry / Query Modal */}
      {queryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">
                  CAR BOOKING INQUIRY
                </span>
                <h3 className="font-extrabold text-base">
                  {selectedCarForQuery ? `Ask About ${selectedCarForQuery.name}` : 'Contact Support & Admin'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQueryModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuery} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={queryForm.name}
                  onChange={(e) => setQueryForm({ ...queryForm, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Phone / Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={queryForm.phone}
                  onChange={(e) => setQueryForm({ ...queryForm, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Query / Question</label>
                <textarea
                  rows={3}
                  required
                  value={queryForm.message}
                  onChange={(e) => setQueryForm({ ...queryForm, message: e.target.value })}
                  placeholder="Ask about car availability, timing, pricing, or custom requests..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-slate-700 text-xs">
                Our admin team will review your inquiry and call you back immediately to assist with your booking.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQueryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuery}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5 transition"
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

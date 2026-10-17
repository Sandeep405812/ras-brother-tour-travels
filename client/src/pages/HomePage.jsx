import React, { useState, useEffect } from 'react';
import CarCard from '../components/cars/CarCard';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import { resolveCoordinates, calculateHaversineDistance } from '../utils/distanceCalculator';
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
  const [sourceAddress, setSourceAddress] = useState('New Delhi');
  const [destinationAddress, setDestinationAddress] = useState('Noida Sector 18');
  const [sourceCoords, setSourceCoords] = useState([77.2090, 28.6139]);
  const [destCoords, setDestCoords] = useState([77.3244, 28.5708]);
  const [estimatedKm, setEstimatedKm] = useState(25);
  const [tripDate, setTripDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  // Direct Query Modal State
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
        setSourceCoords([77.2090, 28.6139]);
        setSourceAddress('New Delhi');
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
                  📍 Est. Distance: <strong className="text-amber-400 font-black text-sm">{estimatedKm} KM</strong>
                </span>
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
                  iconColor="text-emerald-400"
                  placeholder="Enter Pickup Location"
                  inputClassName="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-3 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  iconColor="text-rose-400"
                  placeholder="Enter Drop Destination"
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
          </div>
        </div>
      </section>

      {/* Available Cars Section (Within 100 KM) */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              Available Cars Nearest to You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing cars within 100 KM of "{sourceAddress}" • Sorted by closest distance
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
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm">
            <AlertCircle className="w-14 h-14 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">
              No cars available within 100 KM of your pickup location
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              No active vehicle was found within 100 KM of "{sourceAddress}". Please try another nearby pickup area or submit a booking query directly to Admin.
            </p>
            <button
              type="button"
              onClick={() => handleOpenQueryModal(null)}
              className="mt-5 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow transition inline-flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Contact Admin / Submit Query
            </button>
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
                <div>📍 <strong>Route:</strong> {sourceAddress} ➔ {destinationAddress} ({estimatedKm} KM)</div>
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

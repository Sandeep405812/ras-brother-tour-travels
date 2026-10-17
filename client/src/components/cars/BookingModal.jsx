import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  calculateHaversineDistance,
  resolveCoordinates,
} from '../../utils/distanceCalculator';
import LocationAutocomplete from '../common/LocationAutocomplete';
import RouteMapPicker from '../common/RouteMapPicker';
import {
  X,
  Calendar,
  MapPin,
  ShieldCheck,
  Check,
  CreditCard,
  Navigation,
  Key,
  QrCode,
  Copy,
  Info,
  Phone,
  CheckCircle2,
  AlertCircle,
  Map,
} from 'lucide-react';

export default function BookingModal({
  car,
  isOpen,
  onClose,
  onBookingConfirmed,
  initialDetails = null,
  onNavigate = null,
}) {
  const { user, token, isAuthenticated, role } = useAuth();
  const { showToast } = useNotification();

  const [startDate, setStartDate] = useState(
    initialDetails?.startDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('10:00 AM');

  // Source & Destination
  const [sourceAddress, setSourceAddress] = useState(
    initialDetails?.sourceAddress || 'Sector 18, Noida'
  );
  const [destinationAddress, setDestinationAddress] = useState(
    initialDetails?.destinationAddress || 'Connaught Place, New Delhi'
  );
  const [sourceCoords, setSourceCoords] = useState(
    initialDetails?.sourceCoords || [77.3244, 28.5708]
  );
  const [destCoords, setDestCoords] = useState(
    initialDetails?.destCoords || [77.2195, 28.6315]
  );
  const [calculatedDistance, setCalculatedDistance] = useState(
    initialDetails?.calculatedDistance || 25
  );

  // Payment State: COD vs Online UPI QR
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Success State for showing Ride Start OTP
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Recalculate distance dynamically
  useEffect(() => {
    const c1 = sourceCoords || resolveCoordinates(sourceAddress);
    const c2 = destCoords || resolveCoordinates(destinationAddress);
    const km = calculateHaversineDistance(c1, c2);
    setCalculatedDistance(km > 0 ? km : 25);
  }, [sourceAddress, destinationAddress, sourceCoords, destCoords]);

  if (!isOpen || !car) return null;

  const perKmRate = car.pricing?.perKm || 20;
  const basePrice = car.pricing?.basePrice || 1000;
  const tripTotal = Math.max(basePrice, Math.round(calculatedDistance * perKmRate));

  const upiId = 'rasbrother@okaxis';
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=RAS+Brother+Tour+and+Travels&am=${tripTotal}&cu=INR&tn=Ride+Booking+${car.name}`;
  const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProceedBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please login or register to confirm your car booking', 'info');
      if (onNavigate) {
        onClose();
        onNavigate('login');
      }
      return;
    }

    if (paymentMethod === 'online' && !utrNumber.trim()) {
      showToast('Please enter the 12-digit UPI UTR / Transaction Reference number after payment', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: car._id,
          startDate,
          endDate: startDate, // Single day or same date
          startTime,
          pickupLocation: {
            address: sourceAddress,
            coordinates: sourceCoords,
          },
          destinationAddress,
          destinationCoordinates: destCoords,
          distanceKm: calculatedDistance,
          customTotalAmount: tripTotal,
          paymentMethod: paymentMethod === 'cod' ? 'cash' : 'online',
          utrNumber: paymentMethod === 'online' ? utrNumber.trim() : '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Booking failed');
      }

      const createdBooking = data.booking;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E5A93B', '#10B981', '#3B82F6'],
      });

      setBookingSuccessData(createdBooking);
      if (onBookingConfirmed) onBookingConfirmed(createdBooking);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full my-auto overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">
              RAS BROTHER TOUR &amp; TRAVELS
            </span>
            <h3 className="font-extrabold text-lg font-heading">
              {bookingSuccessData ? 'Booking Confirmed!' : `Book ${car.name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Booking is Successful -> Show Ride Start OTP prominently */}
        {bookingSuccessData ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900">Your Ride is Booked!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Booking ID: <strong className="font-mono text-slate-800">#{bookingSuccessData.bookingId}</strong>
              </p>
            </div>

            {/* Prominent Ride Start OTP Card */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-5 rounded-3xl shadow-lg border-2 border-amber-400">
              <span className="text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 text-slate-900 mb-1">
                <Key className="w-4 h-4" /> Ride Verification OTP
              </span>
              <div className="text-4xl font-black font-mono tracking-widest my-1">
                {bookingSuccessData.startOtp || '1234'}
              </div>
              <p className="text-xs font-bold text-slate-900/80 mt-1">
                Share this 4-digit OTP with your driver on ride day for verification to start your journey.
              </p>
            </div>

            {/* Trip Details Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-bold">{car.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date &amp; Time:</span>
                <span className="font-bold">{startDate} at {startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route ({calculatedDistance} KM):</span>
                <span className="font-bold truncate max-w-[200px]">{sourceAddress} ➔ {destinationAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-black text-amber-700 uppercase">{paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online UPI'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                <span>Total Fare:</span>
                <span className="text-emerald-700">₹{tripTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigate) onNavigate('customer');
                }}
                className="flex-1 py-3 rounded-2xl font-black text-xs bg-slate-900 hover:bg-slate-800 text-white shadow transition"
              >
                View My Bookings
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleProceedBooking} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* Vehicle Card Header */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={car.images?.main}
                alt={car.name}
                className="w-20 h-14 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {car.name}
                </h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  ₹{perKmRate}/km • {car.seatingCapacity || 5} Seats
                </div>
                <div className="text-[11px] font-bold mt-0.5">
                  {car.fuelIncluded !== false ? (
                    <span className="text-emerald-700">🟢 Fuel Included</span>
                  ) : (
                    <span className="text-amber-700">⛽ Fuel Extra Charge</span>
                  )}
                </div>
              </div>
            </div>

            {/* Travel Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-amber-600" /> Travel Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                  Pickup Time
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Pickup & Destination */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Route Details
                </span>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>{showMap ? 'Hide Map' : 'Adjust on Map'}</span>
                </button>
              </div>

              <LocationAutocomplete
                label="Pickup Location"
                value={sourceAddress}
                allowGps={true}
                onOpenMap={() => setShowMap(true)}
                iconColor="text-emerald-500"
                placeholder="Pickup area"
                inputClassName="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                onChange={(val) => {
                  setSourceAddress(val);
                  setSourceCoords(resolveCoordinates(val));
                }}
                onSelectCoords={(coords) => setSourceCoords(coords)}
              />

              <LocationAutocomplete
                label="Drop Location"
                value={destinationAddress}
                allowGps={false}
                onOpenMap={() => setShowMap(true)}
                iconColor="text-rose-500"
                placeholder="Drop destination"
                inputClassName="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                onChange={(val) => {
                  setDestinationAddress(val);
                  setDestCoords(resolveCoordinates(val));
                }}
                onSelectCoords={(coords) => setDestCoords(coords)}
              />

              {showMap && (
                <div className="pt-2 animate-in fade-in">
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
                    height="260px"
                  />
                </div>
              )}
            </div>

            {/* Calculated Fare Box */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-300/80 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-amber-900">
                  Estimated Distance: {calculatedDistance} KM
                </div>
                <div className="text-[10px] text-amber-700">
                  Rate: ₹{perKmRate}/km {car.fuelIncluded !== false ? '(Fuel Included)' : '(Fuel Extra)'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Trip Total</div>
                <div className="text-xl font-black text-slate-900">
                  ₹{tripTotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Payment Options: COD and Online QR */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                Select Payment Option:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Cash on Delivery (COD) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50 text-slate-950 ring-2 ring-amber-400'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-xs flex items-center justify-between">
                    <span>💵 Cash on Delivery</span>
                    {paymentMethod === 'cod' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Pay full fare in cash to driver on ride day
                  </div>
                </button>

                {/* Online UPI QR */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    paymentMethod === 'online'
                      ? 'border-amber-500 bg-amber-50 text-slate-950 ring-2 ring-amber-400'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-extrabold text-xs flex items-center justify-between">
                    <span>📱 Online (UPI QR)</span>
                    {paymentMethod === 'online' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Scan QR code with GPay, PhonePe or Paytm
                  </div>
                </button>
              </div>

              {/* Online UPI QR details view */}
              {paymentMethod === 'online' && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 mt-3 animate-fade-in">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      SCAN QR TO PAY ₹{tripTotal.toLocaleString('en-IN')}
                    </span>
                    <img
                      src={upiQrImageUrl}
                      alt="UPI QR Code"
                      className="w-36 h-36 mx-auto my-2 rounded-xl bg-white p-2 border-2 border-amber-400"
                    />
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                      <span>UPI ID: <strong className="text-white">{upiId}</strong></span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1 hover:text-amber-400"
                        title="Copy UPI ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copiedUpi && <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">
                      Enter UPI 12-Digit Reference / UTR Number *
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === 'online'}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 402839218932"
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl transition"
              >
                {loading
                  ? 'Processing...'
                  : paymentMethod === 'cod'
                  ? `Confirm Booking with COD (₹${tripTotal.toLocaleString('en-IN')})`
                  : `Confirm Online Booking (₹${tripTotal.toLocaleString('en-IN')})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

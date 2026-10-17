import React, { useState, useEffect } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Car,
  Calendar,
  Plus,
  Phone,
  MapPin,
  Fuel,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  Key,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Upload,
  Sparkles,
  Check,
  X,
  CreditCard,
  Navigation,
} from 'lucide-react';
import { uploadSingleFile } from '../utils/imageUpload';

export default function OwnerDashboard({ onNavigate, onLogout }) {
  const { user, token } = useAuth();
  const { showToast } = useNotification();

  // Tab state: ONLY 2 TABS for simplicity
  const [activeTab, setActiveTab] = useState('cars'); // 'cars' | 'bookings'
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed'

  // Data states
  const [myFleet, setMyFleet] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);

  // Date Unavailability Modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedCarForDates, setSelectedCarForDates] = useState(null);
  const [dateToBlock, setDateToBlock] = useState('');

  // Start Ride with OTP Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedBookingForOtp, setSelectedBookingForOtp] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  // Complete Ride Modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedBookingForComplete, setSelectedBookingForComplete] = useState(null);
  const [collectionMethod, setCollectionMethod] = useState('cash');

  // Uploading state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Car Form state - Simple & Intuitive
  const initialCarForm = {
    name: '',
    brand: 'Standard',
    model: '2024',
    perKm: 20,
    locationAddress: '',
    fuelIncluded: true, // true = तेल गाड़ी का (Fuel Included), false = तेल ग्राहक का (Fuel Extra)
    seatingCapacity: 5,
    fuelType: 'Diesel',
    mainImage: '',
    description: '',
    paymentMethods: ['cod', 'online'],
  };
  const [carForm, setCarForm] = useState(initialCarForm);

  // Fetch Owner's Cars and Bookings
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [carsRes, bookingsRes] = await Promise.all([
        fetch('/api/cars/my-fleet', { headers }),
        fetch('/api/bookings/owner-bookings', { headers }),
      ]);

      const carsData = await carsRes.json();
      const bookingsData = await bookingsRes.json();

      if (carsData.success) {
        setMyFleet(carsData.cars || []);
      }
      if (bookingsData.success) {
        setOwnerBookings(bookingsData.bookings || []);
      }
    } catch (err) {
      showToast('डेटा लोड करने में समस्या आई (Failed to load data)', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadSingleFile(file, token);
      setCarForm((prev) => ({ ...prev, mainImage: uploadedUrl }));
      showToast('फोटो सफलतापूर्वक अपलोड हो गई! (Photo uploaded)', 'success');
    } catch (err) {
      showToast(err.message || 'फोटो अपलोड नहीं हो पाई (Upload failed)', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Add Car Modal
  const handleOpenAddCar = () => {
    setIsEditing(false);
    setEditingCarId(null);
    setCarForm(initialCarForm);
    setCarModalOpen(true);
  };

  // Open Edit Car Modal
  const handleOpenEditCar = (car) => {
    setIsEditing(true);
    setEditingCarId(car._id);
    setCarForm({
      name: car.name || '',
      brand: car.brand || 'Standard',
      model: car.model || '2024',
      perKm: car.pricing?.perKm || car.pricing?.extraKmRate || 20,
      locationAddress: car.location?.address || car.location?.city || '',
      fuelIncluded: car.fuelIncluded !== undefined ? car.fuelIncluded : true,
      seatingCapacity: car.seatingCapacity || 5,
      fuelType: car.fuelType || 'Diesel',
      mainImage: car.images?.main || '',
      description: car.description || '',
      paymentMethods: car.paymentMethods?.length ? car.paymentMethods : ['cod', 'online'],
    });
    setCarModalOpen(true);
  };

  // Save Car (Add or Edit)
  const handleSaveCar = async (e) => {
    e.preventDefault();
    if (!carForm.name.trim()) {
      showToast('कृपया गाड़ी का नाम भरें (Please enter car name)', 'error');
      return;
    }
    if (!carForm.locationAddress.trim()) {
      showToast('गाड़ी कहाँ उपलब्ध है, वह जगह भरें (Please enter location)', 'error');
      return;
    }

    try {
      const payload = {
        name: carForm.name.trim(),
        brand: carForm.brand.trim() || 'Standard',
        model: carForm.model.trim() || '2024',
        perKm: Number(carForm.perKm) || 20,
        pricing: {
          perKm: Number(carForm.perKm) || 20,
          extraKmRate: Number(carForm.perKm) || 20,
          perDay: (Number(carForm.perKm) || 20) * 100,
          basePrice: (Number(carForm.perKm) || 20) * 50,
        },
        location: {
          address: carForm.locationAddress.trim(),
          city: carForm.locationAddress.trim(),
          type: 'Point',
          coordinates: [83.7784, 26.5024],
        },
        address: carForm.locationAddress.trim(),
        city: carForm.locationAddress.trim(),
        fuelIncluded: Boolean(carForm.fuelIncluded),
        seatingCapacity: Number(carForm.seatingCapacity) || 5,
        fuelType: carForm.fuelType || 'Diesel',
        mainImage: carForm.mainImage.trim() || '/brand/ras-logo-primary.svg',
        images: {
          main: carForm.mainImage.trim() || '/brand/ras-logo-primary.svg',
        },
        description: carForm.description.trim() || 'Well maintained, verified chauffeur driven vehicle.',
        paymentMethods: carForm.paymentMethods.length ? carForm.paymentMethods : ['cod', 'online'],
      };

      const url = isEditing ? `/api/cars/${editingCarId}` : '/api/cars';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          isEditing ? 'गाड़ी की जानकारी अपडेट हो गई! (Car updated)' : 'नई गाड़ी सफलतापूर्वक जुड़ गई! (Car added)',
          'success'
        );
        setCarModalOpen(false);
        fetchDashboardData();
      } else {
        showToast(data.message || 'गाड़ी सेव नहीं हो सकी (Save failed)', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Car
  const handleDeleteCar = async (carId, carName) => {
    if (!window.confirm(`क्या आप सच में "${carName}" को हटाना चाहते हैं? (Delete this car?)`)) {
      return;
    }

    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('गाड़ी लिस्ट से हटा दी गई (Car removed)', 'success');
        setMyFleet((prev) => prev.filter((c) => c._id !== carId));
      } else {
        showToast(data.message || 'गाड़ी नहीं हट सकी', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle Custom Date Availability
  const handleToggleDate = async (carId, dateStr) => {
    if (!dateStr) return;
    try {
      const res = await fetch(`/api/cars/${carId}/toggle-date`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: dateStr }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        // Update local state
        setMyFleet((prev) =>
          prev.map((c) => (c._id === carId ? { ...c, unavailableDates: data.unavailableDates } : c))
        );
        if (selectedCarForDates && selectedCarForDates._id === carId) {
          setSelectedCarForDates((prev) => ({ ...prev, unavailableDates: data.unavailableDates }));
        }
        setDateToBlock('');
      } else {
        showToast(data.message || 'तारीख अपडेट नहीं हो सकी', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Accept / Reject Booking
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const actionText = newStatus === 'confirmed' ? 'स्वीकार (Accept)' : 'रद्द (Cancel)';
    if (!window.confirm(`क्या आप इस बुकिंग को ${actionText} करना चाहते हैं?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          cancellationReason: newStatus === 'cancelled' ? 'गाड़ी मालिक द्वारा मना किया गया' : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`बुकिंग ${actionText} हो गई!`, 'success');
        fetchDashboardData();
      } else {
        showToast(data.message || 'स्टेटस अपडेट नहीं हो सका', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Start Ride with OTP
  const handleVerifyOtpAndStartRide = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      showToast('कृपया ग्राहक से पूछकर 4 अंकों का OTP डालें', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${selectedBookingForOtp._id}/start-ride`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: otpInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('सत्यापन सफल! राइड शुरू हो गई है। (Ride Started!)', 'success');
        setOtpModalOpen(false);
        setOtpInput('');
        fetchDashboardData();
      } else {
        showToast(data.message || 'गलत OTP! कृपया ग्राहक से सही OTP पूछें।', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Complete Ride
  const handleCompleteRide = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/bookings/${selectedBookingForComplete._id}/complete-ride`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ collectionMethod }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('सफ़र सफलतापूर्वक पूरा हो गया! (Ride Completed)', 'success');
        setCompleteModalOpen(false);
        fetchDashboardData();
      } else {
        showToast(data.message || 'राइड पूरी नहीं हो सकी', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filter Bookings
  const filteredBookings = ownerBookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Header - Simple & Clean */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white font-heading flex items-center gap-2">
                कार मालिक पोर्टल <span className="text-xs text-amber-400 font-normal hidden sm:inline">(Car Owner Panel)</span>
              </h1>
              <p className="text-xs text-slate-400">
                नमस्ते, <span className="font-bold text-amber-300">{user?.name || 'Car Owner'}</span> {user?.phone ? `• 📞 ${user.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddCar}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ नई गाड़ी जोड़ें</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
              title="लॉगआउट (Logout)"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2 MAIN TABS - Simple Big Buttons */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-2 pb-3 pt-1">
            <button
              onClick={() => setActiveTab('cars')}
              className={`py-3 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition border ${
                activeTab === 'cars'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Car className="w-5 h-5" />
              <span>मेरी गाड़ियाँ (My Cars)</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'cars' ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-white'
                }`}
              >
                {myFleet.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-3 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition border ${
                activeTab === 'bookings'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>मेरी बुकिंग (My Bookings)</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'bookings' ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-white'
                }`}
              >
                {ownerBookings.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-sm font-semibold">गाड़ियाँ और बुकिंग लोड हो रही हैं...</p>
          </div>
        ) : activeTab === 'cars' ? (
          /* ========================================================= */
          /* TAB 1: मेरी गाड़ियाँ (MY CARS)                            */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>🚗 आपकी लिस्ट की गई गाड़ियाँ</span>
                  <span className="text-xs text-slate-400 font-normal">({myFleet.length} Cars Available)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  यहाँ से आप अपनी गाड़ी का किराया, तेल की शर्त, या किसी तारीख को बंद/चालू कर सकते हैं।
                </p>
              </div>
              <button
                onClick={handleOpenAddCar}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ नई गाड़ी जोड़ें</span>
              </button>
            </div>

            {myFleet.length === 0 ? (
              <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                  <Car className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">अभी तक कोई गाड़ी नहीं जोड़ी गई है</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    ग्राहकों से बुकिंग पाने के लिए अपनी गाड़ी का नाम, प्रति किलोमीटर रेट और जगह डालकर लिस्ट करें।
                  </p>
                </div>
                <button
                  onClick={handleOpenAddCar}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:from-amber-400 transition"
                >
                  + पहली गाड़ी जोड़ें (Add Your First Car)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myFleet.map((car) => {
                  const rate = car.pricing?.perKm || car.pricing?.extraKmRate || 20;
                  const blockedCount = car.unavailableDates?.length || 0;
                  const mainImg = car.images?.main || '/brand/ras-logo-primary.svg';

                  return (
                    <div
                      key={car._id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
                    >
                      {/* Car Image + Badges */}
                      <div className="relative h-44 bg-slate-950">
                        <img
                          src={mainImg}
                          alt={car.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/brand/ras-logo-primary.svg';
                          }}
                        />
                        <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-amber-400 border border-slate-800">
                          ₹{rate}/km
                        </div>

                        {/* Fuel Option Badge */}
                        <div className="absolute top-3 right-3">
                          {car.fuelIncluded ? (
                            <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 shadow">
                              <Fuel className="w-3 h-3" /> तेल गाड़ी का (Fuel Included)
                            </span>
                          ) : (
                            <span className="bg-rose-950/90 text-rose-300 border border-rose-800/80 px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 shadow">
                              <Fuel className="w-3 h-3" /> तेल ग्राहक का (Fuel Extra)
                            </span>
                          )}
                        </div>

                        {blockedCount > 0 && (
                          <div className="absolute bottom-3 left-3 bg-rose-600 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black shadow">
                            ⛔ {blockedCount} तारीख बंद है (Unavailable)
                          </div>
                        )}
                      </div>

                      {/* Car Info */}
                      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-black text-white">{car.name}</h3>
                            <span className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg font-semibold">
                              {car.brand || 'Standard'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2">
                            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="font-semibold truncate">
                              {car.location?.address || car.location?.city || 'Deoria'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-medium">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" /> {car.seatingCapacity || 5} सीटें
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Fuel className="w-3.5 h-3.5 text-slate-400" /> {car.fuelType || 'Diesel'}
                            </span>
                          </div>

                          {car.description && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2 bg-slate-950/50 p-2 rounded-xl border border-slate-800/80">
                              {car.description}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-800 space-y-2">
                          <button
                            onClick={() => {
                              setSelectedCarForDates(car);
                              setDateModalOpen(true);
                            }}
                            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>📅 तारीख बंद / खोलें (Manage Dates)</span>
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleOpenEditCar(car)}
                              className="py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-blue-500/30 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>बदलें (Edit)</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCar(car._id, car.name)}
                              className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-rose-500/30 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>हटाएं (Delete)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* TAB 2: मेरी बुकिंग (MY BOOKINGS)                          */
          /* ========================================================= */
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">गाड़ियों की बुकिंग (Bookings)</h2>
                <p className="text-xs text-slate-400">ग्राहकों की सभी बुकिंग और फोन नंबर यहाँ देखें।</p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                {[
                  { id: 'all', label: 'सभी (All)' },
                  { id: 'pending', label: 'नई बुकिंग (New)' },
                  { id: 'confirmed', label: 'कन्फर्म (Confirmed)' },
                  { id: 'in_progress', label: 'चालू राइड (On Going)' },
                  { id: 'completed', label: 'पूरी हुई (Done)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setBookingFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      bookingFilter === f.id
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-base sm:text-lg font-black text-white">कोई बुकिंग नहीं मिली</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  जैसे ही कोई ग्राहक आपकी गाड़ी बुक करेगा, उसकी पूरी जानकारी और मोबाइल नंबर यहाँ दिखेगा।
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((b) => {
                  const customerName = b.customer?.name || b.offlineCustomer?.name || 'Customer';
                  const customerPhone = b.customer?.phone || b.offlineCustomer?.phone || '';
                  const totalAmt = b.pricing?.totalAmount || 0;
                  const advanceAmt = b.pricing?.advanceAmount || 0;
                  const remainingAmt = b.pricing?.remainingAmount || Math.max(0, totalAmt - advanceAmt);

                  const dateFormatted = b.startDate
                    ? new Date(b.startDate).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'तारीख तय नहीं';

                  return (
                    <div
                      key={b._id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 hover:border-slate-700 transition"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg">
                            #{b.bookingId}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {dateFormatted} {b.startTime ? `at ${b.startTime}` : ''}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div>
                          {b.status === 'pending' && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                              ⏳ नई बुकिंग (स्वीकार करें)
                            </span>
                          )}
                          {b.status === 'confirmed' && (
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                              ✅ कन्फर्म है (गाड़ी भेजें)
                            </span>
                          )}
                          {b.status === 'in_progress' && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 animate-pulse">
                              🚗 राइड चल रही है
                            </span>
                          )}
                          {b.status === 'completed' && (
                            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                              🎉 पूरी हो गई (Completed)
                            </span>
                          )}
                          {b.status === 'cancelled' && (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                              ❌ रद्द (Cancelled)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Car Details */}
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            गाड़ी (Booked Car)
                          </span>
                          <div className="flex items-center gap-3">
                            <img
                              src={b.car?.images?.main || '/brand/ras-logo-primary.svg'}
                              alt="Car"
                              className="w-14 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800"
                            />
                            <div>
                              <h4 className="font-black text-sm text-white">{b.car?.name || 'Car'}</h4>
                              <p className="text-xs text-amber-400 font-semibold">₹{b.car?.pricing?.perKm || 20}/km</p>
                              {b.car?.fuelIncluded ? (
                                <span className="text-[10px] text-emerald-400 font-semibold">⛽ तेल गाड़ी का</span>
                              ) : (
                                <span className="text-[10px] text-rose-300 font-semibold">⚠️ तेल ग्राहक का</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Customer Info & Direct Call Button */}
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            ग्राहक की जानकारी (Customer)
                          </span>
                          <div className="space-y-1">
                            <h4 className="font-black text-sm text-white">{customerName}</h4>
                            <p className="text-xs text-slate-300 font-mono">{customerPhone || 'फोन नंबर उपलब्ध नहीं'}</p>
                          </div>
                          {customerPhone && (
                            <a
                              href={`tel:${customerPhone}`}
                              className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition active:scale-95"
                            >
                              <Phone className="w-4 h-4 fill-white" />
                              <span>📞 कॉल करें (Call Customer)</span>
                            </a>
                          )}
                        </div>

                        {/* Route & Distance */}
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            सफ़र का रूट (Route & Distance)
                          </span>
                          <div className="text-xs space-y-1.5">
                            <div className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">🟢 पिकअप:</span>
                              <span className="text-slate-200 line-clamp-1">
                                {b.pickupLocation?.address || 'Pickup Point'}
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-rose-400 font-bold">🔴 ड्रॉप:</span>
                              <span className="text-slate-200 line-clamp-1">
                                {b.destinationAddress || 'Destination Point'}
                              </span>
                            </div>
                            {b.distanceKm && (
                              <div className="text-[11px] font-black text-amber-400 pt-1">
                                📏 कुल दूरी: {b.distanceKm} KM
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment & Fares Bar */}
                      <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                          <div>
                            <span className="text-slate-400 block text-[10px]">कुल किराया (Total Fare):</span>
                            <span className="text-base font-black text-amber-400">₹{totalAmt}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">एडवांस (Advance):</span>
                            <span className="text-sm font-bold text-emerald-400">₹{advanceAmt}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">ग्राहक से बाकी लेना है:</span>
                            <span className="text-sm font-black text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700">
                              ₹{remainingAmt}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">पेमेंट का तरीका:</span>
                          <span className="font-bold text-amber-300">
                            {b.paymentMethod === 'online' ? '📱 ऑनलाइन एडवांस जमा' : '💵 गाड़ी पर नकद (Cash on Delivery)'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons for Bookings */}
                      <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                        {/* When Pending */}
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>स्वीकार करें (Accept Booking)</span>
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                              className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs sm:text-sm rounded-xl border border-rose-500/30 transition"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>मना करें (Reject)</span>
                            </button>
                          </>
                        )}

                        {/* When Confirmed -> Needs OTP to Start */}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => {
                              setSelectedBookingForOtp(b);
                              setOtpInput('');
                              setOtpModalOpen(true);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center gap-2 transition transform active:scale-95"
                          >
                            <Key className="w-4 h-4" />
                            <span>🔑 राइड शुरू करें (ग्राहक का OTP डालें)</span>
                          </button>
                        )}

                        {/* When In Progress -> Can Complete Ride */}
                        {b.status === 'in_progress' && (
                          <button
                            onClick={() => {
                              setSelectedBookingForComplete(b);
                              setCollectionMethod('cash');
                              setCompleteModalOpen(true);
                            }}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center gap-2 transition"
                          >
                            <Check className="w-4 h-4" />
                            <span>🏁 सफ़र पूरा करें (Complete Ride & Take Payment)</span>
                          </button>
                        )}

                        {/* When Completed */}
                        {b.status === 'completed' && (
                          <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-4 py-2 rounded-xl flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /> यह राइड पूरी हो चुकी है
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT CAR (SIMPLE & EASY)                   */}
      {/* ========================================================= */}
      {carModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">
                    {isEditing ? 'गाड़ी की जानकारी बदलें (Edit Car)' : 'नई गाड़ी जोड़ें (Add New Car)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">आसान फॉर्म भरें और अपनी गाड़ी लिस्ट करें</p>
                </div>
              </div>
              <button
                onClick={() => setCarModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCar} className="space-y-4 text-xs font-semibold">
              {/* Car Name */}
              <div>
                <label className="text-slate-300 block mb-1">
                  गाड़ी का नाम (Car Name) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Swift Dzire, WagonR, Scorpio, Innova"
                  value={carForm.name}
                  onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Rate per KM & Location in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rate Per KM */}
                <div>
                  <label className="text-slate-300 block mb-1">
                    किराया प्रति KM (Rate ₹/km) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="10"
                      max="200"
                      value={carForm.perKm}
                      onChange={(e) => setCarForm({ ...carForm, perKm: e.target.value })}
                      placeholder="20"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-amber-400 mt-0.5 block">डिफ़ॉल्ट ₹20 प्रति KM रहेगा</span>
                </div>

                {/* Location */}
                <div>
                  <label className="text-slate-300 block mb-1">
                    गाड़ी कहाँ उपलब्ध है (Location) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Deoria, Gorakhpur, Mahuadih"
                    value={carForm.locationAddress}
                    onChange={(e) => setCarForm({ ...carForm, locationAddress: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">शहर या एरिया का नाम</span>
                </div>
              </div>

              {/* Fuel Included or Fuel Extra Charge Option */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-slate-200 block text-xs font-black">
                  ⛽ तेल की शर्त (Fuel Option):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCarForm({ ...carForm, fuelIncluded: true })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      carForm.fuelIncluded
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>तेल गाड़ी का (Fuel Included)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCarForm({ ...carForm, fuelIncluded: false })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      !carForm.fuelIncluded
                        ? 'bg-amber-600 text-white border-amber-400 shadow'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>तेल ग्राहक का (Fuel Extra)</span>
                  </button>
                </div>
              </div>

              {/* Seats & Fuel Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">बैठने की सीटें (Seats)</label>
                  <select
                    value={carForm.seatingCapacity}
                    onChange={(e) => setCarForm({ ...carForm, seatingCapacity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={4}>4 सीटर</option>
                    <option value={5}>5 सीटर (Standard)</option>
                    <option value={7}>7 सीटर (Scorpio / Ertiga)</option>
                    <option value={8}>8 सीटर (Innova)</option>
                    <option value={12}>12 सीटर (Tempo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">ईंधन का प्रकार (Fuel)</label>
                  <select
                    value={carForm.fuelType}
                    onChange={(e) => setCarForm({ ...carForm, fuelType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Diesel">डीज़ल (Diesel)</option>
                    <option value="Petrol">पेट्रोल (Petrol)</option>
                    <option value="CNG">सीएनजी (CNG)</option>
                    <option value="Electric">इलेक्ट्रिक (EV)</option>
                  </select>
                </div>
              </div>

              {/* Car Photo Upload / Image URL */}
              <div className="space-y-2">
                <label className="text-slate-300 block mb-1">गाड़ी की फोटो (Car Photo)</label>
                <div className="flex items-center gap-3">
                  {carForm.mainImage ? (
                    <img
                      src={carForm.mainImage}
                      alt="Preview"
                      className="w-16 h-14 rounded-xl object-cover bg-slate-800 border border-slate-700"
                    />
                  ) : (
                    <div className="w-16 h-14 rounded-xl bg-slate-800 border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                      <Car className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'अपलोड हो रहा है...' : 'गैलरी से फोटो चुनें (Upload Photo)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="या फोटो का लिंक डालें (Or paste photo URL)"
                      value={carForm.mainImage}
                      onChange={(e) => setCarForm({ ...carForm, mainImage: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="text-slate-300 block mb-1">गाड़ी का विवरण (Description - Optional)</label>
                <textarea
                  rows={2}
                  placeholder="उदा. बढ़िया AC गाड़ी, साफ़ सुथरी सीट, अनुभवी ड्राइवर"
                  value={carForm.description}
                  onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Payment Methods Checkbox */}
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex items-center gap-4 text-xs">
                <span className="text-slate-300 font-bold">पेमेंट विकल्प:</span>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carForm.paymentMethods.includes('cod')}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...carForm.paymentMethods, 'cod']
                        : carForm.paymentMethods.filter((m) => m !== 'cod');
                      setCarForm({ ...carForm, paymentMethods: next });
                    }}
                    className="rounded text-amber-500"
                  />
                  <span>💵 नकद (Cash on Delivery)</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carForm.paymentMethods.includes('online')}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...carForm.paymentMethods, 'online']
                        : carForm.paymentMethods.filter((m) => m !== 'online');
                      setCarForm({ ...carForm, paymentMethods: next });
                    }}
                    className="rounded text-amber-500"
                  />
                  <span>📱 ऑनलाइन (QR Code)</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition transform active:scale-95"
                >
                  {isEditing ? '✓ जानकारी सुरक्षित करें (Save Changes)' : '+ गाड़ी लिस्ट करें (List Car)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CUSTOM DATE BLOCK / UNBLOCK                      */}
      {/* ========================================================= */}
      {dateModalOpen && selectedCarForDates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base">तारीख बंद या खोलें (Date Availability)</h3>
              </div>
              <button
                onClick={() => setDateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              गाड़ी: <strong className="text-amber-400">{selectedCarForDates.name}</strong>
            </p>
            <p className="text-xs text-slate-400">
              अगर किसी तारीख को गाड़ी पहले से कहीं और बुक है या सर्विसिंग में है, तो वह तारीख यहाँ डालकर बंद कर सकते हैं। उस दिन ग्राहक को यह गाड़ी उपलब्ध नहीं दिखेगी।
            </p>

            {/* Block New Date Input */}
            <div className="space-y-2">
              <label className="text-slate-300 block text-xs font-bold">तारीख चुनें जिसे बंद करना है:</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={dateToBlock}
                  onChange={(e) => setDateToBlock(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => handleToggleDate(selectedCarForDates._id, dateToBlock)}
                  disabled={!dateToBlock}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  बंद करें (Block)
                </button>
              </div>
            </div>

            {/* Currently Blocked Dates List */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 block">
                वर्तमान में बंद तारीखें (Currently Blocked Dates):
              </span>
              {(!selectedCarForDates.unavailableDates || selectedCarForDates.unavailableDates.length === 0) ? (
                <p className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50">
                  ✓ कोई तारीख बंद नहीं है। गाड़ी सभी दिनों में उपलब्ध है।
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                  {selectedCarForDates.unavailableDates.map((d) => (
                    <span
                      key={d}
                      className="bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-2"
                    >
                      <span>⛔ {d}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleDate(selectedCarForDates._id, d)}
                        className="text-rose-400 hover:text-white p-0.5 rounded"
                        title="खोलें (Make Available)"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setDateModalOpen(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
            >
              बंद करें (Done)
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: START RIDE OTP VERIFICATION                      */}
      {/* ========================================================= */}
      {otpModalOpen && selectedBookingForOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-white text-center">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <Key className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-lg">राइड शुरू करें (Start Ride)</h3>
              <p className="text-xs text-slate-400">
                गाड़ी ग्राहक के पास पहुँचने पर ग्राहक के मोबाइल पर आया 4 अंकों का OTP यहाँ दर्ज करें।
              </p>
            </div>

            <form onSubmit={handleVerifyOtpAndStartRide} className="space-y-4 pt-2">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • •"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-48 mx-auto text-center font-mono tracking-widest text-2xl font-black bg-slate-950 border-2 border-amber-500 rounded-2xl py-3 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                >
                  वेरीफाई करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: COMPLETE RIDE & PAYMENT CONFIRMATION             */}
      {/* ========================================================= */}
      {completeModalOpen && selectedBookingForComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-black text-lg">राइड पूरी करें (Complete Trip)</h3>
              <p className="text-xs text-slate-400">
                सफ़र समाप्त हो गया है। कृपया ग्राहक से बाकी बची रकम प्राप्त कर लें।
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">बाकी पेमेंट (Balance to Collect):</span>
              <p className="text-2xl font-black text-emerald-400">
                ₹{selectedBookingForComplete.pricing?.remainingAmount || 0}
              </p>
            </div>

            <form onSubmit={handleCompleteRide} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">पेमेंट कैसे मिला?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCollectionMethod('cash')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      collectionMethod === 'cash'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    💵 नकद (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectionMethod('online')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      collectionMethod === 'online'
                        ? 'bg-amber-600 text-white border-amber-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    📱 ऑनलाइन (UPI)
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg"
                >
                  ✓ पूरी करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

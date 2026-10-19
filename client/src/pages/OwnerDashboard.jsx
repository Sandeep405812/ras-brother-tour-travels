import React, { useState, useEffect } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/common/LanguageToggle';
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
  Bell,
  BellOff,
  Volume2,
  HandCoins,
  MessageSquare,
  FileText,
  DollarSign,
  TrendingUp,
  User,
  Power,
  PowerOff,
} from 'lucide-react';
import { uploadSingleFile } from '../utils/imageUpload';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import { normalizeCoordinates } from '../utils/distanceCalculator';

export default function OwnerDashboard({
  onNavigate,
  onLogout,
  initialTab,
  onOpenChat,
  onOpenDirectBooking,
}) {
  const { user, token } = useAuth();
  const { showToast } = useNotification();
  const { lang, t } = useLanguage();

  // Tab state: 'cars' | 'bookings' | 'offers' | 'profile'
  const VALID_OWNER_TABS = ['cars', 'bookings', 'offers', 'profile'];
  const [activeTab, setActiveTab] = useState(
    initialTab === 'add-car' ? 'cars' : (VALID_OWNER_TABS.includes(initialTab) ? initialTab : 'cars')
  );
  const [bookingFilter, setBookingFilter] = useState('all');

  // Car Modal State
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);

  useEffect(() => {
    if (initialTab === 'add-car') {
      setActiveTab('cars');
      setCarModalOpen(true);
    } else if (initialTab && VALID_OWNER_TABS.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    businessName: user?.ownerProfile?.businessName || '',
    phone: user?.phone || '',
    city: user?.city || 'New Delhi',
    address: user?.address || '',
    upiId: user?.ownerProfile?.bankDetails?.upiId || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || '',
        businessName: user.ownerProfile?.businessName || '',
        phone: user.phone || '',
        city: user.city || 'New Delhi',
        address: user.address || '',
        upiId: user.ownerProfile?.bankDetails?.upiId || '',
      }));
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 6) {
        showToast(t('Password must be at least 6 characters', 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'), 'error');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        showToast(t('Passwords do not match', 'दोनों पासवर्ड एक जैसे नहीं हैं'), 'error');
        return;
      }
    }

    setProfileSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileForm.name,
          businessName: profileForm.businessName,
          phone: profileForm.phone,
          city: profileForm.city,
          address: profileForm.address,
          upiId: profileForm.upiId,
          password: profileForm.newPassword ? profileForm.newPassword : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(t('Profile and fleet agency details saved successfully!', 'प्रोफाइल और एजेंसी विवरण सुरक्षित हो गया!'), 'success');
        if (data.user) {
          localStorage.setItem('ras_user', JSON.stringify(data.user));
        }
        setProfileForm((prev) => ({
          ...prev,
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        showToast(data.message || t('Profile update failed', 'प्रोफाइल अपडेट नहीं हो सकी'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // Data states
  const [myFleet, setMyFleet] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [ownerOffers, setOwnerOffers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Offers Counter Modal / State
  const [respondingOfferId, setRespondingOfferId] = useState(null);
  const [counterInputOpenId, setCounterInputOpenId] = useState(null);
  const [counterAmountInput, setCounterAmountInput] = useState('');

  // Uploading state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sound Notification Alert state (for incoming new bookings)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Browser Web Audio API Chime Synthesizer
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.14);
      gain2.gain.setValueAtTime(0.45, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  // Car Form state
  const initialCarForm = {
    name: '',
    brand: 'Standard',
    model: '2024',
    perKm: '',
    locationAddress: '',
    locationCoords: null,
    fuelIncluded: true,
    seatingCapacity: 5,
    fuelType: 'Diesel',
    mainImage: '',
    description: '',
    paymentMethods: ['cod', 'online'],
  };
  const [carForm, setCarForm] = useState(initialCarForm);

  // Fetch Owner's Cars, Bookings, and Price Offers
  const fetchDashboardData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [carsRes, bookingsRes, offersRes] = await Promise.all([
        fetch('/api/cars/my-fleet', { headers }),
        fetch('/api/bookings/owner-bookings', { headers }),
        fetch('/api/offers/owner-offers', { headers }),
      ]);

      const carsData = await carsRes.json();
      const bookingsData = await bookingsRes.json();
      const offersData = await offersRes.json();

      if (carsData.success) {
        setMyFleet(carsData.cars || []);
      }
      if (bookingsData.success) {
        const newBookings = bookingsData.bookings || [];
        if (isBackground && newBookings.length > ownerBookings.length) {
          const hasPending = newBookings.some((b) => b.status === 'pending');
          if (hasPending && soundEnabled) {
            playChime();
            showToast(t('New booking received!', 'नई बुकिंग आई है!'), 'success');
          }
        }
        setOwnerBookings(newBookings);
      }
      if (offersData.success) {
        setOwnerOffers(offersData.offers || []);
      }
    } catch (err) {
      if (!isBackground) showToast(t('Failed to load data', 'डेटा लोड करने में समस्या आई'), 'error');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();

      const interval = setInterval(() => {
        fetchDashboardData(true);
      }, 25000);
      return () => clearInterval(interval);
    }
  }, [token, ownerBookings.length, soundEnabled]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadSingleFile(file, token);
      setCarForm((prev) => ({ ...prev, mainImage: uploadedUrl }));
      showToast(t('Photo uploaded successfully', 'फोटो सफलतापूर्वक अपलोड हो गई!'), 'success');
    } catch (err) {
      showToast(err.message || t('Upload failed', 'फोटो अपलोड नहीं हो पाई'), 'error');
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
      perKm: car.pricing?.perKm ?? car.pricing?.extraKmRate ?? '',
      locationAddress: car.location?.address || car.location?.city || '',
      locationCoords:
        Array.isArray(car.location?.coordinates) && car.location.coordinates.length >= 2
          ? [Number(car.location.coordinates[0]), Number(car.location.coordinates[1])]
          : null,
      fuelIncluded: car.fuelIncluded !== undefined ? car.fuelIncluded : true,
      seatingCapacity: car.seatingCapacity || 5,
      fuelType: car.fuelType || 'Diesel',
      mainImage: car.images?.main || '',
      description: car.description || '',
      paymentMethods: car.paymentMethods?.length ? car.paymentMethods : ['cod', 'online'],
    });
    setCarModalOpen(true);
  };

  // Save Car (Add or Edit) with robust coordinates fallback
  const handleSaveCar = async (e) => {
    e.preventDefault();
    if (!carForm.name.trim()) {
      showToast(t('Please enter car name', 'कृपया गाड़ी का नाम भरें'), 'error');
      return;
    }
    if (!carForm.locationAddress.trim()) {
      showToast(t('Please enter vehicle location or city', 'कृपया गाड़ी की लोकेशन या शहर भरें'), 'error');
      return;
    }

    const perKm = Number(carForm.perKm);
    if (!Number.isFinite(perKm) || perKm <= 0) {
      showToast(t('Please enter a valid per KM rate', 'कृपया सही प्रति KM किराया डालें'), 'error');
      return;
    }

    // Determine coordinates: use autocomplete coordinates if available, otherwise resolve location string cleanly
    let coordinates = Array.isArray(carForm.locationCoords) && carForm.locationCoords.length >= 2
      ? carForm.locationCoords.map(Number)
      : null;

    if (!coordinates || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) {
      const resolved = normalizeCoordinates(carForm.locationAddress);
      if (resolved && Array.isArray(resolved) && resolved.length >= 2) {
        coordinates = [Number(resolved[0]), Number(resolved[1])];
      } else {
        coordinates = [77.2090, 28.6139]; // Safe default New Delhi / NCR
      }
    }

    try {
      const payload = {
        name: carForm.name.trim(),
        brand: carForm.brand.trim() || 'Standard',
        model: carForm.model.trim() || '2024',
        perKm,
        pricing: {
          perKm,
          extraKmRate: perKm,
          perDay: perKm * 100,
          basePrice: perKm,
        },
        lng: coordinates[0],
        lat: coordinates[1],
        location: {
          address: carForm.locationAddress.trim(),
          city: carForm.locationAddress.trim(),
          type: 'Point',
          coordinates,
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
          isEditing
            ? t('Car details updated successfully', 'गाड़ी की जानकारी अपडेट हो गई!')
            : t('New car added successfully to your fleet!', 'नई गाड़ी सफलतापूर्वक जुड़ गई!'),
          'success'
        );
        setCarModalOpen(false);
        fetchDashboardData();
      } else {
        showToast(data.message || t('Save failed', 'गाड़ी सेव नहीं हो सकी'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle Car Availability (Active / Inactive)
  const handleToggleCarAvailability = async (carId, currentVal) => {
    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          !currentVal
            ? t('Car is now ACTIVE & available for bookings', 'गाड़ी अब चालू है और बुकिंग के लिए उपलब्ध है')
            : t('Car is now PAUSED (offline)', 'गाड़ी अब रोक (ऑफलाइन) दी गई है'),
          'success'
        );
        setMyFleet((prev) =>
          prev.map((c) => (c._id === carId ? { ...c, isAvailable: !currentVal } : c))
        );
      } else {
        showToast(data.message || t('Failed to update status', 'स्टेटस अपडेट नहीं हो सका'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Car
  const handleDeleteCar = async (carId, carName) => {
    const confirmMsg = t(
      `Are you sure you want to delete "${carName}"?`,
      `क्या आप सच में "${carName}" को हटाना चाहते हैं?`
    );
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast(t('Car deleted successfully', 'गाड़ी हटा दी गई'), 'success');
        setMyFleet((prev) => prev.filter((c) => c._id !== carId));
      } else {
        showToast(data.message || t('Could not delete car', 'गाड़ी नहीं हट सकी'), 'error');
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
        setMyFleet((prev) =>
          prev.map((c) => (c._id === carId ? { ...c, unavailableDates: data.unavailableDates } : c))
        );
        if (selectedCarForDates && selectedCarForDates._id === carId) {
          setSelectedCarForDates((prev) => ({ ...prev, unavailableDates: data.unavailableDates }));
        }
        setDateToBlock('');
      } else {
        showToast(data.message || t('Failed to update date', 'तारीख अपडेट नहीं हो सकी'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Accept / Reject Booking
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const actionText = newStatus === 'confirmed' ? t('Accept', 'स्वीकार') : t('Reject', 'रद्द');
    const confirmMsg = t(
      `Do you want to ${actionText.toLowerCase()} this booking?`,
      `क्या आप इस बुकिंग को ${actionText} करना चाहते हैं?`
    );
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          cancellationReason: newStatus === 'cancelled' ? 'Declined by owner' : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(t(`Booking ${actionText.toLowerCase()}ed successfully`, `बुकिंग ${actionText} हो गई!`), 'success');
        fetchDashboardData();
      } else {
        showToast(data.message || t('Failed to update status', 'स्टेटस अपडेट नहीं हो सका'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Start Ride with OTP
  const handleVerifyOtpAndStartRide = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      showToast(t('Please enter 4-digit customer OTP', 'कृपया ग्राहक का 4 अंकों का OTP डालें'), 'error');
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
        showToast(t('OTP verified! Ride started.', 'सत्यापन सफल! राइड शुरू हो गई है।'), 'success');
        setOtpModalOpen(false);
        setOtpInput('');
        fetchDashboardData();
      } else {
        showToast(data.message || t('Invalid OTP. Please check with customer.', 'गलत OTP! कृपया ग्राहक से सही OTP पूछें।'), 'error');
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
        showToast(t('Ride completed successfully', 'सफ़र पूरा हो गया!'), 'success');
        setCompleteModalOpen(false);
        fetchDashboardData();
      } else {
        showToast(data.message || t('Could not complete ride', 'राइड पूरी नहीं हो सकी'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Offer Response (Accept, Counter-Offer, Reject)
  const handleRespondOffer = async (offerId, action, customAmount = null) => {
    try {
      setRespondingOfferId(offerId);
      const payload = { action };
      if (action === 'counter') {
        const amt = Number(customAmount);
        if (!Number.isFinite(amt) || amt <= 0) {
          showToast(t('Please enter valid counter amount', 'कृपया सही रेट दर्ज करें'), 'error');
          return;
        }
        payload.counterAmount = amt;
      }

      const res = await fetch(`/api/offers/${offerId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          action === 'accept'
            ? t('Offer accepted! Customer can now pay advance to book.', 'ऑफर स्वीकार कर लिया गया! ग्राहक अब बुकिंग कर सकता है।')
            : action === 'counter'
            ? t('Counter-offer sent to customer!', 'नया रेट ग्राहक को भेज दिया गया!')
            : t('Offer declined.', 'ऑफर अस्वीकार कर दिया गया।'),
          'success'
        );
        setCounterInputOpenId(null);
        setCounterAmountInput('');
        fetchDashboardData(true);
      } else {
        showToast(data.message || t('Failed to update offer', 'ऑफर अपडेट नहीं हो सका'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRespondingOfferId(null);
    }
  };

  // Filter Bookings
  const filteredBookings = ownerBookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  const pendingOffersCount = ownerOffers.filter((o) => o.status === 'pending').length;
  const pendingBookingsCount = ownerBookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white font-heading">
                {t('Car Owner Portal', 'कार मालिक पोर्टल')}
              </h1>
              <p className="text-xs text-slate-400">
                {t('Welcome,', 'नमस्ते,')} <span className="font-bold text-amber-300">{user?.name || 'Owner'}</span> {user?.phone ? `• 📞 ${user.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageToggle variant="dark" />

            {/* Sound Notification Alert Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playChime();
                showToast(next ? t('Sound Alert ON', 'साउंड अलर्ट चालू है') : t('Sound Alert Muted', 'साउंड म्यूट है'), 'info');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                soundEnabled
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={t('Toggle Sound Alert', 'नई बुकिंग पर घंटी बजाएं')}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">{t('Alert ON', 'अलर्ट चालू')}</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">{t('Muted', 'म्यूट')}</span>
                </>
              )}
            </button>

            {/* Offline Direct Walk-in Booking Button */}
            {onOpenDirectBooking && (
              <button
                type="button"
                onClick={() => onOpenDirectBooking(myFleet[0] || null)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
                title={t('Create direct booking for walk-in client', 'दुकान पर आए ग्राहक की सीधी बुकिंग करें')}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">{t('Walk-in Booking', 'सीधी बुकिंग')}</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
              title={t('Logout', 'लॉगआउट')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 MAIN TABS */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-3 pt-1">
            <button
              onClick={() => setActiveTab('cars')}
              className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition border ${
                activeTab === 'cars'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>{t('My Cars', 'मेरी गाड़ियाँ')}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'cars' ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-white'
                }`}
              >
                {myFleet.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition border ${
                activeTab === 'bookings'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('Bookings', 'बुकिंग्स')}</span>
              {pendingBookingsCount > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500 text-white animate-pulse">
                  {pendingBookingsCount}
                </span>
              ) : (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'bookings' ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-white'
                  }`}
                >
                  {ownerBookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition border ${
                activeTab === 'offers'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <HandCoins className="w-4 h-4" />
              <span>{t('Price Offers', 'रेट ऑफर्स')}</span>
              {pendingOffersCount > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500 text-white animate-pulse">
                  {pendingOffersCount}
                </span>
              ) : (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'offers' ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-white'
                  }`}
                >
                  {ownerOffers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition border ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('Agency Profile', 'प्रोफाइल व UPI')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-sm font-semibold">{t('Loading vehicles, bookings & offers...', 'गाड़ियाँ और ऑर्डर्स लोड हो रहे हैं...')}</p>
          </div>
        ) : activeTab === 'cars' ? (
          /* =================================================================== */
          /* TAB 1: CARS FLEET                                                   */
          /* =================================================================== */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>🚗 {t('Your Listed Cars', 'आपकी लिस्ट की गई गाड़ियाँ')}</span>
                  <span className="text-xs text-slate-400 font-normal">({myFleet.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('Manage car rates, fuel options, paused status, and unavailable dates.', 'गाड़ी का किराया, उपलब्धता, और तारीखें प्रबंधित करें।')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {onOpenDirectBooking && (
                  <button
                    onClick={() => onOpenDirectBooking(myFleet[0] || null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <span>📝 {t('Walk-in Client', 'सीधा ग्राहक')}</span>
                  </button>
                )}
                <button
                  onClick={handleOpenAddCar}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('+ Add New Car', '+ नई गाड़ी जोड़ें')}</span>
                </button>
              </div>
            </div>

            {myFleet.length === 0 ? (
              <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                  <Car className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">{t('No cars added yet', 'अभी तक कोई गाड़ी नहीं जोड़ी गई है')}</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {t('Add your car with name, rate per km, and location to start getting bookings instantly.', 'ग्राहकों से बुकिंग पाने के लिए अपनी गाड़ी का नाम, प्रति किलोमीटर रेट और जगह डालकर लिस्ट करें।')}
                  </p>
                </div>
                <button
                  onClick={handleOpenAddCar}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:from-amber-400 transition"
                >
                  {t('+ Add Your First Car', '+ पहली गाड़ी जोड़ें')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myFleet.map((car) => {
                  const rate = Number(car.pricing?.perKm ?? car.pricing?.extraKmRate);
                  const hasRate = Number.isFinite(rate) && rate > 0;
                  const blockedCount = car.unavailableDates?.length || 0;
                  const mainImg = car.images?.main || '/brand/ras-logo-primary.svg';
                  const isLive = car.isAvailable !== false && car.active !== false;

                  return (
                    <div
                      key={car._id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
                    >
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
                          {hasRate ? `₹${rate}/km` : t('Rate not set', 'रेट सेट नहीं')}
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {/* Live / Paused Status Badge */}
                          <button
                            type="button"
                            onClick={() => handleToggleCarAvailability(car._id, isLive)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 shadow transition ${
                              isLive
                                ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900'
                                : 'bg-slate-800/90 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                            title={isLive ? t('Click to Pause Car', 'गाड़ी रोकने के लिए दबाएं') : t('Click to Activate Car', 'गाड़ी चालू करने के लिए दबाएं')}
                          >
                            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                            <span>{isLive ? t('Active', 'चालू') : t('Paused', 'रुका हुआ')}</span>
                          </button>
                        </div>

                        {blockedCount > 0 && (
                          <div className="absolute bottom-3 left-3 bg-rose-600 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black shadow">
                            ⛔ {t(`${blockedCount} Dates Blocked`, `${blockedCount} तारीखें बंद`)}
                          </div>
                        )}
                      </div>

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
                              {car.location?.address || car.location?.city || 'Location not set'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-medium">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" /> {car.seatingCapacity || 5} {t('Seats', 'सीटें')}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Fuel className="w-3.5 h-3.5 text-slate-400" /> {car.fuelType || 'Diesel'}
                            </span>
                            <span>•</span>
                            <span>{car.fuelIncluded ? '⛽ Included' : '⛽ Extra'}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setSelectedCarForDates(car);
                                setDateModalOpen(true);
                              }}
                              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 border border-slate-700 transition"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{t('Dates', 'तारीखें')}</span>
                            </button>

                            {onOpenDirectBooking && (
                              <button
                                onClick={() => onOpenDirectBooking(car)}
                                className="py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1 border border-amber-500/30 transition"
                              >
                                <span>📝 {t('Direct Book', 'सीधा बुक')}</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleOpenEditCar(car)}
                              className="py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-blue-500/30 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>{t('Edit', 'बदलें')}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCar(car._id, car.name)}
                              className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-rose-500/30 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{t('Delete', 'हटाएं')}</span>
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
        ) : activeTab === 'bookings' ? (
          /* =================================================================== */
          /* TAB 2: BOOKINGS                                                     */
          /* =================================================================== */
          <div className="space-y-6">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">{t('Customer Bookings', 'ग्राहकों की बुकिंग')}</h2>
                <p className="text-xs text-slate-400">{t('View customer details, routes, call or chat directly.', 'ग्राहकों की सभी बुकिंग, रूट और संपर्क यहाँ देखें।')}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                {[
                  { id: 'all', label: t('All', 'सभी') },
                  { id: 'pending', label: t('New', 'नई बुकिंग') },
                  { id: 'confirmed', label: t('Confirmed', 'कन्फर्म') },
                  { id: 'in_progress', label: t('Ongoing', 'चालू राइड') },
                  { id: 'completed', label: t('Completed', 'पूरी हुई') },
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
                <h3 className="text-base sm:text-lg font-black text-white">{t('No bookings found', 'कोई बुकिंग नहीं मिली')}</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {t('New bookings from customers will appear here instantly.', 'जैसे ही कोई ग्राहक आपकी गाड़ी बुक करेगा, उसकी पूरी जानकारी यहाँ दिखेगी।')}
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
                    ? new Date(b.startDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : t('Date TBD', 'तारीख तय नहीं');

                  return (
                    <div
                      key={b._id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg">
                            #{b.bookingId}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {dateFormatted} {b.startTime ? `at ${b.startTime}` : ''}
                          </span>
                          {b.offlineCustomer && (
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold">
                              Direct Walk-in
                            </span>
                          )}
                        </div>

                        <div>
                          {b.status === 'pending' && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                              ⏳ {t('New Booking (Pending)', 'नई बुकिंग (स्वीकार करें)')}
                            </span>
                          )}
                          {b.status === 'confirmed' && (
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                              ✅ {t('Confirmed', 'कन्फर्म है')}
                            </span>
                          )}
                          {b.status === 'in_progress' && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 animate-pulse">
                              🚗 {t('Ride in Progress', 'राइड चल रही है')}
                            </span>
                          )}
                          {b.status === 'completed' && (
                            <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                              🎉 {t('Completed', 'पूरी हो गई')}
                            </span>
                          )}
                          {b.status === 'cancelled' && (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                              ❌ {t('Cancelled', 'रद्द')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Car Details */}
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t('Booked Car', 'गाड़ी')}
                          </span>
                          <div className="flex items-center gap-3">
                            <img
                              src={b.car?.images?.main || '/brand/ras-logo-primary.svg'}
                              alt="Car"
                              className="w-14 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800"
                            />
                            <div>
                              <h4 className="font-black text-sm text-white">{b.car?.name || 'Car'}</h4>
                              <p className="text-xs text-amber-400 font-semibold">{Number.isFinite(Number(b.car?.pricing?.perKm)) && Number(b.car?.pricing?.perKm) > 0 ? `₹${Number(b.car.pricing.perKm)}/km` : t('Rate not set', 'रेट सेट नहीं है')}</p>
                              <span className="text-[10px] text-slate-400 block">{b.eventType || 'Event Booking'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Info, Direct Call & Chat Button */}
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t('Customer', 'ग्राहक')}
                          </span>
                          <div className="space-y-0.5">
                            <h4 className="font-black text-sm text-white">{customerName}</h4>
                            <p className="text-xs text-slate-300 font-mono">{customerPhone || t('Phone unavailable', 'फोन नंबर नहीं है')}</p>
                          </div>
                          <div className="flex gap-2 pt-1">
                            {customerPhone && (
                              <a
                                href={`tel:${customerPhone}`}
                                className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow transition"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{t('Call', 'कॉल')}</span>
                              </a>
                            )}
                            {onOpenChat && b.customer && (
                              <button
                                onClick={() => onOpenChat(b.customer, b)}
                                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-slate-700 transition"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{t('Chat', 'चैट')}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Route & Distance */}
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t('Route & Distance', 'सफ़र का रूट')}
                          </span>
                          <div className="text-xs space-y-1.5">
                            <div className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">{t('Pickup:', 'पिकअप:')}</span>
                              <span className="text-slate-200 line-clamp-1">
                                {b.pickupLocation?.address || 'Pickup Point'}
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-rose-400 font-bold">{t('Drop:', 'ड्रॉप:')}</span>
                              <span className="text-slate-200 line-clamp-1">
                                {b.destinationAddress || 'Destination Point'}
                              </span>
                            </div>
                            {b.distanceKm && (
                              <div className="text-[11px] font-black text-amber-400 pt-0.5">
                                📏 {t(`Total Distance: ${b.distanceKm} KM`, `कुल दूरी: ${b.distanceKm} KM`)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                          <div>
                            <span className="text-slate-400 block text-[10px]">{t('Total Fare:', 'कुल किराया:')}</span>
                            <span className="text-base font-black text-amber-400">₹{totalAmt.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">{t('Advance Paid:', 'एडवांस जमा:')}</span>
                            <span className="text-sm font-bold text-emerald-400">₹{advanceAmt.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">{t('Balance to Collect:', 'बाकी रकम:')}</span>
                            <span className="text-sm font-black text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700">
                              ₹{remainingAmt.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(`/api/bookings/${b._id}/invoice`, '_blank')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1 transition"
                            title={t('Download tax invoice PDF', 'बिल डाउनलोड करें')}
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t('Invoice', 'बिल')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>{t('Accept Booking', 'स्वीकार करें')}</span>
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                              className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs sm:text-sm rounded-xl border border-rose-500/30 transition"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{t('Reject', 'मना करें')}</span>
                            </button>
                          </>
                        )}

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
                            <span>🔑 {t('Start Ride (Enter OTP)', 'राइड शुरू करें (OTP डालें)')}</span>
                          </button>
                        )}

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
                            <span>🏁 {t('Complete Ride & Collect Fare', 'सफ़र पूरा करें')}</span>
                          </button>
                        )}

                        {b.status === 'completed' && (
                          <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-4 py-2 rounded-xl flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /> {t('Ride Completed', 'यह राइड पूरी हो चुकी है')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'offers' ? (
          /* =================================================================== */
          /* TAB 3: PRICE OFFERS & NEGOTIATIONS                                  */
          /* =================================================================== */
          <div className="space-y-6">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>💰 {t('Customer Price Offers', 'ग्राहकों के रेट ऑफर्स')}</span>
                  <span className="text-xs text-slate-400 font-normal">({ownerOffers.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('Review customer price requests. Accept at their rate, propose a counter-offer, or decline.', 'ग्राहकों के रेट प्रस्ताव देखें। स्वीकार करें, नया रेट भेजें या मना करें।')}
                </p>
              </div>
            </div>

            {ownerOffers.length === 0 ? (
              <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-3">
                <HandCoins className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-base sm:text-lg font-black text-white">{t('No price offers received yet', 'अभी तक कोई रेट ऑफर नहीं आया है')}</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {t('When customers make customized rate requests for your cars, they will appear here.', 'जब भी कोई ग्राहक आपकी गाड़ी के लिए अपना रेट भेजेगा, वह यहाँ दिखेगा।')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ownerOffers.map((offer) => {
                  const origPrice = Number(offer.originalPrice || 0);
                  const custPrice = Number(offer.customerOffer || 0);
                  const diff = origPrice - custPrice;
                  const isPending = offer.status === 'pending';
                  const isAccepted = offer.status === 'accepted';
                  const isCountered = offer.status === 'countered';
                  const isRejected = offer.status === 'rejected';

                  return (
                    <div
                      key={offer._id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg">
                            #{offer.offerId}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold">
                            {offer.eventType || 'Event Booking'}
                          </span>
                        </div>

                        <div>
                          {isPending && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black">
                              ⏳ {t('Awaiting Your Response', 'जवाब दें')}
                            </span>
                          )}
                          {isAccepted && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black">
                              ✓ {t('Offer Accepted', 'स्वीकार किया')}
                            </span>
                          )}
                          {isCountered && (
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-black">
                              🤝 {t(`Counter Sent: ₹${offer.ownerCounterOffer}`, `नया रेट भेजा: ₹${offer.ownerCounterOffer}`)}
                            </span>
                          )}
                          {isRejected && (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-black">
                              ✕ {t('Offer Declined', 'अस्वीकार')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Car Details */}
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t('Target Vehicle', 'गाड़ी')}
                          </span>
                          <div className="flex items-center gap-3">
                            <img
                              src={offer.car?.images?.main || '/brand/ras-logo-primary.svg'}
                              alt="Car"
                              className="w-14 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800"
                            />
                            <div>
                              <h4 className="font-black text-sm text-white">{offer.car?.name || 'Vehicle'}</h4>
                              <p className="text-xs text-slate-400">{t('Listed Price:', 'लिस्टेड किराया:')} ₹{origPrice}</p>
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t('Customer', 'ग्राहक')}
                          </span>
                          <h4 className="font-black text-sm text-white">{offer.customer?.name || 'Client'}</h4>
                          <p className="text-xs text-slate-300 font-mono">{offer.customer?.phone || ''}</p>
                          <div className="flex gap-2 pt-1">
                            {offer.customer?.phone && (
                              <a
                                href={`tel:${offer.customer.phone}`}
                                className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 transition"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{t('Call', 'कॉल')}</span>
                              </a>
                            )}
                            {onOpenChat && offer.customer && (
                              <button
                                onClick={() => onOpenChat(offer.customer)}
                                className="flex-1 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-slate-700 transition"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{t('Chat', 'चैट')}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Price Proposal Box */}
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {t('Customer Proposed Rate', 'ग्राहक का रेट')}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-400">₹{custPrice.toLocaleString('en-IN')}</span>
                            {origPrice > custPrice && (
                              <span className="text-xs text-rose-400 line-through">₹{origPrice}</span>
                            )}
                          </div>
                          {diff > 0 && (
                            <p className="text-[11px] text-amber-300">
                              {t(`Discount Requested: ₹${diff}`, `छूट मांगी: ₹${diff}`)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Pickup Location & Date */}
                      <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-slate-400">{t('Pickup Location:', 'पिकअप:')} </span>
                          <span className="font-semibold text-white">{offer.pickupLocation || 'Local pickup'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">{t('Date:', 'तारीख:')} </span>
                          <span className="font-semibold text-white">
                            {new Date(offer.startDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US')}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons & Counter Input */}
                      {isPending && (
                        <div className="pt-2 space-y-3">
                          {counterInputOpenId === offer._id ? (
                            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/40 space-y-2">
                              <label className="text-xs font-bold text-amber-300 block">
                                {t('Enter your Counter-Offer Amount (₹):', 'अपना नया रेट दर्ज करें (₹):')}
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  min="100"
                                  placeholder={t('e.g. 3500', 'उदा. 3500')}
                                  value={counterAmountInput}
                                  onChange={(e) => setCounterAmountInput(e.target.value)}
                                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold outline-none focus:border-amber-500"
                                />
                                <button
                                  type="button"
                                  disabled={respondingOfferId === offer._id}
                                  onClick={() => handleRespondOffer(offer._id, 'counter', counterAmountInput)}
                                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition"
                                >
                                  {t('Send Rate', 'भेजें')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCounterInputOpenId(null);
                                    setCounterAmountInput('');
                                  }}
                                  className="px-3 py-2 bg-slate-800 text-slate-400 text-xs rounded-xl hover:text-white"
                                >
                                  {t('Cancel', 'रद्द')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-end gap-2.5">
                              <button
                                onClick={() => handleRespondOffer(offer._id, 'accept')}
                                disabled={respondingOfferId === offer._id}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>{t('Accept Offer (₹' + custPrice + ')', 'स्वीकार करें (₹' + custPrice + ')')}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setCounterInputOpenId(offer._id);
                                  setCounterAmountInput(String(Math.round((origPrice + custPrice) / 2)));
                                }}
                                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition"
                              >
                                <HandCoins className="w-4 h-4" />
                                <span>{t('Counter Offer', 'नया रेट बताएं')}</span>
                              </button>

                              <button
                                onClick={() => handleRespondOffer(offer._id, 'reject')}
                                disabled={respondingOfferId === offer._id}
                                className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs sm:text-sm rounded-xl border border-rose-500/30 transition"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>{t('Decline', 'मना करें')}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'profile' ? (
          /* =================================================================== */
          /* TAB 4: OWNER PROFILE & SETTINGS                                     */
          /* =================================================================== */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 max-w-3xl mx-auto text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black font-heading text-white">
                  {t('Fleet Partner Profile & Agency Info', 'कार मालिक / वेंडर प्रोफाइल')}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('Manage your agency name, contact hotline, operating base, and UPI payout ID.', 'अपनी ट्रेवल्स एजेंसी, फ़ोन और UPI भुगतान विवरण प्रबंधित करें।')}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold">
                🚗 Fleet Partner
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5">{t('Owner Full Name *', 'मालिक का नाम *')}</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-bold focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5">{t('Travels or Agency Business Name *', 'ट्रेवल्स या एजेंसी का नाम *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Heritage Travels"
                    value={profileForm.businessName}
                    onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-bold focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5">{t('Phone Number *', 'मोबाइल नंबर *')}</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-bold focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5">{t('Operating City / Hub *', 'शहर / बेस *')}</label>
                  <input
                    type="text"
                    required
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-bold focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* UPI ID Field for Advance Payouts */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-amber-300 text-xs font-black">
                  💳 {t('Your UPI ID for Advance Payments & Payouts', 'एडवांस भुगतान पाने के लिए अपनी UPI ID डालें')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9918272164@okaxis or travels@upi"
                  value={profileForm.upiId}
                  onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold focus:border-amber-500 outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  {t('Customer advance reservations and settlements will be directed to this UPI ID.', 'ग्राहकों के एडवांस बुकिंग की राशि इसी UPI ID पर सेटल की जाएगी।')}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5">{t('Office / Garage Address', 'गैराज / कार्यालय का पता')}</label>
                <textarea
                  rows="2"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="e.g. Shop 14, Main Transport Market, Sector 18"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">{t('Account Security & Password', 'पासवर्ड व सुरक्षा')}</h3>
                  <span className="text-[11px] text-slate-400">{t('Leave blank to keep current password', 'पासवर्ड न बदलना हो तो खाली छोड़ें')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1.5">{t('New Password', 'नया पासवर्ड')}</label>
                    <input
                      type={showProfilePassword ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5">{t('Confirm New Password', 'नया पासवर्ड दोहराएँ')}</label>
                    <input
                      type={showProfilePassword ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Repeat new password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showOwnerPass"
                    checked={showProfilePassword}
                    onChange={(e) => setShowProfilePassword(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="showOwnerPass" className="text-xs text-slate-400 cursor-pointer">
                    {t('Show Password', 'पासवर्ड दिखाएं')}
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {profileSaving ? (
                    <span>{t('Saving Changes...', 'सेव हो रहा है...')}</span>
                  ) : (
                    <>
                      <span>{t('Save Agency Details', 'विवरण सेव करें')}</span>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </main>

      {/* MODAL 1: ADD / EDIT CAR */}
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
                    {isEditing ? t('Edit Car Details', 'गाड़ी की जानकारी बदलें') : t('Add New Car to Fleet', 'नई गाड़ी जोड़ें')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('Fill vehicle details and list on marketplace', 'फ़ॉर्म भरें और अपनी गाड़ी लिस्ट करें')}
                  </p>
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
              <div>
                <label className="text-slate-300 block mb-1">
                  {t('Car Name', 'गाड़ी का नाम')} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('e.g. Swift Dzire, Innova Crysta, Scorpio, Fortuner', 'उदा. Swift Dzire, Innova Crysta, Scorpio')}
                  value={carForm.name}
                  onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">
                    {t('Rate per KM (₹)', 'किराया प्रति KM (₹)')} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="10"
                      max="300"
                      value={carForm.perKm}
                      onChange={(e) => setCarForm({ ...carForm, perKm: e.target.value })}
                      placeholder="20"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">
                    {t('Vehicle Location / City', 'गाड़ी की लोकेशन / शहर')} <span className="text-rose-400">*</span>
                  </label>
                  <LocationAutocomplete
                    value={carForm.locationAddress}
                    allowGps={true}
                    label=""
                    placeholder={t('Search city, locality or type name', 'शहर, इलाका या पता डालें')}
                    iconColor="text-amber-400"
                    inputClassName="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    onChange={(value) =>
                      setCarForm((prev) => ({
                        ...prev,
                        locationAddress: value,
                      }))
                    }
                    onSelectCoords={(coords) => {
                      if (Array.isArray(coords) && coords.length >= 2) {
                        setCarForm((prev) => ({
                          ...prev,
                          locationCoords: [Number(coords[1]), Number(coords[0])], // [lng, lat]
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                <label className="text-slate-200 block text-xs font-black">
                  ⛽ {t('Fuel Option:', 'तेल की शर्त:')}
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
                    <span>{t('Fuel Included', 'तेल शामिल है')}</span>
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
                    <span>{t('Fuel Extra', 'तेल अलग से')}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">{t('Seating Capacity', 'सीटें')}</label>
                  <select
                    value={carForm.seatingCapacity}
                    onChange={(e) => setCarForm({ ...carForm, seatingCapacity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value={4}>4 {t('Seats', 'सीटें')}</option>
                    <option value={5}>5 {t('Seats', 'सीटें')}</option>
                    <option value={7}>7 {t('Seats', 'सीटें')}</option>
                    <option value={8}>8 {t('Seats', 'सीटें')}</option>
                    <option value={12}>12 {t('Seats', 'सीटें')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">{t('Fuel Type', 'ईंधन')}</label>
                  <select
                    value={carForm.fuelType}
                    onChange={(e) => setCarForm({ ...carForm, fuelType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="Diesel">{t('Diesel', 'डीज़ल')}</option>
                    <option value="Petrol">{t('Petrol', 'पेट्रोल')}</option>
                    <option value="CNG">{t('CNG', 'सीएनजी')}</option>
                    <option value="Electric">{t('Electric', 'इलेक्ट्रिक')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block mb-1">{t('Car Photo', 'गाड़ी की फोटो')}</label>
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
                      <span>{uploadingImage ? t('Uploading...', 'अपलोड हो रहा है...') : t('Upload Photo', 'फोटो अपलोड करें')}</span>
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
                      placeholder={t('Or paste image link', 'या फोटो का लिंक डालें')}
                      value={carForm.mainImage}
                      onChange={(e) => setCarForm({ ...carForm, mainImage: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">{t('Description (Optional)', 'विवरण (वैकल्पिक)')}</label>
                <textarea
                  rows={2}
                  placeholder={t('e.g. Clean AC car, well-maintained with verified driver', 'उदा. साफ़ AC गाड़ी, बढ़िया स्थिति')}
                  value={carForm.description}
                  onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition transform active:scale-95 cursor-pointer"
                >
                  {isEditing ? t('Save Changes', 'सुरक्षित करें') : t('+ List Car', '+ गाड़ी लिस्ट करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOM DATES */}
      {dateModalOpen && selectedCarForDates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base">{t('Date Availability', 'तारीख बंद या खोलें')}</h3>
              </div>
              <button
                onClick={() => setDateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {t('Vehicle:', 'गाड़ी:')} <strong className="text-amber-400">{selectedCarForDates.name}</strong>
            </p>
            <p className="text-xs text-slate-400">
              {t('Block specific dates when your car is unavailable or in repair.', 'अगर किसी तारीख को गाड़ी पहले से कहीं और बुक है, तो वह तारीख यहाँ बंद कर सकते हैं।')}
            </p>

            <div className="space-y-2">
              <label className="text-slate-300 block text-xs font-bold">{t('Select date to block:', 'तारीख चुनें:')}</label>
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  {t('Block', 'बंद करें')}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 block">
                {t('Currently Blocked Dates:', 'बंद तारीखें:')}
              </span>
              {(!selectedCarForDates.unavailableDates || selectedCarForDates.unavailableDates.length === 0) ? (
                <p className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/50">
                  {t('✓ No dates blocked. Vehicle is available on all days.', '✓ कोई तारीख बंद नहीं है। गाड़ी सभी दिनों में उपलब्ध है।')}
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
                        className="text-rose-400 hover:text-white p-0.5 rounded cursor-pointer"
                        title={t('Unblock', 'खोलें')}
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
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {t('Close', 'बंद करें')}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: START RIDE OTP */}
      {otpModalOpen && selectedBookingForOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-white text-center">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <Key className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-lg">{t('Start Ride', 'राइड शुरू करें')}</h3>
              <p className="text-xs text-slate-400">
                {t('Enter 4-digit OTP provided by customer to begin trip.', 'ग्राहक के फोन पर आया 4 अंकों का OTP यहाँ दर्ज करें।')}
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
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  {t('Verify OTP', 'वेरीफाई करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: COMPLETE RIDE */}
      {completeModalOpen && selectedBookingForComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-black text-lg">{t('Complete Ride', 'सफ़र पूरा करें')}</h3>
              <p className="text-xs text-slate-400">
                {t('Collect remaining balance payment from customer.', 'कृपया ग्राहक से बाकी बची रकम प्राप्त कर लें।')}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">{t('Balance to Collect:', 'बाकी रकम:')}</span>
              <p className="text-2xl font-black text-emerald-400">
                ₹{selectedBookingForComplete.pricing?.remainingAmount || 0}
              </p>
            </div>

            <form onSubmit={handleCompleteRide} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-bold">{t('Payment Method Received', 'पेमेंट का तरीका')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCollectionMethod('cash')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      collectionMethod === 'cash'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    💵 {t('Cash', 'नकद')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectionMethod('online')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      collectionMethod === 'online'
                        ? 'bg-amber-600 text-white border-amber-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    📱 {t('UPI / Online', 'ऑनलाइन')}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 cursor-pointer"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  ✓ {t('Complete', 'पूरी करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

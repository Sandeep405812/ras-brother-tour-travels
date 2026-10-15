import React, { useState, useEffect } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Car,
  Calendar,
  CreditCard,
  HandCoins,
  Plus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MessageSquare,
  Upload,
  Edit,
  Trash2,
  MapPin,
  Tag,
  DollarSign,
  UserCheck,
  FileText,
  Image as ImageIcon,
  Check,
  LogOut,
  X,
  Key,
  Phone,
  Shield,
  Wallet,
  Sparkles,
  Share2,
  Send,
  QrCode,
  AlertCircle,
  ArrowDownToLine,
  Eye,
} from 'lucide-react';
import { uploadSingleFile } from '../utils/imageUpload';

export default function OwnerDashboard({ onOpenChat, onOpenDirectBooking, onNavigate, onLogout }) {
  const { user, token } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'fleet' | 'bookings' | 'offers' | 'wallet' | 'kyc' | 'add-car'
  const [stats, setStats] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [myFleet, setMyFleet] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [ownerOffers, setOwnerOffers] = useState([]);
  const [kycInfo, setKycInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Counter offer modal state
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [counterAmount, setCounterAmount] = useState(0);

  // Edit Car Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  // OTP Start Ride Modal state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedBookingForOtp, setSelectedBookingForOtp] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  // Complete Trip Modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedBookingForComplete, setSelectedBookingForComplete] = useState(null);
  const [completeMethod, setCompleteMethod] = useState('cash'); // 'cash' | 'upi'
  const [collectedAmount, setCollectedAmount] = useState(0);

  // Assign Chauffeur Modal state
  const [chauffeurModalOpen, setChauffeurModalOpen] = useState(false);
  const [selectedBookingForChauffeur, setSelectedBookingForChauffeur] = useState(null);
  const [chauffeurForm, setChauffeurForm] = useState({ name: '', phone: '', vehiclePlate: '' });

  // Payment Receipt Verification Modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Payout Modal state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    method: 'UPI',
    upiId: '',
    accountNo: '',
    ifsc: '',
    bankName: '',
    holderName: '',
  });

  // Upload progress indicators
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingInterior, setUploadingInterior] = useState(false);

  // Add Car Form state
  const [carForm, setCarForm] = useState({
    name: '',
    brand: '',
    model: '',
    variant: '',
    year: 2024,
    color: 'Obsidian Black',
    seatingCapacity: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    isAC: true,
    category: 'Wedding Special',
    description: '',
    mainImage: '',
    interiorImage: '',
    basePrice: 5000,
    perHour: 800,
    perDay: 5000,
    extraKmRate: 20,
    driverCharges: 600,
    nightCharges: 400,
    decorationCharges: 1500,
    advanceType: 'percentage',
    advanceValue: 20,
    address: 'Noida Sector 18',
    city: 'Noida',
    serviceRadiusKm: 50,
    weddingSpecial: true,
  });

  // KYC Form state
  const [kycForm, setKycForm] = useState({
    idType: 'Aadhaar Card',
    idNumber: '',
    documentFront: '',
    documentBack: '',
    drivingLicense: '',
    vehicleRegistrationRc: '',
  });

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      // 1. Dashboard metrics (filtered to current owner)
      const dashRes = await fetch('/api/owners/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dashData = await dashRes.json();
      if (dashData.success) {
        setStats(dashData.stats);
        setKycInfo(dashData.kyc);
        if (dashData.profile) setOwnerProfile(dashData.profile);
      }

      // 2. My Fleet (filtered to current owner's cars)
      const fleetRes = await fetch('/api/cars/my-fleet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fleetData = await fleetRes.json();
      if (fleetData.success) setMyFleet(fleetData.cars || []);

      // 3. Bookings (filtered to current owner)
      const bkRes = await fetch('/api/bookings/owner-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bkData = await bkRes.json();
      if (bkData.success) setOwnerBookings(bkData.bookings || []);

      // 4. Offers (filtered to current owner)
      const offRes = await fetch('/api/offers/owner-offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const offData = await offRes.json();
      if (offData.success) setOwnerOffers(offData.offers || []);
    } catch (err) {
      console.error('Owner dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOwnerData();
  }, [token]);

  // Handle Verify OTP & Start Ride
  const handleVerifyStartOtp = async (e) => {
    e.preventDefault();
    if (!selectedBookingForOtp || !otpInput) return;
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
        showToast('OTP verified! Trip is now officially IN PROGRESS.', 'success');
        setOtpModalOpen(false);
        setOtpInput('');
        fetchOwnerData();
      } else {
        showToast(data.message || 'Invalid OTP', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Complete Ride & Collect Balance
  const handleCompleteRide = async (e) => {
    e.preventDefault();
    if (!selectedBookingForComplete) return;
    try {
      const res = await fetch(`/api/bookings/${selectedBookingForComplete._id}/complete-ride`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          remainingCollected: Number(collectedAmount),
          paymentMethod: completeMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Trip marked COMPLETED and balance collected. Earnings credited to your wallet!', 'success');
        setCompleteModalOpen(false);
        fetchOwnerData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Assign Chauffeur
  const handleAssignChauffeur = async (e) => {
    e.preventDefault();
    if (!selectedBookingForChauffeur) return;
    try {
      const res = await fetch(`/api/bookings/${selectedBookingForChauffeur._id}/chauffeur`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(chauffeurForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Chauffeur & vehicle details assigned and synced with customer pass!', 'success');
        setChauffeurModalOpen(false);
        fetchOwnerData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Request Payout
  const handleRequestPayout = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/owners/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(payoutForm.amount),
          method: payoutForm.method,
          upiId: payoutForm.upiId,
          bankDetails: {
            accountNumber: payoutForm.accountNo,
            ifsc: payoutForm.ifsc,
            bankName: payoutForm.bankName,
            accountHolderName: payoutForm.holderName,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setPayoutModalOpen(false);
        fetchOwnerData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle direct file upload for car photos
  const handleFileUpload = async (e, fieldName, targetFormSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fieldName === 'mainImage') setUploadingMain(true);
    else setUploadingInterior(true);

    try {
      const result = await uploadSingleFile(file, token);
      if (result && result.url) {
        targetFormSetter((prev) => ({
          ...prev,
          [fieldName]: result.url,
        }));
        showToast('Photo uploaded successfully from device!', 'success');
      } else {
        showToast('Photo upload could not be completed. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Upload error: ' + (err.message || 'File upload failed'), 'error');
    } finally {
      if (fieldName === 'mainImage') setUploadingMain(false);
      else setUploadingInterior(false);
    }
  };

  // Booking Status (Accept / Reject / Complete)
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Booking marked as ${status}`, 'success');
        fetchOwnerData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Payment Verification & Order Confirmation
  const handleVerifyPayment = async (bookingId, action = 'verify') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/verify-payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'verify') {
          showToast('Payment verified & booking confirmed! Start Ride OTP sent to customer.', 'success');
        } else {
          showToast('Payment marked as mismatch / rejected.', 'error');
        }
        setReceiptModalOpen(false);
        fetchOwnerData();
      } else {
        showToast(data.message || 'Verification failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating payment status', 'error');
    }
  };

  // Offer Response (Accept / Counter / Reject)
  const handleRespondOffer = async (offerId, action, customCounter) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          counterAmount: customCounter,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Offer ${action}ed successfully`, 'success');
        setCounterModalOpen(false);
        fetchOwnerData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Car Submission
  const handleAddCarSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: carForm.name,
          brand: carForm.brand,
          model: carForm.model,
          variant: carForm.variant,
          year: Number(carForm.year),
          color: carForm.color,
          seatingCapacity: Number(carForm.seatingCapacity),
          fuelType: carForm.fuelType,
          transmission: carForm.transmission,
          isAC: carForm.isAC,
          category: carForm.category,
          description: carForm.description,
          images: {
            main: carForm.mainImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
            interior: carForm.interiorImage || '',
          },
          pricing: {
            basePrice: Number(carForm.basePrice),
            perHour: Number(carForm.perHour),
            perDay: Number(carForm.perDay),
            extraKmRate: Number(carForm.extraKmRate),
            driverCharges: Number(carForm.driverCharges),
            nightCharges: Number(carForm.nightCharges),
            decorationCharges: Number(carForm.decorationCharges),
          },
          advancePayment: {
            type: carForm.advanceType,
            value: Number(carForm.advanceValue),
          },
          weddingSpecial: carForm.weddingSpecial,
          address: carForm.address,
          city: carForm.city || 'Delhi NCR',
          serviceRadiusKm: Number(carForm.serviceRadiusKm || 50),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Vehicle listed successfully on RAS Brother Tour & Travels!', 'success');
        setActiveTab('fleet');
        fetchOwnerData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Open Edit Car Modal
  const handleOpenEditCar = (car) => {
    setEditingCar({
      _id: car._id,
      name: car.name,
      brand: car.brand,
      model: car.model,
      variant: car.variant || '',
      year: car.year,
      color: car.color,
      seatingCapacity: car.seatingCapacity,
      fuelType: car.fuelType,
      transmission: car.transmission,
      isAC: car.isAC,
      category: car.category,
      description: car.description,
      mainImage: car.images?.main || '',
      interiorImage: car.images?.interior || '',
      perDay: car.pricing?.perDay || car.pricing?.basePrice,
      driverCharges: car.pricing?.driverCharges || 500,
      decorationCharges: car.pricing?.decorationCharges || 1500,
      extraKmRate: car.pricing?.extraKmRate || 20,
      advanceType: car.advancePayment?.type || 'percentage',
      advanceValue: car.advancePayment?.value || 20,
      address: car.location?.address || 'Noida Sector 18',
      city: car.location?.city || 'Delhi NCR',
      serviceRadiusKm: car.serviceRadiusKm || 50,
      isAvailable: car.isAvailable !== false,
      weddingSpecial: car.weddingSpecial || false,
    });
    setEditModalOpen(true);
  };

  // Submit Edit Car
  const handleSaveEditCar = async (e) => {
    e.preventDefault();
    if (!editingCar) return;

    try {
      const res = await fetch(`/api/cars/${editingCar._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingCar.name,
          brand: editingCar.brand,
          model: editingCar.model,
          variant: editingCar.variant,
          year: Number(editingCar.year),
          color: editingCar.color,
          seatingCapacity: Number(editingCar.seatingCapacity),
          fuelType: editingCar.fuelType,
          transmission: editingCar.transmission,
          isAC: editingCar.isAC,
          category: editingCar.category,
          description: editingCar.description,
          images: {
            main: editingCar.mainImage,
            interior: editingCar.interiorImage,
          },
          pricing: {
            basePrice: Number(editingCar.perDay),
            perDay: Number(editingCar.perDay),
            extraKmRate: Number(editingCar.extraKmRate),
            driverCharges: Number(editingCar.driverCharges),
            decorationCharges: Number(editingCar.decorationCharges),
          },
          advancePayment: {
            type: editingCar.advanceType,
            value: Number(editingCar.advanceValue),
          },
          address: editingCar.address,
          city: editingCar.city,
          serviceRadiusKm: Number(editingCar.serviceRadiusKm || 50),
          isAvailable: editingCar.isAvailable,
          weddingSpecial: editingCar.weddingSpecial,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Vehicle details updated successfully!', 'success');
        setEditModalOpen(false);
        fetchOwnerData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // KYC Submit
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/owners/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(kycForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('KYC documents submitted for admin verification!', 'success');
        fetchOwnerData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Fleet Owner Portal Top Bar (clean replacement for global navbar) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <RasLogo variant="light" size="sm" showTagline={false} />
            <div className="h-5 w-px bg-slate-200" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Fleet Owner Console
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('cars')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
              >
                <Car className="w-3.5 h-3.5" /> View Marketplace Fleet
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Top Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0">
              {user?.name?.charAt(0) || 'V'}
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                Fleet Owner Console
                {kycInfo?.status === 'verified' && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px]">
                    KYC Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black font-heading">{user?.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Managing {myFleet.length} vehicles • {ownerBookings.length} bookings received
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none w-full md:w-auto">
            {[
              { id: 'overview', label: 'My Overview' },
              { id: 'fleet', label: `My Fleet (${myFleet.length})` },
              { id: 'bookings', label: `Bookings (${ownerBookings.length})` },
              { id: 'wallet', label: 'Wallet & Payouts' },
              { id: 'offers', label: `Negotiations (${ownerOffers.length})` },
              { id: 'kyc', label: 'KYC Document' },
              { id: 'add-car', label: '+ List Car', highlight: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 whitespace-nowrap ${
                  tab.highlight
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                    : activeTab === tab.id
                    ? 'bg-white text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Overview (Only owner's data) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">My Total Earnings</div>
                <div className="text-2xl font-black text-emerald-600 font-heading mt-1">
                  ₹{stats?.totalEarnings?.toLocaleString('en-IN') || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">From your completed car trips</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">Confirmed Bookings</div>
                <div className="text-2xl font-black text-slate-900 font-heading mt-1">
                  {stats?.confirmedBookings || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Reserved on your fleet</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">Pending Requests</div>
                <div className="text-2xl font-black text-amber-600 font-heading mt-1">
                  {stats?.pendingBookings || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Awaiting your approval</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">Fleet Rating</div>
                <div className="text-2xl font-black text-amber-500 font-heading mt-1 flex items-center gap-1">
                  ★ {stats?.rating || '4.9'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">From {stats?.totalReviews || 0} reviews</div>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 font-heading">
                  Recent Booking Requests for Your Cars
                </h2>
                <button
                  onClick={() => setActiveTab('fleet')}
                  className="text-xs text-amber-600 font-bold hover:underline"
                >
                  View All Fleet
                </button>
              </div>

              {ownerBookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No bookings received yet. Your listings are live on the marketplace.
                </div>
              ) : (
                ownerBookings.slice(0, 5).map((b) => (
                  <div
                    key={b._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={b.car?.images?.main}
                        alt={b.car?.name}
                        className="w-16 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">
                          {b.car?.brand} {b.car?.name}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          Client: {b.offlineCustomer?.name || b.customer?.name} ({b.offlineCustomer?.phone || b.customer?.phone}) • Event: {b.eventType}
                        </div>
                        <div className="text-slate-600 font-semibold mt-0.5">
                          {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()} • ₹{b.pricing?.totalAmount?.toLocaleString('en-IN')} Total
                        </div>
                        {b.distanceKm > 0 && (
                          <div className="text-amber-700 font-bold text-[11px]">
                            Route Distance: {b.distanceKm} KM ({b.pickupLocation?.address} → {b.destinationAddress})
                          </div>
                        )}
                        {(b.paymentScreenshot || b.utrNumber || b.paymentVerificationStatus === 'pending_verification') && (
                          <div className="mt-1 flex items-center gap-2 text-[11px]">
                            <span className={`font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              b.paymentVerificationStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.paymentVerificationStatus === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}>
                              <QrCode className="w-3 h-3" /> UTR: {b.utrNumber || 'Uploaded'}
                            </span>
                            {b.paymentScreenshot && (
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingReceipt({ screenshot: b.paymentScreenshot, utr: b.utrNumber, booking: b });
                                  setReceiptModalOpen(true);
                                }}
                                className="text-amber-700 font-extrabold hover:underline flex items-center gap-0.5"
                              >
                                <Eye className="w-3 h-3" /> View Receipt
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {(b.status === 'pending' || b.paymentVerificationStatus === 'pending_verification') && (
                        <>
                          <button
                            onClick={() => handleVerifyPayment(b._id, 'verify')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Match &amp; Confirm
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(b._id, 'reject')}
                            className="px-3.5 py-1.5 rounded-xl bg-red-100 text-red-800 font-bold hover:bg-red-200"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                        >
                          Mark Completed
                        </button>
                      )}
                      <span className="capitalize font-mono font-bold px-2 py-1 bg-slate-200 rounded-lg">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: My Fleet (With EDIT & DIRECT BOOKING options) */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-heading">
                  Your Cars ({myFleet.length})
                </h2>
                <p className="text-xs text-slate-500">Edit specs, rates, photos, or book directly for offline clients.</p>
              </div>
              <button
                onClick={() => setActiveTab('add-car')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Another Car
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myFleet.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 mb-3">
                      <img
                        src={c.images?.main}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-slate-950/80 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                        {c.category}
                      </span>
                      <span className={`absolute top-2 right-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        c.isAvailable ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
                      }`}>
                        {c.isAvailable ? 'Available' : 'Booked / Off'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900">{c.brand} {c.name}</h4>
                    <p className="text-xs text-slate-500">{c.year} • {c.fuelType} • {c.transmission} • {c.seatingCapacity} Seats</p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs flex justify-between font-bold text-slate-800">
                      <span>Daily: ₹{c.pricing?.perDay?.toLocaleString('en-IN')}</span>
                      <span className="text-emerald-700">Advance: {c.advancePayment?.value}{c.advancePayment?.type === 'percentage' ? '%' : ' INR'}</span>
                    </div>
                  </div>

                  {/* Actions: Edit Car & Direct Book */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditCar(c)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1.5 transition"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Details
                    </button>

                    {onOpenDirectBooking && (
                      <button
                        onClick={() => onOpenDirectBooking(c)}
                        className="flex-1 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-1.5 transition shadow-sm"
                        title="Book directly for walk-in/offline customer"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Book Offline
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Fleet Bookings & Ride Management */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-heading">
                  Manage Fleet Bookings &amp; Security Trips ({ownerBookings.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Verify Start Ride OTPs, assign chauffeurs, track routes, and collect remaining balances.
                </p>
              </div>
            </div>

            {ownerBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No bookings received yet</h3>
                <p className="text-xs text-slate-500 mt-1">Bookings for your cars will appear here with OTP verification.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {ownerBookings.map((b) => {
                  const customerName = b.offlineCustomer?.name || b.customer?.name || 'Valued Guest';
                  const customerPhone = b.offlineCustomer?.phone || b.customer?.phone || '';
                  const total = b.pricing?.totalAmount || 0;
                  const advance = b.pricing?.advanceAmount || 0;
                  const remaining = b.pricing?.remainingAmount || 0;

                  return (
                    <div
                      key={b._id}
                      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              #{b.bookingId}
                            </span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {b.eventType}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'in_progress'
                                ? 'bg-purple-100 text-purple-800 animate-pulse'
                                : b.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : b.status === 'cancelled' || b.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.status === 'in_progress' ? 'Trip In Progress' : b.status}
                          </span>
                        </div>

                        {/* Car Details */}
                        <div className="flex items-center gap-4">
                          <img
                            src={b.car?.images?.main}
                            alt={b.car?.name}
                            className="w-20 h-16 rounded-2xl object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-base text-slate-900 truncate">
                              {b.car?.brand} {b.car?.name}
                            </h4>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                              Reporting: <span className="font-bold text-slate-900">{b.startTime || '10:00 AM'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Information & WhatsApp */}
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Client Information
                            </span>
                            <span className="font-extrabold text-slate-900">{customerName}</span>
                            {customerPhone && (
                              <span className="text-slate-600 ml-1.5">({customerPhone})</span>
                            )}
                          </div>
                          {customerPhone && (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${customerPhone}`}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                                title="Call Customer"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              </a>
                              <a
                                href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(customerName)},%20regarding%20your%20booking%20#${b.bookingId}%20with%20RAS%20Brother%20Tour%20%26%20Travels.`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 transition"
                              >
                                <Share2 className="w-3 h-3" /> WhatsApp
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Route Details */}
                        <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate"><strong className="text-slate-800">Pickup:</strong> {b.pickupLocation?.address}</span>
                          </div>
                          {b.destinationAddress && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="truncate"><strong className="text-slate-800">Destination:</strong> {b.destinationAddress}</span>
                            </div>
                          )}
                          {b.distanceKm > 0 && (
                            <div className="text-[11px] font-bold text-amber-700 pt-1 border-t border-slate-200">
                              Estimated Road Distance: {b.distanceKm} KM
                            </div>
                          )}
                        </div>

                        {/* Floral Decoration Package */}
                        {b.decorationPackage && b.decorationPackage.id !== 'none' && (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between text-rose-800">
                            <span className="flex items-center gap-1.5 font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                              Floral Style: {b.decorationPackage.name}
                            </span>
                            <span className="font-mono font-bold">+₹{b.decorationPackage.price?.toLocaleString('en-IN')}</span>
                          </div>
                        )}

                        {/* Chauffeur Assignment */}
                        <div className="p-3 bg-slate-100 rounded-2xl text-xs flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 block">
                              Assigned Chauffeur &amp; Vehicle Plate
                            </span>
                            {b.chauffeur?.name ? (
                              <div className="font-extrabold text-slate-900 mt-0.5">
                                {b.chauffeur.name} • <span className="font-mono text-slate-600">{b.chauffeur.vehiclePlate || 'Plate Ready'}</span> ({b.chauffeur.phone || 'No phone'})
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No chauffeur assigned yet</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingForChauffeur(b);
                              setChauffeurForm({
                                name: b.chauffeur?.name || '',
                                phone: b.chauffeur?.phone || '',
                                vehiclePlate: b.chauffeur?.vehiclePlate || '',
                              });
                              setChauffeurModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold transition shadow-sm"
                          >
                            {b.chauffeur?.name ? 'Edit Chauffeur' : '+ Assign Chauffeur'}
                          </button>
                        </div>

                        {/* Financial Breakdown */}
                        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>Total Trip Price:</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-bold">
                            <span>Advance Paid by Customer:</span>
                            <span>₹{advance.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-amber-900 font-extrabold pt-1 border-t border-amber-200">
                            <span>Balance to Collect at Venue:</span>
                            <span className="font-mono text-sm">₹{remaining.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        {/* Customer Payment Verification Block */}
                        {(b.paymentScreenshot || b.utrNumber || b.paymentVerificationStatus === 'pending_verification') && (
                          <div className={`p-3.5 rounded-2xl border text-xs space-y-2.5 ${
                            b.paymentVerificationStatus === 'verified'
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : b.paymentVerificationStatus === 'rejected'
                              ? 'bg-rose-50/70 border-rose-200'
                              : 'bg-amber-50/80 border-amber-300'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[11px] uppercase tracking-wide flex items-center gap-1.5 text-slate-800">
                                <QrCode className="w-3.5 h-3.5 text-amber-600" /> UPI Advance Receipt
                              </span>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                b.paymentVerificationStatus === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.paymentVerificationStatus === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-200 text-amber-900 animate-pulse'
                              }`}>
                                {b.paymentVerificationStatus === 'verified'
                                  ? '✓ Verified'
                                  : b.paymentVerificationStatus === 'rejected'
                                  ? '✕ Rejected'
                                  : '⏳ Verification Pending'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                                  Customer UTR / Ref Number:
                                </span>
                                <span className="font-mono font-extrabold text-sm text-slate-900">
                                  {b.utrNumber || 'Not entered'}
                                </span>
                              </div>

                              {b.paymentScreenshot && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingReceipt({ screenshot: b.paymentScreenshot, utr: b.utrNumber, booking: b });
                                    setReceiptModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-amber-400 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-amber-600" /> View Receipt
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ride Control Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {(b.status === 'pending' || b.paymentVerificationStatus === 'pending_verification') && (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={() => handleVerifyPayment(b._id, 'verify')}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-4 h-4" /> Match UTR &amp; Confirm Order
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(b._id, 'reject')}
                              className="px-4 py-2.5 rounded-xl bg-red-100 text-red-700 font-bold text-xs hover:bg-red-200 transition"
                            >
                              ✕ Decline
                            </button>
                          </div>
                        )}

                        {b.status === 'confirmed' && (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={() => {
                                setSelectedBookingForOtp(b);
                                setOtpInput('');
                                setOtpModalOpen(true);
                              }}
                              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                            >
                              <Key className="w-4 h-4" /> Verify Customer OTP &amp; Start Ride
                            </button>
                          </div>
                        )}

                        {b.status === 'in_progress' && (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={() => {
                                setSelectedBookingForComplete(b);
                                setCollectedAmount(remaining);
                                setCompleteModalOpen(true);
                              }}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                            >
                              <CheckCircle className="w-4 h-4" /> Complete Trip &amp; Collect Balance (₹{remaining.toLocaleString('en-IN')})
                            </button>
                          </div>
                        )}

                        {b.status === 'completed' && (
                          <div className="w-full flex items-center justify-between text-xs p-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                            <span className="flex items-center gap-1.5">
                              <Check className="w-4 h-4 text-emerald-600" /> Trip Completed &amp; Balance Cleared
                            </span>
                            <span className="font-mono text-slate-600 text-[11px]">
                              Collected via {b.paymentMethod || 'Cash'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Fleet Owner Wallet & Payout Console */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-heading">
                  Fleet Owner Wallet &amp; Payouts
                </h2>
                <p className="text-xs text-slate-500">
                  Track completed trip revenues, transparent 10% platform commission, and withdraw funds to UPI / Bank.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPayoutForm({
                    amount: ownerProfile?.wallet?.availableBalance || 0,
                    method: 'UPI',
                    upiId: ownerProfile?.bankDetails?.upiId || '',
                    accountNo: ownerProfile?.bankDetails?.accountNumber || '',
                    ifsc: ownerProfile?.bankDetails?.ifscCode || '',
                    bankName: ownerProfile?.bankDetails?.bankName || '',
                    holderName: ownerProfile?.bankDetails?.accountHolderName || user?.name || '',
                  });
                  setPayoutModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center gap-2 shadow-lg transition"
              >
                <ArrowDownToLine className="w-4 h-4" /> Request Payout / Withdraw Funds
              </button>
            </div>

            {/* Wallet Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Available Wallet Balance
                </span>
                <div className="text-3xl font-black text-emerald-600 font-heading">
                  ₹{(ownerProfile?.wallet?.availableBalance || (stats?.totalEarnings ? Math.round(stats.totalEarnings * 0.9) : 0)).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">Ready for instant UPI / Bank withdrawal</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Pending Payouts
                </span>
                <div className="text-3xl font-black text-amber-600 font-heading">
                  ₹{(ownerProfile?.wallet?.pendingPayout || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">Under processing by compliance team</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Total Withdrawn
                </span>
                <div className="text-3xl font-black text-slate-800 font-heading">
                  ₹{(ownerProfile?.wallet?.totalWithdrawn || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">Transferred to your bank/UPI</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Platform Commission (10%)
                </span>
                <div className="text-3xl font-black text-slate-700 font-heading">
                  ₹{Math.round((stats?.totalEarnings || 0) * 0.1).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">You keep 90% net fleet earnings</div>
              </div>
            </div>

            {/* How Payout Works Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                RAS Brother Tour &amp; Travels Vendor Protection &amp; Payout Rules
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <div className="font-bold text-white">1. Instant Wallet Credit</div>
                  <p className="text-[11px] text-slate-400">
                    Once customer OTP is verified and trip is completed, 90% of trip fare is credited to your wallet balance.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <div className="font-bold text-white">2. Fast UPI &amp; Bank Transfer</div>
                  <p className="text-[11px] text-slate-400">
                    Withdraw funds anytime to any UPI handle (GPay/PhonePe/Paytm) or NEFT/IMPS bank account.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <div className="font-bold text-white">3. Zero Hidden Charges</div>
                  <p className="text-[11px] text-slate-400">
                    Straightforward 10% marketplace commission covers marketing, technology, customer support, and GPS routing.
                  </p>
                </div>
              </div>
            </div>

            {/* Payout History Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Payout Withdrawal History
              </h3>

              {(!ownerProfile?.wallet?.payoutHistory || ownerProfile.wallet.payoutHistory.length === 0) ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No payout requests recorded yet. Click "Request Payout" above to withdraw your balance.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Requested Amount</th>
                        <th className="pb-3">Payout Method</th>
                        <th className="pb-3">Account / UPI</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ownerProfile.wallet.payoutHistory.slice().reverse().map((p, idx) => (
                        <tr key={idx} className="font-medium text-slate-700">
                          <td className="py-3">{new Date(p.requestedAt || Date.now()).toLocaleDateString()}</td>
                          <td className="py-3 font-black text-emerald-600">₹{p.amount?.toLocaleString('en-IN')}</td>
                          <td className="py-3 uppercase font-bold text-slate-900">{p.method}</td>
                          <td className="py-3 font-mono text-slate-600">{p.upiId || 'Direct Bank NEFT'}</td>
                          <td className="py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {p.status || 'pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Price Offers & Negotiations Console */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 font-heading">
              Customer Price Offers for Your Fleet
            </h2>

            {ownerOffers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
                No active price offers received yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ownerOffers.map((off) => (
                  <div
                    key={off._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4 text-xs"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-mono font-bold text-slate-500">#{off.offerId}</span>
                      <span className="px-2.5 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800">
                        {off.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={off.car?.images?.main}
                        alt={off.car?.name}
                        className="w-14 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{off.car?.brand} {off.car?.name}</div>
                        <div className="text-slate-500">From: {off.customer?.name} ({off.customer?.phone})</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Listed Price:</span>
                        <span className="font-bold">₹{off.originalPrice?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-amber-800 font-bold">
                        <span>Customer Offer:</span>
                        <span>₹{off.customerOffer?.toLocaleString('en-IN')}</span>
                      </div>
                      {off.ownerCounterOffer && (
                        <div className="flex justify-between text-purple-700 font-bold">
                          <span>Your Counter Offer:</span>
                          <span>₹{off.ownerCounterOffer?.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    {off.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleRespondOffer(off._id, 'accept')}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                        >
                          Accept (₹{off.customerOffer})
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOffer(off);
                            setCounterAmount(Math.round((off.originalPrice + off.customerOffer) / 2));
                            setCounterModalOpen(true);
                          }}
                          className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
                        >
                          Counter Offer
                        </button>
                        <button
                          onClick={() => handleRespondOffer(off._id, 'reject')}
                          className="px-3 py-2 rounded-xl bg-red-100 text-red-700 font-bold hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Add Car Form (With BOTH Upload File + Link Input) */}
        {activeTab === 'add-car' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 font-heading">
              List New Vehicle on RAS Brother Tour &amp; Travels
            </h2>

            <form onSubmit={handleAddCarSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Car Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mercedes-Benz"
                    value={carForm.brand}
                    onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S-Class"
                    value={carForm.model}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Display Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S-Class VIP Chauffeur"
                    value={carForm.name}
                    onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Category</label>
                  <select
                    value={carForm.category}
                    onChange={(e) => setCarForm({ ...carForm, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white"
                  >
                    <option>Wedding Special</option>
                    <option>Luxury</option>
                    <option>Premium</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Vintage</option>
                    <option>Party Car</option>
                    <option>Budget</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Manufacturing Year</label>
                  <input
                    type="number"
                    value={carForm.year}
                    onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Vehicle Color</label>
                  <input
                    type="text"
                    value={carForm.color}
                    onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={carForm.seatingCapacity}
                    onChange={(e) => setCarForm({ ...carForm, seatingCapacity: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Fuel Type</label>
                  <select
                    value={carForm.fuelType}
                    onChange={(e) => setCarForm({ ...carForm, fuelType: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>CNG</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Transmission</label>
                  <select
                    value={carForm.transmission}
                    onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white"
                  >
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload: BOTH File Upload & Image Link */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  Vehicle Photos (Upload Image File OR Paste Image Link)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  {/* Main Exterior Image */}
                  <div className="space-y-2">
                    <label className="block text-slate-700">Main Exterior Photo</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image link or upload below..."
                        value={carForm.mainImage}
                        onChange={(e) => setCarForm({ ...carForm, mainImage: e.target.value })}
                        className="flex-1 p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/50 cursor-pointer hover:bg-amber-100/50 transition">
                      <Upload className="w-4 h-4 text-amber-700" />
                      <span className="text-amber-900 font-bold">
                        {uploadingMain ? 'Uploading photo...' : '📁 Upload Photo from Device'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'mainImage', setCarForm)}
                      />
                    </label>
                    {carForm.mainImage && (
                      <div className="h-24 w-36 rounded-xl overflow-hidden border border-slate-200 mt-1">
                        <img src={carForm.mainImage} alt="Main preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Interior Photo */}
                  <div className="space-y-2">
                    <label className="block text-slate-700">Interior / Cabin Photo</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image link or upload below..."
                        value={carForm.interiorImage}
                        onChange={(e) => setCarForm({ ...carForm, interiorImage: e.target.value })}
                        className="flex-1 p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 cursor-pointer hover:bg-slate-200/60 transition">
                      <Upload className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-800 font-bold">
                        {uploadingInterior ? 'Uploading photo...' : '📁 Upload Photo from Device'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'interiorImage', setCarForm)}
                      />
                    </label>
                    {carForm.interiorImage && (
                      <div className="h-24 w-36 rounded-xl overflow-hidden border border-slate-200 mt-1">
                        <img src={carForm.interiorImage} alt="Interior preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Advance Settings */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4">
                <h3 className="font-extrabold text-sm text-amber-900">
                  Pricing &amp; Advance Booking Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 mb-1">Per Day Base Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={carForm.perDay}
                      onChange={(e) => setCarForm({ ...carForm, perDay: e.target.value, basePrice: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Extra KM Rate (₹/KM)</label>
                    <input
                      type="number"
                      value={carForm.extraKmRate}
                      onChange={(e) => setCarForm({ ...carForm, extraKmRate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Chauffeur Charges (₹/day)</label>
                    <input
                      type="number"
                      value={carForm.driverCharges}
                      onChange={(e) => setCarForm({ ...carForm, driverCharges: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Advance Type &amp; Value</label>
                    <div className="flex gap-2">
                      <select
                        value={carForm.advanceType}
                        onChange={(e) => setCarForm({ ...carForm, advanceType: e.target.value })}
                        className="p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">Fixed ₹</option>
                      </select>
                      <input
                        type="number"
                        value={carForm.advanceValue}
                        onChange={(e) => setCarForm({ ...carForm, advanceValue: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketplace Display Location & Coverage Area */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span className="font-extrabold text-sm text-slate-900">
                    Car Display Location (Near Me Search Placement)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Specify which city and area you want this car to be shown in when customers search "Cars near me" or enter a wedding pickup location.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Display Area / Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sector 18, Noida"
                      value={carForm.address}
                      onChange={(e) => setCarForm({ ...carForm, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Operating City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Noida / South Delhi / Gurgaon"
                      value={carForm.city || 'Noida'}
                      onChange={(e) => setCarForm({ ...carForm, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Service Coverage Radius (KM)</label>
                    <input
                      type="number"
                      value={carForm.serviceRadiusKm || 50}
                      onChange={(e) => setCarForm({ ...carForm, serviceRadiusKm: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs font-semibold">
                <label className="block text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe your car features, clean condition, chauffeur details..."
                  value={carForm.description}
                  onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition"
              >
                Publish Vehicle Listing
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: KYC Verification */}
        {activeTab === 'kyc' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-heading">
                Vendor Identity &amp; Vehicle KYC Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload your government ID and commercial vehicle permit for official verification on RAS Brother Tour &amp; Travels.
              </p>
            </div>

            {kycInfo && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                kycInfo.status === 'verified'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : kycInfo.status === 'rejected'
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div>
                  <div className="font-extrabold uppercase">Status: {kycInfo.status}</div>
                  <div className="mt-0.5">{kycInfo.adminFeedback || 'Under review by RAS Brother compliance team.'}</div>
                </div>
                <div className="font-mono">{kycInfo.idType}: {kycInfo.idNumber}</div>
              </div>
            )}

            <form onSubmit={handleKycSubmit} className="space-y-4 max-w-xl text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">ID Document Type</label>
                <select
                  value={kycForm.idType}
                  onChange={(e) => setKycForm({ ...kycForm, idType: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white"
                >
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Driving License</option>
                  <option>Voter ID</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Document Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1234 5678 9012"
                  value={kycForm.idNumber}
                  onChange={(e) => setKycForm({ ...kycForm, idNumber: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Document Image URL or Upload</label>
                <input
                  type="text"
                  required
                  placeholder="https://... or /uploads/..."
                  value={kycForm.documentFront}
                  onChange={(e) => setKycForm({ ...kycForm, documentFront: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition"
              >
                Submit KYC for Verification
              </button>
            </form>
          </div>
        )}

        {/* EDIT CAR MODAL */}
        {editModalOpen && editingCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-slate-200">
              <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">
                    UPDATE LISTING
                  </span>
                  <h3 className="font-extrabold text-lg font-heading">
                    Edit {editingCar.brand} {editingCar.name}
                  </h3>
                </div>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditCar} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Display Title</label>
                    <input
                      type="text"
                      required
                      value={editingCar.name}
                      onChange={(e) => setEditingCar({ ...editingCar, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Category</label>
                    <select
                      value={editingCar.category}
                      onChange={(e) => setEditingCar({ ...editingCar, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option>Wedding Special</option>
                      <option>Luxury</option>
                      <option>Premium</option>
                      <option>Sedan</option>
                      <option>SUV</option>
                      <option>Vintage</option>
                      <option>Party Car</option>
                      <option>Budget</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Per Day Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingCar.perDay}
                      onChange={(e) => setEditingCar({ ...editingCar, perDay: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Extra KM Rate (₹/KM)</label>
                    <input
                      type="number"
                      value={editingCar.extraKmRate}
                      onChange={(e) => setEditingCar({ ...editingCar, extraKmRate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Chauffeur Charges (₹)</label>
                    <input
                      type="number"
                      value={editingCar.driverCharges}
                      onChange={(e) => setEditingCar({ ...editingCar, driverCharges: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Advance Type &amp; Value</label>
                    <div className="flex gap-1.5">
                      <select
                        value={editingCar.advanceType}
                        onChange={(e) => setEditingCar({ ...editingCar, advanceType: e.target.value })}
                        className="p-2.5 rounded-xl border border-slate-300 bg-white text-[11px]"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">Fixed ₹</option>
                      </select>
                      <input
                        type="number"
                        value={editingCar.advanceValue}
                        onChange={(e) => setEditingCar({ ...editingCar, advanceValue: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Photos: Upload file OR link */}
                {/* Photos: Upload file OR link */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="block text-slate-800 font-bold text-xs">Main Exterior Photo (Upload or Link)</label>
                  {editingCar.mainImage && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-300">
                      <img src={editingCar.mainImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditingCar({ ...editingCar, mainImage: '' })}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-700"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Paste image URL here..."
                    value={editingCar.mainImage}
                    onChange={(e) => setEditingCar({ ...editingCar, mainImage: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/50 cursor-pointer hover:bg-amber-100 transition">
                    <Upload className="w-4 h-4 text-amber-700" />
                    <span className="text-amber-900 font-bold text-xs">Upload New Photo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'mainImage', setEditingCar)}
                    />
                  </label>
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">Car Available on Marketplace</div>
                    <div className="text-[11px] text-slate-500">Disable if vehicle is in service or booked offline</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCar.isAvailable}
                      onChange={(e) => setEditingCar({ ...editingCar, isAvailable: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Marketplace Display Location & Coverage Area */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-700" />
                    <span className="font-extrabold text-slate-900">
                      Marketplace Display Location (Manual City &amp; Area Placement)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Change which area and city this car is shown in for "Cars near me" and wedding pickup venue searches.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Display Area / Address *</label>
                      <input
                        type="text"
                        required
                        value={editingCar.address || ''}
                        onChange={(e) => setEditingCar({ ...editingCar, address: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                        placeholder="e.g. Noida Sector 18"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={editingCar.city || ''}
                        onChange={(e) => setEditingCar({ ...editingCar, city: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                        placeholder="e.g. Noida"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Coverage Radius (KM)</label>
                      <input
                        type="number"
                        value={editingCar.serviceRadiusKm || 50}
                        onChange={(e) => setEditingCar({ ...editingCar, serviceRadiusKm: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-700 mb-1">Description</label>
                  <textarea
                    rows="2"
                    value={editingCar.description}
                    onChange={(e) => setEditingCar({ ...editingCar, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Counter Offer Modal */}
        {counterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
              <h3 className="font-extrabold text-base text-slate-900">
                Propose Counter Offer to Customer
              </h3>
              <p className="text-xs text-slate-500">
                Customer offered ₹{selectedOffer?.customerOffer}. Propose your counter price.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Counter Amount (₹)</label>
                <input
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-300 font-black text-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCounterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRespondOffer(selectedOffer._id, 'counter', counterAmount)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white"
                >
                  Send Counter Offer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP Start Ride Verification Modal */}
        {otpModalOpen && selectedBookingForOtp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Verify Customer Ride Start OTP
                  </h3>
                </div>
                <button
                  onClick={() => setOtpModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Ask the client (<strong>{selectedBookingForOtp.offlineCustomer?.name || selectedBookingForOtp.customer?.name}</strong>) for their 4-digit Ride Start OTP shown on their pass to verify reporting.
              </p>

              <form onSubmit={handleVerifyStartOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Enter 4-Digit OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 5839"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border-2 border-amber-400 text-center font-mono text-2xl font-black tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
                  <div>Booking: #{selectedBookingForOtp.bookingId}</div>
                  <div>Car: {selectedBookingForOtp.car?.brand} {selectedBookingForOtp.car?.name}</div>
                  <div>Pickup: {selectedBookingForOtp.pickupLocation?.address}</div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition"
                  >
                    Verify &amp; Start Trip
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complete Trip & Collect Balance Modal */}
        {completeModalOpen && selectedBookingForComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Complete Trip &amp; Collect Balance
                  </h3>
                </div>
                <button
                  onClick={() => setCompleteModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Confirm receipt of remaining event balance from client. Once completed, 90% of trip fare will be added to your available wallet balance.
              </p>

              <form onSubmit={handleCompleteRide} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Payment Method Used by Customer</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCompleteMethod('cash')}
                      className={`p-3 rounded-xl border text-center font-bold transition ${
                        completeMethod === 'cash'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      💵 Cash at Venue
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompleteMethod('upi')}
                      className={`p-3 rounded-xl border text-center font-bold transition ${
                        completeMethod === 'upi'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      📱 Driver UPI / QR
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Balance Collected (₹)</label>
                  <input
                    type="number"
                    required
                    value={collectedAmount}
                    onChange={(e) => setCollectedAmount(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-0.5">
                  <div>Total Trip Price: ₹{selectedBookingForComplete.pricing?.totalAmount?.toLocaleString('en-IN')}</div>
                  <div>Advance Paid: ₹{selectedBookingForComplete.pricing?.advanceAmount?.toLocaleString('en-IN')}</div>
                  <div className="font-bold text-emerald-700 pt-1 border-t border-amber-200">
                    Net Credited to Your Wallet (90%): ₹{Math.round((selectedBookingForComplete.pricing?.totalAmount || 0) * 0.9).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCompleteModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
                  >
                    Confirm &amp; Complete Trip
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Chauffeur Modal */}
        {chauffeurModalOpen && selectedBookingForChauffeur && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-slate-800" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Assign Chauffeur &amp; Vehicle Plate
                  </h3>
                </div>
                <button
                  onClick={() => setChauffeurModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                These driver details will be instantly synced to the customer's VIP Event Security Pass &amp; WhatsApp dispatch.
              </p>

              <form onSubmit={handleAssignChauffeur} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Chauffeur Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Singh"
                    value={chauffeurForm.name}
                    onChange={(e) => setChauffeurForm({ ...chauffeurForm, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Chauffeur Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={chauffeurForm.phone}
                    onChange={(e) => setChauffeurForm({ ...chauffeurForm, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Vehicle License Plate No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL 1C AA 2026 / UP 16 BB 1234"
                    value={chauffeurForm.vehiclePlate}
                    onChange={(e) => setChauffeurForm({ ...chauffeurForm, vehiclePlate: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 uppercase font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setChauffeurModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md transition"
                  >
                    Save &amp; Dispatch Pass
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payout Withdrawal Modal */}
        {payoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Withdraw Earnings to UPI / Bank
                  </h3>
                </div>
                <button
                  onClick={() => setPayoutModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">Available to Withdraw:</span>
                <span className="font-mono text-lg font-black text-emerald-700">
                  ₹{(ownerProfile?.wallet?.availableBalance || (stats?.totalEarnings ? Math.round(stats.totalEarnings * 0.9) : 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={ownerProfile?.wallet?.availableBalance || stats?.totalEarnings || 500000}
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900"
                    placeholder="Enter amount in INR"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Transfer Destination</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutForm({ ...payoutForm, method: 'UPI' })}
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        payoutForm.method === 'UPI'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Instant UPI (GPay/PhonePe)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutForm({ ...payoutForm, method: 'Bank Account' })}
                      className={`p-2.5 rounded-xl border text-center font-bold transition ${
                        payoutForm.method === 'Bank Account'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Bank Transfer (NEFT/IMPS)
                    </button>
                  </div>
                </div>

                {payoutForm.method === 'UPI' ? (
                  <div>
                    <label className="block text-slate-700 mb-1">UPI ID (VPA)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. mobile@paytm or name@okaxis"
                      value={payoutForm.upiId}
                      onChange={(e) => setPayoutForm({ ...payoutForm, upiId: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="As registered in bank"
                        value={payoutForm.holderName}
                        onChange={(e) => setPayoutForm({ ...payoutForm, holderName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 mb-1">Bank Account Number</label>
                        <input
                          type="text"
                          required
                          placeholder="Account No."
                          value={payoutForm.accountNo}
                          onChange={(e) => setPayoutForm({ ...payoutForm, accountNo: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 mb-1">IFSC Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. HDFC0001234"
                          value={payoutForm.ifsc}
                          onChange={(e) => setPayoutForm({ ...payoutForm, ifsc: e.target.value.toUpperCase() })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 uppercase"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayoutModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
                  >
                    Submit Payout Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Receipt Modal */}
        {receiptModalOpen && viewingReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Customer Payment Receipt
                  </h3>
                  <p className="text-xs text-slate-500">
                    Booking #{viewingReceipt.booking?.bookingId} • {viewingReceipt.booking?.car?.brand} {viewingReceipt.booking?.car?.name}
                  </p>
                </div>
                <button
                  onClick={() => setReceiptModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client:</span>
                  <span className="font-bold text-slate-900">
                    {viewingReceipt.booking?.offlineCustomer?.name || viewingReceipt.booking?.customer?.name} ({viewingReceipt.booking?.offlineCustomer?.phone || viewingReceipt.booking?.customer?.phone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expected Advance:</span>
                  <span className="font-mono font-black text-emerald-700">
                    ₹{viewingReceipt.booking?.pricing?.advanceAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Customer UTR / Ref No:</span>
                  <span className="font-mono font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                    {viewingReceipt.utr || 'Not provided'}
                  </span>
                </div>
              </div>

              {/* Screenshot Image Container */}
              <div className="flex-1 overflow-auto bg-slate-900 rounded-2xl p-2 flex items-center justify-center min-h-[240px]">
                {viewingReceipt.screenshot ? (
                  <img
                    src={viewingReceipt.screenshot}
                    alt="Payment Receipt"
                    className="max-h-[50vh] w-auto object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="text-slate-400 text-xs text-center py-8">
                    No image screenshot uploaded. Only UTR reference was entered.
                  </div>
                )}
              </div>

              {/* Action Buttons inside Modal */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleVerifyPayment(viewingReceipt.booking?._id, 'reject')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 transition"
                >
                  ✕ Mismatch / Reject
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReceiptModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyPayment(viewingReceipt.booking?._id, 'verify')}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Match UTR &amp; Confirm Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

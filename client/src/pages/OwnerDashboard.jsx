import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
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
  ShieldAlert,
  Eye,
  ExternalLink,
  HelpCircle,
  Send,
} from 'lucide-react';
import { uploadSingleFile } from '../utils/imageUpload';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import { normalizeCoordinates } from '../utils/distanceCalculator';
import AssignDriverModal from '../components/booking/AssignDriverModal';
import TripPassInvoiceModal from '../components/booking/TripPassInvoiceModal';
import { useCompany } from '../context/CompanyContext';
import {
  openDriverDutySlipWhatsApp,
  formatDriverDutySlipWhatsAppMessage,
  openSupportTicketWhatsApp,
  formatSupportTicketWhatsAppMessage,
} from '../utils/whatsappHelper';

const cleanFileUrl = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object' && val.url) return String(val.url).trim();
  return String(val).trim();
};

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
  const { company } = useCompany();
  const isKycEnforced = company ? company.kycRequired !== false : true;

  // Tab state: 'cars' | 'bookings' | 'offers' | 'profile' | 'kyc' | 'support'
  const VALID_OWNER_TABS = ['cars', 'bookings', 'offers', 'profile', 'kyc', 'support'];
  const [activeTab, setActiveTab] = useState(
    initialTab === 'add-car' ? 'cars' : (VALID_OWNER_TABS.includes(initialTab) ? initialTab : 'cars')
  );
  const [bookingFilter, setBookingFilter] = useState('all');

  // KYC Verification State
  const [kycData, setKycData] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [showKycRequiredModal, setShowKycRequiredModal] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycForm, setKycForm] = useState({
    legalName: user?.name || '',
    idType: 'Aadhaar Card',
    idNumber: '',
    documentFront: '',
    documentBack: '',
    panNumber: '',
    panDocument: '',
    drivingLicenseNumber: '',
    drivingLicense: '',
    rcNumber: '',
    vehicleRegistrationRc: '',
    bankAccountName: user?.name || '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankName: '',
    upiId: user?.ownerProfile?.bankDetails?.upiId || '',
  });

  // Owner Helpdesk & Problem Queries State
  const [ownerTickets, setOwnerTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [selectedTicketForView, setSelectedTicketForView] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [sendingTicketReply, setSendingTicketReply] = useState(false);
  const [uploadingDocField, setUploadingDocField] = useState(null);
  const [newTicketForm, setNewTicketForm] = useState({
    category: 'Booking Issue',
    subject: '',
    description: '',
    priority: 'medium',
    bookingId: '',
    attachment: '',
  });

  // Car Modal State
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);

  useEffect(() => {
    if (initialTab === 'add-car') {
      setActiveTab('cars');
      if (!isKycEnforced || kycData?.status === 'verified') {
        setCarModalOpen(true);
      } else {
        setShowKycRequiredModal(true);
      }
    } else if (initialTab && VALID_OWNER_TABS.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isKycEnforced, kycData?.status]);

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

  // Assign Driver Modal
  const [assignDriverModalOpen, setAssignDriverModalOpen] = useState(false);
  const [selectedBookingForDriver, setSelectedBookingForDriver] = useState(null);

  // Pass & Invoice Modal
  const [passInvoiceModalOpen, setPassInvoiceModalOpen] = useState(false);
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);

  // Uploading state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sound Notification Alert state (for incoming new bookings)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Browser Web Audio API Multi-Tone Chime Synthesizer
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 3-tone harmonic chime
      const tones = [523.25, 659.25, 1046.5]; // C5, E5, C6
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.4, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.6);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  const triggerNewBookingAlert = () => {
    playChime();
    let count = 0;
    const originalTitle = document.title;
    const interval = setInterval(() => {
      document.title = count % 2 === 0 ? '🔔 (1) NEW RIDE BOOKING!' : originalTitle;
      count++;
      if (count > 12) {
        clearInterval(interval);
        document.title = originalTitle;
      }
    }, 700);
  };

  // Car Form state with Wedding, Party, and Hourly Waiting rates
  const initialCarForm = {
    name: '',
    brand: 'Standard',
    model: '2024',
    perKm: '',
    perHour: '',
    weddingRate: '',
    partyRate: '',
    registrationNumber: '',
    rcDocument: '',
    insuranceDocument: '',
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

  // Fetch Owner's Cars, Bookings, Price Offers, KYC & Support Tickets
  const fetchDashboardData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [carsRes, bookingsRes, offersRes, kycRes, ticketsRes] = await Promise.all([
        fetch('/api/cars/my-fleet', { headers }),
        fetch('/api/bookings/owner-bookings', { headers }),
        fetch('/api/offers/owner-offers', { headers }),
        fetch('/api/owners/kyc', { headers }),
        fetch('/api/support/my-tickets', { headers }),
      ]);

      const carsData = await carsRes.json();
      const bookingsData = await bookingsRes.json();
      const offersData = await offersRes.json();
      const kycResData = await kycRes.json();
      const ticketsData = await ticketsRes.json();

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
      if (kycResData.success && kycResData.kyc) {
        const k = kycResData.kyc;
        setKycData(k);
        setKycForm({
          legalName: k.legalName || user?.name || '',
          idType: k.idType || 'Aadhaar Card',
          idNumber: k.idNumber || '',
          documentFront: k.documentFront || '',
          documentBack: k.documentBack || '',
          panNumber: k.panNumber || '',
          panDocument: k.panDocument || '',
          drivingLicenseNumber: k.drivingLicenseNumber || '',
          drivingLicense: k.drivingLicense || '',
          rcNumber: k.rcNumber || '',
          vehicleRegistrationRc: k.vehicleRegistrationRc || '',
          bankAccountName: k.bankAccountName || user?.name || '',
          bankAccountNumber: k.bankAccountNumber || '',
          bankIfsc: k.bankIfsc || '',
          bankName: k.bankName || '',
          upiId: k.upiId || user?.ownerProfile?.bankDetails?.upiId || '',
        });
      }
      if (ticketsData.success) {
        setOwnerTickets(ticketsData.tickets || []);
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
      const res = await uploadSingleFile(file, token);
      const url = cleanFileUrl(res);
      setCarForm((prev) => ({ ...prev, mainImage: url }));
      showToast(t('Photo uploaded successfully', 'फोटो सफलतापूर्वक अपलोड हो गई!'), 'success');
    } catch (err) {
      showToast(err.message || t('Upload failed', 'फोटो अपलोड नहीं हो पाई'), 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Add Car Modal with Anti-Fraud KYC verification check
  const handleOpenAddCar = () => {
    if (isKycEnforced && kycData?.status !== 'verified') {
      setShowKycRequiredModal(true);
      return;
    }
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
      registrationNumber: car.registrationNumber || '',
      rcDocument: car.rcDocument || '',
      insuranceDocument: car.insuranceDocument || '',
      perKm: car.pricing?.perKm ?? car.pricing?.extraKmRate ?? '',
      perHour: car.pricing?.perHour ?? '',
      weddingRate: car.pricing?.weddingRate ?? '',
      partyRate: car.pricing?.partyRate ?? '',
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

  // Submit KYC handler
  const handleSubmitKYC = async (e) => {
    e.preventDefault();
    const frontUrl = cleanFileUrl(kycForm.documentFront);
    if (!kycForm.legalName.trim() || !kycForm.idNumber.trim() || !frontUrl) {
      showToast(t('Please fill all required KYC fields and upload ID document', 'कृपया सभी आवश्यक KYC फ़ील्ड भरें और पहचान पत्र अपलोड करें'), 'error');
      return;
    }

    try {
      setKycSubmitting(true);
      const sanitizedPayload = {
        ...kycForm,
        documentFront: frontUrl,
        documentBack: cleanFileUrl(kycForm.documentBack),
        panDocument: cleanFileUrl(kycForm.panDocument),
        drivingLicense: cleanFileUrl(kycForm.drivingLicense),
        vehicleRegistrationRc: cleanFileUrl(kycForm.vehicleRegistrationRc),
      };
      const res = await fetch('/api/owners/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedPayload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          t(
            'KYC submitted successfully! Admin will match and verify details within 2-4 hours.',
            'KYC सफलतापूर्वक सबमिट हो गई है! एडमिन 2-4 घंटे में विवरण मैच करके सत्यापित करेंगे।'
          ),
          'success'
        );
        setKycData(data.kyc);
      } else {
        showToast(data.message || 'Failed to submit KYC', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setKycSubmitting(false);
    }
  };

  // Submit Support Problem Ticket handler (Flipkart-Style)
  const handleCreateSupportTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      showToast(t('Please enter subject and description', 'कृपया विषय और समस्या का विवरण भरें'), 'error');
      return;
    }

    try {
      setSubmittingTicket(true);
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user?.name || 'Fleet Partner',
          phone: user?.phone || '',
          email: user?.email || '',
          category: newTicketForm.category,
          subject: newTicketForm.subject.trim(),
          description: newTicketForm.description.trim(),
          priority: newTicketForm.priority,
          bookingId: newTicketForm.bookingId ? newTicketForm.bookingId.trim() : undefined,
          attachments: newTicketForm.attachment ? [newTicketForm.attachment] : [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          t(
            `Support Ticket #${data.ticket?.ticketId} created! Admin has been notified.`,
            `सपोर्ट टिकट #${data.ticket?.ticketId} दर्ज हो गया है! एडमिन को सूचित कर दिया गया है।`
          ),
          'success'
        );
        setTicketModalOpen(false);
        setNewTicketForm({
          category: 'Booking Issue',
          subject: '',
          description: '',
          priority: 'medium',
          bookingId: '',
          attachment: '',
        });
        fetchDashboardData();
        if (data.whatsAppShareUrl) {
          window.open(data.whatsAppShareUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        showToast(data.message || 'Failed to register ticket', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Upload KYC Document Handler
  const handleKycDocUpload = async (field, file) => {
    if (!file) return;
    setUploadingDocField(field);
    try {
      const res = await uploadSingleFile(file, token);
      const url = cleanFileUrl(res);
      setKycForm((prev) => ({ ...prev, [field]: url }));
      showToast(t('Document uploaded successfully!', 'दस्तावेज़ सफलतापूर्वक अपलोड हो गया!'), 'success');
    } catch (err) {
      showToast(err.message || t('Upload failed', 'अपलोड नहीं हो सका'), 'error');
    } finally {
      setUploadingDocField(null);
    }
  };

  // Upload Car Document Handler (RC / Insurance)
  const handleCarDocUpload = async (field, file) => {
    if (!file) return;
    setUploadingDocField(field);
    try {
      const res = await uploadSingleFile(file, token);
      const url = cleanFileUrl(res);
      setCarForm((prev) => ({ ...prev, [field]: url }));
      showToast(t('Vehicle document uploaded!', 'गाड़ी का दस्तावेज़ अपलोड हो गया!'), 'success');
    } catch (err) {
      showToast(err.message || t('Upload failed', 'अपलोड नहीं हो सका'), 'error');
    } finally {
      setUploadingDocField(null);
    }
  };

  // Send Follow-up Message to Support Ticket
  const handleSendTicketReply = async (ticketId) => {
    if (!ticketReplyText.trim()) return;
    setSendingTicketReply(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: ticketReplyText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(t('Message sent to admin', 'संदेश एडमिन को भेज दिया गया'), 'success');
        setTicketReplyText('');
        setSelectedTicketForView(data.ticket);
        fetchDashboardData(true);
      } else {
        showToast(data.message || 'Failed to send reply', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSendingTicketReply(false);
    }
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
      const mainImageUrl = cleanFileUrl(carForm.mainImage) || '/brand/ras-logo-primary.svg';
      const payload = {
        name: carForm.name.trim(),
        brand: carForm.brand.trim() || 'Standard',
        model: carForm.model.trim() || '2024',
        registrationNumber: String(carForm.registrationNumber || '').trim().toUpperCase(),
        rcDocument: cleanFileUrl(carForm.rcDocument),
        insuranceDocument: cleanFileUrl(carForm.insuranceDocument),
        perKm,
        pricing: {
          perKm,
          extraKmRate: perKm,
          perDay: perKm * 100,
          basePrice: perKm,
          perHour: Number(carForm.perHour) || 150,
          weddingRate: Number(carForm.weddingRate) || 0,
          partyRate: Number(carForm.partyRate) || 0,
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
        mainImage: mainImageUrl,
        images: {
          main: mainImageUrl,
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
        if (data.requireKyc) {
          setShowKycRequiredModal(true);
        }
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

    if (selectedBookingForOtp?.startDate) {
      const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
      const rideDayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(selectedBookingForOtp.startDate));
      if (todayStr !== rideDayStr) {
        showToast(t('Ride can only be started on the scheduled date!', 'राइड केवल तय तारीख पर ही शुरू की जा सकती है!'), 'error');
        return;
      }
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
      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        {/* Compact Owner Partner Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
                {user?.ownerProfile?.businessName || t('Fleet Partner Console', 'कार मालिक पार्टनर')}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white font-heading">
                {t('Welcome,', 'नमस्ते,')} <span className="text-amber-300">{user?.name || 'Partner'}</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px] sm:max-w-none">
                {user?.phone ? `📞 ${user.phone}` : ''} {user?.email ? `• ${user.email}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
                  <span>{t('Alert ON', 'अलर्ट चालू')}</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 text-slate-400" />
                  <span>{t('Muted', 'म्यूट')}</span>
                </>
              )}
            </button>

            {/* Offline Direct Walk-in Booking Button */}
            {onOpenDirectBooking && (
              <button
                type="button"
                onClick={() => onOpenDirectBooking(myFleet[0] || null)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                title={t('Create direct booking for walk-in client', 'दुकान पर आए ग्राहक की सीधी बुकिंग करें')}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t('Walk-in Client', 'सीधी बुकिंग')}</span>
              </button>
            )}
          </div>
        </div>

        {/* 🛡️ PROMINENT ANTI-FRAUD KYC STATUS BANNER */}
        {kycData?.status === 'verified' ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-200 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    ✓ {t('KYC Verified Fleet Partner', 'सत्यापित पार्टनर (KYC Approved)')}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {t('Anti-Fraud Compliant', 'सुरक्षित व प्रमाणित')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('Your identity, vehicle documents, and bank payout account are verified. Multiple vehicle listings are active.', 'आपकी पहचान, गाड़ी के दस्तावेज और बैंक खाता सत्यापित हैं। आप कई गाड़ियाँ लिस्ट कर सकते हैं।')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition text-center shrink-0 cursor-pointer"
            >
              {t('View KYC Record', 'केवाईसी रिकॉर्ड देखें')}
            </button>
          </div>
        ) : kycData?.status === 'pending' ? (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 animate-pulse">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    ⏳ {t('KYC Verification Under Review', 'केवाईसी सत्यापन प्रक्रिया में है')}
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {t('Admin Match in Progress', 'एडमिन जांच जारी')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('Admin is cross-matching your Legal Name, Bank Account, and Vehicle RC. Listing new cars will activate upon verification.', 'एडमिन आपके नाम, बैंक खाते और गाड़ी की आरसी की जांच कर रहे हैं। सत्यापन के बाद नई गाड़ियाँ सक्रिय हो जाएँगी।')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition text-center shrink-0 cursor-pointer"
            >
              {t('Track KYC Status', 'जांच स्थिति देखें')}
            </button>
          </div>
        ) : kycData?.status === 'rejected' ? (
          <div className="bg-rose-950/50 border border-rose-500/50 rounded-3xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                    ⚠️ {t('KYC Verification Rejected by Admin', 'केवाईसी सत्यापन अस्वीकार हो गया')}
                  </span>
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-500/30">
                    {t('ACTION NEEDED', 'सुधार आवश्यक')}
                  </span>
                </div>
                <p className="text-xs text-rose-200 mt-0.5 font-semibold">
                  {t('Reason:', 'कारण:')} {kycData?.rejectionReason || t('Detail mismatch or unreadable document.', 'नाम या बैंक खाता मैच नहीं हुआ या दस्तावेज साफ़ नहीं था।')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition text-center shrink-0 shadow-lg cursor-pointer"
            >
              {t('Fix & Re-Submit KYC', 'सुधारें और दोबारा भेजें')}
            </button>
          </div>
        ) : !isKycEnforced ? (
          <div className="bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/50 border border-blue-500/40 rounded-3xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-200 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                    ✨ {t('KYC Verification Optional', 'केवाईसी सत्यापन वर्तमान में वैकल्पिक है')}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {t('Direct Listing Active', 'सीधी लिस्टिंग उपलब्ध')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('Admin has currently set KYC as optional. You can add and list vehicles directly without waiting! You can still submit KYC documents anytime for a verified badge.', 'एडमिन ने फिलहाल केवाईसी को वैकल्पिक किया हुआ है। आप तुरंत अपनी गाड़ियाँ जोड़ सकते हैं! सत्यापित पार्टनर बैज के लिए आप कभी भी दस्तावेज़ भेज सकते हैं।')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenAddCar}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl transition text-center shrink-0 shadow-lg cursor-pointer"
              >
                {t('+ Add Vehicle Now', '+ अभी गाड़ी जोड़ें')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('kyc')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition text-center shrink-0 border border-slate-700 cursor-pointer"
              >
                {t('Submit KYC (Optional)', 'केवाईसी भेजें (वैकल्पिक)')}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 rounded-3xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    🛡️ {t('Anti-Fraud KYC Verification Mandatory', 'धोखाधड़ी से सुरक्षा — KYC अनिवार्य')}
                  </span>
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-500/30">
                    {t('REQUIRED TO LIST CARS', 'गाड़ी जोड़ने के लिए जरूरी')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('To prevent phantom or duplicate car listings, all partners listing multiple vehicles must verify Aadhaar/PAN, Vehicle RC, and Payout Bank Details.', 'प्लेटफॉर्म पर फर्जी गाड़ियाँ रोकने के लिए कार मालिक का पहचान पत्र, आरसी और बैंक खाता सत्यापन अनिवार्य है।')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl transition text-center shrink-0 shadow-lg cursor-pointer active:scale-95"
            >
              {t('Complete KYC Now →', 'अभी KYC पूरा करें →')}
            </button>
          </div>
        )}

        {/* 🎛️ DASHBOARD NAVIGATION TABS BAR */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('cars')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cars'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>{t('My Fleet', 'मेरी गाड़ियाँ')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'cars' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-amber-400'
              }`}
            >
              {myFleet.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t('Bookings & Trips', 'बुकिंग्स व ट्रिप')}</span>
            {pendingBookingsCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black animate-pulse">
                {pendingBookingsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <HandCoins className="w-4 h-4" />
            <span>{t('Price Offers', 'रेट ऑफर्स')}</span>
            {pendingOffersCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black animate-pulse">
                {pendingOffersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'kyc'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('KYC Verification', 'केवाईसी सत्यापन')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                kycData?.status === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : kycData?.status === 'pending'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {kycData?.status === 'verified' ? '✓ Verified' : kycData?.status === 'pending' ? '⏳ In Review' : '⚠️ Required'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'support'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('Help & Problem Desk', 'समस्या हेल्पडेस्क')}</span>
            {ownerTickets.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black">
                {ownerTickets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('Agency Profile & UPI', 'एजेंसी प्रोफाइल व UPI')}</span>
          </button>
        </div>

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

                        {/* Assign Driver Button (Visible on confirmed or in_progress bookings) */}
                        {(b.status === 'confirmed' || b.status === 'in_progress') && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBookingForDriver(b);
                                setAssignDriverModalOpen(true);
                              }}
                              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                            >
                              <span>👨‍✈️ {b.chauffeur?.name ? t('Driver Assigned', 'ड्राइवर बदलें') : t('Assign Driver', 'ड्राइवर जोड़ें')}</span>
                            </button>

                            {b.chauffeur?.phone && (
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    openDriverDutySlipWhatsApp(b, b.chauffeur, company);
                                  } catch (err) {
                                    showToast(err.message || 'Error opening WhatsApp', 'error');
                                  }
                                }}
                                className="px-3 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs sm:text-sm rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer"
                                title={t('Send Duty Slip to Driver on WhatsApp', 'ड्राइवर को व्हाट्सएप पर ड्यूटी स्लिप भेजें')}
                              >
                                <span>📲 {t('Duty Slip', 'ड्यूटी स्लिप')}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Pass & Invoice Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookingForPass(b);
                            setPassInvoiceModalOpen(true);
                          }}
                          className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                        >
                          <FileText className="w-4 h-4" />
                          <span>📄 {t('Pass & Invoice', 'पास व बिल')}</span>
                        </button>

                        {/* Direct Chat with Customer */}
                        {onOpenChat && b.customer && (
                          <button
                            type="button"
                            onClick={() => onOpenChat(b.customer)}
                            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                            title={t('Chat with Customer', 'ग्राहक से चैट करें')}
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-400" />
                            <span>{t('Chat Customer', 'ग्राहक से चैट')}</span>
                          </button>
                        )}

                        {/* Start Ride with same-day OTP verification check */}
                        {b.status === 'confirmed' && (() => {
                          const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
                          const rideDayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(b.startDate));
                          const isToday = todayStr === rideDayStr;

                          return isToday ? (
                            <button
                              onClick={() => {
                                setSelectedBookingForOtp(b);
                                setOtpInput('');
                                setOtpModalOpen(true);
                              }}
                              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center gap-2 transition transform active:scale-95 animate-pulse"
                            >
                              <Key className="w-4 h-4" />
                              <span>🔑 {t('Start Ride (Enter OTP)', 'राइड शुरू करें (OTP डालें)')}</span>
                            </button>
                          ) : (
                            <div className="px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-400 text-xs font-bold flex items-center gap-1.5">
                              <span>🔒</span>
                              <span>{t(`OTP starts on ${new Date(b.startDate).toLocaleDateString()}`, `राइड के दिन (${new Date(b.startDate).toLocaleDateString()}) OTP भरें`)}</span>
                            </div>
                          );
                        })()}

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
        ) : activeTab === 'kyc' ? (
          /* =================================================================== */
          /* TAB 5: ANTI-FRAUD KYC VERIFICATION & AUDIT MATCH                    */
          /* =================================================================== */
          <div className="max-w-4xl mx-auto space-y-6 text-white">
            {/* Header Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      {t('Fraud Elimination & Safety Protocol', 'सुरक्षा व एंटी-फ्रॉड सत्यापन')}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                      v2.4
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
                    {t('Car Owner KYC Verification', 'कार मालिक KYC सत्यापन')}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    {t(
                      'To eliminate fraud, all fleet partners listing vehicles must verify Legal Identity, Vehicle RC, and Payout Bank Details. Admin verifies and matches details before activating cars.',
                      'धोखाधड़ी रोकने के लिए गाड़ी लिस्ट करने से पहले मालिक का आधार/पैन, आरसी और बैंक खाता सत्यापित किया जाता है।'
                    )}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider border shadow-lg ${
                    kycData?.status === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50'
                      : kycData?.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-950/50'
                      : kycData?.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-950/50'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {kycData?.status === 'verified' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  {kycData?.status === 'pending' && <Clock className="w-4 h-4 text-amber-400 animate-spin" />}
                  {kycData?.status === 'rejected' && <XCircle className="w-4 h-4 text-rose-400" />}
                  {(!kycData?.status || kycData?.status === 'not_submitted') && <ShieldAlert className="w-4 h-4 text-amber-400" />}
                  <span>
                    {kycData?.status === 'verified'
                      ? t('KYC Verified & Compliant', 'केवाईसी सत्यापित')
                      : kycData?.status === 'pending'
                      ? t('Under Admin Review', 'समीक्षा में है')
                      : kycData?.status === 'rejected'
                      ? t('Verification Rejected', 'अस्वीकृत')
                      : t('KYC Not Submitted', 'सबमिट नहीं है')}
                  </span>
                </span>
              </div>
            </div>

            {/* Verification Status Details Card */}
            {kycData && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('Admin Audit Status & Verification Checklist', 'एडमिन ऑडिट व जांच चेकलिस्ट')}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-1">{t('Legal ID Document', 'पहचान पत्र')}</span>
                    <span className={`font-bold flex items-center gap-1.5 ${kycData.adminAudit?.idDocumentValid ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {kycData.adminAudit?.idDocumentValid ? '✓ Validated' : '⏳ Pending'}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-1">{t('PAN / License', 'पैन / ड्राइविंग लाइसेंस')}</span>
                    <span className={`font-bold flex items-center gap-1.5 ${kycData.adminAudit?.drivingLicenseValid ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {kycData.adminAudit?.drivingLicenseValid ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-1">{t('Vehicle RC Match', 'गाड़ी आरसी मैच')}</span>
                    <span className={`font-bold flex items-center gap-1.5 ${kycData.adminAudit?.vehicleRcMatched ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {kycData.adminAudit?.vehicleRcMatched ? '✓ Matched' : '⏳ Pending'}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block mb-1">{t('Bank Name Match', 'बैंक नाम मिलान')}</span>
                    <span className={`font-bold flex items-center gap-1.5 ${kycData.adminAudit?.bankNameMatched ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {kycData.adminAudit?.bankNameMatched ? '✓ Matched' : '⏳ Pending'}
                    </span>
                  </div>
                </div>

                {kycData.status === 'rejected' && (
                  <div className="bg-rose-950/60 border border-rose-500/60 rounded-2xl p-4 text-xs space-y-1">
                    <div className="font-bold text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>{t('Rejection Reason from Admin:', 'एडमिन द्वारा अस्वीकृति का कारण:')}</span>
                    </div>
                    <p className="text-rose-100 font-semibold pl-6">
                      {kycData.rejectionReason || t('Information mismatch or unclear documents.', 'दस्तावेज स्पष्ट नहीं थे या नाम मैच नहीं हुआ।')}
                    </p>
                    <p className="text-rose-300 text-[11px] pl-6 pt-1">
                      {t('Please update the form below with clear photos and matching name, then re-submit.', 'कृपया नीचे दिए गए फ़ॉर्म में सही जानकारी और साफ़ फोटो लगाकर दोबारा सबमिट करें।')}
                    </p>
                  </div>
                )}

                {kycData.adminAudit?.notes && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300">
                    <strong className="text-amber-400">{t('Admin Audit Note:', 'एडमिन नोट:')}</strong> {kycData.adminAudit.notes}
                  </div>
                )}
              </div>
            )}

            {/* KYC Submission Form */}
            <form onSubmit={handleSubmitKYC} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* SECTION 1: LEGAL IDENTITY */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">1</span>
                    <span>{t('Legal Identity & Govt ID', 'कानूनी पहचान व सरकारी प्रमाण पत्र')}</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">{t('Must match official records', 'सरकारी रिकॉर्ड से मैच होना जरूरी')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-300 mb-1.5">
                      {t('Legal Full Name (As per Govt ID) *', 'पूरा नाम (पहचान पत्र अनुसार) *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar Sharma"
                      value={kycForm.legalName}
                      onChange={(e) => setKycForm({ ...kycForm, legalName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-bold focus:border-amber-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {t('Must match Bank Account Holder Name exactly to prevent payout fraud.', 'बैंक खाते के नाम से बिल्कुल मेल खाना चाहिए।')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5">{t('ID Document Type *', 'पहचान पत्र का प्रकार *')}</label>
                    <select
                      value={kycForm.idType}
                      onChange={(e) => setKycForm({ ...kycForm, idType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-bold focus:border-amber-500 outline-none"
                    >
                      <option value="Aadhaar Card">{t('Aadhaar Card', 'आधार कार्ड')}</option>
                      <option value="Voter ID">{t('Voter ID Card', 'वोटर आईडी कार्ड')}</option>
                      <option value="Passport">{t('Passport', 'पासपोर्ट')}</option>
                      <option value="Driving License">{t('Driving License', 'ड्राइविंग लाइसेंस')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5">
                      {t('ID Document Number *', 'पहचान पत्र का नंबर *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1234 5678 9012"
                      value={kycForm.idNumber}
                      onChange={(e) => setKycForm({ ...kycForm, idNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5">
                      {t('PAN Card Number (Optional)', 'पैन कार्ड नंबर (वैकल्पिक)')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={kycForm.panNumber}
                      onChange={(e) => setKycForm({ ...kycForm, panNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-mono font-bold uppercase focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* ID Document Photo Uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Front Side */}
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-slate-200 text-xs font-black">
                      {t('ID Document Front Photo *', 'पहचान पत्र का सामने का फोटो *')}
                    </label>
                    <div className="flex items-center gap-3">
                      {cleanFileUrl(kycForm.documentFront) ? (
                        <img
                          src={cleanFileUrl(kycForm.documentFront)}
                          alt="Front Preview"
                          className="w-16 h-12 object-cover rounded-xl border border-slate-700 bg-slate-900"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                          ID Front
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingDocField === 'documentFront' ? t('Uploading...', 'अपलोड...') : t('Upload Front', 'फोटो अपलोड करें')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleKycDocUpload('documentFront', e.target.files?.[0])}
                          disabled={uploadingDocField === 'documentFront'}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-slate-200 text-xs font-black">
                      {t('ID Document Back Photo (Optional)', 'पहचान पत्र का पिछला हिस्सा (वैकल्पिक)')}
                    </label>
                    <div className="flex items-center gap-3">
                      {cleanFileUrl(kycForm.documentBack) ? (
                        <img
                          src={cleanFileUrl(kycForm.documentBack)}
                          alt="Back Preview"
                          className="w-16 h-12 object-cover rounded-xl border border-slate-700 bg-slate-900"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                          ID Back
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingDocField === 'documentBack' ? t('Uploading...', 'अपलोड...') : t('Upload Back', 'फोटो अपलोड करें')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleKycDocUpload('documentBack', e.target.files?.[0])}
                          disabled={uploadingDocField === 'documentBack'}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DRIVING LICENSE & VEHICLE RC */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">2</span>
                    <span>{t('Driving License & Fleet Vehicle RC', 'ड्राइविंग लाइसेंस व गाड़ी की आरसी')}</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">{t('Vehicle Ownership Proof', 'गाड़ी का मालिकाना हक')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-300 mb-1.5">{t('Driving License Number', 'ड्राइविंग लाइसेंस नंबर')}</label>
                    <input
                      type="text"
                      placeholder="e.g. DL-0420110012345"
                      value={kycForm.drivingLicenseNumber}
                      onChange={(e) => setKycForm({ ...kycForm, drivingLicenseNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-mono font-bold uppercase focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5">
                      {t('Primary Vehicle RC / Plate Number *', 'मुख्य गाड़ी का रजिस्ट्रेशन / RC नंबर *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DL 01 AB 1234"
                      value={kycForm.rcNumber}
                      onChange={(e) => setKycForm({ ...kycForm, rcNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-amber-300 font-mono font-bold uppercase focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Upload RC & Driving License Documents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-slate-200 text-xs font-black">
                      {t('Vehicle RC Document Photo *', 'गाड़ी की RC फोटो *')}
                    </label>
                    <div className="flex items-center gap-3">
                      {cleanFileUrl(kycForm.vehicleRegistrationRc) ? (
                        <img
                          src={cleanFileUrl(kycForm.vehicleRegistrationRc)}
                          alt="RC Preview"
                          className="w-16 h-12 object-cover rounded-xl border border-slate-700 bg-slate-900"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                          RC Photo
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingDocField === 'vehicleRegistrationRc' ? t('Uploading...', 'अपलोड...') : t('Upload RC', 'RC फोटो अपलोड करें')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleKycDocUpload('vehicleRegistrationRc', e.target.files?.[0])}
                          disabled={uploadingDocField === 'vehicleRegistrationRc'}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-slate-200 text-xs font-black">
                      {t('Driving License Photo (Optional)', 'ड्राइविंग लाइसेंस फोटो (वैकल्पिक)')}
                    </label>
                    <div className="flex items-center gap-3">
                      {cleanFileUrl(kycForm.drivingLicense) ? (
                        <img
                          src={cleanFileUrl(kycForm.drivingLicense)}
                          alt="DL Preview"
                          className="w-16 h-12 object-cover rounded-xl border border-slate-700 bg-slate-900"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                          DL Photo
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingDocField === 'drivingLicense' ? t('Uploading...', 'अपलोड...') : t('Upload DL', 'DL फोटो अपलोड करें')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleKycDocUpload('drivingLicense', e.target.files?.[0])}
                          disabled={uploadingDocField === 'drivingLicense'}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PAYOUT BANK ACCOUNT DETAILS */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">3</span>
                    <span>{t('Payout Bank Account & UPI Details', 'पेआउट बैंक खाता व UPI')}</span>
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                    {t('Direct Settlement', 'सीधा भुगतान')}
                  </span>
                </div>

                <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200">
                  ⚠️ <strong>{t('Anti-Fraud Match Rule:', 'धोखाधड़ी से सुरक्षा नियम:')}</strong> {t('The Bank Account Holder Name must match your Legal Full Name. Customer advances and rental earnings will ONLY be credited to this verified account.', 'बैंक खाता धारक का नाम आपके पहचान पत्र के नाम से मैच होना अनिवार्य है। बुकिंग का एडवांस केवल इसी खाते में भेजा जाएगा।')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-300 mb-1.5">
                      {t('Bank Account Holder Name *', 'खाता धारक का नाम (पासबुक अनुसार) *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar Sharma"
                      value={kycForm.bankAccountName}
                      onChange={(e) => setKycForm({ ...kycForm, bankAccountName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5">{t('Bank Name *', 'बैंक का नाम *')}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. State Bank of India, HDFC Bank"
                      value={kycForm.bankName}
                      onChange={(e) => setKycForm({ ...kycForm, bankName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5">{t('Bank Account Number *', 'बैंक खाता नंबर *')}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50100234567890"
                      value={kycForm.bankAccountNumber}
                      onChange={(e) => setKycForm({ ...kycForm, bankAccountNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5">{t('Bank IFSC Code *', 'बैंक IFSC कोड *')}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBIN0001234"
                      value={kycForm.bankIfsc}
                      onChange={(e) => setKycForm({ ...kycForm, bankIfsc: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-mono font-bold uppercase focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5">{t('Payout UPI ID (Google Pay / PhonePe / Paytm)', 'UPI ID (गूगल पे / फोनपे / पेटीएम)')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 9918272164@okaxis or name@upi"
                    value={kycForm.upiId}
                    onChange={(e) => setKycForm({ ...kycForm, upiId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-amber-300 font-mono font-bold focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-slate-400">
                  {t(
                    '🔒 All documents are stored securely with 256-bit encryption and reviewed solely by authorized Admin.',
                    '🔒 आपके सभी दस्तावेज 256-बिट एन्क्रिप्शन के साथ पूरी तरह सुरक्षित रखे जाते हैं।'
                  )}
                </p>

                <button
                  type="submit"
                  disabled={kycSubmitting}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
                >
                  {kycSubmitting ? (
                    <span>{t('Submitting KYC...', 'केवाईसी सबमिट हो रही है...')}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                      <span>
                        {kycData?.status === 'rejected'
                          ? t('Re-Submit Corrected KYC', 'सुधारकर दोबारा सबमिट करें')
                          : t('Submit KYC for Verification', 'सत्यापन के लिए KYC सबमिट करें')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'support' ? (
          /* =================================================================== */
          /* TAB 6: FLIPKART-STYLE HELPDESK & PROBLEM QUERY DESK                */
          /* =================================================================== */
          <div className="max-w-5xl mx-auto space-y-6 text-white">
            {/* Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <MessageSquare className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                      {t('Flipkart-Style 24x7 Problem Desk', '24x7 समस्या हेल्पडेस्क')}
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                      Direct Admin Alert
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
                    {t('Fleet Partner Problem & Help Query', 'पार्टनर समस्या व सहायता केंद्र')}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    {t(
                      'Facing issues with booking payouts, passenger disputes, or ride cancellations? Raise a problem query. Admin gets instant alerts and provides official resolution replies.',
                      'बुकिंग, पेमेंट या सवारी से जुड़ी किसी भी समस्या के लिए टिकट दर्ज करें। एडमिन को तुरंत सूचना जाएगी और समाधान मिलेगा।'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{t('+ Raise Problem Query', '+ नई समस्या दर्ज करें')}</span>
                </button>
              </div>
            </div>

            {/* Quick Contact Hotline Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${company.phone || '9918272164'}`}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl flex items-center gap-3.5 transition group shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t('24/7 Admin Helpline', 'एडमिन फ़ोन हेल्पलाइन')}</span>
                  <p className="text-sm font-black text-white group-hover:text-amber-400 transition">
                    {company.phone || '+91 9918272164'}
                  </p>
                </div>
              </a>

              <button
                type="button"
                onClick={() =>
                  openWhatsAppMessage(
                    company.phone || '9918272164',
                    `Namaste RAS Brother Admin, I am fleet partner ${user?.name || ''} (Phone: ${user?.phone || ''}). I need direct assistance with my vehicle fleet.`
                  )
                }
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl flex items-center gap-3.5 transition group shadow-lg text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t('Direct WhatsApp Support', 'सीधा व्हाट्सएप सपोर्ट')}</span>
                  <p className="text-sm font-black text-white group-hover:text-emerald-400 transition">
                    {t('Chat Directly with Admin Desk', 'एडमिन से व्हाट्सएप पर बात करें')}
                  </p>
                </div>
              </button>
            </div>

            {/* Tickets Listing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>{t('Your Problem Query Tickets', 'आपकी दर्ज की गई समस्याएं')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                    {ownerTickets.length}
                  </span>
                </h3>
              </div>

              {ownerTickets.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h4 className="text-base font-black text-white">{t('No Problem Queries Logged', 'कोई समस्या दर्ज नहीं है')}</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {t(
                      'All your bookings and fleet operations are active and running smoothly. If you ever face an issue, click below to raise a problem query.',
                      'आपकी सभी बुकिंग्स और गाड़ियाँ बढ़िया चल रही हैं। कोई परेशानी होने पर नया टिकट बनाएं।'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setTicketModalOpen(true)}
                    className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                  >
                    {t('Raise Problem Query', 'समस्या दर्ज करें')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {ownerTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 transition hover:border-slate-700"
                    >
                      {/* Top Header of Ticket */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                            #{ticket.ticketId}
                          </span>
                          <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                            {ticket.category}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              ticket.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : ticket.priority === 'high'
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                              ticket.status === 'resolved'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : ticket.status === 'in_progress'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : ticket.status === 'closed'
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }`}
                          >
                            {ticket.status}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Subject & Description */}
                      <div className="space-y-1.5">
                        <h4 className="text-base font-black text-white">{ticket.subject}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {ticket.description}
                        </p>
                        {ticket.bookingId && (
                          <div className="pt-1">
                            <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                              📋 Linked Booking: #{ticket.bookingId}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Admin Official Resolution Box (If resolved or reply exists) */}
                      {ticket.adminResponse?.message && (
                        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-emerald-400 font-black">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4" />
                              <span>{t('Official Admin Resolution', 'एडमिन समाधान')}</span>
                            </span>
                            <span className="text-[10px] text-emerald-300 font-normal">
                              {ticket.adminResponse.resolvedAt
                                ? new Date(ticket.adminResponse.resolvedAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>
                          <p className="text-emerald-100 font-semibold leading-relaxed">
                            {ticket.adminResponse.message}
                          </p>
                          {ticket.adminResponse.resolvedBy && (
                            <span className="text-[10px] text-emerald-300 block pt-1">
                              — {ticket.adminResponse.resolvedBy}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedTicketForView(ticket)}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>
                            {t('Discussion Thread', 'चर्चा देखें')} ({ticket.messages?.length || 0})
                          </span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openSupportTicketWhatsApp(ticket, company.phone || '9918272164', company)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{t('WhatsApp Admin', 'व्हाट्सएप पर भेजें')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

              {/* Anti-Fraud Vehicle Plate & RC Verification */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-amber-400 block text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t('Vehicle Registration & RC Verification', 'गाड़ी नंबर व आरसी सत्यापन')}</span>
                  </label>
                  <span className="text-[10px] text-emerald-300 font-black bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {t('Fraud Protection', 'एंटी-फ्रॉड')}
                  </span>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 text-xs">
                    {t('Vehicle Number Plate (RC Plate Number) *', 'गाड़ी का नंबर (RC नंबर) *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL 01 AB 1234 or UP 32 XX 5678"
                    value={carForm.registrationNumber}
                    onChange={(e) => setCarForm({ ...carForm, registrationNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {t('Verified by admin against vehicle RC to prevent duplicate or phantom car listings.', 'फर्जी गाड़ी लिस्टिंग रोकने के लिए एडमिन इस नंबर को आरसी से मैच करेंगे।')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-slate-300 block mb-1 text-[11px] font-semibold">
                      {t('Vehicle RC Document Photo', 'गाड़ी की RC फोटो')}
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingDocField === 'rcDocument' ? t('Uploading...', 'अपलोड...') : t('Upload RC', 'RC अपलोड करें')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCarDocUpload('rcDocument', e.target.files?.[0])}
                          disabled={uploadingDocField === 'rcDocument'}
                          className="hidden"
                        />
                      </label>
                      {carForm.rcDocument && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> {t('Uploaded', 'अपलोड है')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 text-[11px] font-semibold">
                      {t('Insurance Certificate (Optional)', 'बीमा प्रमाण पत्र (वैकल्पिक)')}
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingDocField === 'insuranceDocument' ? t('Uploading...', 'अपलोड...') : t('Upload Insurance', 'बीमा अपलोड करें')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCarDocUpload('insuranceDocument', e.target.files?.[0])}
                          disabled={uploadingDocField === 'insuranceDocument'}
                          className="hidden"
                        />
                      </label>
                      {carForm.insuranceDocument && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> {t('Uploaded', 'अपलोड है')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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

              {/* Specialized Event & Hourly Rates */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700/80 space-y-2.5">
                <label className="text-amber-400 block text-xs font-black uppercase tracking-wider flex items-center justify-between">
                  <span>💰 {t('Event & Hourly Standby Pricing', 'इवेंट व घंटे के अनुसार रेट सेटिंग')}</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">{t('optional add-ons', 'वैकल्पिक')}</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-300 block mb-1 text-[11px]">
                      {t('Hourly Standby (₹/hr)', 'घंटे का चार्ज (₹/hr)')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={carForm.perHour}
                      onChange={(e) => setCarForm({ ...carForm, perHour: e.target.value })}
                      placeholder="150"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 text-[11px]">
                      {t('Wedding Rate (+₹)', 'शादी रेट (+₹)')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={carForm.weddingRate}
                      onChange={(e) => setCarForm({ ...carForm, weddingRate: e.target.value })}
                      placeholder="500"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 text-[11px]">
                      {t('Party Rate (+₹)', 'पार्टी रेट (+₹)')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={carForm.partyRate}
                      onChange={(e) => setCarForm({ ...carForm, partyRate: e.target.value })}
                      placeholder="300"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
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
                  {cleanFileUrl(carForm.mainImage) ? (
                    <img
                      src={cleanFileUrl(carForm.mainImage)}
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

      {/* MODAL 5: ASSIGN DRIVER MODAL */}
      {assignDriverModalOpen && selectedBookingForDriver && (
        <AssignDriverModal
          isOpen={assignDriverModalOpen}
          onClose={() => setAssignDriverModalOpen(false)}
          booking={selectedBookingForDriver}
          token={token}
          onSuccess={() => {
            fetchDashboardData();
          }}
          onDriverAssigned={() => {
            fetchDashboardData();
          }}
        />
      )}

      {/* MODAL 6: DIGITAL PASS & PROFESSIONAL INVOICE MODAL */}
      {passInvoiceModalOpen && selectedBookingForPass && (
        <TripPassInvoiceModal
          isOpen={passInvoiceModalOpen}
          onClose={() => setPassInvoiceModalOpen(false)}
          booking={selectedBookingForPass}
        />
      )}

      {/* MODAL 7: 🛡️ ANTI-FRAUD KYC REQUIRED MODAL INTERCEPT */}
      {showKycRequiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl text-white">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <ShieldCheck className="w-9 h-9 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {t('Anti-Fraud Security Policy', 'धोखाधड़ी से सुरक्षा नीति')}
                </span>
                <h3 className="font-black text-xl text-white font-heading">
                  {t('KYC Verification Required', 'केवाईसी सत्यापन आवश्यक है')}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t(
                  'To prevent phantom cars, duplicate plate listings, and payout fraud, all vehicle owners must complete KYC verification before listing cars on RAS Brother.',
                  'फर्जी गाड़ियाँ और धोखाधड़ी रोकने के लिए गाड़ी लिस्ट करने से पहले मालिक का आधार/पैन, आरसी और बैंक खाता सत्यापित होना अनिवार्य है।'
                )}
              </p>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>{t('Zero Tolerance for Fraudulent Listings', 'फर्जी लिस्टिंग पर पूर्ण रोक')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>{t('Admin matches Legal Name with Bank Account', 'नाम और बैंक खाते का मिलान')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>{t('Vehicle RC verified to protect customer trust', 'आरसी से गाड़ी का नंबर सत्यापित')}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowKycRequiredModal(false);
                  setActiveTab('kyc');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>{t('Proceed to Complete KYC Verification →', 'केवाईसी सत्यापन पूरा करें →')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowKycRequiredModal(false)}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                {t('Cancel & Do Later', 'बाद में करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: 🎧 FLIPKART-STYLE PROBLEM QUERY TICKET SUBMISSION */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">
                    {t('Raise a Problem Query', 'समस्या का टिकट दर्ज करें')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('Instant alert sent to Admin like Flipkart helpdesk', 'फ्लिपकार्ट की तरह एडमिन को तुरंत सूचना जाएगी')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTicketModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupportTicket} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">
                    {t('Problem Category *', 'समस्या की श्रेणी *')}
                  </label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Booking Issue">{t('Booking Issue', 'बुकिंग समस्या')}</option>
                    <option value="Payment / Refund">{t('Payment / Balance Settlement', 'पेमेंट या बकाया राशि')}</option>
                    <option value="Vehicle Issue">{t('Vehicle Breakdown / Problem', 'गाड़ी में खराबी')}</option>
                    <option value="Chauffeur / Driver Dispute">{t('Driver / Chauffeur Duty', 'ड्राइवर ड्यूटी समस्या')}</option>
                    <option value="Account / KYC">{t('Account / KYC Verification', 'केवाईसी व खाता समस्या')}</option>
                    <option value="Fraud / Safety Concern">{t('Fraud / Suspicious Rider Concern', 'धोखाधड़ी या सुरक्षा शंका')}</option>
                    <option value="Other">{t('Other Inquiry', 'अन्य समस्या')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">
                    {t('Urgency Priority *', 'प्राथमिकता *')}
                  </label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="urgent">🚨 {t('Urgent (Ride Currently Active)', 'अति आवश्यक (सफ़र चालू है)')}</option>
                    <option value="high">🔴 {t('High Priority', 'उच्च प्राथमिकता')}</option>
                    <option value="medium">🟡 {t('Medium Priority', 'सामान्य')}</option>
                    <option value="low">⚪ {t('Low Priority', 'कम')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  {t('Subject / Problem Title *', 'समस्या का शीर्षक *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('e.g. Passenger refused remaining payment on arrival', 'उदा. ग्राहक ने बची हुई रकम देने से मना किया')}
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  {t('Linked Booking ID (Optional)', 'संबंधित बुकिंग आईडी (वैकल्पिक)')}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 260842"
                  value={newTicketForm.bookingId}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, bookingId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  {t('Describe Problem in Detail *', 'पूरी समस्या का विवरण लिखें *')}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={t('Explain clearly what happened and what help you need from Admin...', 'साफ़ शब्दों में लिखें कि क्या हुआ और आपको क्या सहायता चाहिए...')}
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              {/* Notice */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                <span className="text-emerald-400 font-black">📲 Direct Alert:</span>
                <span>{t('Creating ticket generates a unique ticket ID and provides instant WhatsApp connection with Admin.', 'टिकट बनते ही एडमिन को व्हाट्सएप व सिस्टम अलर्ट मिल जाएगा।')}</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {submittingTicket ? (
                    <span>{t('Submitting Problem Query...', 'टिकट दर्ज हो रहा है...')}</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 stroke-[2.5]" />
                      <span>{t('Register Ticket & Alert Admin Now', 'समस्या दर्ज करें व एडमिन को अलर्ट भेजें')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: 💬 TICKET DISCUSSION & ADMIN REPLY DRAWER */}
      {selectedTicketForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-400">
                      #{selectedTicketForView.ticketId}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        selectedTicketForView.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : selectedTicketForView.status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {selectedTicketForView.status}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white truncate max-w-sm">
                    {selectedTicketForView.subject}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicketForView(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Problem Query */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {t('Original Problem Description', 'दर्ज की गई समस्या')}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedTicketForView.description}
              </p>
            </div>

            {/* Admin Official Resolution (If available) */}
            {selectedTicketForView.adminResponse?.message && (
              <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-black">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('Official Resolution by Admin', 'एडमिन समाधान')}</span>
                  </span>
                  <span className="text-[10px] text-emerald-300 font-normal">
                    {selectedTicketForView.adminResponse.resolvedAt
                      ? new Date(selectedTicketForView.adminResponse.resolvedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : ''}
                  </span>
                </div>
                <p className="text-emerald-100 font-semibold leading-relaxed">
                  {selectedTicketForView.adminResponse.message}
                </p>
                {selectedTicketForView.adminResponse.resolvedBy && (
                  <span className="text-[10px] text-emerald-300 block pt-1">
                    — {selectedTicketForView.adminResponse.resolvedBy}
                  </span>
                )}
              </div>
            )}

            {/* Discussion Thread */}
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-300 block">
                {t('Discussion Thread', 'संदेश इतिहास')} ({selectedTicketForView.messages?.length || 0})
              </span>

              {(!selectedTicketForView.messages || selectedTicketForView.messages.length === 0) ? (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  {t('No follow-up messages yet.', 'अभी कोई अतिरिक्त संदेश नहीं है।')}
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedTicketForView.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.senderRole === 'admin'
                          ? 'bg-amber-950/40 border border-amber-500/30 text-amber-100 mr-6'
                          : 'bg-slate-800 text-slate-200 ml-6'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[10px]">
                        <span className={msg.senderRole === 'admin' ? 'text-amber-400' : 'text-slate-400'}>
                          {msg.senderRole === 'admin' ? '👑 Admin Desk' : msg.senderName || 'You (Partner)'}
                        </span>
                        <span className="text-slate-500">
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send Reply Box */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('Type a message or update to admin...', 'एडमिन के लिए संदेश लिखें...')}
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendTicketReply(selectedTicketForView._id);
                    }
                  }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleSendTicketReply(selectedTicketForView._id)}
                  disabled={sendingTicketReply || !ticketReplyText.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => openSupportTicketWhatsApp(selectedTicketForView, company.phone || '9918272164', company)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('Open in WhatsApp with Admin', 'एडमिन के साथ व्हाट्सएप पर खोलें')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTicketForView(null)}
                  className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {t('Close', 'बंद करें')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useCompany } from '../context/CompanyContext';
import {
  Users,
  Car,
  Calendar,
  CreditCard,
  ShieldCheck,
  Tag,
  Settings,
  Percent,
  TrendingUp,
  CheckCircle,
  XCircle,
  Building,
  Save,
  LogOut,
  Clock,
  MapPin,
  Phone,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Printer,
  Check,
  AlertCircle,
  ExternalLink,
  Layers,
  Download,
  HardDrive,
  Database,
  Shield,
  FileJson,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboard({ onNavigate, onLogout, initialTab }) {
  const { user, token } = useAuth();
  const { showToast } = useNotification();
  const { company, setCompany, refreshCompany } = useCompany();

  const [activeTab, setActiveTab] = useState(initialTab || 'bookings'); // 'bookings' | 'customers' | 'owners' | 'backup' | 'overview' | 'kyc' | 'coupons' | 'settings'

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [kycList, setKycList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [commissionData, setCommissionData] = useState({ platformRatePercentage: 10, fixedBookingFee: 199 });

  // Separate Customer and Owner search filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [downloadingBackup, setDownloadingBackup] = useState(false);

  // Bookings monitoring state
  const [bookingsList, setBookingsList] = useState([]);
  const [bookingMetrics, setBookingMetrics] = useState({
    totalCount: 0,
    confirmedCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    pendingVerificationsCount: 0,
  });
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [bookingEventTypeFilter, setBookingEventTypeFilter] = useState('All');
  const [selectedReceiptImage, setSelectedReceiptImage] = useState(null);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  // Company settings form state
  const [settingsForm, setSettingsForm] = useState({
    companyName: company?.companyName || 'RAS Brother Tour & Travels',
    tagline: company?.tagline || 'Premium Local Car Rental & Event Transportation Marketplace',
    email: company?.email || 'contact@rasbrothertravels.com',
    phone: company?.phone || '+91 9918272164',
    altPhone: company?.altPhone || '+91 9838183127',
    address: company?.address || 'Shop 14, Main Market, Sector 18, Noida, Uttar Pradesh 201301',
    website: company?.website || 'https://rasbrothertravels.com',
    gstNumber: company?.gstNumber || '07AAAAA0000A1Z5',
    upiId: company?.upiId || '9918272164@okaxis',
  });

  // Admin Personal Profile & Password Change Form
  const [adminSecurityForm, setAdminSecurityForm] = useState({
    name: user?.name || 'Administrator',
    phone: user?.phone || '+91 9918272164',
    newPassword: '',
    confirmPassword: '',
  });
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [savingAdminSecurity, setSavingAdminSecurity] = useState(false);

  useEffect(() => {
    if (company) {
      setSettingsForm({
        companyName: company.companyName || 'RAS Brother Tour & Travels',
        tagline: company.tagline || 'Premium Local Car Rental & Event Transportation Marketplace',
        email: company.email || 'contact@rasbrothertravels.com',
        phone: company.phone || '+91 9918272164',
        altPhone: company.altPhone || '+91 9838183127',
        address: company.address || 'Shop 14, Main Market, Sector 18, Noida, Uttar Pradesh 201301',
        website: company.website || 'https://rasbrothertravels.com',
        gstNumber: company.gstNumber || '07AAAAA0000A1Z5',
        upiId: company.upiId || '9918272164@okaxis',
      });
    }
  }, [company]);

  useEffect(() => {
    if (user) {
      setAdminSecurityForm((prev) => ({
        ...prev,
        name: user.name || 'Administrator',
        phone: user.phone || '+91 9918272164',
      }));
    }
  }, [user]);

  const handleSaveAdminSecurity = async (e) => {
    e.preventDefault();
    if (adminSecurityForm.newPassword) {
      if (adminSecurityForm.newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
      if (adminSecurityForm.newPassword !== adminSecurityForm.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
    }

    setSavingAdminSecurity(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: adminSecurityForm.name,
          phone: adminSecurityForm.phone,
          password: adminSecurityForm.newPassword ? adminSecurityForm.newPassword : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Admin personal security details updated successfully!', 'success');
        localStorage.setItem('ras_user', JSON.stringify(data.user));
        setAdminSecurityForm((prev) => ({
          ...prev,
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        showToast(data.message || 'Failed to update admin security', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingAdminSecurity(false);
    }
  };

  // New coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponVal, setCouponVal] = useState(10);
  const [couponType, setCouponType] = useState('percentage');

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const params = new URLSearchParams();
      if (bookingStatusFilter && bookingStatusFilter !== 'All') {
        params.append('status', bookingStatusFilter);
      }
      if (bookingEventTypeFilter && bookingEventTypeFilter !== 'All') {
        params.append('eventType', bookingEventTypeFilter);
      }
      if (bookingSearch.trim()) {
        params.append('search', bookingSearch.trim());
      }

      const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBookingsList(data.bookings || []);
        if (data.metrics) setBookingMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch admin bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // 1. Stats
      const statRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statData = await statRes.json();
      if (statData.success) setStats(statData.stats);

      // 2. Users
      const userRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      if (userData.success) setUsersList(userData.users || []);

      // 3. KYC
      const kycRes = await fetch('/api/admin/kyc', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const kycData = await kycRes.json();
      if (kycData.success) setKycList(kycData.kycRecords || []);

      // 4. Coupons
      const coupRes = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const coupData = await coupRes.json();
      if (coupData.success) setCouponsList(coupData.coupons || []);

      // 5. Settings
      const setRes = await fetch('/api/admin/company-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const setData = await setRes.json();
      if (setData.success && setData.settings) {
        setSettingsForm(setData.settings);
      }

      // 6. Bookings
      fetchBookings();
    } catch (err) {
      console.error('Admin data fetch error:', err);
    }
  };

  useEffect(() => {
    if (token) fetchAdminData();
  }, [token]);

  useEffect(() => {
    if (token && activeTab === 'bookings') {
      fetchBookings();
    }
  }, [bookingStatusFilter, bookingEventTypeFilter]);

  // Handle Admin Booking Status Override
  const handleUpdateBookingStatus = async (bookingId, newStatus, action = null) => {
    try {
      setUpdatingBookingId(bookingId);
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Booking updated successfully', 'success');
        fetchBookings();
      } else {
        showToast(data.message || 'Failed to update booking', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Approve / Reject KYC
  const handleUpdateKyc = async (kycId, status, feedback = '') => {
    try {
      const res = await fetch(`/api/admin/kyc/${kycId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminFeedback: feedback }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`KYC marked as ${status}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          discountType: couponType,
          discountValue: Number(couponVal),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon ${couponCode} created!`, 'success');
        setCouponCode('');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id) => {
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Coupon deleted', 'info');
      fetchAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Save Company Settings / Branding
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/company-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Company branding and settings saved successfully!', 'success');
        setCompany(data.settings);
        refreshCompany();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtered customer and owner lists
  const customers = usersList.filter((u) => u.role === 'customer');
  const owners = usersList.filter((u) => u.role === 'owner');

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  const filteredOwners = owners.filter((o) => {
    if (!ownerSearch.trim()) return true;
    const q = ownerSearch.toLowerCase();
    return (
      o.name?.toLowerCase().includes(q) ||
      o.ownerProfile?.businessName?.toLowerCase().includes(q) ||
      o.phone?.includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.city?.toLowerCase().includes(q)
    );
  });

  // Handle Download Full System JSON Backup (Weekly Backup feature)
  const handleDownloadBackup = async () => {
    try {
      setDownloadingBackup(true);
      showToast('Preparing full system database snapshot...', 'info');
      const res = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.backup) {
        const jsonStr = JSON.stringify(data.backup, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `ras_brother_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Complete Database Backup (.json) downloaded successfully! All records safe.', 'success');
      } else {
        showToast(data.message || 'Backup export failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to download backup', 'error');
    } finally {
      setDownloadingBackup(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Admin Portal Top Bar (clean replacement for global navbar) */}
        <div className="flex flex-row items-center justify-between gap-2 bg-white p-3.5 sm:p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <RasLogo variant="light" size="sm" showTagline={false} />
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800 truncate hidden sm:inline">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('cars')}
                className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
              >
                <Car className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View Fleet</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Admin Header */}
        <div className="bg-slate-900 rounded-3xl p-5 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 shadow-xl">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xl shrink-0">
              ⚙️
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
                Platform Administrator Console
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-heading">
                {company.companyName}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Control center for users, KYC, revenue, coupons &amp; branding</p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none w-full md:w-auto">
            {[
              {
                id: 'bookings',
                label: `Bookings (${bookingMetrics.totalCount})`,
                badge: bookingMetrics.pendingVerificationsCount > 0 ? `${bookingMetrics.pendingVerificationsCount} verify` : null,
              },
              { id: 'customers', label: `Customers (${customers.length})` },
              { id: 'owners', label: `Fleet Owners (${owners.length})` },
              { id: 'backup', label: 'Weekly Backup 🛡️' },
              { id: 'overview', label: 'Stats' },
              { id: 'kyc', label: `KYC (${kycList.length})` },
              { id: 'coupons', label: `Coupons (${couponsList.length})` },
              { id: 'settings', label: 'Brand & UPI Settings' },
              { id: 'admin_security', label: 'Admin Security 🔐' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Fleet Bookings & Live Monitoring */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Fleet KPIs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
                  {bookingMetrics.totalCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-400" /> All-time orders
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confirmed / Active</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading mt-1">
                  {bookingMetrics.confirmedCount}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Ready for dispatch
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live On-Road</div>
                <div className="text-2xl sm:text-3xl font-black text-blue-600 font-heading mt-1">
                  {bookingMetrics.inProgressCount}
                </div>
                <div className="text-[11px] text-blue-700 font-medium mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Trips in progress
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Trips</div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading mt-1">
                  {bookingMetrics.completedCount}
                </div>
                <div className="text-[11px] text-indigo-700 font-medium mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Successfully served
                </div>
              </div>

              <div className={`rounded-3xl p-5 border shadow-sm col-span-2 sm:col-span-1 ${
                bookingMetrics.pendingVerificationsCount > 0
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20 shadow-lg'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${
                  bookingMetrics.pendingVerificationsCount > 0 ? 'text-slate-900 font-black' : 'text-slate-400'
                }`}>
                  Verify Payments
                </div>
                <div className="text-2xl sm:text-3xl font-black font-heading mt-1">
                  {bookingMetrics.pendingVerificationsCount}
                </div>
                <div className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${
                  bookingMetrics.pendingVerificationsCount > 0 ? 'text-slate-950 underline' : 'text-slate-400'
                }`}>
                  <AlertCircle className="w-3 h-3" /> Pending UTR checks
                </div>
              </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchBookings();
                }}
                className="flex-1 w-full relative"
              >
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, mobile, car model, booking ID, UTR #, owner..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-amber-500 focus:outline-none transition"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="pending_verification">Pending UTR Verification</option>
                  <option value="pending">Pending Acceptance</option>
                  <option value="confirmed">Confirmed / Ready</option>
                  <option value="in_progress">Live / In Progress</option>
                  <option value="completed">Completed Trips</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={bookingEventTypeFilter}
                  onChange={(e) => setBookingEventTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Event Types</option>
                  <option value="Wedding Special">Wedding Special</option>
                  <option value="Special Event">Special Event</option>
                  <option value="Hourly Rental">Hourly Rental</option>
                </select>

                <button
                  type="button"
                  onClick={() => fetchBookings()}
                  disabled={loadingBookings}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                  title="Refresh bookings list"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
                  title="Print dispatch manifest"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print Dispatch</span>
                </button>
              </div>
            </div>

            {/* Bookings List Cards */}
            {loadingBookings && bookingsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Loading fleet booking records...</p>
              </div>
            ) : bookingsList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
                <Car className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-black text-slate-800">No Bookings Found</h3>
                <p className="text-xs text-slate-400">
                  No reservations match the selected search or status filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingsList.map((b) => {
                  const customerName = b.customer?.name || b.offlineCustomer?.name || 'Guest User';
                  const customerPhone = b.customer?.phone || b.offlineCustomer?.phone || '';
                  const customerEmail = b.customer?.email || 'N/A';
                  const carTitle = b.car ? `${b.car.brand} ${b.car.name}` : 'Custom Vehicle';
                  const ownerName = b.owner?.name || 'Direct / RAS Fleet';
                  const ownerPhone = b.owner?.phone || '';
                  const rawPhone = customerPhone.replace(/\D/g, '');

                  return (
                    <div
                      key={b._id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4"
                    >
                      {/* Booking Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black font-mono px-3 py-1 rounded-xl bg-slate-900 text-amber-400 tracking-wider">
                            #{b.bookingId || b._id.slice(-8).toUpperCase()}
                          </span>

                          {(b.isBulkBooking || b.bulkBookingId) && (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                              🚗 Convoy Order #{b.bulkBookingId || 'BULK'}
                            </span>
                          )}

                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                            {b.eventType || 'Special Event'}
                          </span>

                          <span className="text-[11px] text-slate-400">
                            Booked on: {new Date(b.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {b.paymentVerificationStatus === 'pending_verification' && (
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse">
                              <AlertCircle className="w-3 h-3" /> UTR Pending
                            </span>
                          )}

                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : b.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : b.status === 'completed'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : b.status === 'cancelled'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {b.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* 4-Column Booking Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        {/* 1. Customer Info */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Customer Details
                          </div>
                          <div className="font-black text-slate-900 text-sm">{customerName}</div>
                          {customerPhone ? (
                            <div className="flex items-center gap-2 pt-0.5">
                              <a
                                href={`tel:${customerPhone}`}
                                className="font-semibold text-slate-700 hover:text-amber-600 flex items-center gap-1 underline"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                {customerPhone}
                              </a>
                              {rawPhone && (
                                <a
                                  href={`https://wa.me/91${rawPhone}?text=Hello%20${encodeURIComponent(customerName)},%20regarding%20your%20car%20booking%20%23${b.bookingId}%20with%20RAS%20Brother%20Tour%20%26%20Travels.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black transition"
                                >
                                  WhatsApp
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="text-slate-400">No phone provided</div>
                          )}
                          <div className="text-slate-500 truncate">{customerEmail}</div>
                        </div>

                        {/* 2. Booked Vehicle & Owner */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Assigned Car & Fleet Owner
                          </div>
                          <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-amber-500" />
                            {carTitle}
                          </div>
                          <div className="font-mono text-slate-700 font-bold">
                            Plate: {b.car?.licensePlate || 'Pending Allocation'}
                          </div>
                          <div className="text-slate-600 pt-0.5">
                            <span className="text-slate-400">Owner:</span> {ownerName}
                            {ownerPhone && ` (${ownerPhone})`}
                          </div>
                        </div>

                        {/* 3. Venue & Schedule */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Venue & Route Dispatch
                          </div>
                          <div className="font-bold text-slate-800 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {b.sourceAddress || b.pickupLocation?.address || 'Pickup Venue Not Specified'}
                            </span>
                          </div>
                          {b.destinationAddress && (
                            <div className="text-slate-500 line-clamp-1">
                              To: {b.destinationAddress}
                            </div>
                          )}
                          <div className="text-slate-700 font-semibold flex items-center gap-1 pt-0.5">
                            <Calendar className="w-3 h-3 text-amber-500" />
                            {new Date(b.startDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {b.reportingTime && ` • ${b.reportingTime}`}
                          </div>
                        </div>

                        {/* 4. Payment, UTR & Security OTP */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>Payment & Security</span>
                            <span className="font-black text-slate-900">
                              ₹{(b.pricing?.totalPrice || b.totalAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 flex justify-between">
                            <span>Advance: ₹{(b.pricing?.advanceAmount || b.advancePaid || 0).toLocaleString('en-IN')}</span>
                            <span className="text-rose-600 font-bold">
                              Due: ₹{Math.max(0, (b.pricing?.totalPrice || b.totalAmount || 0) - (b.pricing?.advanceAmount || b.advancePaid || 0)).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="font-mono text-slate-800 font-semibold bg-white px-2 py-1 rounded-lg border border-slate-200 flex items-center justify-between">
                            <span className="text-slate-400 text-[10px]">UTR:</span>
                            <span className="font-bold">{b.utrNumber || 'No UTR'}</span>
                            {b.paymentScreenshot && (
                              <button
                                type="button"
                                onClick={() => setSelectedReceiptImage(b.paymentScreenshot)}
                                className="text-[10px] text-amber-600 hover:text-amber-700 font-black underline flex items-center gap-0.5"
                              >
                                <Eye className="w-2.5 h-2.5" /> View Receipt
                              </button>
                            )}
                          </div>

                          {/* Security OTP */}
                          <div className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-800 uppercase">Trip Start OTP</span>
                            <span className="text-xs font-black font-mono text-slate-950 tracking-wider">
                              {b.startOtp || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Quick Action Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-3xl">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span>HQ Status Override:</span>
                          <select
                            disabled={updatingBookingId === b._id}
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          {b.paymentVerificationStatus === 'pending_verification' && (
                            <button
                              type="button"
                              disabled={updatingBookingId === b._id}
                              onClick={() => handleUpdateBookingStatus(b._id, 'confirmed', 'verify_payment')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Verify Payment &amp; Confirm Booking
                            </button>
                          )}

                          {b.paymentScreenshot && (
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptImage(b.paymentScreenshot)}
                              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Receipt Screenshot
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Platform Stats */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase">Total Customers</div>
              <div className="text-3xl font-black text-slate-900 font-heading mt-1">
                {stats?.totalCustomers || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active event planners</div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase">Registered Fleet Owners</div>
              <div className="text-3xl font-black text-slate-900 font-heading mt-1">
                {stats?.totalOwners || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Verified partner vendors</div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase">Total Vehicles Listed</div>
              <div className="text-3xl font-black text-slate-900 font-heading mt-1">
                {stats?.totalCars || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active in marketplace</div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase">Gross Platform Volume</div>
              <div className="text-3xl font-black text-emerald-600 font-heading mt-1">
                ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                Est. Commission: ₹{stats?.commission?.toLocaleString('en-IN') || 0}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Customers Directory */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-heading">
                  Customer Directory ({filteredCustomers.length})
                </h2>
                <p className="text-xs text-slate-500">Registered customers, ride history, and total spending.</p>
              </div>

              <div className="w-full sm:w-72 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, email, phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No customer records match your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="pb-3">Customer Name</th>
                      <th className="pb-3">Contact Details</th>
                      <th className="pb-3">City / Area</th>
                      <th className="pb-3 text-center">Bookings</th>
                      <th className="pb-3 text-right">Total Spent</th>
                      <th className="pb-3 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredCustomers.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {c.name?.charAt(0) || 'C'}
                          </div>
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3">
                          <div className="text-slate-900 font-semibold">{c.phone || 'No phone'}</div>
                          <div className="text-slate-400 text-[11px]">{c.email}</div>
                        </td>
                        <td className="py-3 text-slate-600">{c.city || c.address || 'Delhi NCR'}</td>
                        <td className="py-3 text-center font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {c.bookingsCount || 0} rides
                          </span>
                        </td>
                        <td className="py-3 text-right font-black text-emerald-600 font-mono">
                          ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 text-right text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Fleet Owners Directory */}
        {activeTab === 'owners' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-heading">
                  Fleet Owners &amp; Vendors ({filteredOwners.length})
                </h2>
                <p className="text-xs text-slate-500">Car suppliers, fleet size, business names, and KYC verification.</p>
              </div>

              <div className="w-full sm:w-72 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search owner, business name, phone..."
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {filteredOwners.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No fleet owner records match your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="pb-3">Owner / Partner</th>
                      <th className="pb-3">Business Fleet Title</th>
                      <th className="pb-3">Contact</th>
                      <th className="pb-3 text-center">Listed Cars</th>
                      <th className="pb-3">Operating Location</th>
                      <th className="pb-3 text-right">KYC Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredOwners.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {o.name?.charAt(0) || 'O'}
                          </div>
                          <span>{o.name}</span>
                        </td>
                        <td className="py-3 font-bold text-slate-800">
                          {o.ownerProfile?.businessName || `${o.name} Fleet`}
                        </td>
                        <td className="py-3">
                          <div className="text-slate-900 font-semibold">{o.phone || 'No phone'}</div>
                          <div className="text-slate-400 text-[11px]">{o.email}</div>
                        </td>
                        <td className="py-3 text-center font-black">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                            🚗 {o.carsCount || 0} Cars
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">{o.city || o.address || 'Delhi NCR'}</td>
                        <td className="py-3 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.isVerified ? 'Verified' : 'Pending KYC'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Weekly Data Backup & Disaster Recovery */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> DATA PROTECTION &amp; ZERO-DATA-LOSS GUARANTEE
                </span>
                <h2 className="text-xl font-black text-slate-900 font-heading mt-0.5">
                  Database Backup &amp; Weekly Snapshot Console
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Export complete database records anytime. Automated weekly snapshots run every Sunday at 00:00 UTC.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={downloadingBackup}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition shrink-0"
              >
                <Download className="w-4 h-4" />
                {downloadingBackup ? 'Exporting Database...' : 'Download Full Backup (.json)'}
              </button>
            </div>

            {/* Backup Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="text-emerald-800 font-extrabold uppercase text-[10px]">Weekly Cloud Schedule</div>
                <div className="text-lg font-black text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Weekly Auto-Backup Active</span>
                </div>
                <p className="text-[11px] text-emerald-700">Runs automatically every 7 days (Sunday 00:00 UTC).</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-slate-500 font-extrabold uppercase text-[10px]">Protected Collections</div>
                <div className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                  <Database className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>7 Full MongoDB Collections</span>
                </div>
                <p className="text-[11px] text-slate-500">Users, Owners, Cars, Bookings, Payments, KYC, Settings.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-slate-500 font-extrabold uppercase text-[10px]">Export Format</div>
                <div className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                  <FileJson className="w-5 h-5 text-blue-500 shrink-0" />
                  <span>Universal JSON Archive</span>
                </div>
                <p className="text-[11px] text-slate-500">Easily restorable to MongoDB Atlas or local MongoDB instance.</p>
              </div>
            </div>

            {/* Collections Breakdown Table */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-sm text-slate-900">
                Data Volume Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="pb-2.5">Database Collection</th>
                      <th className="pb-2.5">Data Category</th>
                      <th className="pb-2.5 text-center">Active Records</th>
                      <th className="pb-2.5 text-right">Backup Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="py-2.5 font-bold font-mono">users</td>
                      <td className="py-2.5">Customers, Admins &amp; Vendor Logins</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{usersList.length}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">✓ Protected</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold font-mono">cars</td>
                      <td className="py-2.5">Vehicle Fleet, Rates, Fuel Policy, Availability</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{stats?.totalCars || 0}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">✓ Protected</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold font-mono">bookings</td>
                      <td className="py-2.5">Reservations, Ride Verification OTPs, Routes</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{bookingMetrics.totalCount || 0}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">✓ Protected</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold font-mono">ownerprofiles</td>
                      <td className="py-2.5">Fleet Vendor Businesses &amp; Wallets</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{owners.length}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">✓ Protected</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold font-mono">kycrecords</td>
                      <td className="py-2.5">Aadhaar, Driving License, RC Documents</td>
                      <td className="py-2.5 text-center font-bold text-slate-900">{kycList.length}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">✓ Protected</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: KYC Approvals */}
        {activeTab === 'kyc' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 font-heading">
              Vendor KYC Verification Queue
            </h2>

            {kycList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No KYC documents pending review.
              </div>
            ) : (
              <div className="space-y-4">
                {kycList.map((k) => (
                  <div
                    key={k._id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {k.user?.name} ({k.user?.phone})
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        Document: <span className="font-bold">{k.idType}</span> • ID Number: <span className="font-mono">{k.idNumber}</span>
                      </div>
                      {k.documentFront && (
                        <a
                          href={k.documentFront}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-600 font-bold underline mt-1 inline-block"
                        >
                          View Uploaded Document
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="uppercase font-bold text-[10px] px-2.5 py-1 rounded-full bg-slate-200">
                        {k.status}
                      </span>
                      {k.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateKyc(k._id, 'verified')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateKyc(k._id, 'rejected', 'Image unclear')}
                            className="px-3.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Coupons */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Create Promotional Coupon</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER15"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponVal}
                    onChange={(e) => setCouponVal(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  Create Coupon
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Active Coupons</h3>
              <div className="space-y-2">
                {couponsList.map((cp) => (
                  <div
                    key={cp._id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-mono font-black text-amber-700 text-sm">{cp.code}</span>
                      <div className="text-slate-500 mt-0.5">
                        {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} FLAT OFF`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(cp._id)}
                      className="text-red-500 hover:underline font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Brand & Company Settings and Admin Security */}
        {(activeTab === 'settings' || activeTab === 'admin_security') && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-heading">
                Company Brand &amp; Marketplace Settings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize the official company name, logos, and support details for RAS Brother Tour &amp; Travels.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.companyName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Primary Helpline Phone (Live on UI)</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Alternative Phone</label>
                  <input
                    type="text"
                    value={settingsForm.altPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, altPhone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              {/* UPI ID for Payments */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <label className="block text-emerald-900 font-black text-xs uppercase tracking-wider">
                  💳 Platform Booking UPI ID (Live on Customer Payment QR &amp; Booking Modal)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9918272164@okaxis or rasbrother@okaxis"
                  value={settingsForm.upiId}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                  className="w-full p-3 rounded-xl border border-emerald-300 bg-white font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <p className="text-[11px] text-emerald-700">
                  Changing this UPI ID will instantly update the QR Code and UPI Payment link for all users booking cars on the site.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={settingsForm.gstNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gstNumber: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Official Office Address (Live on Contact &amp; Footer)</label>
                <textarea
                  rows="2"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={settingsForm.website}
                  onChange={(e) => setSettingsForm({ ...settingsForm, website: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Brand &amp; UPI Settings (Update Live on UI)
              </button>
            </form>

            {/* Admin Personal Account & Security Section */}
            <div className="mt-10 pt-8 border-t border-slate-200 space-y-4 max-w-2xl">
              <div>
                <h3 className="text-base font-black text-slate-900 font-heading">
                  🔐 Administrator Personal Profile &amp; Password
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your admin login password, phone number, and name.
                </p>
              </div>

              <form onSubmit={handleSaveAdminSecurity} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Admin Name</label>
                    <input
                      type="text"
                      required
                      value={adminSecurityForm.name}
                      onChange={(e) => setAdminSecurityForm({ ...adminSecurityForm, name: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Admin Personal Phone</label>
                    <input
                      type="tel"
                      required
                      value={adminSecurityForm.phone}
                      onChange={(e) => setAdminSecurityForm({ ...adminSecurityForm, phone: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">New Admin Password</label>
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={adminSecurityForm.newPassword}
                      onChange={(e) => setAdminSecurityForm({ ...adminSecurityForm, newPassword: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      minLength={6}
                      placeholder="Repeat new password"
                      value={adminSecurityForm.confirmPassword}
                      onChange={(e) => setAdminSecurityForm({ ...adminSecurityForm, confirmPassword: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showAdminPassCheck"
                    checked={showAdminPass}
                    onChange={(e) => setShowAdminPass(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <label htmlFor="showAdminPassCheck" className="text-xs text-slate-600 cursor-pointer">
                    Show Password
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingAdminSecurity}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center gap-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {savingAdminSecurity ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Admin Password &amp; Profile
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Receipt Screenshot Modal */}
        {selectedReceiptImage && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black text-slate-900 font-heading">
                    Customer Payment Proof (Receipt Screenshot)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptImage(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900/5 max-h-[65vh] flex items-center justify-center p-2">
                <img
                  src={selectedReceiptImage}
                  alt="Payment Receipt"
                  className="max-h-[60vh] w-auto object-contain rounded-xl shadow"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={selectedReceiptImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution Image
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedReceiptImage(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

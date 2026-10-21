import React, { useState, useEffect } from 'react';
import RasLogo from '../brand/RasLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Home,
  Car,
  Sparkles,
  ShieldCheck,
  Users,
  Info,
  PhoneCall,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Smartphone,
  Phone,
  Zap,
  HandCoins,
  CreditCard,
  Tag,
  HardDrive,
  Settings,
  Shield,
  PlusCircle,
  CheckCircle,
  LayoutDashboard,
  Crown,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function Navbar({ onNavigate, currentPage, pageParams = {} }) {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { t } = useLanguage();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (/android|iphone|ipad/i.test(navigator.userAgent || '')) {
      setShowInstallBtn(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') setShowInstallBtn(false);
      setDeferredPrompt(null);
    } else {
      alert(
        t(
          '📲 To install RAS Brother Tour & Travels app on your phone:\n\n1. In Chrome: Tap the 3 dots (⋮) and select "Add to Home screen" / "Install app"\n2. In Safari (iOS): Tap the Share button (⎋) and select "Add to Home Screen"',
          '📲 फोन में ऐप इंस्टॉल करने के लिए:\n\n1. Chrome में: ऊपर 3 डॉट्स (⋮) दबाएं और "Install app" चुनें\n2. Safari में: शेयर बटन (⎋) दबाएं और "Add to Home Screen" चुनें'
        )
      );
    }
  };

  const getDashboardPage = () => {
    if (role === 'admin') return 'admin-dashboard';
    if (role === 'owner') return 'owner-dashboard';
    return 'customer-dashboard';
  };

  const handleLinkClick = (page, params = {}) => {
    onNavigate(page, params);
    setMobileMenuOpen(false);
  };

  // Close mobile drawer when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Dynamic Navigation Links based on User Role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: t('Home', 'होम'), page: 'home', icon: Home },
        { label: t('Cars Fleet', 'लग्जरी गाड़ियाँ'), page: 'cars', icon: Car, badge: cartCount > 0 ? cartCount : null },
        { label: t('Services', 'सेवाएं'), page: 'services', icon: Sparkles },
        { label: t('How It Works', 'प्रक्रिया'), page: 'how-it-works', icon: ShieldCheck },
        { label: t('Partner', 'पार्टनर बनें'), page: 'partner', icon: Users, hideOnSmallDesktop: true },
        { label: t('Contact 24/7', 'संपर्क 24/7'), page: 'contact', icon: PhoneCall },
      ];
    }

    if (role === 'customer') {
      return [
        {
          label: t('👑 My Dashboard', '👑 मेरा डैशबोर्ड'),
          page: 'customer-dashboard',
          params: { tab: 'bookings' },
          icon: Crown,
          isHighlight: true,
          badgeText: t('MAIN', 'मुख्य'),
        },
        {
          label: t('🚗 Book Nearest Car', '🚗 गाड़ियाँ खोजें व बुक करें'),
          page: 'cars',
          icon: Car,
          badge: cartCount > 0 ? cartCount : null,
        },
        {
          label: t('📅 My Bookings & Trips', '📅 मेरी बुकिंग्स व पास'),
          page: 'customer-dashboard',
          params: { tab: 'bookings' },
          icon: Calendar,
        },
        {
          label: t('💰 My Price Offers', '💰 मेरे रेट ऑफर्स'),
          page: 'customer-dashboard',
          params: { tab: 'offers' },
          icon: HandCoins,
        },
        {
          label: t('💳 Payment Receipts', '💳 रसीद व पेमेंट्स'),
          page: 'customer-dashboard',
          params: { tab: 'payments' },
          icon: CreditCard,
        },
        {
          label: t('👤 My Profile & Details', '👤 मेरी प्रोफाइल'),
          page: 'customer-dashboard',
          params: { tab: 'profile' },
          icon: User,
        },
        {
          label: t('🎧 Help & Problem Query', '🎧 सहायता व समस्या केंद्र'),
          page: 'customer-dashboard',
          params: { tab: 'support' },
          icon: MessageSquare,
        },
        {
          label: t('📞 24x7 Helpdesk', '📞 सहायता केंद्र'),
          page: 'contact',
          icon: PhoneCall,
        },
      ];
    }

    if (role === 'owner') {
      return [
        {
          label: t('👑 My Dashboard', '👑 मेरा डैशबोर्ड'),
          page: 'owner-dashboard',
          params: { tab: 'cars' },
          icon: Crown,
          isHighlight: true,
          badgeText: t('MAIN', 'मुख्य'),
        },
        {
          label: t('🚘 My Fleet Vehicles', '🚘 मेरी गाड़ियाँ'),
          page: 'owner-dashboard',
          params: { tab: 'cars' },
          icon: Car,
        },
        {
          label: t('🛡️ KYC Anti-Fraud Verification', '🛡️ केवाईसी सत्यापन'),
          page: 'owner-dashboard',
          params: { tab: 'kyc' },
          icon: ShieldCheck,
        },
        {
          label: t('📋 Rental Orders & Trips', '📋 बुकिंग ऑर्डर्स'),
          page: 'owner-dashboard',
          params: { tab: 'bookings' },
          icon: Calendar,
        },
        {
          label: t('💰 Customer Price Offers', '💰 ग्राहकों के रेट ऑफर्स'),
          page: 'owner-dashboard',
          params: { tab: 'offers' },
          icon: HandCoins,
        },
        {
          label: t('➕ Add Vehicle to Fleet', '➕ नई गाड़ी जोड़ें'),
          page: 'owner-dashboard',
          params: { tab: 'add-car' },
          icon: PlusCircle,
        },
        {
          label: t('🎧 Help & Problem Desk', '🎧 समस्या हेल्पडेस्क'),
          page: 'owner-dashboard',
          params: { tab: 'support' },
          icon: MessageSquare,
        },
        {
          label: t('👤 Owner Profile & Agency', '👤 प्रोफाइल सेटिंग्स'),
          page: 'owner-dashboard',
          params: { tab: 'profile' },
          icon: User,
        },
        {
          label: t('📞 Owner Helpdesk', '📞 पार्टनर सहायता'),
          page: 'contact',
          icon: PhoneCall,
        },
      ];
    }

    if (role === 'admin') {
      return [
        {
          label: t('👑 My Dashboard', '👑 मेरा डैशबोर्ड'),
          page: 'admin-dashboard',
          params: { tab: 'overview' },
          icon: Crown,
          isHighlight: true,
          badgeText: t('MAIN', 'मुख्य'),
        },
        {
          label: t('📋 All Bookings & Revenue', '📋 सभी बुकिंग्स व आय'),
          page: 'admin-dashboard',
          params: { tab: 'bookings' },
          icon: Calendar,
        },
        {
          label: t('🚗 Fleet Inventory', '🚗 संपूर्ण गाड़ियाँ'),
          page: 'cars',
          icon: Car,
        },
        {
          label: t('👥 Customer Accounts', '👥 कस्टमर लिस्ट'),
          page: 'admin-dashboard',
          params: { tab: 'customers' },
          icon: Users,
        },
        {
          label: t('🏢 Fleet Owner Partners', '🏢 कार मालिक'),
          page: 'admin-dashboard',
          params: { tab: 'owners' },
          icon: ShieldCheck,
        },
        {
          label: t('🛡️ KYC Verifications', '🛡️ सत्यापन (KYC)'),
          page: 'admin-dashboard',
          params: { tab: 'kyc' },
          icon: CheckCircle,
        },
        {
          label: t('🎧 Support Problem Helpdesk', '🎧 समस्या हेल्पडेस्क'),
          page: 'admin-dashboard',
          params: { tab: 'helpdesk' },
          icon: MessageSquare,
        },
        {
          label: t('🎟️ Promo Coupons', '🎟️ डिस्काउंट कूपन'),
          page: 'admin-dashboard',
          params: { tab: 'coupons' },
          icon: Tag,
        },
        {
          label: t('💾 Weekly System Backup', '💾 डेटा बैकअप'),
          page: 'admin-dashboard',
          params: { tab: 'backup' },
          icon: HardDrive,
        },
        {
          label: t('⚙️ Brand & UPI Settings', '⚙️ सेटिंग्स व UPI'),
          page: 'admin-dashboard',
          params: { tab: 'settings' },
          icon: Settings,
        },
        {
          label: t('🔒 Admin Profile & Security', '🔒 एडमिन सुरक्षा व प्रोफाइल'),
          page: 'admin-dashboard',
          params: { tab: 'admin_security' },
          icon: Shield,
        },
        {
          label: t('📞 Contact Enquiries', '📞 संपर्क संदेश'),
          page: 'contact',
          icon: PhoneCall,
        },
      ];
    }

    return [];
  };

  const isLinkActive = (link) => {
    if (currentPage !== link.page) return false;
    if (link.params?.tab) {
      if (pageParams?.tab) {
        return pageParams.tab === link.params.tab;
      }
      if (link.page === 'customer-dashboard') return link.params.tab === 'bookings';
      if (link.page === 'owner-dashboard') return link.params.tab === 'cars';
      if (link.page === 'admin-dashboard') return link.params.tab === 'overview';
    }
    return true;
  };

  const getMenuHeading = () => {
    if (!isAuthenticated) return t('EXPLORE MARKETPLACE', 'एक्सप्लोर करें');
    if (role === 'customer') return t('CUSTOMER CONCIERGE', 'कस्टमर मेनू');
    if (role === 'owner') return t('FLEET OWNER CONSOLE', 'कार मालिक मेनू');
    if (role === 'admin') return t('ADMIN CONTROL PANEL', 'एडमिन कंट्रोल पैनल');
    return t('NAVIGATION', 'नेविगेशन');
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* =================================================================== */}
      {/* 1A. GUEST TOP NAVBAR (Visible on screens >= 1024px when NOT logged in) */}
      {/* =================================================================== */}
      {!isAuthenticated && (
        <header className="hidden lg:block sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 shadow-xl select-none w-full max-w-full overflow-x-hidden">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-18 sm:h-20 flex items-center justify-between gap-2 xl:gap-3">
            {/* Left: Brand Logo */}
            <div
              onClick={() => handleLinkClick('home')}
              className="cursor-pointer group flex items-center transition-transform hover:scale-[1.02] shrink-0"
              title="RAS Brother Tour & Travels"
            >
              <RasLogo variant="dark" size="sm" showTagline={false} />
            </div>

            {/* Center: Top Navigation Links */}
            <nav className="flex items-center gap-1 xl:gap-1.5 shrink min-w-0">
              {navLinks.map((link, idx) => {
                const Icon = link.icon;
                const active = isLinkActive(link);

                return (
                  <button
                    key={`top-nav-${link.page}-${idx}`}
                    onClick={() => handleLinkClick(link.page, link.params || {})}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                      link.hideOnSmallDesktop ? 'hidden xl:flex' : ''
                    } ${
                      active
                        ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-400 border border-amber-500/40 shadow-sm font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`} />
                    <span className="whitespace-nowrap">{link.label}</span>
                    {link.badge && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: 24/7 Helpline, Language Toggle, Login & Register */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:+919450909581"
                className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/30 transition text-xs font-bold shadow-sm"
                title="24/7 Helpline"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-mono tracking-tight">+91 94509 09581</span>
              </a>

              <LanguageToggle variant="dark" />

              <button
                type="button"
                onClick={() => handleLinkClick('login')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-700 transition cursor-pointer shadow-sm shrink-0"
              >
                {t('Login', 'लॉगिन')}
              </button>

              <button
                type="button"
                onClick={() => handleLinkClick('register')}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                {t('Register', 'रजिस्टर')}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* =================================================================== */}
      {/* 1B. AUTHENTICATED LEFT SIDEBAR (Desktop screens >= 1024px when LOGGED IN) */}
      {/* =================================================================== */}
      {isAuthenticated && (
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 xl:w-72 bg-slate-950 border-r border-slate-800/90 z-40 flex-col justify-between shadow-2xl select-none">
          {/* Top: Brand Logo & Role Pill */}
          <div className="p-4 xl:p-5 border-b border-slate-800/80 space-y-2.5">
            <div
              onClick={() => handleLinkClick(getDashboardPage())}
              className="cursor-pointer group flex items-center transition-transform hover:scale-[1.02]"
              title="RAS Brother Tour & Travels"
            >
              <RasLogo variant="dark" size="sm" showTagline={true} />
            </div>

            {/* Role Status Tag */}
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase border ${
                  role === 'admin'
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : role === 'owner'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : role === 'customer'
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {`${role} Portal`}
              </span>
            </div>
          </div>

          {/* Middle: Role Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 mb-2 flex items-center justify-between">
              <span>{getMenuHeading()}</span>
              <span className="text-[9px] text-amber-500 font-bold">● Active</span>
            </div>

            {navLinks.map((link, idx) => {
              const Icon = link.icon;
              const active = isLinkActive(link);
              const isTopDashboard = link.isHighlight;

              return (
                <button
                  key={`${link.page}-${link.params?.tab || idx}`}
                  onClick={() => handleLinkClick(link.page, link.params || {})}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group text-left cursor-pointer ${
                    isTopDashboard
                      ? active
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 border border-amber-300 shadow-lg shadow-amber-500/20 font-black'
                        : 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 hover:text-white hover:from-amber-500/30 border border-amber-500/40 shadow-sm'
                      : active
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-xl transition shrink-0 ${
                        isTopDashboard
                          ? active
                            ? 'bg-slate-950 text-amber-400'
                            : 'bg-amber-500 text-slate-950 font-black'
                          : active
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{link.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {link.badgeText && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          active && isTopDashboard
                            ? 'bg-slate-950 text-amber-400'
                            : 'bg-amber-500/30 text-amber-300'
                        }`}
                      >
                        {link.badgeText}
                      </span>
                    )}
                    {link.badge && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                    {active && !link.badge && !link.badgeText && (
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 opacity-90" />
                    )}
                  </div>
                </button>
              );
            })}

            {/* Quick Action Button for Customer */}
            {role === 'customer' && (
              <div className="pt-3 px-1">
                <button
                  onClick={() => handleLinkClick('cars')}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{t('⚡ Find & Book Cars', '⚡ गाड़ियाँ खोजें व बुक करें')}</span>
                </button>
              </div>
            )}

            {/* Quick Action Button for Owner */}
            {role === 'owner' && (
              <div className="pt-3 px-1">
                <button
                  onClick={() => handleLinkClick('owner-dashboard', { tab: 'add-car' })}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('➕ Add Vehicle to Fleet', '➕ नई गाड़ी जोड़ें')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Section: Language, PWA, User Info / Logout */}
          <div className="p-3.5 xl:p-4 border-t border-slate-800/80 bg-slate-950/90 space-y-3">
            {/* Language Switcher & Install Pill */}
            <div className="flex items-center justify-between gap-2">
              <LanguageToggle variant="dark" />

              {showInstallBtn && (
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Install App"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>{t('App', 'ऐप')}</span>
                </button>
              )}
            </div>

            {/* User Auth Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div
                  onClick={() => handleLinkClick(getDashboardPage(), { tab: 'profile' })}
                  className="flex items-center gap-2.5 cursor-pointer min-w-0 group"
                  title="View / Edit Profile"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xs uppercase overflow-hidden shrink-0 group-hover:ring-2 ring-amber-400 transition">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition">
                      {user?.name}
                    </div>
                    <div className="text-[10px] text-amber-400 capitalize">
                      {role === 'owner' ? user?.ownerProfile?.businessName || 'Fleet Partner' : `${role} Profile`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="desktop-logout-btn"
                  aria-label="Logout"
                  onClick={() => {
                    logout();
                    handleLinkClick('home');
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title={t('Logout', 'लॉगआउट')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => handleLinkClick(getDashboardPage(), { tab: 'profile' })}
                  className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <User className="w-3 h-3 text-amber-400" />
                  <span>{t('Profile', 'प्रोफाइल')}</span>
                </button>
                <button
                  onClick={() => handleLinkClick(getDashboardPage())}
                  className="py-1.5 px-2 rounded-xl text-[10px] font-black bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 transition text-center cursor-pointer"
                >
                  {t('Dashboard →', 'डैशबोर्ड →')}
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* =================================================================== */}
      {/* 2. MOBILE TOP BAR (Visible on screens < 1024px)                     */}
      {/* =================================================================== */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-lg w-full max-w-full overflow-x-hidden">
        {/* Left: Hamburger Button that opens Left Drawer */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            aria-label="Open Left Navigation Menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => handleLinkClick(isAuthenticated ? getDashboardPage() : 'home')}
            className="cursor-pointer"
          >
            <RasLogo variant="dark" size="xs" showTagline={false} />
          </div>
        </div>

        {/* Right: Phone Call, Language Toggle & Quick Auth / Dashboard */}
        <div className="flex items-center gap-1.5">
          {!isAuthenticated && (
            <a
              href="tel:+919450909581"
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-white transition shadow-sm flex items-center justify-center"
              title="24/7 Helpline"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          <LanguageToggle variant="dark" />

          {isAuthenticated ? (
            <button
              onClick={() => handleLinkClick(getDashboardPage())}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center uppercase shadow-sm"
              title="Dashboard"
            >
              {user?.name?.charAt(0) || 'U'}
            </button>
          ) : (
            <button
              onClick={() => handleLinkClick('login')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition shadow"
            >
              {t('Login', 'लॉगिन')}
            </button>
          )}
        </div>
      </header>

      {/* =================================================================== */}
      {/* 3. MOBILE LEFT-SLIDE DRAWER (Slides smoothly from LEFT side)        */}
      {/* =================================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Left-Side Drawer Content */}
          <div className="relative w-72 sm:w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 h-full flex flex-col justify-between p-4 sm:p-5 z-50 shadow-2xl animate-in slide-in-from-left duration-300 ease-out overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
              <div
                onClick={() => handleLinkClick(isAuthenticated ? getDashboardPage() : 'home')}
                className="cursor-pointer"
              >
                <RasLogo variant="dark" size="sm" showTagline={true} />
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Role Navigation Links */}
            <div className="flex-1 py-3.5 space-y-1 overflow-y-auto">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span>{getMenuHeading()}</span>
                {isAuthenticated && (
                  <span className="text-[9px] text-amber-400 font-bold capitalize">{role}</span>
                )}
              </div>

              {navLinks.map((link, idx) => {
                const Icon = link.icon;
                const active = isLinkActive(link);
                const isTopDashboard = link.isHighlight;

                return (
                  <button
                    key={`mob-${link.page}-${link.params?.tab || idx}`}
                    onClick={() => handleLinkClick(link.page, link.params || {})}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                      isTopDashboard
                        ? active
                          ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : active
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isTopDashboard && active
                            ? 'text-slate-950'
                            : active
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{link.label}</span>
                    </div>

                    {link.badge && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Quick Action Button for Mobile */}
              {(!isAuthenticated || role === 'customer') && (
                <div className="pt-3">
                  <button
                    onClick={() => handleLinkClick('cars')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{t('⚡ Find & Book Cars', '⚡ गाड़ियाँ खोजें व बुक करें')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-3.5 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <LanguageToggle variant="dark" />
                {showInstallBtn && (
                  <button
                    type="button"
                    onClick={handleInstallPwa}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/40"
                  >
                    📱 {t('Install App', 'ऐप इंस्टॉल')}
                  </button>
                )}
              </div>

              {isAuthenticated ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleLinkClick(getDashboardPage(), { tab: 'profile' })}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow"
                  >
                    <User className="w-4 h-4" />
                    <span>{t('Edit My Profile', 'मेरी प्रोफाइल एडिट करें')}</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      onNavigate('home');
                    }}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 text-rose-400 border border-slate-800 hover:bg-rose-950/30 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('Logout', 'लॉगआउट')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleLinkClick('login')}
                    className="w-full py-2 rounded-xl text-xs font-bold text-white bg-slate-900 border border-slate-800 text-center"
                  >
                    {t('Login', 'लॉगिन')}
                  </button>
                  <button
                    onClick={() => handleLinkClick('register')}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 text-center shadow"
                  >
                    {t('Register', 'रजिस्टर')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MOBILE BOTTOM NAVIGATION DOCK (Role-tailored quick buttons)       */}
      {/* =================================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-2 flex items-center justify-around shadow-2xl select-none w-full max-w-full overflow-x-hidden">
        {/* Role 1: Customer */}
        {isAuthenticated && role === 'customer' && (
          <>
            <button
              onClick={() => handleLinkClick('customer-dashboard', { tab: 'bookings' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'customer-dashboard' && (!pageParams?.tab || pageParams?.tab === 'bookings')
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{t('Dashboard', 'डैशबोर्ड')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('cars')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition relative ${
                currentPage === 'cars' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>{t('Cars', 'गाड़ियाँ')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleLinkClick('customer-dashboard', { tab: 'offers' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'customer-dashboard' && pageParams?.tab === 'offers'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HandCoins className="w-4 h-4" />
              <span>{t('Offers', 'ऑफर्स')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('customer-dashboard', { tab: 'profile' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'customer-dashboard' && pageParams?.tab === 'profile'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('Profile', 'प्रोफाइल')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('contact')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'contact' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('Help', 'सपोर्ट')}</span>
            </button>
          </>
        )}

        {/* Role 2: Owner */}
        {isAuthenticated && role === 'owner' && (
          <>
            <button
              onClick={() => handleLinkClick('owner-dashboard', { tab: 'cars' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'owner-dashboard' && (!pageParams?.tab || pageParams?.tab === 'cars')
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{t('Dashboard', 'डैशबोर्ड')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('owner-dashboard', { tab: 'bookings' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'owner-dashboard' && pageParams?.tab === 'bookings'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('Orders', 'ऑर्डर्स')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('owner-dashboard', { tab: 'offers' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'owner-dashboard' && pageParams?.tab === 'offers'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HandCoins className="w-4 h-4" />
              <span>{t('Offers', 'ऑफर्स')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('owner-dashboard', { tab: 'add-car' })}
              className="flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl text-[10px] font-bold text-amber-400 hover:text-amber-300"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('+ Add', '+ जोड़ें')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('owner-dashboard', { tab: 'profile' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'owner-dashboard' && pageParams?.tab === 'profile'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('Profile', 'प्रोफाइल')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('contact')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'contact' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('Support', 'सपोर्ट')}</span>
            </button>
          </>
        )}

        {/* Role 3: Admin */}
        {isAuthenticated && role === 'admin' && (
          <>
            <button
              onClick={() => handleLinkClick('admin-dashboard', { tab: 'overview' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'admin-dashboard' && (!pageParams?.tab || pageParams?.tab === 'overview')
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{t('Dashboard', 'डैशबोर्ड')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('admin-dashboard', { tab: 'bookings' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'admin-dashboard' && pageParams?.tab === 'bookings'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('Bookings', 'बुकिंग्स')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('admin-dashboard', { tab: 'settings' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'admin-dashboard' && pageParams?.tab === 'settings'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t('UPI & Brand', 'सेटिंग्स')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('admin-dashboard', { tab: 'admin_security' })}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'admin-dashboard' && pageParams?.tab === 'admin_security'
                  ? 'text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{t('Security', 'सुरक्षा')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('contact')}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'contact' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('Contact', 'संपर्क')}</span>
            </button>
          </>
        )}

        {/* Guest */}
        {!isAuthenticated && (
          <>
            <button
              onClick={() => handleLinkClick('home')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'home' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('Home', 'होम')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('cars')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition relative ${
                currentPage === 'cars' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>{t('Cars', 'गाड़ियाँ')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 right-2 bg-amber-500 text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleLinkClick('services')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'services' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('Services', 'सेवाएं')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('contact')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'contact' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>{t('Contact', 'संपर्क')}</span>
            </button>

            <button
              onClick={() => handleLinkClick('login')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition ${
                currentPage === 'login' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('Login', 'लॉगिन')}</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
}

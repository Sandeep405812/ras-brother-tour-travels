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
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { t } = useLanguage();
  const { cartCount, setIsCartOpen } = useCart();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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

  const navLinks = [
    { label: t('Home', 'होम'), page: 'home', icon: Home },
    { label: t('Cars Fleet', 'गाड़ियाँ'), page: 'cars', icon: Car, badge: cartCount > 0 ? cartCount : null },
    { label: t('Services', 'सेवाएं'), page: 'services', icon: Sparkles },
    { label: t('How It Works', 'यह कैसे काम करता है'), page: 'how-it-works', icon: ShieldCheck },
    { label: t('Become a Partner', 'पार्टनर बनें'), page: 'partner', icon: Users },
    { label: t('About Us', 'हमारे बारे में'), page: 'about', icon: Info },
    { label: t('Contact & 24/7 Support', 'संपर्क'), page: 'contact', icon: PhoneCall },
  ];

  const handleLinkClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const getDashboardPage = () => {
    if (role === 'admin') return 'admin-dashboard';
    if (role === 'owner') return 'owner-dashboard';
    return 'customer-dashboard';
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

  return (
    <>
      {/* =================================================================== */}
      {/* 1. DESKTOP LEFT SIDEBAR NAVIGATION (Visible on screens >= 1024px) */}
      {/* =================================================================== */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 xl:w-72 bg-slate-950 border-r border-slate-800/90 z-40 flex-col justify-between shadow-2xl select-none">
        {/* Top: Brand Logo & Crest */}
        <div className="p-5 border-b border-slate-800/80">
          <div
            onClick={() => handleLinkClick('home')}
            className="cursor-pointer group flex items-center transition-transform hover:scale-[1.02]"
            title="RAS Brother Tour & Travels"
          >
            <RasLogo variant="dark" size="sm" showTagline={true} />
          </div>
        </div>

        {/* Middle: Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1.5 scrollbar-none">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 mb-2">
            {t('Navigation Menu', 'नेविगेशन मेनू')}
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.page;
            return (
              <button
                key={link.page}
                onClick={() => handleLinkClick(link.page)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-xl transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="whitespace-nowrap">{link.label}</span>
                </div>

                {link.badge && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
                {isActive && !link.badge && (
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400 opacity-80" />
                )}
              </button>
            );
          })}

          {/* Quick Ride Booking Action Button */}
          <div className="pt-4 px-1">
            <button
              onClick={() => handleLinkClick('cars')}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{t('Book Nearest Car', 'गाड़ी बुक करें')}</span>
            </button>
          </div>
        </div>

        {/* Bottom Section: Language Toggle, PWA Install & User / Auth */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-3">
          {/* Language Switcher & Install Pill */}
          <div className="flex items-center justify-between gap-2">
            <LanguageToggle variant="dark" />

            {showInstallBtn && (
              <button
                type="button"
                onClick={handleInstallPwa}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition flex items-center gap-1 shadow-sm"
                title="Install App"
              >
                <Smartphone className="w-3 h-3" />
                <span>{t('App', 'ऐप')}</span>
              </button>
            )}
          </div>

          {/* User Auth Card */}
          {isAuthenticated ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => handleLinkClick(getDashboardPage())}
                  className="flex items-center gap-2.5 cursor-pointer min-w-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xs uppercase overflow-hidden shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                    <div className="text-[10px] text-amber-400 capitalize">{role} Portal</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    handleLinkClick('home');
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleLinkClick(getDashboardPage())}
                className="mt-2 w-full py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition text-center"
              >
                {t('Go to Dashboard →', 'डैशबोर्ड खोलें →')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLinkClick('login')}
                className="w-full py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition text-center"
              >
                {t('Login', 'लॉगिन')}
              </button>
              <button
                onClick={() => handleLinkClick('register')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition text-center"
              >
                {t('Register', 'रजिस्टर')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =================================================================== */}
      {/* 2. MOBILE TOP BAR (Visible on screens < 1024px) */}
      {/* =================================================================== */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-lg">
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

          <div onClick={() => handleLinkClick('home')} className="cursor-pointer">
            <RasLogo variant="dark" size="xs" showTagline={false} />
          </div>
        </div>

        {/* Right: Language Toggle & Quick Auth / Dashboard */}
        <div className="flex items-center gap-1.5">
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
      {/* 3. MOBILE LEFT-SLIDE DRAWER (Slides smoothly from the LEFT side) */}
      {/* =================================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Left-Side Drawer Content */}
          <div className="relative w-72 sm:w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 h-full flex flex-col justify-between p-5 z-50 shadow-2xl animate-in slide-in-from-left duration-300 ease-out overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div onClick={() => handleLinkClick('home')} className="cursor-pointer">
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

            {/* Drawer Navigation Links */}
            <div className="flex-1 py-4 space-y-1 overflow-y-auto">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-2">
                {t('Navigation', 'नेविगेशन')}
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPage === link.page;
                return (
                  <button
                    key={link.page}
                    onClick={() => handleLinkClick(link.page)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                    </div>

                    {link.badge && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-3">
                <button
                  onClick={() => handleLinkClick('cars')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{t('⚡ Find & Book Cars', '⚡ गाड़ियाँ खोजें व बुक करें')}</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
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
                    onClick={() => handleLinkClick(getDashboardPage())}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{t('Open Dashboard', 'डैशबोर्ड खोलें')}</span>
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
      {/* 4. MOBILE BOTTOM NAVIGATION DOCK (Native App Feel on Mobile Screens) */}
      {/* =================================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-3 flex items-center justify-around shadow-2xl select-none">
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
          onClick={() => {
            if (isAuthenticated) handleLinkClick(getDashboardPage());
            else handleLinkClick('login');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-bold transition ${
            ['login', 'register', 'customer-dashboard', 'owner-dashboard', 'admin-dashboard'].includes(currentPage)
              ? 'text-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{isAuthenticated ? t('Portal', 'पोर्टल') : t('Login', 'लॉगिन')}</span>
        </button>
      </nav>
    </>
  );
}

import React, { useState } from 'react';
import RasLogo from '../brand/RasLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  Car,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ShoppingCart,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Also show install button on mobile browsers so user can see it
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
      alert('📲 To install RAS Brother Tour & Travels app on your phone:\n\n1. In Chrome: Tap the 3 dots (⋮) and select "Add to Home screen" / "Install app"\n2. In Safari (iOS): Tap the Share button (⎋) and select "Add to Home Screen"');
    }
  };

  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'Cars', page: 'cars' },
    { label: 'Services', page: 'services' },
    { label: 'How It Works', page: 'how-it-works' },
    { label: 'Become a Partner', page: 'partner' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' },
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

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => handleLinkClick('home')}
            className="cursor-pointer group flex items-center transition-transform hover:scale-[1.01]"
          >
            <RasLogo variant="dark" size="md" showTagline={false} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleLinkClick(link.page)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === link.page
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Wedding Fleet Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition flex items-center gap-1.5"
              title="Wedding Fleet Cart"
            >
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              {cartCount > 0 ? (
                <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-full shadow-md animate-pulse">
                  {cartCount} Cars
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-semibold hidden xl:inline">Fleet Cart</span>
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Real-time Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="relative p-2.5 rounded-full text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-84 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-3 z-50 text-slate-200">
                      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-800">
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-400" /> Notifications
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-amber-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No notifications right now
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.link) onNavigate(n.link.replace('/', ''));
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3 text-xs cursor-pointer transition hover:bg-slate-800/80 ${
                                !n.read ? 'bg-amber-500/10 border-l-2 border-amber-400' : ''
                              }`}
                            >
                              <div className="font-semibold text-slate-200">{n.title}</div>
                              <div className="text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                              <div className="text-[10px] text-slate-500 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages / Chat Pill */}
                <button
                  onClick={() => onNavigate('chat')}
                  className="p-2.5 rounded-full text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition"
                  title="Messages & Chat"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 hover:border-amber-500/50 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-xs uppercase overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="text-left text-xs leading-tight">
                      <div className="font-semibold text-white truncate max-w-[100px]">{user?.name}</div>
                      <div className="text-[10px] text-amber-400 capitalize font-medium">{role}</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 text-slate-200">
                      <div className="px-4 py-2 border-b border-slate-800 text-xs">
                        <div className="text-slate-400">Signed in as</div>
                        <div className="font-semibold text-white truncate">{user?.email}</div>
                      </div>

                      <button
                        onClick={() => {
                          onNavigate(getDashboardPage());
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                      >
                        <User className="w-4 h-4 text-amber-400" />
                        Dashboard
                      </button>

                      {role === 'customer' && (
                        <button
                          onClick={() => {
                            onNavigate('customer-dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                        >
                          <Calendar className="w-4 h-4 text-amber-400" />
                          My Bookings &amp; Offers
                        </button>
                      )}

                      {role === 'owner' && (
                        <button
                          onClick={() => {
                            onNavigate('owner-dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                        >
                          <Car className="w-4 h-4 text-amber-400" />
                          Manage Fleet &amp; Rates
                        </button>
                      )}

                      {role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin-dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 hover:bg-slate-800 text-slate-300 hover:text-amber-400"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          Admin Console
                        </button>
                      )}

                      <div className="border-t border-slate-800 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 hover:bg-red-950/40 text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Register
                </button>
              </div>
            )}

            {/* PWA Install Button */}
            {showInstallBtn && (
              <button
                type="button"
                onClick={handleInstallPwa}
                className="px-3 py-2 rounded-xl text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition flex items-center gap-1.5 shadow-sm"
              >
                📱 Install App
              </button>
            )}
          </div>

          {/* Mobile Menu Button & Fleet Cart */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition"
              title="Wedding Fleet Cart"
            >
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => onNavigate(getDashboardPage())}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-xs"
              >
                {user?.name?.charAt(0) || 'U'}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleLinkClick(link.page)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left ${
                  currentPage === link.page
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleLinkClick(getDashboardPage())}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-amber-500 text-slate-950 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" /> Go to Dashboard ({role})
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-800 text-red-400 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLinkClick('login')}
                  className="py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => handleLinkClick('register')}
                  className="py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-slate-950"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

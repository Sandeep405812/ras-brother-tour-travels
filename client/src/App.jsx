import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider, useCart } from './context/CartContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import LanguageToggle from './components/common/LanguageToggle';
import { ShoppingCart, Smartphone, X } from 'lucide-react';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import RasLogo from './components/brand/RasLogo';

import HomePage from './pages/HomePage';
import CarsPage from './pages/CarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import ServicesPage from './pages/ServicesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutContactPage from './pages/AboutContactPage';
import PartnerPage from './pages/PartnerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';

import BookingModal from './components/cars/BookingModal';
import MakeOfferModal from './components/cars/MakeOfferModal';
import BulkBookingModal from './components/cars/BulkBookingModal';
import FloatingWhatsAppButton from './components/common/FloatingWhatsAppButton';

// React Error Boundary to catch any unforeseen runtime errors and prevent blank screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl font-black mb-4">
            ⚠️
          </div>
          <h2 className="text-2xl font-black font-heading mb-2">Something went wrong</h2>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            An unexpected error occurred while loading this view. You can return to the home page safely.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-2xl shadow-xl text-sm transition"
          >
            Return to Home Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route normalization helper to map URLs and aliases into supported page identifiers
export function normalizePageName(page) {
  if (!page) return 'home';
  const clean = String(page).toLowerCase().replace(/^\/+|\/+$/g, '').trim();

  if (!clean || clean === 'home') return 'home';
  if (['cars', 'fleet', 'vehicles', 'car'].includes(clean)) return 'cars';
  if (['services', 'service', 'packages', 'tours'].includes(clean)) return 'services';
  if (['how-it-works', 'howitworks', 'process', 'how'].includes(clean)) return 'how-it-works';
  if (['partner', 'partners', 'vendor', 'vendors', 'attach-car'].includes(clean)) return 'partner';
  if (['about', 'about-us', 'aboutus'].includes(clean)) return 'about';
  if (['contact', 'contact-us', 'contactus', 'support', 'help'].includes(clean)) return 'contact';
  if (['login', 'signin', 'log-in'].includes(clean)) return 'login';
  if (['register', 'signup', 'sign-up'].includes(clean)) return 'register';
  if (['customer', 'customer-dashboard', 'my-bookings', 'dashboard'].includes(clean)) return 'customer-dashboard';
  if (['owner', 'owner-dashboard', 'vendor-dashboard'].includes(clean)) return 'owner-dashboard';
  if (['admin', 'admin-dashboard'].includes(clean)) return 'admin-dashboard';
  if (['chat', 'messages'].includes(clean)) return 'chat';
  if (['booking-confirmation', 'confirmed', 'receipt'].includes(clean)) return 'booking-confirmation';
  if (['car-details'].includes(clean)) return 'car-details';

  return 'home';
}

function FloatingInstallAppButton() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (/android|iphone|ipad/i.test(navigator.userAgent || '')) {
      setVisible(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') setVisible(false);
      setDeferredPrompt(null);
    } else {
      alert(t(
        '📲 To install app on phone:\n\n1. In Chrome: Tap 3 dots (⋮) and select "Install app" / "Add to Home screen"\n2. In Safari: Tap Share button (⎋) and select "Add to Home Screen"',
        '📲 फोन में ऐप इंस्टॉल करने के लिए:\n\n1. Chrome में: ऊपर 3 डॉट्स (⋮) दबाएं और "Install app" चुनें\n2. Safari में: शेयर बटन (⎋) दबाएं और "Add to Home Screen" चुनें'
      ));
    }
  };

  return (
    <div className="sm:hidden fixed bottom-4 left-4 z-40 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md text-white border border-amber-500/40 rounded-2xl p-1.5 pr-2.5 shadow-2xl">
      <button
        onClick={handleInstall}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:from-amber-400 transition shadow-md"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{t('📲 Install App', '📲 ऐप इंस्टॉल करें')}</span>
      </button>
      <button
        onClick={() => setVisible(false)}
        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        title={t('Close', 'बंद करें')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function FloatingFleetCartButton() {
  const { cartCount, setIsCartOpen } = useCart();
  const { t } = useLanguage();
  if (cartCount === 0) return null;
  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-slate-950 px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2 border-2 border-amber-300 transition-transform transform hover:scale-105 active:scale-95"
    >
      <span className="relative">
        <ShoppingCart className="w-4 h-4 text-slate-950" />
        <span className="absolute -top-2.5 -right-2.5 bg-slate-950 text-amber-400 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
          {cartCount}
        </span>
      </span>
      <span className="hidden sm:inline">{t(`Selected Cars (${cartCount})`, `चुनी गई गाड़ियाँ (${cartCount})`)}</span>
      <span className="sm:hidden">{t(`Cars (${cartCount})`, `गाड़ियाँ (${cartCount})`)}</span>
    </button>
  );
}

function MainLayout() {
  const { loading: authLoading, isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();

  // Initialize page from current browser pathname so direct URL navigation and refreshes work flawlessly
  const [currentPage, setCurrentPage] = useState(() => {
    return normalizePageName(window.location.pathname);
  });
  const [pageParams, setPageParams] = useState({});

  // Listen to browser Back / Forward history events
  useEffect(() => {
    const handlePopState = (e) => {
      const normalized = normalizePageName(window.location.pathname);
      setCurrentPage(normalized);
      if (e.state) {
        setPageParams(e.state);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogout = () => {
    logout();
    navigateTo('home');
  };

  // Modals state
  const [selectedCarForBooking, setSelectedCarForBooking] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [prefilledPrice, setPrefilledPrice] = useState(null);
  const [prefilledOfferId, setPrefilledOfferId] = useState(null);
  const [isOwnerDirectBooking, setIsOwnerDirectBooking] = useState(false);
  const [initialBookingDetails, setInitialBookingDetails] = useState(null);

  const [selectedCarForOffer, setSelectedCarForOffer] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  // Active chat target
  const [chatTargetUser, setChatTargetUser] = useState(null);
  const [chatBookingRef, setChatBookingRef] = useState(null);

  // Confirmed booking state
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  if (authLoading) {
    return <LoadingSpinner message="Initializing RAS Brother Tour &amp; Travels..." />;
  }

  const navigateTo = (page, params = {}) => {
    const normalized = normalizePageName(page);
    setCurrentPage(normalized);
    setPageParams(params);

    // Sync browser URL so address bar reflects current view
    const targetUrl = normalized === 'home' ? '/' : `/${normalized}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(params, '', targetUrl);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (car, customPrice = null, offerId = null, extraDetails = null) => {
    setSelectedCarForBooking(car);
    setPrefilledPrice(customPrice);
    setPrefilledOfferId(offerId);
    setIsOwnerDirectBooking(false);
    setInitialBookingDetails(extraDetails);
    setBookingModalOpen(true);
  };

  const handleOpenDirectBooking = (car) => {
    setSelectedCarForBooking(car);
    setPrefilledPrice(null);
    setPrefilledOfferId(null);
    setIsOwnerDirectBooking(true);
    setInitialBookingDetails(null);
    setBookingModalOpen(true);
  };

  const handleOpenOffer = (car) => {
    setSelectedCarForOffer(car);
    setOfferModalOpen(true);
  };

  const handleViewCarDetails = (car) => {
    navigateTo('car-details', { carId: car._id });
  };

  const handleOpenChat = (targetUser, booking = null) => {
    setChatTargetUser(targetUser);
    setChatBookingRef(booking);
    navigateTo('chat');
  };

  const handleBookingConfirmed = (booking) => {
    setConfirmedBookingData(booking);
    navigateTo('booking-confirmation');
  };

  const KNOWN_PAGES = [
    'home',
    'cars',
    'car-details',
    'services',
    'how-it-works',
    'partner',
    'about',
    'contact',
    'login',
    'register',
    'customer-dashboard',
    'owner-dashboard',
    'admin-dashboard',
    'chat',
    'booking-confirmation',
  ];

  const isAuthPage = currentPage === 'login' || currentPage === 'register';

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col ${isAuthenticated && !isAuthPage ? 'lg:flex-row' : ''} bg-slate-50 selection:bg-amber-500 selection:text-white font-sans`}>
      {/* Universal Navigation: Top Navbar for Guests, Left Sidebar for Authenticated Users, None for Auth pages */}
      {!isAuthPage && (
        <Navbar onNavigate={navigateTo} currentPage={currentPage} pageParams={pageParams} />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 min-w-0 w-full max-w-full overflow-x-hidden flex flex-col ${isAuthenticated && !isAuthPage ? 'lg:pl-64 xl:pl-72' : ''} ${!isAuthPage ? 'pb-16 lg:pb-0' : ''}`}>
        {/* Main Content Router */}
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onBookCar={handleOpenBooking}
            onMakeOfferCar={handleOpenOffer}
            onViewCarDetails={handleViewCarDetails}
          />
        )}

        {currentPage === 'cars' && (
          <CarsPage
            initialFilters={pageParams}
            onBookCar={handleOpenBooking}
            onMakeOfferCar={handleOpenOffer}
            onViewCarDetails={handleViewCarDetails}
          />
        )}

        {currentPage === 'car-details' && (
          <CarDetailsPage
            carId={pageParams.carId}
            onBack={() => navigateTo('cars')}
            onBook={handleOpenBooking}
            onMakeOffer={handleOpenOffer}
            onOpenChat={handleOpenChat}
          />
        )}

        {currentPage === 'services' && (
          <ServicesPage onNavigate={navigateTo} />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorksPage onNavigate={navigateTo} />
        )}

        {currentPage === 'partner' && (
          <PartnerPage onNavigate={navigateTo} />
        )}

        {currentPage === 'about' && (
          <AboutContactPage mode="about" onNavigate={navigateTo} />
        )}

        {currentPage === 'contact' && (
          <AboutContactPage mode="contact" onNavigate={navigateTo} />
        )}

        {currentPage === 'login' && (
          <LoginPage onNavigate={navigateTo} />
        )}

        {currentPage === 'register' && (
          <RegisterPage onNavigate={navigateTo} />
        )}

        {currentPage === 'customer-dashboard' && (
          isAuthenticated ? (
            <CustomerDashboard
              key={`customer-${pageParams?.tab || 'default'}`}
              initialTab={pageParams?.tab}
              onNavigate={navigateTo}
              onLogout={handleLogout}
              onOpenChat={handleOpenChat}
              onBookCar={handleOpenBooking}
            />
          ) : (
            <LoginPage onNavigate={navigateTo} />
          )
        )}

        {currentPage === 'owner-dashboard' && (
          isAuthenticated ? (
            <OwnerDashboard
              key={`owner-${pageParams?.tab || 'default'}`}
              initialTab={pageParams?.tab}
              onNavigate={navigateTo}
              onLogout={handleLogout}
              onOpenChat={handleOpenChat}
              onOpenDirectBooking={handleOpenDirectBooking}
            />
          ) : (
            <LoginPage onNavigate={navigateTo} />
          )
        )}

        {currentPage === 'admin-dashboard' && (
          isAuthenticated && user?.role === 'admin' ? (
            <AdminDashboard
              key={`admin-${pageParams?.tab || 'default'}`}
              initialTab={pageParams?.tab}
              onNavigate={navigateTo}
              onLogout={handleLogout}
            />
          ) : (
            <LoginPage onNavigate={navigateTo} />
          )
        )}

        {currentPage === 'chat' && (
          <ChatPage targetUser={chatTargetUser} bookingRef={chatBookingRef} />
        )}

        {currentPage === 'booking-confirmation' && (
          <BookingConfirmationPage
            booking={confirmedBookingData}
            onNavigate={navigateTo}
            onOpenChat={handleOpenChat}
          />
        )}

        {/* Fallback for any unknown route so it NEVER renders a blank page */}
        {!KNOWN_PAGES.includes(currentPage) && (
          <HomePage
            onNavigate={navigateTo}
            onBookCar={handleOpenBooking}
            onMakeOfferCar={handleOpenOffer}
            onViewCarDetails={handleViewCarDetails}
          />
        )}
        </main>

        {/* Footer: Strictly displayed ONLY on the Home Page and never on auth pages */}
        {currentPage === 'home' && !isAuthPage && (
          <Footer onNavigate={navigateTo} />
        )}
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && selectedCarForBooking && (
        <BookingModal
          car={selectedCarForBooking}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onBookingConfirmed={handleBookingConfirmed}
          prefilledPrice={prefilledPrice}
          prefilledOfferId={prefilledOfferId}
          isOwnerDirect={isOwnerDirectBooking}
          initialDetails={initialBookingDetails}
          onNavigate={navigateTo}
        />
      )}

      {/* Make an Offer Modal */}
      {offerModalOpen && selectedCarForOffer && (
        <MakeOfferModal
          car={selectedCarForOffer}
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          onOfferSuccess={() => {
            navigateTo('customer-dashboard');
          }}
        />
      )}
      {/* Bulk Booking / Wedding Fleet Cart Modal */}
      <BulkBookingModal onNavigate={navigateTo} />

      {/* Floating Action Elements (Hidden on auth pages to maintain pure focus) */}
      {!isAuthPage && (
        <>
          {/* Floating Wedding Fleet Cart Pill Button */}
          <FloatingFleetCartButton />

          {/* Floating PWA Install App Button on Mobile */}
          <FloatingInstallAppButton />

          {/* Floating WhatsApp Concierge Button */}
          <FloatingWhatsAppButton />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CompanyProvider>
          <SocketProvider>
            <NotificationProvider>
              <LanguageProvider>
                <CartProvider>
                  <MainLayout />
                </CartProvider>
              </LanguageProvider>
            </NotificationProvider>
          </SocketProvider>
        </CompanyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

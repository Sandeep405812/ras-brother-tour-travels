import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider, useCart } from './context/CartContext';
import { ShoppingCart } from 'lucide-react';

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

function FloatingFleetCartButton() {
  const { cartCount, setIsCartOpen } = useCart();
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
      <span className="hidden sm:inline">Wedding Fleet ({cartCount} Cars Selected)</span>
      <span className="sm:hidden">Fleet ({cartCount})</span>
    </button>
  );
}

function MainLayout() {
  const { loading: authLoading, isAuthenticated, user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});

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
    setCurrentPage(page);
    setPageParams(params);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-amber-500 selection:text-white font-sans">
      {/* Universal Brand Navbar (Hidden when logged in) */}
      {!isAuthenticated && <Navbar onNavigate={navigateTo} currentPage={currentPage} />}

      {/* Mini App Header for Logged-In Users on Non-Dashboard Pages */}
      {isAuthenticated && !['customer-dashboard', 'owner-dashboard', 'admin-dashboard'].includes(currentPage) && (
        <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 hover:opacity-90 transition"
              title="Go to Home"
            >
              <RasLogo variant="dark" size="sm" showTagline={false} />
            </button>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider hidden sm:inline">
              • {user?.role === 'owner' ? 'Owner Portal' : user?.role === 'admin' ? 'Admin Panel' : 'Customer Portal'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentPage === 'home'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>🏠 Home &amp; Route Search</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('cars')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentPage === 'cars'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>🚗 Browse Fleet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (user?.role === 'admin') navigateTo('admin-dashboard');
                else if (user?.role === 'owner') navigateTo('owner-dashboard');
                else navigateTo('customer-dashboard');
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition shadow-sm"
            >
              My Dashboard
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-900 hover:text-rose-200 text-slate-300 transition"
            >
              Logout
            </button>
          </div>
        </header>
      )}

      {/* Main Content Router */}
      <main className="flex-1">
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
          <AboutContactPage />
        )}

        {currentPage === 'contact' && (
          <AboutContactPage />
        )}

        {currentPage === 'login' && (
          <LoginPage onNavigate={navigateTo} />
        )}

        {currentPage === 'register' && (
          <RegisterPage onNavigate={navigateTo} />
        )}

        {currentPage === 'customer-dashboard' && (
          <CustomerDashboard
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onOpenChat={handleOpenChat}
            onBookCar={handleOpenBooking}
          />
        )}

        {currentPage === 'owner-dashboard' && (
          <OwnerDashboard
            onNavigate={navigateTo}
            onLogout={handleLogout}
            onOpenChat={handleOpenChat}
            onOpenDirectBooking={handleOpenDirectBooking}
          />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboard
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
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
      </main>

      {/* Universal Footer (Hidden when logged in) */}
      {!isAuthenticated && <Footer onNavigate={navigateTo} />}

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

      {/* Floating Wedding Fleet Cart Pill Button */}
      <FloatingFleetCartButton />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <SocketProvider>
          <NotificationProvider>
            <CartProvider>
              <MainLayout />
            </CartProvider>
          </NotificationProvider>
        </SocketProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

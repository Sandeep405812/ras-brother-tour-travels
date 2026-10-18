import React, { useState } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Key,
  X,
  CheckCircle2,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  Check,
  ChevronRight,
} from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email/phone, 2 = enter OTP & new password
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      if (loggedUser.role === 'admin') onNavigate('admin-dashboard');
      else if (loggedUser.role === 'owner') onNavigate('owner-dashboard');
      else onNavigate('customer-dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Request Forgot Password OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmailOrPhone.trim()) {
      showToast('Please enter your registered email or phone', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: forgotEmailOrPhone.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'OTP generated successfully!', 'success');
        if (data.resetOtp) {
          setForgotOtp(data.resetOtp); // prefill for easy user experience
        }
        setForgotStep(2);
      } else {
        showToast(data.message || 'Failed to generate OTP', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      showToast('Please enter the 6-digit OTP', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: forgotEmailOrPhone.trim(),
          otp: forgotOtp.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password reset successfully! Please sign in with your new password.', 'success');
        setPassword(newPassword);
        if (data.user?.email) setEmail(data.user.email);
        setForgotModalOpen(false);
        setForgotStep(1);
      } else {
        showToast(data.message || 'Password reset failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden select-none">
      {/* Background Decorative Blur Rings */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Luxury Showcase Hero (Desktop & Tablet) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-7 relative p-8 sm:p-12 lg:p-14 flex flex-col justify-between overflow-hidden bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80">
            {/* Background Image with Dark Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60" />

            {/* Top Brand Logo */}
            <div className="relative z-10">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-block transform hover:scale-[1.02] transition"
                title="Go to Home"
              >
                <RasLogo variant="dark" size="md" showTagline={true} />
              </button>
            </div>

            {/* Center Value Proposition */}
            <div className="relative z-10 py-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('Premium Local Fleet Marketplace', 'प्रीमियम लोकल कार रेंटल व विवाह काफ़िला')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white font-heading tracking-tight leading-tight">
                {t('Royal Entries & Seamless VIP Convoy Travel', 'शाही शादियाँ व वीआईपी यात्रा, अब पारदर्शी दामों पर')}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                {t(
                  'Book verified luxury cars within 100 KM of your venue. Transparent ₹20/km pricing, uniformed chauffeurs, and 100% on-time arrival guarantee.',
                  'अपने शहर व गाँव के 100 किमी के अंदर वेरिफाइड गाड़ियाँ बुक करें। सीधा ₹20/किमी रेट, वर्दीधारी ड्राइवर और समय पर आगमन की पक्की गारंटी।'
                )}
              </p>

              {/* Key Features Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>{t('Zero Hidden Fees (Live KM Fare)', 'कोई छुपा चार्ज नहीं')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>{t('Cash on Delivery & Online QR', 'कैश ऑन डिलीवरी व ऑनलाइन भुगतान')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>{t('Police-Verified Uniformed Drivers', 'पुलिस वेरिफाइड ड्राइवर')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span>{t('Fresh Flower Ribbons on Demand', 'ताज़ा फूलों की सजावट')}</span>
                </div>
              </div>

              {/* Social Proof Quote */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                  <span className="ml-1 font-black text-white">4.9 / 5.0</span>
                </div>
                <p className="italic">
                  "{t(
                    'RAS Brother made our wedding baraat grand and stress-free. The convoy reached our venue 30 mins before time!',
                    'RAS Brother ने हमारी शादी की बारात को बहुत भव्य बनाया। गाड़ियाँ समय से आधा घंटा पहले पहुँच गई थीं!'
                  )}"
                </p>
                <div className="text-[11px] font-bold text-slate-400">
                  — Rahul &amp; Priya Singh, Noida Sector 18
                </div>
              </div>
            </div>

            {/* Bottom Security Trust Footer */}
            <div className="relative z-10 pt-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {t('256-Bit SSL Encrypted', '256-बिट सुरक्षित')}
              </span>
              <span>•</span>
              <span>{t('GST Registered Fleet', 'जीएसटी रजिस्टर्ड सर्विस')}</span>
              <span>•</span>
              <span>{t('24/7 Roadside Concierge', '24/7 हेल्पलाइन')}</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Interactive Login Form Card */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-900/90">
            <div className="max-w-md w-full mx-auto space-y-6">
              
              {/* Form Header */}
              <div>
                <span className="text-xs font-black tracking-widest uppercase text-amber-400">
                  {t('WELCOME BACK', 'नमस्ते व स्वागत')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
                  {t('Sign In to Account', 'अपने खाते में लॉगिन करें')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {t('Manage ride bookings, fleet listings, and trip status', 'अपनी बुकिंग, गाड़ियाँ व राइड स्टेटस देखें')}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {t('Email Address or Mobile', 'ईमेल या मोबाइल नंबर')} *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-inner font-semibold"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Password Field with Show/Hide Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      {t('Password', 'पासवर्ड')} *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmailOrPhone(email || '');
                        setForgotStep(1);
                        setForgotModalOpen(true);
                      }}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                    >
                      {t('Forgot Password?', 'पासवर्ड भूल गए?')}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-inner font-semibold"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition"
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                    />
                    <span>{t('Remember me on this device', 'इस डिवाइस पर याद रखें')}</span>
                  </label>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>{t('Authenticating...', 'लॉगिन हो रहा है...')}</span>
                  ) : (
                    <>
                      <span>{t('Sign In to Account', 'खाते में साइन इन करें')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick 1-Click Demo Logins */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 text-center mb-2.5">
                    {t('⚡ 1-Click Quick Demo Login', '⚡ 1-क्लिक डेमो लॉगिन')}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@rasbrother.com');
                        setPassword('admin123');
                      }}
                      className="py-2 px-1 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-extrabold border border-amber-500/30 hover:border-amber-400 transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      👑 Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('sandeep@gmail.com');
                        setPassword('123456');
                      }}
                      className="py-2 px-1 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-extrabold border border-slate-700 hover:border-slate-500 transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      🚗 Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('krishna@gmail.com');
                        setPassword('123456');
                      }}
                      className="py-2 px-1 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-extrabold border border-slate-700 hover:border-slate-500 transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      👤 Customer
                    </button>
                  </div>
                </div>
              </form>

              {/* Registration Link */}
              <div className="text-center text-xs text-slate-400 pt-1">
                {t("Don't have an account yet?", 'क्या आपका खाता नहीं है?')}{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-amber-400 font-bold hover:underline ml-1"
                >
                  {t('Create an Account', 'नया खाता बनाएँ →')}
                </button>
              </div>

              {/* Return to Home Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  ← {t('Back to Home & Fleet', 'होमपेज व गाड़ियाँ देखें')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================================================= */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-heading">{t('Reset Password', 'पासवर्ड रीसेट करें')}</h3>
                  <p className="text-[11px] text-slate-400">Step {forgotStep} of 2</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-slate-300">
                  {t(
                    'Enter your registered email address or mobile number. We will send you a 6-digit verification OTP.',
                    'अपना रजिस्टर्ड ईमेल या मोबाइल दर्ज करें। हम आपको 6-अंकों का वेरिफिकेशन ओटीपी भेजेंगे।'
                  )}
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('Registered Email or Phone *', 'रजिस्टर्ड ईमेल या फ़ोन *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmailOrPhone}
                    onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                    placeholder="e.g. name@example.com or 9876543210"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                  >
                    {t('Cancel', 'रद्द करें')}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow"
                  >
                    {forgotLoading ? t('Sending...', 'भेज रहे हैं...') : t('Send OTP', 'ओटीपी भेजें')}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <p className="text-xs text-slate-300">
                  {t('Enter the 6-digit OTP sent for', 'ओटीपी दर्ज करें जो भेजा गया है:')}{' '}
                  <strong className="text-amber-400">{forgotEmailOrPhone}</strong>
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('6-Digit Verification OTP *', '6-अंकों का ओटीपी *')}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm font-mono tracking-widest text-center text-amber-400 font-black focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('New Password *', 'नया पासवर्ड *')}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('Confirm New Password *', 'नया पासवर्ड दोबारा लिखें *')}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← {t('Back', 'पीछे')}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
                  >
                    {forgotLoading ? t('Resetting...', 'रीसेट हो रहा है...') : t('Reset Password', 'पासवर्ड बदलें')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

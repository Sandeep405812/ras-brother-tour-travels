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
          setForgotOtp(data.resetOtp);
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
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password-otp', {
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
        showToast('Password reset successful! You can now sign in.', 'success');
        setForgotModalOpen(false);
        setPassword(newPassword);
        setForgotStep(1);
        setForgotEmailOrPhone('');
        setForgotOtp('');
        setNewPassword('');
        setConfirmPassword('');
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden select-none">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Direct Login Card */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Top Brand Logo */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-block transform hover:scale-[1.02] transition cursor-pointer"
            title="Return to Home"
          >
            <RasLogo variant="dark" size="md" showTagline={true} />
          </button>
        </div>

        {/* Focused Login Form Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-black text-white font-heading tracking-tight">
              {t('Sign In to Account', 'खाते में लॉगिन करें')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('Enter your email and password to access your portal', 'बुकिंग व पोर्टल एक्सेस करने के लिए क्रेडेंशियल्स दर्ज करें')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {t('Email Address', 'ईमेल पता')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password with Eye Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {t('Password', 'पासवर्ड')}
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                >
                  {t('Forgot password?', 'पासवर्ड भूल गए?')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                />
                <span>{t('Remember me on this device', 'इस डिवाइस पर याद रखें')}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t('Authenticating...', 'लॉगिन हो रहा है...')}</span>
                </span>
              ) : (
                <>
                  <span>{t('Sign In to Account', 'खाते में साइन इन करें')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
            {t("Don't have an account yet?", 'क्या आपका खाता नहीं है?')}{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-amber-400 font-bold hover:underline ml-1 cursor-pointer"
            >
              {t('Create an Account', 'नया खाता बनाएँ →')}
            </button>
          </div>
        </div>

        {/* Bottom Home & Security Trust Footer */}
        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            ← {t('Back to Home & Fleet', 'होमपेज व गाड़ियाँ देखें')}
          </button>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted &amp; Government Registered Network</span>
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

            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t(
                    'Enter your registered email address or phone number to receive a 6-digit verification code.',
                    'अपना रजिस्टर्ड ईमेल या मोबाइल नंबर दर्ज करें जिससे 6-अंकों का वेरिफिकेशन कोड भेजा जा सके।'
                  )}
                </p>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {t('Registered Email or Phone', 'ईमेल या फ़ोन नंबर')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. name@example.com or 9876543210"
                      value={forgotEmailOrPhone}
                      onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    {t('Cancel', 'रद्द करें')}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {forgotLoading ? t('Sending OTP...', 'भेजा जा रहा है...') : t('Get 6-Digit OTP', 'OTP प्राप्त करें')} &rarr;
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t(
                    'Enter the 6-digit OTP code along with your new password.',
                    'प्राप्त 6-अंकों का OTP कोड और नया पासवर्ड दर्ज करें।'
                  )}
                </p>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('6-Digit OTP Code', '6-अंकों का OTP')}</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full tracking-widest text-center text-lg font-black bg-slate-950 border border-slate-700 rounded-2xl py-2.5 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('New Password', 'नया पासवर्ड')}</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('Confirm New Password', 'नया पासवर्ड दोहराएँ')}</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    &larr; {t('Back to Step 1', 'वापस जाएँ')}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {forgotLoading ? t('Updating...', 'अपडेट हो रहा है...') : t('Set New Password', 'नया पासवर्ड सेट करें')}
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

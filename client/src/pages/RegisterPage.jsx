import React, { useState } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Building,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Star,
  Check,
  Eye,
  EyeOff,
  Car,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const { showToast } = useNotification();
  const { t } = useLanguage();

  const [role, setRole] = useState('customer'); // 'customer' | 'owner'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('Please accept the Terms of Service to continue', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      const newUser = await register({
        name,
        email,
        password,
        phone,
        role,
        businessName: role === 'owner' ? businessName : undefined,
        address,
        city,
      });

      showToast(`Welcome to RAS Brother Tour & Travels, ${newUser.name}!`, 'success');
      if (newUser.role === 'owner') onNavigate('owner-dashboard');
      else onNavigate('customer-dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden select-none py-8 sm:py-12">
      {/* Background Decorative Blur Glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900/60 backdrop-blur-xl">

          {/* ========================================================= */}
          {/* LEFT COLUMN: Luxury Showcase Hero (Desktop & Tablet) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-6 relative p-8 sm:p-12 lg:p-14 flex flex-col justify-between overflow-hidden bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80">
            {/* Background Image with Dark Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
              style={{
                backgroundImage:
                  role === 'owner'
                    ? "url('https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80')"
                    : "url('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/60" />

            {/* Top Brand Logo */}
            <div className="relative z-10">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-block transform hover:scale-[1.02] transition"
                title="Return to Home"
              >
                <RasLogo variant="dark" size="md" showTagline={true} />
              </button>
            </div>

            {/* Center Value Proposition based on Selected Role */}
            <div className="relative z-10 py-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {role === 'owner'
                    ? t('Fleet Partner Onboarding', 'कार मालिक व ट्रेवल्स पार्टनर नेटवर्क')
                    : t('VIP Customer Membership', 'वीआईपी कस्टमर रजिस्ट्रेशन')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white font-heading tracking-tight leading-tight">
                {role === 'owner'
                  ? t('Monetize Your Fleet With Guaranteed Bookings', 'अपनी गाड़ी जोड़ें और हर महीने ₹50,000+ कमाएं')
                  : t('Royal Entries & Seamless VIP Convoy Travel', 'शाही शादियाँ व वीआईपी यात्रा, अब पारदर्शी दामों पर')}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                {role === 'owner'
                  ? t(
                      'List your luxury sedans, vintage cars, or SUVs. Receive direct booking enquiries from weddings, receptions, and corporate delegates with 0% platform joining fee.',
                      'अपनी लग्जरी, विंटेज व एसयूवी गाड़ियाँ लिस्ट करें। शादियों और वीआईपी आयोजनों से सीधी बुकिंग प्राप्त करें, समय पर पारदर्शी भुगतान के साथ।'
                    )
                  : t(
                      'Book verified luxury cars within 100 KM of your venue. Transparent ₹20/km pricing, uniformed chauffeurs, and 100% on-time arrival guarantee.',
                      'अपने शहर व गाँव के 100 किमी के अंदर वेरिफाइड गाड़ियाँ बुक करें। सीधा ₹20/किमी रेट, वर्दीधारी ड्राइवर और समय पर आगमन की पक्की गारंटी।'
                    )}
              </p>

              {/* Key Features Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {role === 'owner' ? (
                  <>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t('Zero Upfront Listing Fee', 'मुफ्त लिस्टिंग')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t('Direct Payouts & Advance Cash', 'सीधा एडवांस व भुगतान')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t('Vendor Dashboard & Calendar', 'वेंडर बुकिंग पोर्टल')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t('24/7 Fleet Dispatch Support', '24/7 कस्टमर सहायता')}</span>
                    </div>
                  </>
                ) : (
                  <>
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
                      <span>{t('Cash on Delivery & Online QR', 'कैश ऑन डिलीवरी व UPI')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t('Police-Verified Uniformed Drivers', 'वेरिफाइड ड्राइवर')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{t('Fresh Flower Ribbons on Demand', 'ताज़ा फूलों की सजावट')}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Verified Trust Testimonial Card */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-1 text-amber-400 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                  <span className="text-white text-xs font-bold ml-1.5">4.9 / 5.0</span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  {role === 'owner'
                    ? '"Listed 3 Innova Crystas and got 14 bookings in the first marriage season. The RAS Brother team handles everything smoothly."'
                    : '"Booked a decorated Audi A4 for my brother\'s wedding in Deoria. The driver arrived 30 mins before time in crisp white uniform!"'}
                </p>
                <div className="mt-2 text-[11px] text-slate-400 font-semibold">
                  {role === 'owner'
                    ? '— Rajeshwar Verma, Fleet Partner (Gorakhpur)'
                    : '— Aditya Pratap Singh, Verified Customer (Lucknow)'}
                </div>
              </div>
            </div>

            {/* Bottom Security Trust */}
            <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('Government Registered & GST Compliant', 'जीएसटी एवं सरकारी मानकों के अनुसार सुरक्षित')}</span>
              </div>
              <div className="text-slate-500 text-[11px]">256-Bit SSL Secured</div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Interactive Registration Form */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            
            {/* Header */}
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                {t('Create Your Account', 'नया खाता बनाएँ')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {t(
                  'Join RAS Brother Tour & Travels for royal wedding cars and luxury journeys',
                  'शाही शादियों और बेहतरीन यात्राओं के लिए आज ही जुड़ें'
                )}
              </p>
            </div>

            {/* Account Type Selector Pills */}
            <div className="mb-6 p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                  role === 'customer'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>{t('VIP Customer', 'ग्राहक / बुकिंग')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                  role === 'owner'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>{t('Fleet Partner / Vendor', 'कार मालिक / वेंडर')}</span>
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('Full Name *', 'पूरा नाम *')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* If Owner: Agency / Business Name */}
              {role === 'owner' && (
                <div className="animate-in fade-in duration-300">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t('Travels or Fleet Business Name *', 'ट्रेवल्स या एजेंसी का नाम *')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={role === 'owner'}
                      placeholder="e.g. Royal Heritage Fleet & Travels"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                    />
                    <Building className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              {/* Contact Info: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t('Email Address *', 'ईमेल पता *')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t('Phone Number *', 'मोबाइल नंबर *')}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('Password *', 'पासवर्ड *')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Create a strong password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Location Details: Operating City & Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t('City / Hub *', 'शहर / बेस *')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi, Deoria, Noida"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl pl-10 pr-3 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t('Locality / Address', 'इलाका / पता')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 18 / Civil Lines"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/20"
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-400 cursor-pointer">
                  {t(
                    'I agree to the Terms of Service, Privacy Policy, and verified car marketplace guidelines.',
                    'मैं सेवा की शर्तों, गोपनीयता नीति व कार रेंटल नियमों से सहमत हूँ।'
                  )}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{t('Creating Account...', 'खाता बनाया जा रहा है...')}</span>
                  </span>
                ) : (
                  <>
                    <span>
                      {role === 'owner'
                        ? t('Register as Fleet Partner', 'कार मालिक / वेंडर के रूप में रजिस्टर करें')
                        : t('Register as VIP Customer', 'वीआईपी कस्टमर अकाउंट बनाएँ')}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Redirect to Sign In */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                {t('Already have an account?', 'क्या आपके पास पहले से खाता है?')}{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-amber-400 font-black hover:text-amber-300 hover:underline transition ml-1"
                >
                  {t('Sign In Now', 'यहाँ साइन इन करें')} &rarr;
                </button>
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

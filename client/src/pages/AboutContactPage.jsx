import React, { useState } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useCompany } from '../context/CompanyContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ShieldCheck,
  Send,
  MessageCircle,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export default function AboutContactPage({ mode = 'contact', onNavigate }) {
  const { company } = useCompany();
  const { showToast } = useNotification();
  const { t } = useLanguage();

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      showToast(t('Please fill all required fields', 'कृपया सभी आवश्यक फ़ील्ड भरें'), 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          carName: '24/7 Concierge Support / Helpdesk',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          t(
            'Your query has been sent to Admin! Our team will call you within 15 minutes.',
            'आपकी समस्या/पूछताछ एडमिन को भेज दी गई है! हमारी टीम 15 मिनट में आपसे संपर्क करेगी।'
          ),
          'success'
        );
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        showToast(data.message || 'Failed to submit query', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error submitting query', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const phoneClean = (company.phone || '9918272164').replace(/[^0-9]/g, '');
    const num = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(
      'Hello RAS Brother Tour & Travels, I need 24/7 concierge assistance for booking / car enquiry.'
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // If mode is 'contact', render ONLY the pure direct contact section
  if (mode === 'contact') {
    return (
      <div className="min-h-screen bg-slate-950 py-10 sm:py-16 text-slate-100 select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Title */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wide uppercase">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('24/7 Direct Concierge Desk', '24 घंटे सीधा संपर्क व सहायता')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
              {t('Contact & Customer Care', 'संपर्क करें — हमेशा आपकी सेवा में')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t(
                'Instant car bookings, wedding convoy coordination, or urgent roadside support.',
                'शाही शादियों के लिए गाड़ी बुकिंग, दूल्हा गाड़ी व आपातकालीन सहायता के लिए सीधे संपर्क करें।'
              )}
            </p>
          </div>

          {/* Quick Action Contact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Phone Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{t('Direct Hotlines', 'सीधा कॉल नंबर')}</h3>
                <p className="text-xs text-slate-400 mt-1">{t('Speak directly with Sandeep Yadav & Dispatch', 'तुरंत कॉल पर बात करें')}</p>
              </div>
              <div className="space-y-1 pt-1">
                <a
                  href={`tel:${company.phone || '+919918272164'}`}
                  className="block text-base font-black text-amber-400 hover:text-amber-300 transition"
                >
                  📞 {company.phone || '+91 9918272164'}
                </a>
                {company.altPhone && (
                  <a
                    href={`tel:${company.altPhone}`}
                    className="block text-sm font-bold text-slate-300 hover:text-white transition"
                  >
                    📞 {company.altPhone}
                  </a>
                )}
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 fill-emerald-500/30" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{t('WhatsApp Concierge', 'व्हाट्सएप चैट')}</h3>
                <p className="text-xs text-slate-400 mt-1">{t('Get car photos, decorator rates & instant quotes', 'गाड़ियों के फ़ोटो और तुरंत रेट मंगाएं')}</p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>{t('Chat on WhatsApp', 'व्हाट्सएप पर चैट करें')}</span>
                </button>
              </div>
            </div>

            {/* Office & Email Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{t('Main Hub & Email', 'कार्यालय व ईमेल')}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  📍 {company.address || 'Civil Lines, Gorakhpur / Deoria & Sector 18, Noida'}
                </p>
              </div>
              <div className="pt-1">
                <a
                  href={`mailto:${company.email || 'rasbrother9838@gmail.com'}`}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{company.email || 'rasbrother9838@gmail.com'}</span>
                </a>
              </div>
            </div>

          </div>

          {/* Direct Message Form Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl max-w-3xl mx-auto space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white font-heading">
                {t('Send an Instant Message', 'सीधा संदेश भेजें')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('Fill in your inquiry below and we will respond immediately.', 'नीचे अपनी जानकारी भरें, हम तुरंत आपसे संपर्क करेंगे।')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t('Your Name *', 'आपका नाम *')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t('Phone Number *', 'मोबाइल नंबर *')}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('Email Address (Optional)', 'ईमेल पता (वैकल्पिक)')}
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('Your Message or Event Requirements *', 'आपका संदेश या आयोजन विवरण *')}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={t(
                    'e.g. Need Audi A4 or Fortuner with fresh flower ribbons for wedding on 24th November in Gorakhpur...',
                    'उदा. शादी के लिए 24 नवंबर को सजी हुई ऑडी या फॉर्च्यूनर गाड़ी चाहिए...'
                  )}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-2xl p-4 text-sm text-white placeholder-slate-500 transition outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>{t('Sending Message...', 'भेजा जा रहा है...')}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('Send Message to Concierge', 'संदेश भेजें')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // mode === 'about'
  return (
    <div className="min-h-screen bg-slate-950 py-10 sm:py-16 text-slate-100 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Heritage Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-black tracking-widest uppercase text-amber-400">
              OUR HERITAGE &amp; PROMISE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
              About {company.companyName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Founded by Sandeep Yadav and family with the singular mission of bringing trust, luxury, and transparent pricing to India's event car rental industry. We connect private car owners, premium chauffeur services, and wedding hosts into one verified marketplace.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every car on our platform undergoes strict multi-point physical checks, driver background verification, and commercial clearance before handling weddings, receptions, and VIP delegations.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-bold text-white">
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-amber-400">500+</div>
                <div className="text-slate-400 font-normal">Weddings &amp; Events Served</div>
              </div>
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black text-amber-400">100%</div>
                <div className="text-slate-400 font-normal">Punctual Arrival Record</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8 bg-slate-950 rounded-3xl text-center space-y-4 border border-slate-800 shadow-2xl">
            <RasLogo variant="dark" size="xl" showTagline={true} />
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {company.tagline}
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              GST Registered Service Provider • Government Recognized Tourism Fleet
            </p>
            <button
              onClick={() => onNavigate && onNavigate('contact')}
              className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
            >
              Contact Concierge &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

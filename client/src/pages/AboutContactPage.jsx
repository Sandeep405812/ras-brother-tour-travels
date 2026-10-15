import React, { useState } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useCompany } from '../context/CompanyContext';
import { useNotification } from '../context/NotificationContext';
import { MapPin, Phone, Mail, Globe, Clock, ShieldCheck, Send } from 'lucide-react';

export default function AboutContactPage() {
  const { company } = useCompany();
  const { showToast } = useNotification();

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Thank you! Our concierge team will contact you within 30 minutes.', 'success');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* About Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-black tracking-widest uppercase text-amber-600">
              OUR HERITAGE &amp; PROMISE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              About {company.companyName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Founded with the singular mission of bringing trust, luxury, and transparent pricing to India's event car rental industry. We bridge private car owners, premium chauffeur services, and event hosts into one seamless marketplace.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every car on our platform undergoes strict multi-point physical checks, driver background verification, and commercial roadworthiness clearance before handling weddings and VIP convocations.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-bold text-slate-800">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-2xl font-black text-amber-600">500+</div>
                <div className="text-slate-500 font-normal">Weddings &amp; Events Served</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-2xl font-black text-amber-600">100%</div>
                <div className="text-slate-500 font-normal">Punctual Arrival Record</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8 bg-slate-950 rounded-3xl text-center space-y-4 shadow-2xl">
            <RasLogo variant="dark" size="xl" showTagline={true} />
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {company.tagline}
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              GST Registered Service Provider • Government Recognized Tourism Fleet
            </p>
          </div>
        </div>

        {/* Contact Form & Head Office Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Office Info */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-black font-heading text-white">
              Headquarters &amp; Direct Support
            </h2>
            <p className="text-xs text-slate-400">
              Reach our 24/7 dedicated fleet dispatcher for immediate roadside assistance or booking inquiries.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Official Office Address</div>
                  <div className="text-slate-300 mt-0.5">{company.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Direct Hotline</div>
                  <div className="text-slate-300 mt-0.5">{company.phone} / {company.altPhone}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Email Inquiries</div>
                  <div className="text-slate-300 mt-0.5">{company.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Operating Hours</div>
                  <div className="text-slate-300 mt-0.5">24 Hours / 7 Days a Week</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md space-y-4">
            <h2 className="text-xl font-black text-slate-900 font-heading">
              Send Concierge Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ankit Singhal"
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@mail.com"
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Event Requirements</label>
                <textarea
                  rows="3"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your event date, expected cars, or city location..."
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <Send className="w-4 h-4" /> Send Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

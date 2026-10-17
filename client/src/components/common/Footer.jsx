import React from 'react';
import RasLogo from '../brand/RasLogo';
import { useCompany } from '../../context/CompanyContext';
import { Phone, Mail, MapPin, Globe, Shield, Clock, Heart, Award } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const { company } = useCompany();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <RasLogo variant="dark" size="lg" showTagline={true} />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mt-3">
              India's premier verified local marketplace connecting car owners and vendors with customers for weddings, receptions, VIP delegations, parties, and ceremonial events.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-amber-400 font-semibold">
              <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" /> 100% Verified Fleet
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" /> 24/7 Road Concierge
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase font-heading text-amber-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-400 transition">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-400 transition">
                  Book Your Car
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-amber-400 transition">
                  Special Event Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-amber-400 transition">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('partner')} className="hover:text-amber-400 transition">
                  Become a Partner
                </button>
              </li>
            </ul>
          </div>

          {/* Event Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase font-heading text-amber-400">
              Event Fleet
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('cars', { category: 'Wedding Special' })} className="hover:text-amber-400 transition">
                  Wedding Car Booking
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cars', { category: 'Luxury' })} className="hover:text-amber-400 transition">
                  Luxury &amp; Chauffeur
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cars', { category: 'Vintage' })} className="hover:text-amber-400 transition">
                  Vintage Classics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cars', { category: 'Party Car' })} className="hover:text-amber-400 transition">
                  Open-Top &amp; Party Cars
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cars', { category: 'SUV' })} className="hover:text-amber-400 transition">
                  SUVs &amp; VIP Escort
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase font-heading text-amber-400">
              Headquarters
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{company.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${company.phone}`} className="hover:text-amber-400">{company.phone}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${company.email}`} className="hover:text-amber-400">{company.email}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-amber-400">
                  {company.website}
                </a>
              </div>
              <div className="pt-2 text-[11px] text-slate-400">
                GSTIN: <span className="font-mono text-slate-300">{company.gstNumber || '07AAAAA0000A1Z5'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-300">{company.companyName}</strong>. All Rights Reserved.
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span>Transparent Pricing</span>
            <span>•</span>
            <span>Zero Hidden Charges</span>
            <span>•</span>
            <span>Secure Razorpay Escrow</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

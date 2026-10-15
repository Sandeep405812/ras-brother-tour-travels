import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Award, Phone } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export default function ServicesPage({ onNavigate }) {
  const { company } = useCompany();

  const services = [
    {
      title: 'Wedding Car Booking',
      desc: 'Make your entrance majestic. Choose from Rolls-Royce, Jaguar, Mercedes, and Audi limousines decorated with fresh flower ribbons and driven by uniformed chauffeurs.',
      icon: '💍',
      category: 'Wedding Special',
      badge: 'Most Popular',
    },
    {
      title: 'Marriage & Reception Cars',
      desc: 'Complete bridal and groom motorcades for reception stage entries, baraat processions, and multi-venue wedding logistics.',
      icon: '👑',
      category: 'Wedding Special',
      badge: 'Flagship',
    },
    {
      title: 'Party Cars',
      desc: 'Open-top Mahindra Thar 4x4, convertibles, and high-energy music bass setups for bachelor trips, bachelorette convoys, and birthday parties.',
      icon: '🎉',
      category: 'Party Car',
      badge: 'Youth Choice',
    },
    {
      title: 'Luxury Cars',
      desc: 'Ultra-refined executive sedans like BMW 7 Series and Mercedes S-Class with massage seating, acoustic privacy, and rear entertainment.',
      icon: '✨',
      category: 'Luxury',
      badge: 'VIP Class',
    },
    {
      title: 'Corporate Travel',
      desc: 'Seamless executive mobility for business summits, VIP foreign delegates, conferences, and daily boardroom chauffeurs.',
      icon: '💼',
      category: 'Premium',
      badge: 'Executive',
    },
    {
      title: 'Airport Transfers',
      desc: 'Flight-synchronized pickup and drop services from IGI T3 and regional airports with luggage handling and zero waiting fees.',
      icon: '✈️',
      category: 'Sedan',
      badge: 'Punctual',
    },
    {
      title: 'Local Tours',
      desc: 'Comfortable day packages across historical landmarks, luxury malls, and dining spots with courteous local drivers.',
      icon: '🏙️',
      category: 'Budget',
      badge: 'Full Day',
    },
    {
      title: 'Outstation Tours',
      desc: 'Long-distance highway travel to Jaipur, Agra, Neemrana, Dehradun, and Chandigarh in commanding 4x4 SUVs and luxury sedans.',
      icon: '🌄',
      category: 'SUV',
      badge: 'Highway Ready',
    },
    {
      title: 'Photoshoot Cars',
      desc: 'Vintage 1969 Mustangs, open cruisers, and rare classics available for pre-wedding couple shoots, music videos, and fashion editorials.',
      icon: '📸',
      category: 'Vintage',
      badge: 'Cinematic',
    },
    {
      title: 'Event Transportation',
      desc: 'Group transport in 7-to-12 seater luxury vans (Kia Carnival, Toyota Vellfire, Tempo Travellers) ensuring all wedding guests travel in synchrony.',
      icon: '🚐',
      category: 'Premium',
      badge: 'Family Fleet',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-black tracking-widest uppercase text-amber-600">
            OFFICIAL SERVICES
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-heading">
            World-Class Event &amp; Tour Transportation
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            {company.companyName} provides an elite fleet of vehicles and verified chauffeurs crafted specifically for Indian marriages, VIP hospitality, and celebratory travel.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-md hover:shadow-2xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                    {s.badge}
                  </span>
                </div>
                <h3 className="font-extrabold text-xl text-slate-900 font-heading">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('cars', { category: s.category })}
                  className="text-xs font-black text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  Browse Available Cars <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

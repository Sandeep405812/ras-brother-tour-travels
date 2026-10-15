import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Check,
  Car,
  Users,
  Calendar,
  Clock,
  Phone,
  ArrowRight,
  Heart,
  Crown,
  Share2,
} from 'lucide-react';

export default function WeddingConvoyBuilder({ onBookCustomConvoy, onNavigate }) {
  const [selectedPackage, setSelectedPackage] = useState(0);

  // Preset Wedding Packages
  const packages = [
    {
      id: 'maharaja-royal',
      badge: 'Most Popular for VIP Baraat',
      title: 'Maharaja Royal Groom Convoy',
      tagline: 'Supreme luxury groom entry with high-security VIP family convoy',
      leadCar: 'Mercedes S-Class / BMW 7-Series (Groom Car)',
      leadCarImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      convoyCars: [
        { name: '1x Mercedes-Benz S-Class (Groom VIP Entry)', type: 'Luxury Flagship' },
        { name: '2x Toyota Innova Crysta / Fortuner (Family & Baraat)', type: 'Executive Escort' },
        { name: 'Complimentary Maharaja Orchid & Rose Bonnet Floral Styling', type: 'Wedding Décor' },
      ],
      features: [
        'All Chauffeurs in Uniformed Safari Suit',
        'VIP Event Venue Entry Clearance Pass',
        'Fuel & 80 KM Local NCR Included',
        'GPS Real-Time Convoy Tracking',
      ],
      originalPrice: 48000,
      comboPrice: 39999,
      discountText: 'SAVE ₹8,000 (17% COMBO DISCOUNT)',
    },
    {
      id: 'grand-baraat-express',
      badge: 'Best for Big Families & Guests',
      title: 'Grand Baraat & Family Escort',
      tagline: 'Complete wedding convoy combining bridal luxury with luxury guest coaches',
      leadCar: 'Audi A6 / BMW 5-Series (Couple Car)',
      leadCarImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      convoyCars: [
        { name: '1x BMW 5-Series / Audi A6 (Couple)', type: 'Premium Sedan' },
        { name: '2x Toyota Innova Crysta (Parents & VIPs)', type: 'Executive SUV' },
        { name: '1x 17-Seater Luxury Tempo Traveller (Relatives & Baraat)', type: 'Guest Coach' },
      ],
      features: [
        'Dedicated Convoy Marshal Coordinator',
        'Floral Garland & Ribbon Dressing on Lead Car',
        'Simultaneous Synchronized Reporting',
        '100 KM Total Running Included',
      ],
      originalPrice: 42000,
      comboPrice: 34500,
      discountText: 'SAVE ₹7,500 (18% COMBO DISCOUNT)',
    },
    {
      id: 'vintage-regal-heritage',
      badge: 'Royal Heritage Doli Entry',
      title: 'Vintage Royalty Heritage Convoy',
      tagline: 'Timeless vintage classic convertible lead with modern luxury escort',
      leadCar: 'Vintage 1930s Royal Open Convertible',
      leadCarImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      convoyCars: [
        { name: '1x Vintage Open Tourer / Convertible (Royal Doli / Entry)', type: 'Vintage Classic' },
        { name: '2x Mercedes-Benz E-Class (Dignitaries & Close Family)', type: 'Executive Luxury' },
        { name: 'Royal Velvet & Fresh Orchid Styling Included', type: 'Floral Art' },
      ],
      features: [
        'Red Carpet Chauffeur Service',
        'High-Impact Photography Clearance',
        'VIP Venue Staging Coordination',
        'Complimentary Chilled Refreshments',
      ],
      originalPrice: 55000,
      comboPrice: 44999,
      discountText: 'SAVE ₹10,000 (18% COMBO DISCOUNT)',
    },
  ];

  const currentPkg = packages[selectedPackage];

  const handleBookPackage = (pkg) => {
    const text = `🎉 *RAS BROTHER TOUR & TRAVELS — WEDDING CONVOY INQUIRY*\n\n` +
      `*Package Selected:* ${pkg.title}\n` +
      `*Lead Vehicle:* ${pkg.leadCar}\n` +
      `*Combo Package Price:* ₹${pkg.comboPrice.toLocaleString('en-IN')}\n` +
      `*Fleet Included:*\n` +
      pkg.convoyCars.map((c) => `• ${c.name}`).join('\n') + `\n\n` +
      `Please confirm availability and dispatch for our upcoming wedding celebration!`;
    const url = `https://wa.me/919876543210?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-10 border-2 border-amber-500/30 text-white shadow-2xl relative overflow-hidden">
      {/* Background glow & accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-3xl space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5" /> RAS Brother Wedding Convoy Builder
        </div>
        <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
          Multi-Car Baraat &amp; Wedding Motorcade Packages
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Book multiple luxury cars, escort SUVs, and Baraati Tempo Travellers in a single coordinated contract. Guaranteed simultaneous arrival, uniform chauffeurs, and up to <strong>18% combo discounts</strong>.
        </p>
      </div>

      {/* Package Selector Cards (3 Columns) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {packages.map((pkg, idx) => {
          const isSelected = selectedPackage === idx;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(idx)}
              className={`rounded-2xl p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 shadow-xl scale-[1.02]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}>
                  {pkg.badge}
                </span>

                <h3 className="font-extrabold text-lg text-white mt-3 font-heading">
                  {pkg.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {pkg.tagline}
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    ₹{pkg.comboPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{pkg.originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[10px] font-black text-emerald-400 uppercase mt-0.5">
                  {pkg.discountText}
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold">
                <span className={isSelected ? 'text-amber-300' : 'text-slate-400'}>
                  {isSelected ? '✓ Selected Convoy' : 'Click to View'}
                </span>
                <span className="text-amber-400 font-mono text-sm">➔</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Package Spotlight */}
      <div className="relative z-10 bg-slate-950/70 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 shadow-xl">
        {/* Car Image Preview */}
        <div className="w-full lg:w-5/12 shrink-0">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-white/10 shadow-lg">
            <img
              src={currentPkg.leadCarImage}
              alt={currentPkg.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                Lead Motorcade Vehicle
              </span>
              <div className="text-sm font-black text-white">{currentPkg.leadCar}</div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="w-full lg:w-7/12 space-y-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Included In This Convoy Package
            </span>
            <h4 className="text-2xl font-black text-white font-heading mt-0.5">
              {currentPkg.title}
            </h4>
            <p className="text-xs text-slate-300 mt-1">{currentPkg.tagline}</p>
          </div>

          {/* Cars in Convoy */}
          <div className="space-y-2">
            {currentPkg.convoyCars.map((car, i) => (
              <div
                key={i}
                className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-white">{car.name}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-300/80 bg-white/5 px-2 py-0.5 rounded">
                  {car.type}
                </span>
              </div>
            ))}
          </div>

          {/* Features Checklist */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-white/10">
            {currentPkg.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Booking & Concierge CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
            <div>
              <div className="text-xs text-slate-400">All-Inclusive Package Fare:</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  ₹{currentPkg.comboPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  ₹{currentPkg.originalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleBookPackage(currentPkg)}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Sparkles className="w-4 h-4" /> Book This Wedding Convoy
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('cars')}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                Customize <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

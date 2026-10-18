import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function FloatingWhatsAppButton() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = '919918272164';
  const defaultMessage = 'Hello RAS Brother Tour & Travels, I want to enquire about car booking for wedding / event.';

  const handleOpenWhatsApp = (customMsg) => {
    const text = encodeURIComponent(customMsg || defaultMessage);
    const url = `https://wa.me/${phoneNumber}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 select-none">
      {/* Expanded Quick Enquiry Card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5 fill-emerald-500/30" />
              </div>
              <div>
                <h4 className="text-white text-xs font-black">RAS Brother Concierge</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Quick Reply</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-slate-300 space-y-2">
            <p className="bg-slate-800/80 p-2.5 rounded-2xl text-[11px] leading-relaxed border border-slate-700/50">
              {t(
                'Namaste! Looking for a luxury wedding car, vintage convoy, or outstation journey? Tap below for instant quotes on WhatsApp.',
                'नमस्ते! शादी के लिए लग्जरी कार या आउटस्टेशन यात्रा के लिए तुरंत व्हाट्सएप पर बात करें।'
              )}
            </p>
          </div>

          {/* Preset Enquiry Chips */}
          <div className="space-y-1.5">
            <button
              onClick={() =>
                handleOpenWhatsApp(
                  'Hello, I want to book a Wedding Car with flower decoration. Please share rates and available models.'
                )
              }
              className="w-full text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 rounded-xl text-[11px] font-semibold text-slate-200 transition flex items-center justify-between group"
            >
              <span>🌸 Wedding Car with Decoration</span>
              <Send className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100" />
            </button>

            <button
              onClick={() =>
                handleOpenWhatsApp(
                  'Hello, I need an SUV / Luxury Chauffeur car for family travel / VIP escort. Please guide me.'
                )
              }
              className="w-full text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 rounded-xl text-[11px] font-semibold text-slate-200 transition flex items-center justify-between group"
            >
              <span>🚗 Luxury Sedan / Chauffeur Fleet</span>
              <Send className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100" />
            </button>

            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{t('Chat Directly on WhatsApp', 'व्हाट्सएप पर चैट करें')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-2xl shadow-emerald-500/40 border-2 border-emerald-300 transition-all transform hover:scale-105 active:scale-95"
        title="Chat on WhatsApp with RAS Brother Concierge"
      >
        <span className="relative flex items-center justify-center">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-950 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-950" />
        </span>
        <span className="hidden sm:inline tracking-wide font-black">
          {t('WhatsApp Concierge', 'व्हाट्सएप सहायता')}
        </span>
      </button>
    </div>
  );
}

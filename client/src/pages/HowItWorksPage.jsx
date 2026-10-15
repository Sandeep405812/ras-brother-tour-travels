import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, CreditCard, Sparkles, HandCoins } from 'lucide-react';

export default function HowItWorksPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs font-black tracking-widest uppercase text-amber-600">
            TRANSPARENT PROCESS
          </span>
          <h1 className="text-4xl font-black text-slate-900 font-heading">
            How RAS Brother Tour &amp; Travels Operates
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            A step-by-step walkthrough of how customers and car owners connect, negotiate, and finalize event cars.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {[
            {
              num: '1',
              title: 'Discover Local Cars with Exact GPS Filtering',
              desc: 'Select your event (Wedding, Party, Photoshoot), set your pickup point or allow browser GPS, and filter by budget, seating, and category.',
              features: ['Live OpenStreetMap with car locations', 'Filter by 5km to 50km radius', 'Real photos of actual vehicles'],
            },
            {
              num: '2',
              title: 'Book Directly OR "Make an Offer" to Negotiate',
              desc: 'Want a custom rate? Enter your desired budget with our interactive offer counter. The owner gets an instant notification and can Accept, Decline, or Propose a Counter-Offer.',
              features: ['Complete offer counter negotiation history', 'Real-time Socket.io notifications', 'Zero commitment until agreed'],
            },
            {
              num: '3',
              title: 'Pay Nominal Advance via Secure Razorpay Escrow',
              desc: 'You only pay the nominal advance fee (e.g. 20% or ₹1,000 fixed). The car is immediately blocked in our backend system to prevent any double-booking.',
              features: ['UPI, Cards, NetBanking supported', 'Automatic instant booking confirmation ID', 'Digital Tax Invoice PDF generated'],
            },
            {
              num: '4',
              title: 'Chauffeur Arrival & Remaining Balance at Pickup',
              desc: 'On the event day, the verified uniformed chauffeur arrives 20-30 minutes early with a spotless, decorated vehicle. Pay the remaining balance upon vehicle inspection.',
              features: ['Live chat with owner for route updates', '24/7 dedicated telephone concierge', 'Post-event 5-star review system'],
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-6 items-start"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 font-heading shadow-md shadow-amber-500/20">
                0{s.num}
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="font-extrabold text-xl text-slate-900 font-heading">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {s.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <button
            onClick={() => onNavigate('cars')}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-sm rounded-2xl shadow-xl transition"
          >
            Start Browsing Fleet Now
          </button>
        </div>
      </div>
    </div>
  );
}

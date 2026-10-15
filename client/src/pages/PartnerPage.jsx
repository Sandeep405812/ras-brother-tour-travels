import React from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useCompany } from '../context/CompanyContext';
import { ShieldCheck, TrendingUp, DollarSign, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PartnerPage({ onNavigate }) {
  const { company } = useCompany();

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-black tracking-widest uppercase text-amber-600">
            FLEET VENDOR OPPORTUNITY
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-heading">
            Partner with {company.companyName}
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Turn your luxury sedans, vintage classics, party SUVs, and fleet vehicles into high-earning assets by connecting with pre-verified marriage and event organizers.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2"
            >
              Register as Fleet Partner <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl mb-4">
              💰
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 font-heading">Set Your Own Pricing &amp; Advance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Define your per-day, per-hour, extra KM, and decoration fees. Choose whether customers pay 20% percentage advance or fixed ₹1,000 reservation fee.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl mb-4">
              🤝
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 font-heading">Interactive Price Negotiations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customers can make custom price offers. You have complete control to Accept, Decline, or Counter-Offer at an agreeable rate.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl mb-4">
              🛡️
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 font-heading">Secure Escrow &amp; Guaranteed Payouts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customer advance payments are processed securely via Razorpay. Direct bank/UPI settlement directly into your account with 0 hassle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

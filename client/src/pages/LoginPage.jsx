import React, { useState } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      if (loggedUser.role === 'admin') onNavigate('admin-dashboard');
      else if (loggedUser.role === 'owner') onNavigate('owner-dashboard');
      else onNavigate('customer-dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins
  const handleDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <div className="inline-block transform hover:scale-105 transition">
          <RasLogo variant="dark" size="lg" showTagline={true} />
        </div>
        <h2 className="text-2xl font-black text-white font-heading">
          Sign In to Your Account
        </h2>
        <p className="text-xs text-slate-400">
          Access your bookings, negotiations, and fleet concierge
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              One-Click Demo Credentials
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer1@rasbrother.com', 'customer123')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-xl border border-slate-700"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('owner1@rasbrother.com', 'owner123')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold rounded-xl border border-slate-700"
              >
                Car Owner
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@rasbrother.com', 'admin123')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-purple-300 text-[10px] font-bold rounded-xl border border-slate-700"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-amber-400 font-bold hover:underline"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

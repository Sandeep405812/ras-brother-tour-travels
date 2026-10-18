import React, { useState } from 'react';
import RasLogo from '../components/brand/RasLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Lock, Mail, User, Phone, MapPin, Building, ArrowRight } from 'lucide-react';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const { showToast } = useNotification();

  const [role, setRole] = useState('customer'); // 'customer' | 'owner'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newUser = await register({
        name,
        email,
        password,
        phone,
        role,
        businessName,
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <div className="inline-block transform hover:scale-105 transition">
          <RasLogo variant="dark" size="lg" showTagline={true} />
        </div>
        <h2 className="text-2xl font-black text-white font-heading">
          Create an Account
        </h2>
        <p className="text-xs text-slate-400">
          Book luxury cars or list your fleet with RAS Brother Tour &amp; Travels
        </p>

        {/* Role Switcher Pill */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              role === 'customer'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer / Book Cars
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              role === 'owner'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Car Owner / Vendor
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {role === 'owner' && (
              <div>
                <label className="text-slate-300 block mb-1">Travels or Business Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Heritage Travels"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Operating City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Locality / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 18"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'owner' ? 'Car Owner' : 'Customer'}`}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-amber-400 font-bold hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

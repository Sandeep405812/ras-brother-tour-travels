import React, { useState, useEffect } from 'react';
import { X, User, Phone, Car, ShieldCheck, CheckCircle2, MessageCircle, Send, FileText } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { formatDriverDutySlipWhatsAppMessage } from '../../utils/whatsappHelper';

export default function AssignDriverModal({
  booking,
  isOpen,
  onClose,
  onDriverAssigned,
  onSuccess,
  token: propToken,
}) {
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const { token: contextToken } = useAuth();
  const { company } = useCompany();

  // Robust token retrieval: prop -> AuthContext -> localStorage fallback
  const token =
    propToken ||
    contextToken ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('ras_token') || localStorage.getItem('token')
      : null);

  const [chauffeurName, setChauffeurName] = useState(
    booking?.chauffeur?.name || ''
  );
  const [chauffeurPhone, setChauffeurPhone] = useState(
    booking?.chauffeur?.phone || ''
  );
  const [vehiclePlate, setVehiclePlate] = useState(
    booking?.chauffeur?.vehiclePlate || booking?.car?.licensePlate || ''
  );
  const [loading, setLoading] = useState(false);

  // Sync state when booking changes or modal re-opens
  useEffect(() => {
    if (booking) {
      setChauffeurName(booking.chauffeur?.name || '');
      setChauffeurPhone(booking.chauffeur?.phone || '');
      setVehiclePlate(
        booking.chauffeur?.vehiclePlate || booking.car?.licensePlate || ''
      );
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chauffeurName.trim() || !chauffeurPhone.trim()) {
      showToast(
        t('Please enter driver name and phone number', 'कृपया ड्राइवर का नाम और फोन नंबर दर्ज करें'),
        'error'
      );
      return;
    }

    if (!token) {
      showToast(
        t('Your login session is missing or expired. Please log in again.', 'आपका लॉगिन सेशन समाप्त हो गया है। कृपया दोबारा लॉगिन करें।'),
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking._id}/chauffeur`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chauffeurName: chauffeurName.trim(),
          chauffeurPhone: chauffeurPhone.trim(),
          vehiclePlate: vehiclePlate.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          t('Chauffeur assigned successfully! Customer has been notified.', 'ड्राइवर सफलतापूर्वक असाइन कर दिया गया! कस्टमर को नोटिफिकेशन भेज दिया गया है।'),
          'success'
        );
        if (onDriverAssigned) {
          onDriverAssigned(data.booking || data.chauffeur);
        }
        if (onSuccess) {
          onSuccess(data.booking || data.chauffeur);
        }
        onClose();
      } else {
        showToast(data.message || 'Failed to assign driver', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error assigning driver', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShareDutySlipToDriverWhatsApp = () => {
    if (!chauffeurPhone) {
      showToast(
        t('Please enter driver phone number', 'कृपया ड्राइवर का फोन नंबर दर्ज करें'),
        'error'
      );
      return;
    }
    const cleanPhone = chauffeurPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = formatDriverDutySlipWhatsAppMessage(
      booking,
      {
        name: chauffeurName,
        phone: chauffeurPhone,
        vehiclePlate: vehiclePlate || booking.car?.licensePlate,
      },
      company
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareToCustomerWhatsApp = () => {
    const custPhone = booking.customer?.phone || booking.offlineCustomer?.phone || '';
    if (!custPhone) {
      showToast('Customer phone number not available', 'error');
      return;
    }
    const cleanPhone = custPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Namaste ${booking.customer?.name || 'Customer'}! \n\n` +
      `Your Chauffeur has been assigned for RAS Brother Booking #${booking.bookingId} (${booking.car?.name || 'Vehicle'}):\n` +
      `👨‍✈️ Driver: ${chauffeurName}\n` +
      `📞 Phone: ${chauffeurPhone}\n` +
      `🚗 Plate: ${vehiclePlate || booking.car?.licensePlate || 'Confirmed'}\n\n` +
      `Our chauffeur will report on time at your pickup point. Have a wonderful trip with RAS Brother Tour & Travels!`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-heading">
                {t('Assign Chauffeur / Driver', 'ड्राइवर असाइन करें')}
              </h3>
              <p className="text-[11px] text-slate-400">
                Booking #{booking.bookingId} • {booking.car?.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {t('Chauffeur Full Name *', 'ड्राइवर का पूरा नाम *')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Yadav"
                value={chauffeurName}
                onChange={(e) => setChauffeurName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {t('Driver Mobile Number (with WhatsApp) *', 'ड्राइवर का मोबाइल नंबर *')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={chauffeurPhone}
                onChange={(e) => setChauffeurPhone(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {t('Vehicle Registration Plate # (Optional)', 'गाड़ी नंबर प्लेट (वैकल्पिक)')}
            </label>
            <div className="relative">
              <Car className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. UP 52 AB 1234"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition font-mono uppercase"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>{t('Assigning...', 'असाइन हो रहा है...')}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('Confirm & Assign Chauffeur', 'ड्राइवर असाइन करें')}</span>
                </>
              )}
            </button>

            {chauffeurPhone && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('1-Click WhatsApp Dispatch', 'व्हाट्सएप डिस्पैच')}
                </span>

                {/* 1. Share Duty Slip directly to Driver */}
                <button
                  type="button"
                  onClick={handleShareDutySlipToDriverWhatsApp}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('📲 WhatsApp Duty Slip to Driver', '📲 ड्राइवर को ड्यूटी स्लिप भेजें')}</span>
                </button>

                {/* 2. Share Driver Details to Customer */}
                <button
                  type="button"
                  onClick={handleShareToCustomerWhatsApp}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t('💬 Share Driver Details to Customer', '💬 ग्राहक को ड्राइवर डिटेल भेजें')}</span>
                </button>
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}

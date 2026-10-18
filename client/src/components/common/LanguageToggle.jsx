import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle({ className = '', variant = 'dark' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-xl p-0.5 border text-xs font-bold transition ${
        variant === 'dark'
          ? 'bg-slate-900 border-slate-700 text-slate-300'
          : 'bg-white border-slate-200 text-slate-700 shadow-sm'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 rounded-lg transition ${
          lang === 'en'
            ? 'bg-amber-500 text-slate-950 font-black shadow'
            : 'hover:text-amber-400'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLang('hi')}
        className={`px-2.5 py-1 rounded-lg transition ${
          lang === 'hi'
            ? 'bg-amber-500 text-slate-950 font-black shadow'
            : 'hover:text-amber-400'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}

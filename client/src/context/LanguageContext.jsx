import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ras_language') || 'en';
  });

  const toggleLanguage = (selectedLang) => {
    const nextLang = selectedLang || (lang === 'en' ? 'hi' : 'en');
    setLang(nextLang);
    localStorage.setItem('ras_language', nextLang);
  };

  // Helper function: if lang === 'hi' returns hiText, otherwise enText
  const t = (enText, hiText) => {
    if (lang === 'hi' && hiText) return hiText;
    return enText;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: toggleLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      toggleLanguage: () => {},
      t: (en, hi) => en,
    };
  }
  return context;
};

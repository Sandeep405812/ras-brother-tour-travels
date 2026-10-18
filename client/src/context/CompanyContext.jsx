import React, { createContext, useContext, useState, useEffect } from 'react';

const CompanyContext = createContext(null);

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState({
    companyName: 'RAS Brother Tour & Travels',
    tagline: 'Premium Local Car Rental & Event Transportation Marketplace',
    email: 'contact@rasbrothertravels.com',
    phone: '+91 98765 43210',
    altPhone: '+91 98111 22334',
    address: 'Shop 14, Main Market, Sector 18, Noida, Uttar Pradesh 201301',
    website: 'https://rasbrothertravels.com',
    supportInformation: '24/7 dedicated event concierge and luxury fleet dispatch support',
    gstNumber: '07AAAAA0000A1Z5',
    upiId: '9918272164@okaxis',
    logo: '/brand/ras-logo-primary.svg',
    logoDark: '/brand/ras-logo-dark.svg',
    logoLight: '/brand/ras-logo-light.svg',
    favicon: '/brand/favicon.svg',
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/company-settings/public');
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        return;
      }
      if (data.success && data.settings) {
        setCompany(data.settings);
      }
    } catch (err) {
      console.warn('Could not fetch public company settings, using defaults:', err.message);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <CompanyContext.Provider value={{ company, setCompany, refreshCompany: fetchSettings }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);

const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    default: 'RAS Brother Tour & Travels',
  },
  tagline: {
    type: String,
    default: 'Premium Local Car Rental & Event Transportation Marketplace',
  },
  logo: {
    type: String,
    default: '/brand/ras-logo-primary.svg',
  },
  logoLight: {
    type: String,
    default: '/brand/ras-logo-light.svg',
  },
  logoDark: {
    type: String,
    default: '/brand/ras-logo-dark.svg',
  },
  favicon: {
    type: String,
    default: '/brand/favicon.svg',
  },
  email: {
    type: String,
    default: 'contact@rasbrothertravels.com',
  },
  phone: {
    type: String,
    default: '+91 98765 43210',
  },
  altPhone: {
    type: String,
    default: '+91 98111 22334',
  },
  address: {
    type: String,
    default: 'Shop 14, Main Market, Sector 18, Noida, Uttar Pradesh 201301',
  },
  website: {
    type: String,
    default: 'https://rasbrothertravels.com',
  },
  supportInformation: {
    type: String,
    default: '24/7 dedicated customer concierge & emergency road support',
  },
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com/rasbrothertravels' },
    instagram: { type: String, default: 'https://instagram.com/rasbrothertravels' },
    twitter: { type: String, default: 'https://twitter.com/rasbrother' },
    youtube: { type: String, default: 'https://youtube.com/@rasbrothertravels' },
    whatsapp: { type: String, default: '+919876543210' },
  },
  gstNumber: {
    type: String,
    default: '07AAAAA0000A1Z5',
  },
  upiId: {
    type: String,
    default: '9918272164@okaxis',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CompanySettings', companySettingsSchema);

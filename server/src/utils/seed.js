require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const OwnerProfile = require('../models/OwnerProfile');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Coupon = require('../models/Coupon');
const Commission = require('../models/Commission');
const CompanySettings = require('../models/CompanySettings');
const Review = require('../models/Review');
const ServiceArea = require('../models/ServiceArea');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ras_brother_tour_travels');
  console.log('[Seed]: Connected to MongoDB');
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed]: Cleaning existing records...');
    await User.deleteMany();
    await OwnerProfile.deleteMany();
    await Car.deleteMany();
    await Booking.deleteMany();
    await Coupon.deleteMany();
    await Commission.deleteMany();
    await CompanySettings.deleteMany();
    await Review.deleteMany();
    await ServiceArea.deleteMany();

    console.log('[Seed]: Creating Company Settings for RAS Brother Tour & Travels...');
    await CompanySettings.create({
      companyName: 'RAS Brother Tour & Travels',
      tagline: 'Premium Local Car Rental & Event Transportation Marketplace',
      email: 'contact@rasbrothertravels.com',
      phone: '+91 98765 43210',
      altPhone: '+91 98111 22334',
      address: 'Shop 14, Main Market, Sector 18, Noida, Uttar Pradesh 201301',
      website: 'https://rasbrothertravels.com',
      supportInformation: '24/7 dedicated event concierge and luxury fleet dispatch support',
      gstNumber: '07AAAAA0000A1Z5',
    });

    console.log('[Seed]: Creating Commission & Coupons...');
    await Commission.create({
      platformRatePercentage: 10,
      fixedBookingFee: 199,
      taxPercentage: 5,
    });

    await Coupon.insertMany([
      {
        code: 'RASWEDDING',
        discountType: 'percentage',
        discountValue: 15,
        minBookingAmount: 10000,
        maxDiscount: 3000,
      },
      {
        code: 'WELCOME500',
        discountType: 'flat',
        discountValue: 500,
        minBookingAmount: 3000,
        maxDiscount: 500,
      },
      {
        code: 'FESTIVE10',
        discountType: 'percentage',
        discountValue: 10,
        minBookingAmount: 5000,
        maxDiscount: 2000,
      },
    ]);

    console.log('[Seed]: Creating Service Areas...');
    await ServiceArea.insertMany([
      { city: 'Noida', state: 'Uttar Pradesh', coordinates: { type: 'Point', coordinates: [77.3910, 28.5355] }, radiusKm: 60 },
      { city: 'New Delhi', state: 'Delhi', coordinates: { type: 'Point', coordinates: [77.2090, 28.6139] }, radiusKm: 70 },
      { city: 'Gurugram', state: 'Haryana', coordinates: { type: 'Point', coordinates: [77.0266, 28.4595] }, radiusKm: 60 },
      { city: 'Jaipur', state: 'Rajasthan', coordinates: { type: 'Point', coordinates: [75.7873, 26.9124] }, radiusKm: 80 },
      { city: 'Agra', state: 'Uttar Pradesh', coordinates: { type: 'Point', coordinates: [78.0081, 27.1767] }, radiusKm: 50 },
    ]);

    console.log('[Seed]: Creating Users...');
    const defaultSeedPassword = process.env.SEED_DEFAULT_PASSWORD || 'DevSeed2026!Secure';

    // Admin
    const admin = await User.create({
      name: 'Admin RAS Brother',
      email: 'admin@rasbrother.com',
      password: defaultSeedPassword,
      phone: '+91 98765 00001',
      role: 'admin',
      address: 'Corporate Tower, Central Delhi',
      city: 'New Delhi',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    // Owners
    const owner1 = await User.create({
      name: 'Vikramaditya Rathore',
      email: 'owner1@rasbrother.com',
      password: defaultSeedPassword,
      phone: '+91 98765 11111',
      role: 'owner',
      address: 'Block C, Sector 15, Noida',
      city: 'Noida',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });

    const ownerProfile1 = await OwnerProfile.create({
      user: owner1._id,
      businessName: 'Rathore Royal Chauffeur & Wedding Cars',
      bio: 'Leading luxury fleet provider specializing in high-end wedding cavalcades, VIP corporate travels, and ceremonial motorcades across North India.',
      address: 'Block C, Sector 15, Noida, UP',
      city: 'Noida',
      rating: 4.9,
      totalReviews: 24,
      totalBookings: 38,
      totalEarnings: 285000,
      kycStatus: 'verified',
      location: { type: 'Point', coordinates: [77.3150, 28.5830] },
      bankDetails: {
        accountHolderName: 'Vikramaditya Rathore',
        accountNumber: '918237498234',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank Sector 18',
        upiId: 'rathore.fleet@hdfcbank',
      },
    });

    const owner2 = await User.create({
      name: 'Simranjeet Singh',
      email: 'owner2@rasbrother.com',
      password: defaultSeedPassword,
      phone: '+91 98765 22222',
      role: 'owner',
      address: 'Ring Road, South Extension, New Delhi',
      city: 'New Delhi',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    });

    const ownerProfile2 = await OwnerProfile.create({
      user: owner2._id,
      businessName: 'Singh Heritage & Celebration Fleet',
      bio: 'Authentic vintage convertibles, open-top photoshoot cruisers, and premium SUVs with verified polite chauffeurs for special occasions.',
      address: 'Ring Road, South Extension, New Delhi',
      city: 'New Delhi',
      rating: 4.8,
      totalReviews: 18,
      totalBookings: 29,
      totalEarnings: 194000,
      kycStatus: 'verified',
      location: { type: 'Point', coordinates: [77.2200, 28.5700] },
      bankDetails: {
        accountHolderName: 'Simranjeet Singh',
        accountNumber: '827364829102',
        ifscCode: 'ICIC0000456',
        bankName: 'ICICI Bank South Ex',
        upiId: 'singh.celebrations@icici',
      },
    });

    // Customers
    const customer1 = await User.create({
      name: 'Rahul Sharma',
      email: 'customer1@rasbrother.com',
      password: defaultSeedPassword,
      phone: '+91 98111 55555',
      role: 'customer',
      address: 'Indirapuram, Ghaziabad',
      city: 'Ghaziabad',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    });

    const customer2 = await User.create({
      name: 'Pooja Verma',
      email: 'customer2@rasbrother.com',
      password: defaultSeedPassword,
      phone: '+91 98111 66666',
      role: 'customer',
      address: 'Greater Kailash 1, New Delhi',
      city: 'New Delhi',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    });

    console.log('[Seed]: Creating Premium Cars Fleet...');
    const carsData = [
      {
        owner: owner1._id,
        ownerProfile: ownerProfile1._id,
        name: 'Ghost Series II - White Edition',
        brand: 'Rolls-Royce',
        model: 'Ghost',
        variant: 'Extended Wheelbase Luxury',
        year: 2023,
        color: 'Diamond White with Gold Pinstripe',
        seatingCapacity: 4,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        isAC: true,
        category: 'Wedding Special',
        description: 'The pinnacle of ceremonial arrival. Features handcrafted starlight headliner, pure lambswool rugs, privacy blinds, and signature champagne flutes. Ideal for grand royal weddings and reception bride-groom entry.',
        features: ['Starlight Headliner', 'Champagne Chiller', 'Lambswool Carpets', 'Uniformed Chauffeur', 'Red Carpet Arrival', 'Soundproof Cabin'],
        images: {
          main: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1563720358988-cb9b11915664?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
          ],
        },
        pricing: {
          basePrice: 35000,
          perHour: 4500,
          perDay: 35000,
          extraKmRate: 150,
          driverCharges: 1500,
          nightCharges: 1000,
          decorationCharges: 3500,
        },
        advancePayment: { type: 'percentage', value: 20 },
        location: {
          type: 'Point',
          coordinates: [77.3150, 28.5830],
          address: 'Sector 18, Noida, Uttar Pradesh',
          city: 'Noida',
        },
        weddingSpecial: true,
        vipChauffeur: true,
        ratingsAverage: 5.0,
        ratingsQuantity: 14,
      },
      {
        owner: owner1._id,
        ownerProfile: ownerProfile1._id,
        name: 'S-Class S450 4MATIC',
        brand: 'Mercedes-Benz',
        model: 'S-Class',
        variant: 'Chauffeur Package',
        year: 2024,
        color: 'Obsidian Black',
        seatingCapacity: 4,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        isAC: true,
        category: 'Luxury',
        description: 'World-renowned executive luxury sedan. Features executive rear reclining seats with massage function, Burmester 3D Surround sound, rear entertainment screens, and serene airmatic suspension.',
        features: ['Reclining Massage Seats', 'Burmester 3D Audio', 'Airmatic Suspension', 'Panoramic Sunroof', 'Rear Executive Tables', 'Ambient Lighting 64-colors'],
        images: {
          main: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [],
        },
        pricing: {
          basePrice: 18000,
          perHour: 2500,
          perDay: 18000,
          extraKmRate: 80,
          driverCharges: 800,
          nightCharges: 600,
          decorationCharges: 2500,
        },
        advancePayment: { type: 'percentage', value: 25 },
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: 'Connaught Place, New Delhi',
          city: 'New Delhi',
        },
        weddingSpecial: true,
        vipChauffeur: true,
        ratingsAverage: 4.9,
        ratingsQuantity: 19,
      },
      {
        owner: owner2._id,
        ownerProfile: ownerProfile2._id,
        name: 'Mustang Fastback V8 1969',
        brand: 'Ford',
        model: 'Mustang',
        variant: 'Heritage Classic Convertible',
        year: 1969,
        color: 'Candy Apple Red with Racing Stripes',
        seatingCapacity: 4,
        fuelType: 'Petrol',
        transmission: 'Manual',
        isAC: true,
        category: 'Vintage',
        description: 'Iconic American classic cruiser with roaring V8 muscle sound and convertible top. The absolute showstopper for pre-wedding couple photoshoots, music videos, bridegroom vintage entry, and fashion parties.',
        features: ['Convertible Open Top', 'Authentic V8 Engine', 'Leather Bucket Seats', 'Chrome Spoke Wheels', 'Photogenic Retro Aesthetics'],
        images: {
          main: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [],
        },
        pricing: {
          basePrice: 15000,
          perHour: 2200,
          perDay: 15000,
          extraKmRate: 60,
          driverCharges: 1000,
          nightCharges: 500,
          decorationCharges: 2000,
        },
        advancePayment: { type: 'fixed', value: 3000 },
        location: {
          type: 'Point',
          coordinates: [77.2200, 28.5700],
          address: 'South Extension Part II, New Delhi',
          city: 'New Delhi',
        },
        weddingSpecial: true,
        vipChauffeur: true,
        ratingsAverage: 4.9,
        ratingsQuantity: 12,
      },
      {
        owner: owner2._id,
        ownerProfile: ownerProfile2._id,
        name: 'Thar 4x4 Convertible Top Edition',
        brand: 'Mahindra',
        model: 'Thar',
        variant: 'Hardtop & Soft-top Convertible',
        year: 2024,
        color: 'Napoli Black with Red Accents',
        seatingCapacity: 4,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        isAC: true,
        category: 'Party Car',
        description: 'Open-top party favourite! Equipped with booming JBL bass audio setup, auxiliary party lights, and rugged posture. Ideal for wedding baraat processions, bachelor trips, birthday party convoys, and adventure shoots.',
        features: ['Convertible Open Roof', 'Party DJ Bass Audio', 'Auxiliary LED Strobe Lights', 'All-Terrain 4x4', 'High Ground Clearance'],
        images: {
          main: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [],
        },
        pricing: {
          basePrice: 6500,
          perHour: 900,
          perDay: 6500,
          extraKmRate: 20,
          driverCharges: 600,
          nightCharges: 400,
          decorationCharges: 1200,
        },
        advancePayment: { type: 'fixed', value: 1500 },
        location: {
          type: 'Point',
          coordinates: [77.0266, 28.4595],
          address: 'Cyber Hub, DLF Phase 2, Gurugram',
          city: 'Gurugram',
        },
        weddingSpecial: false,
        vipChauffeur: true,
        ratingsAverage: 4.8,
        ratingsQuantity: 28,
      },
      {
        owner: owner1._id,
        ownerProfile: ownerProfile1._id,
        name: 'Fortuner Legender 4x4',
        brand: 'Toyota',
        model: 'Fortuner',
        variant: 'Legender Dual Tone Black & White',
        year: 2024,
        color: 'Pearl White with Black Roof',
        seatingCapacity: 7,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        isAC: true,
        category: 'SUV',
        description: 'Imposing, powerful road presence with unmatched reliability. Preferred choice for politician and VIP security escort, high-profile wedding convoys, outstation tours, and corporate guest delegations.',
        features: ['VIP Cavalcade Escort Ready', '7 Passenger Seating', 'Dual-Tone Leather Seats', 'Wireless Phone Charger', 'Rear Power Tailgate'],
        images: {
          main: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [],
        },
        pricing: {
          basePrice: 8500,
          perHour: 1200,
          perDay: 8500,
          extraKmRate: 25,
          driverCharges: 700,
          nightCharges: 500,
          decorationCharges: 1500,
        },
        advancePayment: { type: 'percentage', value: 20 },
        location: {
          type: 'Point',
          coordinates: [77.3910, 28.5355],
          address: 'Sector 62, Noida, Uttar Pradesh',
          city: 'Noida',
        },
        weddingSpecial: true,
        vipChauffeur: true,
        ratingsAverage: 4.9,
        ratingsQuantity: 31,
      },
      {
        owner: owner1._id,
        ownerProfile: ownerProfile1._id,
        name: 'BMW 7 Series 740Li M-Sport',
        brand: 'BMW',
        model: '7 Series',
        variant: 'M-Sport Flagship',
        year: 2023,
        color: 'Mineral White Metallic',
        seatingCapacity: 4,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        isAC: true,
        category: 'Luxury',
        description: 'The ultra-modern limousine with 31.3-inch 8K BMW Theatre Screen in the ceiling, Bowers & Wilkins surround sound, and lounge seating. Ideal for tech leaders, grand marriage entrances, and high-stakes events.',
        features: ['31.3 inch Ceiling Theatre Screen', 'Bowers & Wilkins Diamond Sound', 'Sky Lounge Panoramic Glass', 'Automatic Soft-Close Doors'],
        images: {
          main: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [],
        },
        pricing: {
          basePrice: 20000,
          perHour: 2800,
          perDay: 20000,
          extraKmRate: 90,
          driverCharges: 900,
          nightCharges: 700,
          decorationCharges: 2500,
        },
        advancePayment: { type: 'percentage', value: 20 },
        location: {
          type: 'Point',
          coordinates: [77.0850, 28.4900],
          address: 'Golf Course Road, Gurugram',
          city: 'Gurugram',
        },
        weddingSpecial: true,
        vipChauffeur: true,
        ratingsAverage: 4.9,
        ratingsQuantity: 15,
      },
      {
        owner: owner2._id,
        ownerProfile: ownerProfile2._id,
        name: 'Jaguar XF Prestige Wedding Edition',
        brand: 'Jaguar',
        model: 'XF',
        variant: 'Prestige Chauffeur Package',
        year: 2023,
        color: 'Fuji White',
        seatingCapacity: 4,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        isAC: true,
        category: 'Wedding Special',
        description: 'Sleek British elegance made famous for wedding garland ribbons and floral arches. Smooth ride with whisper-quiet cabin and elegant champagne interior.',
        features: ['British Luxury Styling', 'Meridian Audio System', 'Dual-Zone Climate Control', 'Chauffeur Driven Specialist'],
        images: {
          main: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [],
        },
        pricing: {
          basePrice: 12000,
          perHour: 1800,
          perDay: 12000,
          extraKmRate: 50,
          driverCharges: 700,
          nightCharges: 500,
          decorationCharges: 2000,
        },
        advancePayment: { type: 'fixed', value: 2500 },
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: 'Barakhamba Road, Connaught Place, New Delhi',
          city: 'New Delhi',
        },
        weddingSpecial: true,
        vipChauffeur: true,
        ratingsAverage: 4.8,
        ratingsQuantity: 22,
      },
      {
        owner: owner1._id,
        ownerProfile: ownerProfile1._id,
        name: 'Kia Carnival Limousine VIP',
        brand: 'Kia',
        model: 'Carnival',
        variant: 'Limousine Plus 7-Seater',
        year: 2024,
        color: 'Aurora Black Pearl',
        seatingCapacity: 7,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        isAC: true,
        category: 'Premium',
        description: 'First-class aircraft comfort on wheels. Features VIP captain seats with extending leg rests, dual electric sunroofs, and rear entertainment screens. Ideal for transporting VIP wedding guests, family delegates, and corporate executives.',
        features: ['VIP Captain Reclining Chairs', 'Leg Ottoman Support', 'Dual Sunroofs', 'Smart Power Sliding Doors', 'Huge Luggage Capacity'],
        images: {
          main: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [],
        },
        pricing: {
          basePrice: 7500,
          perHour: 1000,
          perDay: 7500,
          extraKmRate: 22,
          driverCharges: 600,
          nightCharges: 400,
          decorationCharges: 1000,
        },
        advancePayment: { type: 'percentage', value: 20 },
        location: {
          type: 'Point',
          coordinates: [77.3150, 28.5830],
          address: 'Sector 15, Noida, Uttar Pradesh',
          city: 'Noida',
        },
        weddingSpecial: false,
        vipChauffeur: true,
        ratingsAverage: 4.9,
        ratingsQuantity: 18,
      },
      {
        owner: owner2._id,
        ownerProfile: ownerProfile2._id,
        name: 'Honda City ZX Top Model',
        brand: 'Honda',
        model: 'City',
        variant: 'ZX Sunroof Edition',
        year: 2024,
        color: 'Golden Brown Metallic',
        seatingCapacity: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        isAC: true,
        category: 'Sedan',
        description: 'Smooth, executive comfort sedan for airport transfers, local city tours, birthday dinners, and guest travel. Excellent fuel efficiency and spacious rear legroom.',
        features: ['Electric Sunroof', 'Leather Upholstery', 'Rear AC Vents', 'Apple CarPlay & Android Auto', 'Spacious 506L Trunk'],
        images: {
          main: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [],
        },
        pricing: {
          basePrice: 3500,
          perHour: 500,
          perDay: 3500,
          extraKmRate: 14,
          driverCharges: 400,
          nightCharges: 300,
          decorationCharges: 800,
        },
        advancePayment: { type: 'fixed', value: 800 },
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: 'Karol Bagh, New Delhi',
          city: 'New Delhi',
        },
        weddingSpecial: false,
        vipChauffeur: true,
        ratingsAverage: 4.7,
        ratingsQuantity: 34,
      },
      {
        owner: owner2._id,
        ownerProfile: ownerProfile2._id,
        name: 'Hyundai Creta SX Turbo',
        brand: 'Hyundai',
        model: 'Creta',
        variant: 'SX Panoramic Sunroof',
        year: 2024,
        color: 'Ranger Khaki Dual Tone',
        seatingCapacity: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        isAC: true,
        category: 'Budget',
        description: 'India\'s most popular compact SUV. Perfect for budget-friendly weddings, family trips, outstation getaways to Agra/Jaipur, and corporate site visits.',
        features: ['Panoramic Sunroof', 'Ventilated Seats', 'Bose Premium Audio', 'Wireless Charging', 'High Riding Stance'],
        images: {
          main: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
          front: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
          rear: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
          side: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
          interior: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
          dashboard: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          gallery: [],
        },
        pricing: {
          basePrice: 3200,
          perHour: 450,
          perDay: 3200,
          extraKmRate: 13,
          driverCharges: 400,
          nightCharges: 300,
          decorationCharges: 800,
        },
        advancePayment: { type: 'fixed', value: 700 },
        location: {
          type: 'Point',
          coordinates: [77.2200, 28.5700],
          address: 'Lajpat Nagar, New Delhi',
          city: 'New Delhi',
        },
        weddingSpecial: false,
        vipChauffeur: true,
        ratingsAverage: 4.8,
        ratingsQuantity: 27,
      },
    ];

    const insertedCars = await Car.insertMany(carsData);
    console.log(`[Seed]: Inserted ${insertedCars.length} luxury & event cars.`);

    // Seed a completed sample booking and review
    const sampleBooking = await Booking.create({
      bookingId: 'RAS-BK-918234',
      customer: customer1._id,
      owner: owner1._id,
      car: insertedCars[0]._id, // Rolls Royce
      eventType: 'Wedding Car Booking',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      startTime: '04:00 PM',
      endTime: '02:00 AM',
      durationDays: 1,
      pickupLocation: {
        address: 'Radisson Blu Hotel, Sector 18, Noida',
        coordinates: [77.3200, 28.5700],
      },
      destinationAddress: 'The Grand Ballroom, New Delhi',
      decorationRequired: true,
      driverRequired: true,
      pricing: {
        baseAmount: 35000,
        driverCharges: 1500,
        decorationCharges: 3500,
        discountAmount: 1000,
        platformCommission: 3900,
        totalAmount: 39000,
        advanceAmount: 7800,
        remainingAmount: 31200,
      },
      status: 'completed',
      paymentStatus: 'fully_paid',
    });

    await Review.create({
      booking: sampleBooking._id,
      car: insertedCars[0]._id,
      customer: customer1._id,
      owner: owner1._id,
      ratings: {
        overall: 5,
        carCondition: 5,
        cleanliness: 5,
        punctuality: 5,
        service: 5,
      },
      comment: 'Absolutely spectacular service from RAS Brother Tour & Travels! The Rolls Royce arrived 20 minutes prior to schedule, decorated with fresh orchids, and the chauffeur in formal uniform was polite and gracious. Made our wedding night unforgettable!',
      responseFromOwner: 'Thank you Mr. Rahul! It was an absolute honour serving you on your auspicious wedding day.',
      isVerified: true,
    });

    console.log('[Seed]: Successfully completed database seeding!');
    console.log('----------------------------------------------------');
    console.log('Database seeded with admin, fleet owner, and customer accounts.');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();

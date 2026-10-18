// RAS Brother Tour & Travels — Distance, Places & Dynamic Fare Engine

// Verified landmarks, venues, airports & hubs across NCR and North India
export const POPULAR_LOCATIONS = [
  // Airports & Transit
  { name: 'IGI Airport Terminal 3, New Delhi', type: 'airport', icon: '✈️', coords: [77.0863, 28.5562] },
  { name: 'IGI Airport Terminal 1, New Delhi', type: 'airport', icon: '✈️', coords: [77.1124, 28.5684] },
  { name: 'Hindon Airport, Ghaziabad', type: 'airport', icon: '✈️', coords: [77.3588, 28.7061] },
  { name: 'New Delhi Railway Station (NDLS)', type: 'station', icon: '🚆', coords: [77.2215, 28.6430] },
  { name: 'Hazrat Nizamuddin Railway Station', type: 'station', icon: '🚆', coords: [77.2533, 28.5888] },
  { name: 'Anand Vihar Railway & Bus Terminal', type: 'station', icon: '🚆', coords: [77.3153, 28.6508] },
  { name: 'Old Delhi Railway Station (DLI)', type: 'station', icon: '🚆', coords: [77.2289, 28.6606] },

  // Luxury Wedding Venues & 5-Star Hotels
  { name: 'The Leela Palace, Chanakyapuri, New Delhi', type: 'venue', icon: '💍', coords: [77.1914, 28.5786] },
  { name: 'Taj Palace, Diplomatic Enclave, New Delhi', type: 'venue', icon: '💍', coords: [77.1685, 28.5956] },
  { name: 'ITC Maurya, Chanakyapuri, New Delhi', type: 'venue', icon: '💍', coords: [77.1706, 28.5973] },
  { name: 'The Oberoi, Dr Zakir Hussain Marg, New Delhi', type: 'venue', icon: '💍', coords: [77.2393, 28.5997] },
  { name: 'Amaara Farms, Chattarpur, New Delhi', type: 'venue', icon: '💍', coords: [77.1620, 28.4900] },
  { name: 'Tivoli Grand Resort, GT Karnal Road, Delhi', type: 'venue', icon: '💍', coords: [77.1420, 28.7900] },
  { name: 'Chattarpur Temple & Farms, South Delhi', type: 'venue', icon: '💍', coords: [77.1762, 28.5028] },
  { name: 'Radisson Blu MBD, Sector 18, Noida', type: 'venue', icon: '💍', coords: [77.3228, 28.5701] },
  { name: 'Crowne Plaza, Greater Noida', type: 'venue', icon: '💍', coords: [77.5110, 28.4680] },
  { name: 'The Leela Ambience, Gurugram', type: 'venue', icon: '💍', coords: [77.0970, 28.5042] },
  { name: 'Karma Lakelands, Sector 80, Gurugram', type: 'venue', icon: '💍', coords: [76.9580, 28.3750] },
  { name: 'Rambagh Palace & Heritage Lawns, Jaipur', type: 'venue', icon: '🏰', coords: [75.8080, 26.8970] },
  { name: 'ITC Mughal & Taj Gateway, Agra', type: 'venue', icon: '🏰', coords: [78.0410, 27.1610] },

  // Delhi NCR Key Hubs
  { name: 'Connaught Place (CP), Central Delhi', type: 'city', icon: '🏙️', coords: [77.2195, 28.6315] },
  { name: 'India Gate & Central Vista, New Delhi', type: 'city', icon: '🏛️', coords: [77.2295, 28.6129] },
  { name: 'South Extension & Defence Colony, Delhi', type: 'city', icon: '📍', coords: [77.2230, 28.5720] },
  { name: 'Vasant Kunj & Aerocity, New Delhi', type: 'city', icon: '🏙️', coords: [77.1220, 28.5490] },
  { name: 'Sector 18, Mall of India, Noida', type: 'city', icon: '🏙️', coords: [77.3244, 28.5708] },
  { name: 'Sector 62, Electronic City, Noida', type: 'city', icon: '🏙️', coords: [77.3639, 28.6280] },
  { name: 'Sector 137 / Advant Navis, Noida', type: 'city', icon: '📍', coords: [77.4080, 28.5060] },
  { name: 'Pari Chowk, Greater Noida', type: 'city', icon: '📍', coords: [77.5040, 28.4744] },
  { name: 'Gaur City / Noida Extension, Greater Noida West', type: 'city', icon: '📍', coords: [77.4280, 28.6080] },
  { name: 'Cyber Hub & DLF Phase 2, Gurugram', type: 'city', icon: '🏢', coords: [77.0878, 28.4950] },
  { name: 'Golf Course Road / Sector 54, Gurugram', type: 'city', icon: '✨', coords: [77.1025, 28.4595] },
  { name: 'Sohna Road / Subhash Chowk, Gurugram', type: 'city', icon: '📍', coords: [77.0420, 28.4230] },
  { name: 'Indirapuram, Habitat Centre, Ghaziabad', type: 'city', icon: '📍', coords: [77.3712, 28.6415] },
  { name: 'Vaishali Sector 4 / Metro, Ghaziabad', type: 'city', icon: '📍', coords: [77.3410, 28.6490] },
  { name: 'Faridabad Sector 15 / Badkal Lake', type: 'city', icon: '📍', coords: [77.3178, 28.4089] },

  // Major North India Cities & Outstation
  { name: 'Jaipur (Pink City), Rajasthan', type: 'city', icon: '🏰', coords: [75.7873, 26.9124] },
  { name: 'Agra (Taj City), Uttar Pradesh', type: 'city', icon: '🕌', coords: [78.0081, 27.1767] },
  { name: 'Mathura & Vrindavan, Uttar Pradesh', type: 'city', icon: '🛕', coords: [77.6737, 27.4924] },
  { name: 'Meerut City, Uttar Pradesh', type: 'city', icon: '📍', coords: [77.7064, 28.9845] },
  { name: 'Chandigarh (Sector 17 & Mohali)', type: 'city', icon: '🏙️', coords: [76.7794, 30.7333] },
  { name: 'Dehradun & Mussoorie, Uttarakhand', type: 'city', icon: '🌄', coords: [78.0322, 30.3165] },
  { name: 'Haridwar & Rishikesh, Uttarakhand', type: 'city', icon: '🛕', coords: [78.1642, 29.9457] },

  // Eastern & Central UP Hubs
  { name: 'Deoria (City / Sadar), Uttar Pradesh', type: 'city', icon: '🏙️', coords: [83.7788, 26.5024] },
  { name: 'Deoria Railway Station (DEOS)', type: 'station', icon: '🚆', coords: [83.7842, 26.5055] },
  { name: 'Mahuadih, Deoria, Uttar Pradesh', type: 'city', icon: '📍', coords: [83.8200, 26.5500] },
  { name: 'Salempur, Deoria, Uttar Pradesh', type: 'city', icon: '📍', coords: [83.9261, 26.3015] },
  { name: 'Bhatpar Rani, Deoria, Uttar Pradesh', type: 'city', icon: '📍', coords: [84.0200, 26.3200] },
  { name: 'Barhaj, Deoria, Uttar Pradesh', type: 'city', icon: '📍', coords: [83.7483, 26.2755] },
  { name: 'Rudrapur, Deoria, Uttar Pradesh', type: 'city', icon: '📍', coords: [83.6214, 26.4389] },
  { name: 'Gorakhpur Junction (GKP)', type: 'station', icon: '🚆', coords: [83.3820, 26.7588] },
  { name: 'Gorakhpur City / Golghar, Uttar Pradesh', type: 'city', icon: '🏙️', coords: [83.3732, 26.7606] },
  { name: 'Gorakhpur Airport (GOP)', type: 'airport', icon: '✈️', coords: [83.4497, 26.7397] },
  { name: 'Kushinagar (Buddha Relic / Airport)', type: 'city', icon: '🛕', coords: [83.8893, 26.7410] },
  { name: 'Padrauna, Kushinagar, Uttar Pradesh', type: 'city', icon: '📍', coords: [83.8936, 26.9025] },
  { name: 'Hata, Kushinagar, Uttar Pradesh', type: 'city', icon: '📍', coords: [83.7420, 26.7450] },
  { name: 'Maharajganj City, Uttar Pradesh', type: 'city', icon: '📍', coords: [83.5620, 27.1450] },
  { name: 'Basti City & Railway Station, Uttar Pradesh', type: 'city', icon: '📍', coords: [82.7628, 26.7997] },
  { name: 'Khalilabad, Sant Kabir Nagar, Uttar Pradesh', type: 'city', icon: '📍', coords: [83.0720, 26.7820] },
  { name: 'Ayodhya Dham & Ram Mandir, Uttar Pradesh', type: 'city', icon: '🛕', coords: [82.1998, 26.7922] },
  { name: 'Ayodhya Cantt Railway Station', type: 'station', icon: '🚆', coords: [82.1400, 26.7750] },
  { name: 'Lucknow (Hazratganj / Charbagh), Uttar Pradesh', type: 'city', icon: '🏙️', coords: [80.9462, 26.8467] },
  { name: 'Chaudhary Charan Singh Airport (LKO), Lucknow', type: 'airport', icon: '✈️', coords: [80.8836, 26.7606] },
  { name: 'Gomti Nagar, Lucknow, Uttar Pradesh', type: 'city', icon: '🏙️', coords: [80.9980, 26.8520] },
  { name: 'Varanasi (Kashi / Godowlia), Uttar Pradesh', type: 'city', icon: '🛕', coords: [82.9739, 25.3176] },
  { name: 'Varanasi Cantt Railway Station (BSB)', type: 'station', icon: '🚆', coords: [82.9860, 25.3280] },
  { name: 'Lal Bahadur Shastri Airport (VNS), Babatpur', type: 'airport', icon: '✈️', coords: [82.8590, 25.4520] },
  { name: 'Prayagraj (Civil Lines / Sangam), Uttar Pradesh', type: 'city', icon: '🛕', coords: [81.8463, 25.4358] },
  { name: 'Kanpur Central Railway Station (CNB)', type: 'station', icon: '🚆', coords: [80.3500, 26.4530] },
  { name: 'Kanpur City / Mall Road, Uttar Pradesh', type: 'city', icon: '🏙️', coords: [80.3319, 26.4499] },

  // Bihar Hubs
  { name: 'Patna Junction (PNBE), Bihar', type: 'station', icon: '🚆', coords: [85.1376, 25.6022] },
  { name: 'Jay Prakash Narayan Airport (PAT), Patna', type: 'airport', icon: '✈️', coords: [85.0880, 25.5913] },
  { name: 'Siwan Junction & City, Bihar', type: 'city', icon: '📍', coords: [84.3567, 26.2196] },
  { name: 'Gopalganj City, Bihar', type: 'city', icon: '📍', coords: [84.4447, 26.4687] },
  { name: 'Chhapra (Saran), Bihar', type: 'city', icon: '📍', coords: [84.7460, 25.7796] },
  { name: 'Muzaffarpur Junction & City, Bihar', type: 'city', icon: '📍', coords: [85.3906, 26.1209] },
  { name: 'Gaya Junction & Bodh Gaya, Bihar', type: 'city', icon: '🛕', coords: [85.0002, 24.7955] },
];

// Helper to normalize any input coordinates format into [lng, lat]
export function normalizeCoordinates(val) {
  if (!val) return [77.2090, 28.6139];
  // Array [lng, lat]
  if (Array.isArray(val) && val.length >= 2) {
    // If [lat, lng] was passed where val[0] is lat (20-35) and val[1] is lng (68-98)
    if (val[0] < 40 && val[1] > 60) {
      return [Number(val[1]), Number(val[0])];
    }
    return [Number(val[0]), Number(val[1])];
  }
  // Object { lat, lng } or { latitude, longitude }
  if (typeof val === 'object') {
    const lat = val.lat ?? val.latitude;
    const lng = val.lng ?? val.longitude ?? val.lon;
    if (lat !== undefined && lng !== undefined) {
      return [Number(lng), Number(lat)];
    }
  }
  return [77.2090, 28.6139];
}

// Robust Haversine formula accepting any input format (FALLBACK only)
// calculateHaversineDistance(c1, c2) or calculateHaversineDistance(lat1, lon1, lat2, lon2)
export function calculateHaversineDistance(a, b, c, d) {
  let lon1, lat1, lon2, lat2;

  if (c !== undefined && d !== undefined) {
    // 4 numeric arguments: (lat1, lon1, lat2, lon2)
    lat1 = Number(a);
    lon1 = Number(b);
    lat2 = Number(c);
    lon2 = Number(d);
  } else {
    // 2 coordinate items
    const p1 = normalizeCoordinates(a);
    const p2 = normalizeCoordinates(b);
    lon1 = p1[0];
    lat1 = p1[1];
    lon2 = p2[0];
    lat2 = p2[1];
  }

  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const haversineVal =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const angle = 2 * Math.atan2(Math.sqrt(haversineVal), Math.sqrt(1 - haversineVal));
  const straightKm = R * angle;

  // Fallback multiplier only used when OSRM fails
  const drivingFactor = 1.30;
  const roadKm = Math.round(straightKm * drivingFactor * 10) / 10;

  return roadKm > 0 ? roadKm : 1;
}

// In-memory cache for OSRM road distances
const osrmCache = new Map();

/**
 * Get EXACT road distance via OSRM (Open Source Routing Machine) — Free, no API key.
 * Returns { distanceKm, durationMin, routeGeometry } or falls back to Haversine.
 * Accepts coordinates as [lng, lat] arrays, or { lat, lng } objects.
 */
export async function getRoadDistance(from, to) {
  const p1 = normalizeCoordinates(from);
  const p2 = normalizeCoordinates(to);
  const lon1 = p1[0], lat1 = p1[1];
  const lon2 = p2[0], lat2 = p2[1];

  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return { distanceKm: 0, durationMin: 0, routeGeometry: null, source: 'invalid' };
  }
  if (lat1 === lat2 && lon1 === lon2) {
    return { distanceKm: 0, durationMin: 0, routeGeometry: null, source: 'same' };
  }

  // Cache key rounded to 4 decimal places (~11m precision)
  const cacheKey = `${lon1.toFixed(4)},${lat1.toFixed(4)}-${lon2.toFixed(4)},${lat2.toFixed(4)}`;
  if (osrmCache.has(cacheKey)) {
    return osrmCache.get(cacheKey);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=simplified&geometries=geojson`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Math.round((route.distance / 1000) * 10) / 10; // meters to km, 1 decimal
        const durationMin = Math.round(route.duration / 60);
        const routeGeometry = route.geometry || null;
        const result = { distanceKm, durationMin, routeGeometry, source: 'osrm' };
        osrmCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('OSRM road distance failed, using Haversine fallback:', err.message);
  }

  // Fallback to Haversine if OSRM fails
  const haversineKm = calculateHaversineDistance(p1, p2);
  const fallback = { distanceKm: haversineKm, durationMin: Math.round(haversineKm * 2), routeGeometry: null, source: 'haversine' };
  osrmCache.set(cacheKey, fallback);
  return fallback;
}

// Resolve approximate coordinates from address string
export function resolveCoordinates(address) {
  if (!address || typeof address !== 'string') return [77.2090, 28.6139];

  const lower = address.toLowerCase();

  // 1. Direct match with verified landmark table
  for (const item of POPULAR_LOCATIONS) {
    if (lower.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(lower)) {
      return item.coords;
    }
  }

  // 2. Keyword heuristics
  if (lower.includes('terminal 3') || lower.includes('t3')) return [77.0863, 28.5562];
  if (lower.includes('airport') || lower.includes('igi') || lower.includes('aerocity')) return [77.0863, 28.5562];
  if (lower.includes('chattarpur') || lower.includes('amaara')) return [77.1620, 28.4900];
  if (lower.includes('leela') || lower.includes('chanakyapuri')) return [77.1914, 28.5786];
  if (lower.includes('taj palace') || lower.includes('itc maurya')) return [77.1685, 28.5956];
  if (lower.includes('sector 18') && lower.includes('noida')) return [77.3244, 28.5708];
  if (lower.includes('sector 62') && lower.includes('noida')) return [77.3639, 28.6280];
  if (lower.includes('pari chowk') || lower.includes('greater noida')) return [77.5040, 28.4744];
  if (lower.includes('cyber hub') || lower.includes('gurugram') || lower.includes('gurgaon')) return [77.0878, 28.4950];
  if (lower.includes('golf course') || lower.includes('dlf')) return [77.1025, 28.4595];
  if (lower.includes('indirapuram') || lower.includes('ghaziabad')) return [77.3712, 28.6415];
  if (lower.includes('faridabad')) return [77.3178, 28.4089];
  if (lower.includes('jaipur')) return [75.7873, 26.9124];
  if (lower.includes('agra')) return [78.0081, 27.1767];
  if (lower.includes('mathura') || lower.includes('vrindavan')) return [77.6737, 27.4924];
  if (lower.includes('chandigarh')) return [76.7794, 30.7333];
  if (lower.includes('dehradun') || lower.includes('mussoorie')) return [78.0322, 30.3165];
  if (lower.includes('haridwar') || lower.includes('rishikesh')) return [78.1642, 29.9457];
  if (lower.includes('connaught') || lower.includes('delhi')) return [77.2195, 28.6315];

  return [77.2090, 28.6139];
}

// In-memory cache for ultra-fast autocomplete lookups
const placeCache = new Map();

// Search Places & Landmarks Autocomplete Engine (Ola / Uber Style)
// Suggests every Indian locality, city, landmark, airport, railway station, and street
export async function searchPlaces(query) {
  if (!query || query.trim().length === 0) {
    return POPULAR_LOCATIONS.slice(0, 8);
  }

  const cleanQuery = query.trim();
  const lowerQ = cleanQuery.toLowerCase();

  // Check in-memory cache
  if (placeCache.has(lowerQ)) {
    return placeCache.get(lowerQ);
  }

  // 1. Local verified hubs & landmarks
  const localMatches = POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(lowerQ)
  );

  let onlineMatches = [];

  // 2. Fetch live suggestions from Photon (OpenStreetMap Autocomplete Service)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery + ' India')}&limit=15`;
    const res = await fetch(photonUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features)) {
        onlineMatches = data.features
          .filter((f) => {
            const country = (f.properties?.country || '').toLowerCase();
            const countrycode = (f.properties?.countrycode || '').toLowerCase();
            // Prioritize India
            return countrycode === 'in' || country.includes('india') || !countrycode;
          })
          .map((f) => {
            const p = f.properties || {};
            const coords = f.geometry?.coordinates || [77.2090, 28.6139];
            const name = p.name || p.street || p.city || cleanQuery;

            const addrParts = [
              p.street,
              p.district || p.suburb || p.county,
              p.city,
              p.state,
              p.postcode,
            ].filter(Boolean);

            const fullAddress = addrParts.length > 0 ? addrParts.join(', ') : (p.country || 'India');

            let icon = '📍';
            let type = p.osm_value || p.type || 'place';
            if (p.osm_key === 'aeroway' || p.osm_value === 'aerodrome' || name.toLowerCase().includes('airport')) {
              icon = '✈️';
              type = 'airport';
            } else if (p.osm_key === 'railway' || name.toLowerCase().includes('station') || name.toLowerCase().includes('junction')) {
              icon = '🚆';
              type = 'station';
            } else if (p.osm_key === 'tourism' && p.osm_value === 'hotel') {
              icon = '🏨';
              type = 'hotel';
            }

            return {
              name,
              fullAddress,
              type,
              icon,
              coords,
            };
          });
      }
    }
  } catch (err) {
    console.warn('Photon geocoding error:', err.message);
  }

  // 3. Fallback to OpenStreetMap Nominatim if Photon returned few results
  if (onlineMatches.length < 3) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&countrycodes=in&limit=8&addressdetails=1`;
      const res = await fetch(nomUrl, { headers: { 'Accept-Language': 'en' } });
      if (res.ok) {
        const nomData = await res.json();
        const nomList = nomData.map((item) => {
          const parts = (item.display_name || '').split(',').map((s) => s.trim());
          const name = parts.slice(0, 2).join(', ');
          const fullAddress = parts.slice(2).join(', ') || item.display_name;
          return {
            name,
            fullAddress,
            type: item.type || 'address',
            icon: item.type === 'aerodrome' ? '✈️' : item.type === 'station' ? '🚆' : '📍',
            coords: [parseFloat(item.lon), parseFloat(item.lat)],
          };
        });
        onlineMatches = [...onlineMatches, ...nomList];
      }
    } catch (nomErr) {
      console.warn('Nominatim geocoding error:', nomErr.message);
    }
  }

  // Combine local matches + online suggestions, eliminating duplicates
  const seen = new Set();
  const results = [];

  for (const item of [...localMatches, ...onlineMatches]) {
    const key = `${item.name.toLowerCase()}-${item.coords?.[0]?.toFixed(2)}-${item.coords?.[1]?.toFixed(2)}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(item);
    }
  }

  // If still empty, return typed place with estimated coordinates
  const finalResults = results.length > 0 ? results.slice(0, 10) : [
    { name: cleanQuery, fullAddress: 'Custom Address, India', type: 'custom', icon: '📍', coords: resolveCoordinates(cleanQuery) }
  ];

  placeCache.set(lowerQ, finalResults);
  return finalResults;
}

// Ola/Uber Style Dynamic Fare Breakdown
export function computeTripFare({
  car,
  distanceKm = 0,
  durationDays = 1,
  driverRequired = true,
  decorationRequired = false,
  customDecorationCharge = null,
  couponDiscount = 0,
}) {
  const perDay = car?.pricing?.perDay || car?.pricing?.basePrice || 5000;
  const extraKmRate = car?.pricing?.extraKmRate || 20;
  const driverChargePerDay = car?.pricing?.driverCharges || 500;
  const decorationCharges = customDecorationCharge !== null
    ? customDecorationCharge
    : (decorationRequired ? (car?.pricing?.decorationCharges || 1500) : 0);

  // 80 KM standard daily package included
  const includedKm = 80 * durationDays;
  const extraKm = Math.max(0, distanceKm - includedKm);
  const extraKmCost = Math.round(extraKm * extraKmRate);

  const baseRental = perDay * durationDays;
  const driverTotal = driverRequired ? driverChargePerDay * durationDays : 0;

  const totalBeforeDiscount = baseRental + extraKmCost + driverTotal + decorationCharges;
  const grandTotal = Math.max(0, totalBeforeDiscount - couponDiscount);

  // Advance Calculation
  let advanceAmount = 0;
  if (car?.advancePayment?.type === 'percentage') {
    const pct = car.advancePayment.value || 20;
    advanceAmount = Math.round((grandTotal * pct) / 100);
  } else {
    advanceAmount = Math.min(grandTotal, car?.advancePayment?.value || 1000);
  }

  const remainingBalance = Math.max(0, grandTotal - advanceAmount);

  return {
    distanceKm,
    durationDays,
    includedKm,
    extraKm,
    extraKmCost,
    baseRental,
    driverTotal,
    decorationCharges,
    couponDiscount,
    grandTotal,
    advanceAmount,
    remainingBalance,
    extraKmRate,
  };
}

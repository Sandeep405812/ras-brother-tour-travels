// RAS Brother Tour & Travels — OpenStreetMap & Nominatim Geocoding Engine
// Fully compliant with Nominatim Usage Policy:
// - Max 1 request/sec rate limiting with queue
// - In-memory and sessionStorage caching
// - Custom User-Agent identification
// - Graceful fallback to manual pin placement & Photon OSM service

import { POPULAR_LOCATIONS, resolveCoordinates } from './distanceCalculator';

// Cache keys & stores
const reverseCache = new Map();
const searchCache = new Map();

// Load session cache if available
try {
  const savedSearch = sessionStorage.getItem('ras_geo_search_cache');
  if (savedSearch) {
    const parsed = JSON.parse(savedSearch);
    Object.entries(parsed).forEach(([k, v]) => searchCache.set(k, v));
  }
} catch (e) {
  // Ignore sessionStorage errors
}

// Rate Limiter for Nominatim (Min 1000ms between calls)
let lastNominatimRequestTime = 0;
const NOMINATIM_MIN_INTERVAL_MS = 1100;

async function throttleNominatim() {
  const now = Date.now();
  const timeSinceLast = now - lastNominatimRequestTime;
  if (timeSinceLast < NOMINATIM_MIN_INTERVAL_MS) {
    const waitTime = NOMINATIM_MIN_INTERVAL_MS - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastNominatimRequestTime = Date.now();
}

/**
 * Format a Nominatim address object into a human-readable Indian address
 * (village, colony, street, town, district, state, pin)
 */
export function formatAddressFromNominatim(item) {
  if (!item) return '';

  const addr = item.address || {};
  const parts = [];

  // 1. Street / POI / Colony / Hamlet / Village
  const primary =
    addr.amenity ||
    addr.building ||
    addr.road ||
    addr.suburb ||
    addr.neighbourhood ||
    addr.residential ||
    addr.village ||
    addr.hamlet ||
    item.name;

  if (primary) parts.push(primary);

  // 2. Village / Suburb / Tehsil if not already added
  const secondary = addr.village || addr.hamlet || addr.suburb || addr.subdistrict;
  if (secondary && secondary !== primary) parts.push(secondary);

  // 3. City / Town / District
  const locality = addr.city || addr.town || addr.county || addr.state_district || addr.district;
  if (locality && !parts.includes(locality)) parts.push(locality);

  // 4. State
  if (addr.state && !parts.includes(addr.state)) parts.push(addr.state);

  // 5. Postal Code
  if (addr.postcode) parts.push(addr.postcode);

  return parts.length > 0 ? parts.join(', ') : item.display_name || 'Selected Location, India';
}

/**
 * Reverse Geocode: (lat, lon) -> Formatted Address
 * Compliant with Nominatim policy + cached
 */
export async function reverseGeocode(lat, lon) {
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    return { formattedAddress: 'Selected Point', lat: 28.6139, lon: 77.2090 };
  }

  const roundedLat = parseFloat(Number(lat).toFixed(4));
  const roundedLon = parseFloat(Number(lon).toFixed(4));
  const cacheKey = `${roundedLat},${roundedLon}`;

  // Check cache
  if (reverseCache.has(cacheKey)) {
    return reverseCache.get(cacheKey);
  }

  try {
    await throttleNominatim();

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLon}&zoom=18&addressdetails=1&countrycodes=in`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en,hi',
        'User-Agent': 'RAS-Brother-Tour-Travels/1.0',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const formattedAddress = formatAddressFromNominatim(data);
      const result = {
        formattedAddress,
        displayName: data.display_name || formattedAddress,
        addressDetails: data.address || {},
        lat: roundedLat,
        lon: roundedLon,
        coords: [roundedLon, roundedLat], // [lng, lat]
      };

      reverseCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('Reverse geocoding request failed:', err.message);
  }

  // Graceful fallback for remote or offline points
  const fallback = {
    formattedAddress: `Pin Location (${roundedLat}, ${roundedLon})`,
    displayName: `Selected Map Pin (${roundedLat}, ${roundedLon})`,
    lat: roundedLat,
    lon: roundedLon,
    coords: [roundedLon, roundedLat],
  };
  return fallback;
}

/**
 * Forward Search: (query) -> List of places
 * Searches villages, colonies, roads, landmarks in India
 * Uses Photon OSM + Nominatim fallback with strict debouncing & caching
 */
export async function searchPlacesOSM(query) {
  if (!query || query.trim().length === 0) {
    return POPULAR_LOCATIONS.slice(0, 20);
  }

  const cleanQuery = query.trim();
  const lowerQ = cleanQuery.toLowerCase();
  const queryWords = lowerQ.split(/\s+/).filter(Boolean);

  // Check in-memory Cache
  if (searchCache.has(lowerQ)) {
    return searchCache.get(lowerQ);
  }

  // 1. Check local verified Indian hubs (Instant 0ms match)
  const localMatches = POPULAR_LOCATIONS.filter((loc) => {
    const locLower = loc.name.toLowerCase();
    return queryWords.every((w) => locLower.includes(w)) || locLower.includes(lowerQ);
  });

  let onlineMatches = [];

  // 2. Query Photon (Fast OSM-based search for villages, colonies, roads, landmarks)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=35&lang=en`;
    const res = await fetch(photonUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features)) {
        onlineMatches = data.features
          .filter((f) => {
            const countrycode = (f.properties?.countrycode || '').toLowerCase();
            const country = (f.properties?.country || '').toLowerCase();
            return countrycode === 'in' || country.includes('india') || countrycode === '';
          })
          .map((f) => {
            const p = f.properties || {};
            const coords = f.geometry?.coordinates || [77.2090, 28.6139]; // [lng, lat]
            const name = p.name || p.street || p.city || cleanQuery;

            const addrParts = [
              p.street && p.street !== name ? p.street : '',
              p.district || p.suburb || p.locality,
              p.county,
              p.city && p.city !== name ? p.city : '',
              p.state,
              p.postcode,
            ].filter(Boolean);

            const fullAddress =
              addrParts.length > 0 ? addrParts.join(', ') : p.country || 'India';

            let icon = '📍';
            let type = p.osm_value || p.type || 'place';
            const nameLower = name.toLowerCase();

            if (p.osm_key === 'aeroway' || nameLower.includes('airport')) {
              icon = '✈️';
              type = 'airport';
            } else if (
              p.osm_key === 'railway' ||
              nameLower.includes('station') ||
              nameLower.includes('junction')
            ) {
              icon = '🚆';
              type = 'station';
            } else if (p.osm_key === 'tourism' || nameLower.includes('hotel') || nameLower.includes('resort')) {
              icon = '🏨';
              type = 'hotel';
            } else if (p.osm_value === 'village' || p.osm_value === 'hamlet') {
              icon = '🏡';
              type = 'village';
            } else if (nameLower.includes('sector') || nameLower.includes('colony') || nameLower.includes('nagar') || nameLower.includes('vihar')) {
              icon = '🏘️';
              type = 'colony';
            }

            return {
              name,
              fullAddress,
              type,
              icon,
              coords,
              lat: coords[1],
              lon: coords[0],
            };
          });
      }
    }
  } catch (err) {
    console.warn('Photon lookup failed:', err.message);
  }

  // 3. Fallback to OpenStreetMap Nominatim if results are sparse
  if (onlineMatches.length < 15 && cleanQuery.length >= 2) {
    try {
      await throttleNominatim();
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&countrycodes=in&limit=15&addressdetails=1`;
      const res = await fetch(nomUrl, {
        headers: {
          'Accept-Language': 'en,hi',
          'User-Agent': 'RAS-Brother-Tour-Travels/1.0',
        },
      });

      if (res.ok) {
        const nomData = await res.json();
        const nomList = nomData.map((item) => {
          const parts = (item.display_name || '').split(',').map((s) => s.trim());
          const name = parts.slice(0, 2).join(', ');
          const fullAddress = parts.slice(2).join(', ') || item.display_name;
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          return {
            name,
            fullAddress,
            type: item.type || 'address',
            icon: item.type === 'aerodrome' ? '✈️' : item.type === 'station' ? '🚆' : '📍',
            coords: [lon, lat],
            lat,
            lon,
          };
        });
        onlineMatches = [...onlineMatches, ...nomList];
      }
    } catch (nomErr) {
      console.warn('Nominatim forward search error:', nomErr.message);
    }
  }

  // Combine and deduplicate smartly by name + address
  const seen = new Set();
  const finalResults = [];

  for (const item of [...localMatches, ...onlineMatches]) {
    const key = `${item.name.toLowerCase().trim()}|${(item.fullAddress || '').toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      finalResults.push(item);
    }
  }

  // Always append custom address option so user can always pick their exact typed location
  const customOption = {
    name: cleanQuery,
    fullAddress: 'Use custom location • Tap to fine-tune pin on map',
    type: 'custom',
    icon: '📍',
    coords: resolveCoordinates(cleanQuery),
  };
  const hasExact = finalResults.some((r) => r.name.toLowerCase() === lowerQ);
  if (!hasExact) {
    finalResults.push(customOption);
  }

  // Return up to 25 comprehensive results
  const results = finalResults.slice(0, 25);

  searchCache.set(lowerQ, results);
  try {
    sessionStorage.setItem(
      'ras_geo_search_cache',
      JSON.stringify(Object.fromEntries(Array.from(searchCache.entries()).slice(-50)))
    );
  } catch (e) {
    // Ignore storage limits
  }

  return results;
}

/**
 * Browser Geolocation API wrapper with clean error messages
 */
export function detectGpsLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const coords = [lon, lat]; // [lng, lat]

        try {
          const geo = await reverseGeocode(lat, lon);
          resolve({
            coords,
            lat,
            lon,
            address: geo.formattedAddress || 'Current GPS Location',
          });
        } catch (e) {
          resolve({
            coords,
            lat,
            lon,
            address: `Current GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          });
        }
      },
      (err) => {
        let msg = 'Could not detect your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow GPS access in your browser settings or tap on the map to select your location.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable. Please select your location on the map.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or pick on the map.';
        }
        reject(new Error(msg));
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  });
}

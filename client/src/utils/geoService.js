// RAS Brother Tour & Travels
// Dynamic Google Places + GPS Geolocation Service

import {
  setOptions,
  importLibrary,
} from '@googlemaps/js-api-loader';

let placesLoaded = false;
let placesModule = null;
let sessionToken = null;

// ---------------------------------------------------------
// Load Google Places
// ---------------------------------------------------------

async function loadGooglePlaces() {
  if (placesLoaded && placesModule) {
    return placesModule;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  if (!apiKey) return null;

  setOptions({
    key: apiKey,
    v: 'weekly',
  });

  placesModule = await importLibrary('places');

  placesLoaded = true;

  return placesModule;
}

// ---------------------------------------------------------
// Format Google Place
// ---------------------------------------------------------

function formatGooglePlace(place, prediction = null) {
  const location = place.location;

  if (!location) {
    return null;
  }

  const lat =
    typeof location.lat === 'function'
      ? location.lat()
      : location.lat;

  const lng =
    typeof location.lng === 'function'
      ? location.lng()
      : location.lng;

  const name =
    place.displayName ||
    prediction?.text?.toString() ||
    'Selected Location';

  const fullAddress =
    place.formattedAddress ||
    name;

  return {
    name,
    fullAddress,
    address: fullAddress,

    type:
      prediction?.types?.[0] ||
      'place',

    icon: '📍',

    coords: [lng, lat],

    lat,
    lon: lng,
    lng,
  };
}

// ---------------------------------------------------------
// Google Places Search
// ---------------------------------------------------------

export async function searchPlacesOSM(query) {
  if (!query || !query.trim()) {
    return [];
  }

  try {
    const {
      AutocompleteSuggestion,
      AutocompleteSessionToken,
    } = await loadGooglePlaces();

    if (!sessionToken) {
      sessionToken = new AutocompleteSessionToken();
    }

    const request = {
      input: query.trim(),

      sessionToken,

      includedRegionCodes: ['in'],

      language: 'en-IN',

      region: 'in',
    };

    const response =
      await AutocompleteSuggestion.fetchAutocompleteSuggestions(
        request
      );

    const suggestions =
      response?.suggestions || [];

    const results = [];

    for (const suggestion of suggestions) {
      const prediction =
        suggestion?.placePrediction;

      if (!prediction) {
        continue;
      }

      try {
        const place =
          prediction.toPlace();

        await place.fetchFields({
          fields: [
            'displayName',
            'formattedAddress',
            'location',
          ],
        });

        const formatted =
          formatGooglePlace(
            place,
            prediction
          );

        if (formatted) {
          results.push(formatted);
        }
      } catch (placeError) {
        console.warn(
          'Google Place details failed:',
          placeError.message
        );
      }
    }

    return results;
  } catch (error) {
    console.error(
      'Google Places search error:',
      error
    );

    return [];
  }
}

// ---------------------------------------------------------
// Reverse Geocode
// ---------------------------------------------------------

export async function reverseGeocode(lat, lon) {
  if (
    lat === undefined ||
    lon === undefined ||
    lat === null ||
    lon === null ||
    Number.isNaN(Number(lat)) ||
    Number.isNaN(Number(lon))
  ) {
    return {
      formattedAddress: 'Selected Point',
      displayName: 'Selected Point',
      lat: null,
      lon: null,
      coords: null,
    };
  }

  const latitude = Number(lat);
  const longitude = Number(lon);

  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=json` +
      `&lat=${latitude}` +
      `&lon=${longitude}` +
      `&zoom=18` +
      `&addressdetails=1` +
      `&countrycodes=in`;

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en,hi',
      },
    });

    if (response.ok) {
      const data = await response.json();

      const formattedAddress =
        formatAddressFromNominatim(data);

      return {
        formattedAddress,

        displayName:
          data.display_name ||
          formattedAddress,

        addressDetails:
          data.address || {},

        lat: latitude,

        lon: longitude,

        coords: [
          longitude,
          latitude,
        ],
      };
    }
  } catch (error) {
    console.warn(
      'Reverse geocoding failed:',
      error.message
    );
  }

  // If reverse geocoding fails,
  // keep the actual selected coordinates.
  return {
    formattedAddress:
      `Pin Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,

    displayName:
      `Selected Map Pin (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,

    lat: latitude,

    lon: longitude,

    coords: [
      longitude,
      latitude,
    ],
  };
}

// ---------------------------------------------------------
// Format Nominatim Address
// ---------------------------------------------------------

export function formatAddressFromNominatim(item) {
  if (!item) {
    return '';
  }

  const addr = item.address || {};

  const parts = [];

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

  if (primary) {
    parts.push(primary);
  }

  const secondary =
    addr.village ||
    addr.hamlet ||
    addr.suburb ||
    addr.subdistrict;

  if (
    secondary &&
    secondary !== primary
  ) {
    parts.push(secondary);
  }

  const locality =
    addr.city ||
    addr.town ||
    addr.county ||
    addr.state_district ||
    addr.district;

  if (
    locality &&
    !parts.includes(locality)
  ) {
    parts.push(locality);
  }

  if (
    addr.state &&
    !parts.includes(addr.state)
  ) {
    parts.push(addr.state);
  }

  if (addr.postcode) {
    parts.push(addr.postcode);
  }

  return parts.length > 0
    ? parts.join(', ')
    : item.display_name ||
      'Selected Location';
}

// ---------------------------------------------------------
// GPS Location
// ---------------------------------------------------------

export function detectGpsLocation() {
  return new Promise(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            'Geolocation is not supported by your browser.'
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat =
            position.coords.latitude;

          const lon =
            position.coords.longitude;

          const coords = [
            lon,
            lat,
          ];

          try {
            const geo =
              await reverseGeocode(
                lat,
                lon
              );

            resolve({
              coords,

              lat,

              lon,

              address:
                geo.formattedAddress ||
                'Current GPS Location',
            });
          } catch (error) {
            resolve({
              coords,

              lat,

              lon,

              address:
                `Current GPS Location (${lat.toFixed(
                  4
                )}, ${lon.toFixed(4)})`,
            });
          }
        },

        (error) => {
          let message =
            'Could not detect your location.';

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            message =
              'Location permission was denied. Please allow GPS access in your browser settings.';
          } else if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {
            message =
              'Location information is unavailable. Please select your location manually.';
          } else if (
            error.code ===
            error.TIMEOUT
          ) {
            message =
              'Location request timed out. Please try again.';
          }

          reject(
            new Error(message)
          );
        },

        {
          timeout: 12000,

          enableHighAccuracy: true,

          maximumAge: 30000,
        }
      );
    }
  );
}

// ---------------------------------------------------------
// Geocode text address to coordinates (Google Geocoding + OSM fallback)
// ---------------------------------------------------------
export async function geocodeAddress(searchText) {
  if (!searchText || !searchText.trim()) return null;
  const text = searchText.trim();

  // Try Google Geocoding first
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) return null;

    setOptions({
      key: apiKey,
      v: 'weekly',
    });
    const { Geocoder } = await importLibrary('geocoding');
    const geocoder = new Geocoder();
    const response = await geocoder.geocode({
      address: text,
      region: 'IN',
    });
    const results = response?.results || [];
    if (results.length > 0 && results[0]?.geometry?.location) {
      const loc = results[0].geometry.location;
      const lat = typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat);
      const lng = typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {
          address: results[0].formatted_address || text,
          lat,
          lng,
          coords: [lat, lng],
        };
      }
    }
  } catch (err) {
    console.warn('Google geocoding fallback to OSM:', err.message);
  }

  // Fallback to OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=in&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en,hi' } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = Number(data[0].lat);
        const lng = Number(data[0].lon);
        return {
          address: data[0].display_name || text,
          lat,
          lng,
          coords: [lat, lng],
        };
      }
    }
  } catch (osmErr) {
    console.warn('Nominatim geocode failed:', osmErr.message);
  }

  return null;
}
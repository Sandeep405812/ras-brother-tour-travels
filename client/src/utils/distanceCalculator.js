// ============================================================
// RAS Brother Tour & Travels
// Dynamic Distance & Google Routes API Utility
// ============================================================

// ------------------------------------------------------------
// Normalize coordinates
//
// Supported formats:
// [lng, lat]
// [lat, lng]
// { lat, lng }
// { latitude, longitude }
// { lat, lon }
// ------------------------------------------------------------

export const KNOWN_CITY_COORDINATES = {
  'new delhi': [77.2090, 28.6139],
  'delhi': [77.2090, 28.6139],
  'delhi ncr': [77.2090, 28.6139],
  'noida': [77.3910, 28.5355],
  'noida sector 18': [77.3244, 28.5708],
  'gurgaon': [77.0266, 28.4595],
  'gurugram': [77.0266, 28.4595],
  'deoria': [83.7791, 26.5024],
  'gorakhpur': [83.3732, 26.7606],
  'lucknow': [80.9462, 26.8467],
  'varanasi': [82.9739, 25.3176],
  'agra': [78.0081, 27.1767],
  'jaipur': [75.7873, 26.9124],
  'kanpur': [80.3319, 26.4499],
  'ghaziabad': [77.4538, 28.6692],
  'faridabad': [77.3178, 28.4089],
  'patna': [85.1376, 25.5941],
  'prayagraj': [81.8463, 25.4358],
  'allahabad': [81.8463, 25.4358],
};

export function normalizeCoordinates(value) {
  if (!value) {
    return null;
  }

  // ----------------------------------------------------------
  // String format (known city / landmark lookup)
  // ----------------------------------------------------------
  if (typeof value === 'string') {
    const clean = value.trim().toLowerCase();
    if (KNOWN_CITY_COORDINATES[clean]) {
      return [...KNOWN_CITY_COORDINATES[clean]];
    }
    // Substring match for compound names like "Noida Sector 18" or "South Delhi"
    for (const [cityName, coords] of Object.entries(KNOWN_CITY_COORDINATES)) {
      if (clean.includes(cityName) || cityName.includes(clean)) {
        return [...coords];
      }
    }
    return null;
  }

  // ----------------------------------------------------------
  // Array format
  // ----------------------------------------------------------

  if (
    Array.isArray(value) &&
    value.length >= 2
  ) {
    const first = Number(value[0]);
    const second = Number(value[1]);

    if (
      !Number.isFinite(first) ||
      !Number.isFinite(second)
    ) {
      return null;
    }

    // Detect [lat, lng]
    // India latitude is generally < 40
    // longitude is generally > 60
    if (
      Math.abs(first) <= 90 &&
      Math.abs(second) <= 180 &&
      Math.abs(first) < 40 &&
      Math.abs(second) > 60
    ) {
      return [second, first];
    }

    // Assume [lng, lat]
    return [first, second];
  }

  // ----------------------------------------------------------
  // Object format
  // ----------------------------------------------------------

  if (
    typeof value === 'object'
  ) {
    const lat =
      value.lat ??
      value.latitude;

    const lng =
      value.lng ??
      value.longitude ??
      value.lon;

    if (
      lat !== undefined &&
      lng !== undefined
    ) {
      const latitude =
        Number(lat);

      const longitude =
        Number(lng);

      if (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
      ) {
        return [
          longitude,
          latitude,
        ];
      }
    }
  }

  return null;
}


// ------------------------------------------------------------
// Haversine Distance
//
// This function is kept only for compatibility / utility.
// It is NOT used for final booking fare.
//
// Final booking distance must come from Google Routes API.
// ------------------------------------------------------------

export function calculateHaversineDistance(
  from,
  to
) {
  const p1 =
    normalizeCoordinates(from);

  const p2 =
    normalizeCoordinates(to);

  if (!p1 || !p2) {
    return 0;
  }

  const lon1 =
    Number(p1[0]);

  const lat1 =
    Number(p1[1]);

  const lon2 =
    Number(p2[0]);

  const lat2 =
    Number(p2[1]);

  if (
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon2) ||
    !Number.isFinite(lat2)
  ) {
    return 0;
  }

  const earthRadiusKm =
    6371;

  const lat1Rad =
    (lat1 * Math.PI) / 180;

  const lat2Rad =
    (lat2 * Math.PI) / 180;

  const deltaLat =
    ((lat2 - lat1) * Math.PI) /
    180;

  const deltaLon =
    ((lon2 - lon1) * Math.PI) /
    180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return Number(
    (
      earthRadiusKm * c
    ).toFixed(2)
  );
}


// ------------------------------------------------------------
// Resolve Coordinates
//
// Kept for compatibility with older components.
//
// No city/location is hard-coded here.
// ------------------------------------------------------------

export function resolveCoordinates(
  value
) {
  return normalizeCoordinates(
    value
  );
}


// ------------------------------------------------------------
// Google Routes API
//
// Frontend
//     ↓
// POST /api/routes/calculate
//     ↓
// Backend
//     ↓
// Google Routes API
//
// IMPORTANT:
// No Haversine fallback is used for final distance.
// ------------------------------------------------------------

export async function getRoadDistance(
  from,
  to
) {
  const p1 =
    normalizeCoordinates(from);

  const p2 =
    normalizeCoordinates(to);

  // ----------------------------------------------------------
  // Coordinates missing
  // ----------------------------------------------------------

  if (!p1 || !p2) {
    console.warn(
      'Route calculation skipped: valid coordinates are required.'
    );

    return {
      distanceKm: 0,
      durationMin: 0,
      durationSeconds: 0,
      encodedPolyline: null,
      routeGeometry: null,
      source:
        'invalid-coordinates',
    };
  }

  // ----------------------------------------------------------
  // Convert to Google Routes format
  // ----------------------------------------------------------

  const origin = {
    lat: Number(p1[1]),
    lng: Number(p1[0]),
  };

  const destination = {
    lat: Number(p2[1]),
    lng: Number(p2[0]),
  };

  try {
    // --------------------------------------------------------
    // Backend Route API
    // --------------------------------------------------------

    const response = await fetch('/api/routes/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin,
        destination,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Google Routes calculation failed');
    }

    const distanceKm = Number(data.distanceKm);

    if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
      throw new Error('Google Routes returned an invalid road distance.');
    }

    return {
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMin: Number(data.durationMin || 0),
      durationSeconds: Number(data.durationSeconds || 0),
      encodedPolyline: data.encodedPolyline || null,
      routeGeometry: null,
      source: 'google-routes',
    };
  } catch (error) {
    console.warn('Google Routes API failed, calculating estimated road distance:', error.message);

    // Resilient fallback: Indian road distance is typically ~1.25x Haversine (straight-line) distance
    const haversineDist = calculateHaversineDistance(from, to);
    if (haversineDist > 0) {
      const estimatedRoadDist = Math.max(1, Number((haversineDist * 1.25).toFixed(2)));
      const estimatedMin = Math.round(estimatedRoadDist * 1.8);
      return {
        distanceKm: estimatedRoadDist,
        durationMin: estimatedMin,
        durationSeconds: estimatedMin * 60,
        encodedPolyline: null,
        routeGeometry: null,
        source: 'estimated-road-fallback',
      };
    }

    return {
      distanceKm: 0,
      durationMin: 0,
      durationSeconds: 0,
      encodedPolyline: null,
      routeGeometry: null,
      source: 'google-routes-error',
      error: error.message || 'Unable to calculate road distance',
    };
  }
}
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

export function normalizeCoordinates(value) {
  if (!value) {
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

    const response =
      await fetch(
        'http://localhost:5000/api/routes/calculate',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            origin,
            destination,
          }),
        }
      );

    // --------------------------------------------------------
    // Parse response safely
    // --------------------------------------------------------

    const data =
      await response.json();

    // --------------------------------------------------------
    // Backend / Google error
    // --------------------------------------------------------

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          'Google Routes calculation failed'
      );
    }

    // --------------------------------------------------------
    // Validate actual Google road distance
    // --------------------------------------------------------

    const distanceKm =
      Number(
        data.distanceKm
      );

    if (
      !Number.isFinite(
        distanceKm
      ) ||
      distanceKm <= 0
    ) {
      throw new Error(
        'Google Routes returned an invalid road distance.'
      );
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return {
      distanceKm:
        Number(
          distanceKm.toFixed(2)
        ),

      durationMin:
        Number(
          data.durationMin || 0
        ),

      durationSeconds:
        Number(
          data.durationSeconds || 0
        ),

      encodedPolyline:
        data.encodedPolyline ||
        null,

      routeGeometry: null,

      source:
        'google-routes',
    };

  } catch (error) {
    // --------------------------------------------------------
    // IMPORTANT:
    // DO NOT use Haversine here.
    //
    // Because Haversine is straight-line distance,
    // not actual road distance.
    // --------------------------------------------------------

    console.error(
      'Google Routes Error:',
      error
    );

    return {
      distanceKm: 0,
      durationMin: 0,
      durationSeconds: 0,
      encodedPolyline: null,
      routeGeometry: null,
      source:
        'google-routes-error',
      error:
        error.message ||
        'Unable to calculate road distance',
    };
  }
}
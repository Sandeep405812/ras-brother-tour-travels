const calculateRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (
      !origin ||
      !destination ||
      typeof origin.lat !== 'number' ||
      typeof origin.lng !== 'number' ||
      typeof destination.lat !== 'number' ||
      typeof destination.lng !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid origin and destination coordinates are required',
      });
    }

    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY ,
          'X-Goog-FieldMask':
            'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: origin.lat,
                longitude: origin.lng,
              },
            },
          },

          destination: {
            location: {
              latLng: {
                latitude: destination.lat,
                longitude: destination.lng,
              },
            },
          },

          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          computeAlternativeRoutes: false,
          languageCode: 'en-IN',
          units: 'METRIC',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Routes API error:', data);

      return res.status(response.status).json({
        success: false,
        message: 'Google Routes API failed',
        error: data,
      });
    }

    if (!data.routes || data.routes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No route found',
      });
    }

    const route = data.routes[0];

    const distanceKm =
      Number(route.distanceMeters || 0) / 1000;

    const durationSeconds =
      parseInt(String(route.duration || '0').replace('s', ''), 10);

    const durationMin =
      Math.round(durationSeconds / 60);

    return res.json({
      success: true,
      distanceKm: Number(distanceKm.toFixed(2)),
      distanceMeters: route.distanceMeters,
      durationMin,
      durationSeconds,
      encodedPolyline:
        route.polyline?.encodedPolyline || null,
    });
  } catch (error) {
    console.error('Calculate route error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to calculate route',
      error: error.message,
    });
  }
};

module.exports = {
  calculateRoute,
};

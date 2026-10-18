import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode, detectGpsLocation } from '../../utils/geoService';
import { getRoadDistance } from '../../utils/distanceCalculator';
import {
  MapPin,
  Navigation,
  Crosshair,
  Maximize2,
  Minimize2,
  Loader2,
  Info,
  CheckCircle,
} from 'lucide-react';

// Custom Leaflet DivIcons (No PNG dependency, sharp on high-DPI/retina screens)
const pickupIcon = L.divIcon({
  className: 'custom-pickup-pin',
  html: `
    <div style="position:relative; width:38px; height:46px;">
      <div style="background-color:#10B981; color:#FFFFFF; width:38px; height:38px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:3px solid #FFFFFF; box-shadow:0 4px 14px rgba(16,185,129,0.55);">
        <span style="transform:rotate(45deg); font-size:16px; font-weight:900;">📍</span>
      </div>
      <div style="position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:8px; height:8px; background:#047857; border-radius:50%;"></div>
    </div>
  `,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
  popupAnchor: [0, -46],
});

const dropIcon = L.divIcon({
  className: 'custom-drop-pin',
  html: `
    <div style="position:relative; width:38px; height:46px;">
      <div style="background-color:#F43F5E; color:#FFFFFF; width:38px; height:38px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:3px solid #FFFFFF; box-shadow:0 4px 14px rgba(244,63,94,0.55);">
        <span style="transform:rotate(45deg); font-size:16px; font-weight:900;">🎯</span>
      </div>
      <div style="position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:8px; height:8px; background:#BE123C; border-radius:50%;"></div>
    </div>
  `,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
  popupAnchor: [0, -46],
});

// Map Click Listener component
function MapClickInterceptor({ activePinMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng, activePinMode);
      }
    },
  });
  return null;
}

// Map Bounds Auto-Fitter
function MapBoundsController({ pickupLatLng, dropLatLng, focusTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (pickupLatLng && dropLatLng) {
      const bounds = L.latLngBounds([pickupLatLng, dropLatLng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (pickupLatLng) {
      map.setView(pickupLatLng, 14);
    } else if (dropLatLng) {
      map.setView(dropLatLng, 14);
    }
  }, [pickupLatLng, dropLatLng, focusTrigger, map]);

  return null;
}

export default function RouteMapPicker({
  pickupCoords = [77.2090, 28.6139], // [lng, lat]
  dropCoords = [77.3244, 28.5708],   // [lng, lat]
  pickupAddress = '',
  dropAddress = '',
  onPickupChange, // ({ address, coords: [lng, lat] })
  onDropChange,   // ({ address, coords: [lng, lat] })
  height = '420px',
  className = '',
}) {
  // Pin placement mode: 'pickup' | 'drop'
  const [activePinMode, setActivePinMode] = useState('pickup');
  const [geocodingStatus, setGeocodingStatus] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [gpsError, setGpsError] = useState('');
  const [roadRoutePositions, setRoadRoutePositions] = useState(null);
  const [roadInfo, setRoadInfo] = useState(null); // { distanceKm, durationMin }

  // Normalize coordinates to [lat, lng] for Leaflet
  const pickupLatLng =
    pickupCoords && pickupCoords.length === 2 ? [pickupCoords[1], pickupCoords[0]] : [28.6139, 77.2090];
  const dropLatLng =
    dropCoords && dropCoords.length === 2 ? [dropCoords[1], dropCoords[0]] : [28.5708, 77.3244];

  // Fetch real road route from OSRM when coordinates change
  useEffect(() => {
    let cancelled = false;
    getRoadDistance(pickupCoords, dropCoords).then((result) => {
      if (cancelled) return;
      if (result.routeGeometry && result.routeGeometry.coordinates) {
        // OSRM returns GeoJSON [lng, lat], Leaflet needs [lat, lng]
        const positions = result.routeGeometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRoadRoutePositions(positions);
      } else {
        setRoadRoutePositions(null);
      }
      if (result.distanceKm > 0) {
        setRoadInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });
      }
    });
    return () => { cancelled = true; };
  }, [pickupCoords, dropCoords]);

  // Handle map click
  const handleMapClick = async (lat, lng, mode) => {
    setIsGeocoding(true);
    setGeocodingStatus(`Resolving ${mode === 'pickup' ? 'pickup' : 'drop-off'} address...`);
    setGpsError('');

    try {
      const geo = await reverseGeocode(lat, lng);
      const address = geo.formattedAddress;
      const coords = [lng, lat]; // [lng, lat]

      if (mode === 'pickup') {
        if (onPickupChange) onPickupChange({ address, coords, lat, lon: lng });
        setGeocodingStatus(`Pickup set: ${address}`);
        // Switch to drop mode automatically for convenient two-step booking
        setActivePinMode('drop');
      } else {
        if (onDropChange) onDropChange({ address, coords, lat, lon: lng });
        setGeocodingStatus(`Drop-off set: ${address}`);
      }
    } catch (err) {
      console.warn('Click reverse geocode error:', err);
      const fallbackAddr = `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      if (mode === 'pickup' && onPickupChange) {
        onPickupChange({ address: fallbackAddr, coords: [lng, lat], lat, lon: lng });
      } else if (mode === 'drop' && onDropChange) {
        onDropChange({ address: fallbackAddr, coords: [lng, lat], lat, lon: lng });
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle pickup marker drag end
  const handlePickupDragEnd = async (e) => {
    const marker = e.target;
    const latlng = marker.getLatLng();
    setIsGeocoding(true);
    setGeocodingStatus('Updating pickup location address...');

    try {
      const geo = await reverseGeocode(latlng.lat, latlng.lng);
      if (onPickupChange) {
        onPickupChange({
          address: geo.formattedAddress,
          coords: [latlng.lng, latlng.lat],
          lat: latlng.lat,
          lon: latlng.lng,
        });
      }
      setGeocodingStatus(`Pickup updated: ${geo.formattedAddress}`);
    } catch (err) {
      if (onPickupChange) {
        onPickupChange({
          address: `Pickup Pin (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
          coords: [latlng.lng, latlng.lat],
        });
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle drop marker drag end
  const handleDropDragEnd = async (e) => {
    const marker = e.target;
    const latlng = marker.getLatLng();
    setIsGeocoding(true);
    setGeocodingStatus('Updating drop-off location address...');

    try {
      const geo = await reverseGeocode(latlng.lat, latlng.lng);
      if (onDropChange) {
        onDropChange({
          address: geo.formattedAddress,
          coords: [latlng.lng, latlng.lat],
          lat: latlng.lat,
          lon: latlng.lng,
        });
      }
      setGeocodingStatus(`Drop-off updated: ${geo.formattedAddress}`);
    } catch (err) {
      if (onDropChange) {
        onDropChange({
          address: `Drop-off Pin (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
          coords: [latlng.lng, latlng.lat],
        });
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Detect GPS Location
  const handleDetectGps = async () => {
    setIsGeocoding(true);
    setGpsError('');
    setGeocodingStatus('Detecting your GPS position...');

    try {
      const loc = await detectGpsLocation();
      if (onPickupChange) {
        onPickupChange({
          address: loc.address,
          coords: loc.coords,
          lat: loc.lat,
          lon: loc.lon,
        });
      }
      setGeocodingStatus(`Current location set: ${loc.address}`);
      setFocusTrigger((prev) => prev + 1);
    } catch (err) {
      setGpsError(err.message || 'GPS permission was denied.');
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 ${className}`}
      style={{ height }}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Pin Mode Toggles (Pickup vs Drop) */}
        <div className="inline-flex rounded-2xl bg-slate-900/90 backdrop-blur-md p-1 border border-slate-700 shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setActivePinMode('pickup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activePinMode === 'pickup'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🟢</span> Set Pickup (Click Map)
          </button>
          <button
            type="button"
            onClick={() => setActivePinMode('drop')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activePinMode === 'drop'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🔴</span> Set Drop-off
          </button>
        </div>

        {/* Action Buttons: GPS + Fit View */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={handleDetectGps}
            title="Use current GPS position for pickup"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-amber-300 border border-slate-700 shadow-xl transition flex items-center gap-1"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Use GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setFocusTrigger((prev) => prev + 1)}
            title="Center route in view"
            className="p-1.5 rounded-xl text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 shadow-xl transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        center={pickupLatLng}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapClickInterceptor activePinMode={activePinMode} onMapClick={handleMapClick} />
        <MapBoundsController
          pickupLatLng={pickupLatLng}
          dropLatLng={dropLatLng}
          focusTrigger={focusTrigger}
        />

        {/* Pickup Marker (Draggable) */}
        {pickupLatLng && (
          <Marker
            position={pickupLatLng}
            icon={pickupIcon}
            draggable={true}
            eventHandlers={{
              dragend: handlePickupDragEnd,
            }}
          >
            <Popup>
              <div className="text-xs p-1 font-sans">
                <span className="font-bold text-emerald-700 uppercase tracking-wider block text-[10px]">
                  🟢 Pickup Location (Drag to adjust)
                </span>
                <p className="font-semibold text-slate-900 mt-1">
                  {pickupAddress || 'Selected Pickup Point'}
                </p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Lat: {pickupLatLng[0].toFixed(4)}, Lng: {pickupLatLng[1].toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drop-off Marker (Draggable) */}
        {dropLatLng && (
          <Marker
            position={dropLatLng}
            icon={dropIcon}
            draggable={true}
            eventHandlers={{
              dragend: handleDropDragEnd,
            }}
          >
            <Popup>
              <div className="text-xs p-1 font-sans">
                <span className="font-bold text-rose-700 uppercase tracking-wider block text-[10px]">
                  🔴 Drop-off Venue (Drag to adjust)
                </span>
                <p className="font-semibold text-slate-900 mt-1">
                  {dropAddress || 'Selected Drop-off Point'}
                </p>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Lat: {dropLatLng[0].toFixed(4)}, Lng: {dropLatLng[1].toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Real Road Route (OSRM) — solid blue curve following actual roads */}
        {roadRoutePositions && roadRoutePositions.length > 1 && (
          <Polyline
            positions={roadRoutePositions}
            pathOptions={{
              color: '#3B82F6',
              weight: 5,
              opacity: 0.9,
            }}
          />
        )}

        {/* Straight-line fallback if OSRM route not loaded yet */}
        {!roadRoutePositions && pickupLatLng && dropLatLng && (
          <Polyline
            positions={[pickupLatLng, dropLatLng]}
            pathOptions={{
              color: '#F59E0B',
              weight: 4,
              opacity: 0.85,
              dashArray: '8, 8',
            }}
          />
        )}
      </MapContainer>

      {/* Road Distance & Duration Info Badge */}
      {roadInfo && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-slate-950/95 backdrop-blur-md border border-blue-500/40 rounded-2xl px-4 py-1.5 shadow-xl flex items-center gap-3 text-xs pointer-events-auto">
            <span className="font-black text-blue-400">🛣️ {roadInfo.distanceKm} km</span>
            {roadInfo.durationMin > 0 && (
              <span className="text-slate-300">⏱️ ~{roadInfo.durationMin} min</span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Status / Error Bar */}
      {(isGeocoding || geocodingStatus || gpsError) && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none">
          <div className="bg-slate-950/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-2.5 sm:px-4 shadow-2xl flex items-center justify-between gap-3 text-xs pointer-events-auto">
            <div className="flex items-center gap-2 truncate">
              {isGeocoding ? (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              ) : gpsError ? (
                <Info className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span
                className={`truncate ${
                  gpsError ? 'text-rose-300 font-semibold' : 'text-slate-200'
                }`}
              >
                {gpsError || geocodingStatus || 'Click map or drag pins to adjust location'}
              </span>
            </div>
            <span className="text-[10px] text-amber-400/80 uppercase font-black tracking-wider shrink-0 hidden sm:inline">
              OpenStreetMap
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

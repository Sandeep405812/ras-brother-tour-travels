import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons in React
const customCarIcon = L.divIcon({
  className: 'custom-car-pin',
  html: `<div style="background-color:#E5A93B; color:#0A1128; border:2px solid #0A1128; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.3); font-weight:bold; font-size:16px;">🚗</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const userLocationIcon = L.divIcon({
  className: 'custom-user-pin',
  html: `<div style="background-color:#0284C7; color:#FFFFFF; border:3px solid #FFFFFF; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(2,132,199,0.5); font-weight:bold; font-size:16px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      if (onSelectLocation) {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapFleetView({
  cars = [],
  userCenter = [28.6139, 77.2090], // Delhi default
  onSelectCar,
  onSelectLocation,
  selectedLocation,
  height = '500px',
}) {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl z-10" style={{ height }}>
      <MapContainer
        center={selectedLocation || userCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={selectedLocation || userCenter} />
        {onSelectLocation && <MapClickHandler onSelectLocation={onSelectLocation} />}

        {/* User / Pickup Pin */}
        {selectedLocation && (
          <Marker position={selectedLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-xs font-bold text-slate-800">
                📍 Selected Pickup Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Car Fleet Markers */}
        {cars.map((car) => {
          const coords = car.location?.coordinates;
          if (!coords || coords.length < 2) return null;
          // GeoJSON coordinates are [longitude, latitude]
          const lat = coords[1];
          const lng = coords[0];

          return (
            <Marker key={car._id} position={[lat, lng]} icon={customCarIcon}>
              <Popup>
                <div className="w-56 p-1 text-slate-900 font-sans">
                  <div className="h-28 rounded-xl overflow-hidden mb-2 relative">
                    <img
                      src={car.images?.main}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                      {car.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm leading-tight text-slate-950">
                    {car.brand} {car.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{car.location?.address || car.location?.city}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500">Per Day:</span>
                      <div className="text-sm font-black text-amber-600">
                        ₹{(car.pricing?.perDay || car.pricing?.basePrice)?.toLocaleString('en-IN')}
                      </div>
                    </div>
                    {onSelectCar && (
                      <button
                        onClick={() => onSelectCar(car)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

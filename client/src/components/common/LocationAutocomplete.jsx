import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X, Loader2, Sparkles, Map } from 'lucide-react';
import { searchPlacesOSM, detectGpsLocation } from '../../utils/geoService';
import { POPULAR_LOCATIONS } from '../../utils/distanceCalculator';

export default function LocationAutocomplete({
  value = '',
  onChange,
  onSelectCoords,
  onOpenMap,
  placeholder = 'Enter city, village, locality or street...',
  label = '',
  iconColor = 'text-amber-500',
  allowGps = false,
  className = '',
  inputClassName = '',
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const wrapperRef = useRef(null);

  // Sync internal query state with prop value
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search using OpenStreetMap Nominatim & Photon
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage('');

    const timer = setTimeout(async () => {
      try {
        const results = await searchPlacesOSM(query);
        if (isMounted) {
          setSuggestions(results);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setSuggestions(POPULAR_LOCATIONS.slice(0, 6));
          setLoading(false);
        }
      }
    }, 350); // Compliant debounce

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setErrorMessage('');
    if (onChange) onChange(val);
  };

  const handleSelectPlace = (place) => {
    setQuery(place.name);
    setIsOpen(false);
    if (onChange) onChange(place.name);
    if (onSelectCoords && place.coords) onSelectCoords(place.coords);
  };

  const handleGpsDetect = async (e) => {
    e.stopPropagation();
    setDetectingGps(true);
    setErrorMessage('');

    try {
      const loc = await detectGpsLocation();
      setQuery(loc.address);
      setIsOpen(false);
      if (onChange) onChange(loc.address);
      if (onSelectCoords) onSelectCoords(loc.coords);
    } catch (err) {
      setErrorMessage(err.message || 'GPS location could not be determined.');
      alert(err.message || 'GPS location permission denied. You can select your point directly on the map.');
    } finally {
      setDetectingGps(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setErrorMessage('');
    if (onChange) onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <MapPin className={`w-3.5 h-3.5 ${iconColor}`} /> {label}
          </label>
          <div className="flex items-center gap-2">
            {onOpenMap && (
              <button
                type="button"
                onClick={onOpenMap}
                className="text-[10px] font-bold text-slate-300 hover:text-amber-400 flex items-center gap-1 transition"
                title="Pick exact point on interactive map"
              >
                <Map className="w-2.5 h-2.5 text-amber-400" /> Pin on Map
              </button>
            )}
            {allowGps && (
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={detectingGps}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline transition disabled:opacity-50"
              >
                {detectingGps ? (
                  <>
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Detecting GPS...
                  </>
                ) : (
                  <>
                    <Navigation className="w-2.5 h-2.5" /> Use Current Location
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={
            inputClassName ||
            'w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-base sm:text-sm text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500'
          }
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-700/50 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mt-1 text-[11px] text-rose-400 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Autocomplete Suggestions Dropdown (OpenStreetMap Nominatim / Photon) */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-800/80 -webkit-overflow-scrolling-touch">
          <div className="px-3.5 py-2.5 bg-slate-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center justify-between sticky top-0 z-10 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              OpenStreetMap Suggestions (Villages, Cities &amp; Roads)
            </span>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
          </div>

          {suggestions.length === 0 && !loading && (
            <div className="p-4 text-xs text-center text-slate-400">
              No matching locations found. You can proceed with typed address or select point on the map.
            </div>
          )}

          {suggestions.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              type="button"
              onClick={() => handleSelectPlace(item)}
              className="w-full text-left px-4 py-3 hover:bg-slate-800 active:bg-slate-700/80 transition flex items-center justify-between gap-3 group border-b border-slate-800/40 last:border-b-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon || '📍'}
                </span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-400">
                    {item.name}
                  </div>
                  {item.fullAddress && (
                    <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                      {item.fullAddress}
                    </div>
                  )}
                </div>
              </div>

              {item.type && (
                <span className="shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/20">
                  {item.type === 'venue' ? 'Wedding' : item.type}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

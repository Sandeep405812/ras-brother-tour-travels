import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X, Loader2, Sparkles } from 'lucide-react';
import { searchPlaces, POPULAR_LOCATIONS } from '../../utils/distanceCalculator';

export default function LocationAutocomplete({
  value = '',
  onChange,
  onSelectCoords,
  placeholder = 'Enter city, locality or venue...',
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

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(query);
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
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (onChange) onChange(val);
  };

  const handleSelectPlace = (place) => {
    setQuery(place.name);
    setIsOpen(false);
    if (onChange) onChange(place.name);
    if (onSelectCoords && place.coords) onSelectCoords(place.coords);
  };

  const handleGpsDetect = (e) => {
    e.stopPropagation();
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        const label = 'My GPS Location (Current)';
        setQuery(label);
        setIsOpen(false);
        setDetectingGps(false);
        if (onChange) onChange(label);
        if (onSelectCoords) onSelectCoords(coords);
      },
      (err) => {
        console.warn('GPS detection failed:', err.message);
        setDetectingGps(false);
        alert('Could not detect location. Please type your pickup place.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleClear = () => {
    setQuery('');
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
          {allowGps && (
            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={detectingGps}
              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline transition"
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
            'w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500'
          }
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-white rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-800/80">
          <div className="px-3 py-2 bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Suggested Places &amp; Landmarks
            </span>
            {loading && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
          </div>

          {suggestions.length === 0 && !loading && (
            <div className="p-4 text-xs text-center text-slate-400">
              No matching locations found. Press enter to use typed address.
            </div>
          )}

          {suggestions.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              type="button"
              onClick={() => handleSelectPlace(item)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 transition flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon || '📍'}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate group-hover:text-amber-400">
                    {item.name}
                  </div>
                  {item.fullAddress && (
                    <div className="text-[10px] text-slate-400 truncate">
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

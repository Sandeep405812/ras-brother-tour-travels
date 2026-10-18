import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  MapPin,
  Navigation,
  X,
  Loader2,
  Sparkles,
  Map,
} from 'lucide-react';

import {
  setOptions,
  importLibrary,
} from '@googlemaps/js-api-loader';

import {
  detectGpsLocation,
} from '../../utils/geoService';

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

  const [suggestions, setSuggestions] =
    useState([]);

  const [isOpen, setIsOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [detectingGps, setDetectingGps] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const wrapperRef = useRef(null);

  const sessionTokenRef =
    useRef(null);

  const requestIdRef =
    useRef(0);

  const googleLoadedRef =
    useRef(false);

  // =========================================================
  // SYNC VALUE
  // =========================================================

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // =========================================================
  // CLOSE DROPDOWN OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // LOAD GOOGLE MAPS / PLACES
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const initializeGooglePlaces =
      async () => {
        try {
          const apiKey =
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

          if (!apiKey) return;

          setOptions({
            key: apiKey,
            v: 'weekly',
          });

          const {
            AutocompleteSessionToken,
          } = await importLibrary(
            'places'
          );

          if (!mounted) return;

          sessionTokenRef.current =
            new AutocompleteSessionToken();

          googleLoadedRef.current =
            true;
        } catch (error) {
          console.error(
            'Google Places initialization error:',
            error
          );

          if (mounted) {
            setErrorMessage(
              'Google Places could not be loaded. Please check your API configuration.'
            );
          }
        }
      };

    initializeGooglePlaces();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // GOOGLE GEOCODER FALLBACK
  //
  // Used when Places Autocomplete returns zero results.
  // No city/location is hard-coded.
  // =========================================================

  const geocodeFallback =
    async (searchText) => {
      try {
        const {
          Geocoder,
        } = await importLibrary(
          'geocoding'
        );

        const geocoder =
          new Geocoder();

        const response =
          await geocoder.geocode({
            address: searchText,
            region: 'IN',
          });

        const results =
          response?.results || [];

        return results
          .slice(0, 8)
          .map((result) => {
            const location =
              result.geometry
                ?.location;

            if (!location) {
              return null;
            }

            const lat =
              typeof location.lat ===
              'function'
                ? location.lat()
                : Number(location.lat);

            const lng =
              typeof location.lng ===
              'function'
                ? location.lng()
                : Number(location.lng);

            if (
              !Number.isFinite(lat) ||
              !Number.isFinite(lng)
            ) {
              return null;
            }

            const address =
              result.formatted_address ||
              searchText;

            const name =
              result.address_components
                ?.find(
                  (component) =>
                    component.types?.includes(
                      'point_of_interest'
                    ) ||
                    component.types?.includes(
                      'premise'
                    ) ||
                    component.types?.includes(
                      'street_address'
                    ) ||
                    component.types?.includes(
                      'route'
                    ) ||
                    component.types?.includes(
                      'sublocality'
                    ) ||
                    component.types?.includes(
                      'locality'
                    )
                )
                ?.long_name ||
              searchText;

            return {
              type: 'geocoder',
              name,
              fullAddress: address,
              icon: '📍',
              lat,
              lng,
              coords: [
                lat,
                lng,
              ],
              geocoderResult: result,
            };
          })
          .filter(Boolean);
      } catch (error) {
        console.error(
          'Google Geocoder fallback error:',
          error
        );

        return [];
      }
    };

  // =========================================================
  // GOOGLE PLACES AUTOCOMPLETE
  // =========================================================

  useEffect(() => {
    if (
      !isOpen ||
      !query.trim() ||
      query.trim().length < 2
    ) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const currentRequestId =
      ++requestIdRef.current;

    const timer =
      setTimeout(async () => {
        try {
          setLoading(true);
          setErrorMessage('');

          const {
            AutocompleteSuggestion,
            AutocompleteSessionToken,
          } =
            await importLibrary(
              'places'
            );

          if (
            !sessionTokenRef.current
          ) {
            sessionTokenRef.current =
              new AutocompleteSessionToken();
          }

          const searchText =
            query.trim();

          const request = {
            input: searchText,

            sessionToken:
              sessionTokenRef.current,

            includedRegionCodes: [
              'in',
            ],

            language: 'en-IN',

            region: 'in',
          };

          const response =
            await AutocompleteSuggestion.fetchAutocompleteSuggestions(
              request
            );

          const googleSuggestions =
            response?.suggestions ||
            [];

          if (
            cancelled ||
            currentRequestId !==
              requestIdRef.current
          ) {
            return;
          }

          const formattedSuggestions =
            googleSuggestions
              .filter(
                (item) =>
                  item?.placePrediction
              )
              .map((item) => {
                const prediction =
                  item.placePrediction;

                return {
                  prediction,

                  name:
                    prediction.mainText?.toString() ||
                    prediction.text?.toString() ||
                    searchText,

                  fullAddress:
                    prediction.secondaryText?.toString() ||
                    prediction.text?.toString() ||
                    searchText,

                  icon: '📍',

                  type:
                    prediction.types?.[0] ||
                    'location',
                };
              });

          // --------------------------------------------------
          // GOOGLE GEOCODER FALLBACK
          // --------------------------------------------------

          if (
            formattedSuggestions.length ===
            0
          ) {
            const fallbackResults =
              await geocodeFallback(
                searchText
              );

            if (
              cancelled ||
              currentRequestId !==
                requestIdRef.current
            ) {
              return;
            }

            setSuggestions(
              fallbackResults
            );

            if (
              fallbackResults.length ===
              0
            ) {
              setErrorMessage(
                'No matching location found. Try adding a nearby area, city or PIN code.'
              );
            }

            return;
          }

          setSuggestions(
            formattedSuggestions
          );
        } catch (error) {
          if (cancelled) return;

          console.error(
            'Google Places autocomplete error:',
            error
          );

          // --------------------------------------------------
          // EVEN IF AUTOCOMPLETE API FAILS,
          // TRY GEOCODER
          // --------------------------------------------------

          try {
            const fallbackResults =
              await geocodeFallback(
                query.trim()
              );

            if (
              fallbackResults.length >
              0
            ) {
              setSuggestions(
                fallbackResults
              );

              setErrorMessage('');
            } else {
              setSuggestions([]);

              setErrorMessage(
                'Location search is temporarily unavailable.'
              );
            }
          } catch (fallbackError) {
            console.error(
              'Location fallback failed:',
              fallbackError
            );

            setSuggestions([]);

            setErrorMessage(
              'Location search is temporarily unavailable.'
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }, 350);

    return () => {
      cancelled = true;

      clearTimeout(timer);
    };
  }, [query, isOpen]);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleInputChange = (
    e
  ) => {
    const val =
      e.target.value;

    setQuery(val);

    setIsOpen(true);

    setErrorMessage('');

    if (onChange) {
      onChange(val);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        e.preventDefault();
        handleSelectPlace(suggestions[0]);
      }
    }
  };

  // =========================================================
  // SELECT GOOGLE PLACE
  // =========================================================

  const handleSelectPlace =
    async (item) => {
      try {
        setLoading(true);

        setErrorMessage('');

        // --------------------------------------------------
        // GOOGLE PLACES RESULT
        // --------------------------------------------------

        if (item.prediction) {
          const prediction =
            item.prediction;

          const place =
            prediction.toPlace();

          await place.fetchFields({
            fields: [
              'displayName',
              'formattedAddress',
              'location',
            ],
          });

          const location =
            place.location;

          const lat =
            typeof location?.lat ===
            'function'
              ? location.lat()
              : Number(
                  location?.lat
                );

          const lng =
            typeof location?.lng ===
            'function'
              ? location.lng()
              : Number(
                  location?.lng
                );

          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {
            throw new Error(
              'Selected location coordinates are unavailable.'
            );
          }

          const address =
            place.formattedAddress ||
            place.displayName ||
            item.name;

          setQuery(address);

          setIsOpen(false);

          setSuggestions([]);

          if (onChange) {
            onChange(address);
          }

          if (onSelectCoords) {
            // Existing project format:
            // [latitude, longitude]

            onSelectCoords([
              lat,
              lng,
            ]);
          }

          // Start new session
          const {
            AutocompleteSessionToken,
          } =
            await importLibrary(
              'places'
            );

          sessionTokenRef.current =
            new AutocompleteSessionToken();

          return;
        }

        // --------------------------------------------------
        // GEOCODER RESULT
        // --------------------------------------------------

        if (
          item.type ===
          'geocoder'
        ) {
          const lat =
            Number(item.lat);

          const lng =
            Number(item.lng);

          const address =
            item.fullAddress ||
            item.name ||
            query;

          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {
            throw new Error(
              'Selected location coordinates are unavailable.'
            );
          }

          setQuery(address);

          setIsOpen(false);

          setSuggestions([]);

          if (onChange) {
            onChange(address);
          }

          if (onSelectCoords) {
            onSelectCoords([
              lat,
              lng,
            ]);
          }

          return;
        }

        throw new Error(
          'Unsupported location result.'
        );
      } catch (error) {
        console.error(
          'Google Place selection error:',
          error
        );

        setErrorMessage(
          'Could not get the selected location.'
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================================================
  // GPS
  // =========================================================

  const handleGpsDetect =
    async (e) => {
      e.stopPropagation();

      setDetectingGps(true);

      setErrorMessage('');

      try {
        const loc =
          await detectGpsLocation();

        setQuery(
          loc.address
        );

        setIsOpen(false);

        setSuggestions([]);

        if (onChange) {
          onChange(
            loc.address
          );
        }

        if (onSelectCoords) {
          onSelectCoords(
            loc.coords
          );
        }
      } catch (err) {
        const message =
          err.message ||
          'GPS location could not be determined.';

        setErrorMessage(
          message
        );

        alert(message);
      } finally {
        setDetectingGps(false);
      }
    };

  // =========================================================
  // CLEAR
  // =========================================================

  const handleClear = () => {
    setQuery('');

    setSuggestions([]);

    setErrorMessage('');

    setIsOpen(false);

    if (onChange) {
      onChange('');
    }

    // Important:
    // Parent BookingModal will clear coordinates
    // through its onChange handler.
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
    >
      {/* =====================================================
          LABEL
      ===================================================== */}

      {label && (
        <div className="flex items-center justify-between mb-1">

          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">

            <MapPin
              className={`w-3.5 h-3.5 ${iconColor}`}
            />

            {label}

          </label>

          <div className="flex items-center gap-2">

            {/* PIN ON MAP */}

            {onOpenMap && (
              <button
                type="button"
                onClick={
                  onOpenMap
                }
                className="text-[10px] font-bold text-slate-300 hover:text-amber-400 flex items-center gap-1 transition"
                title="Pick exact point on interactive map"
              >
                <Map className="w-2.5 h-2.5 text-amber-400" />

                Pin on Map
              </button>
            )}

            {/* GPS */}

            {allowGps && (
              <button
                type="button"
                onClick={
                  handleGpsDetect
                }
                disabled={
                  detectingGps
                }
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline transition disabled:opacity-50"
              >
                {detectingGps ? (
                  <>
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />

                    Detecting GPS...
                  </>
                ) : (
                  <>
                    <Navigation className="w-2.5 h-2.5" />

                    Use Current Location
                  </>
                )}
              </button>
            )}

          </div>
        </div>
      )}

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div className="relative flex items-center">

        <input
          type="text"
          value={query}
          onChange={
            handleInputChange
          }
          onKeyDown={handleKeyDown}
          onFocus={() =>
            setIsOpen(true)
          }
          placeholder={
            placeholder
          }
          autoComplete="off"
          className={
            inputClassName ||
            'w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3.5 text-base sm:text-sm text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500'
          }
        />

        {/* LOADER */}

        {loading && (
          <Loader2 className="absolute right-10 w-4 h-4 text-amber-400 animate-spin" />
        )}

        {/* CLEAR */}

        {query &&
          !loading && (
            <button
              type="button"
              onClick={
                handleClear
              }
              className="absolute right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-700/50 hover:bg-slate-700 transition"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {errorMessage && (
        <div className="mt-1 text-[11px] text-rose-400 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* =====================================================
          SUGGESTIONS
      ===================================================== */}

      {isOpen && (
        <div className="absolute z-[9999] left-0 right-0 mt-2 bg-slate-950 border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-800">

          {/* HEADER */}

          <div className="px-3.5 py-2.5 bg-slate-950 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center justify-between sticky top-0 z-10 border-b border-slate-800">

            <span className="flex items-center gap-1.5">

              <Sparkles className="w-3.5 h-3.5 text-amber-400" />

              Google Location Suggestions

            </span>

            {loading && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            )}

          </div>

          {/* NO RESULT */}

          {suggestions.length ===
            0 &&
            !loading && (
              <div className="p-4 text-xs text-center text-slate-400">

                {errorMessage
                  ? 'Try a more complete address, locality, landmark or PIN code.'
                  : 'No matching locations found.'}

              </div>
            )}

          {/* RESULTS */}

          {suggestions.map(
            (item, idx) => (
              <button
                key={`${item.name}-${item.lat || ''}-${item.lng || ''}-${idx}`}
                type="button"
                onClick={() =>
                  handleSelectPlace(
                    item
                  )
                }
                className="w-full text-left px-4 py-3 hover:bg-slate-800 active:bg-slate-700/80 transition flex items-center justify-between gap-3 group border-b border-slate-800/40 last:border-b-0"
              >

                <div className="flex items-center gap-3 min-w-0">

                  <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon ||
                      '📍'}
                  </span>

                  <div className="min-w-0">

                    <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-400">
                      {item.name}
                    </div>

                    {item.fullAddress && (
                      <div className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                        {
                          item.fullAddress
                        }
                      </div>
                    )}

                  </div>

                </div>

                {item.type && (
                  <span className="shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/20">
                    {item.type ===
                    'geocoder'
                      ? 'Address'
                      : 'Location'}
                  </span>
                )}

              </button>
            )
          )}

        </div>
      )}
    </div>
  );
}
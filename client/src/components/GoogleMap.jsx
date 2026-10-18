import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

function GoogleMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        setOptions({
          key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCRkPmfLzNuvIJxZMoKdNf4lw97ImyCXU8',
          v: "weekly",
        });

        const { Map } = await importLibrary("maps");

        new Map(mapRef.current, {
          center: {
            lat: 26.8467,
            lng: 80.9462,
          },
          zoom: 12,
        });
      } catch (error) {
        console.error("Google Maps loading error:", error);
      }
    };

    loadMap();
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "12px",
      }}
    />
  );
}

export default GoogleMap;
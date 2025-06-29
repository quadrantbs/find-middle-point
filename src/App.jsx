// src/App.jsx

import { useEffect } from "react";
import { useLocationContext } from "./context/LocationContext";
import { calculateMiddlePoint } from "./utils/calculateMiddlePoint";
import MapView from "./components/MapView";
import LocationInput from "./components/LocationInput";
import LocationList from "./components/LocationList";
import PlaceRecommendationList from "./components/PlaceRecommendationList";

function App() {
  const {
    locations,
    setMiddlePoint,
    middlePoint,
    setPlaces,
    setSearchRadius,
    setIsLoading,
  } = useLocationContext();

  useEffect(() => {
    if (locations.length >= 1) {
      setPlaces([]);
      const initialRadius = 400;
      setSearchRadius(initialRadius);
      const midpoint = calculateMiddlePoint(locations);
      setMiddlePoint(midpoint);

      const searchPlaces = async (radius) => {
        const query = `
  [out:json];
  (
    node["amenity"~"restaurant|cafe|fast_food|shopping_mall|cinema"](around:${radius},${midpoint.lat},${midpoint.lng});
    way["amenity"~"restaurant|cafe|fast_food|shopping_mall|cinema"](around:${radius},${midpoint.lat},${midpoint.lng});
    relation["amenity"~"restaurant|cafe|fast_food|shopping_mall|cinema"](around:${radius},${midpoint.lat},${midpoint.lng});
    node["shop"="mall"](around:${radius},${midpoint.lat},${midpoint.lng});
    way["shop"="mall"](around:${radius},${midpoint.lat},${midpoint.lng});
    relation["shop"="mall"](around:${radius},${midpoint.lat},${midpoint.lng});
  );
  out center;
`;

        try {
          const res = await fetch(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
              query
            )}`
          );
          const data = await res.json();
          let results = data.elements
            .map((el) => ({
              id: el.id,
              name: el.tags.name || "",
              type: el.tags.amenity || "unknown",
              lat: el.lat || el.center?.lat,
              lng: el.lon || el.center?.lon,
            }))
            .map((place) => {
              const R = 6371e3;
              const φ1 = (midpoint.lat * Math.PI) / 180;
              const φ2 = (place.lat * Math.PI) / 180;
              const Δφ = ((place.lat - midpoint.lat) * Math.PI) / 180;
              const Δλ = ((place.lng - midpoint.lng) * Math.PI) / 180;
              const a =
                Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) *
                  Math.cos(φ2) *
                  Math.sin(Δλ / 2) *
                  Math.sin(Δλ / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;
              return { ...place, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10);

          if (results.length < 5 && radius < 5000) {
            console.log("Kurang dari 5 hasil, memperluas radius...");
            const newRadius = radius * 2;
            setSearchRadius(newRadius);
            return searchPlaces(newRadius);
          }

          setPlaces(results);
        } catch (err) {
          console.error("Overpass error:", err);
        }
      };

      const run = async () => {
        setIsLoading(true);
        await searchPlaces(initialRadius);
        setIsLoading(false);
      };

      run();
    }
  }, [locations]);

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-4 border-b border-base-300">
        <h1 className="text-2xl font-bold">Find Middle Point</h1>
        <p className="text-sm text-base-content/70">
          Temukan titik tengah dan rekomendasi tempat terdekat
        </p>
      </div>
      <MapView />
      <LocationInput />
      <LocationList />
      {middlePoint && <PlaceRecommendationList />}
    </div>
  );
}

export default App;

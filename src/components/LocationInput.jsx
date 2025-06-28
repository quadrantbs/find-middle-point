import { useLocationContext } from "../context/LocationContext";
import { useState, useRef } from "react";

export default function LocationInput() {
  const { locations, setLocations } = useLocationContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (q.length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            q
          )}`
        );
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("Nominatim error", err);
      }
    }, 1000);
  };

  const handleSelect = (place) => {
    const { lat, lon, display_name } = place;
    setLocations([
      ...locations,
      { lat: parseFloat(lat), lng: parseFloat(lon), name: display_name },
    ]);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Cari lokasi"
        className="input input-bordered w-full"
        value={query}
        onChange={handleSearch}
      />
      {results.length > 0 && (
        <ul className="absolute bg-base-100 shadow rounded w-full mt-1 z-50 max-h-60 overflow-y-auto">
          {results.map((place, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(place)}
              className="px-2 py-1 hover:bg-base-200 cursor-pointer text-sm"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

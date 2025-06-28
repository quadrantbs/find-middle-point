import { useEffect } from "react";
import { useLocationContext } from "../context/LocationContext";

export default function LocationList() {
  const { locations, setLocations, setMiddlePoint, setPlaces } =
    useLocationContext();

  const removeLocation = (index) => {
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
  };

  useEffect(() => {
    if (locations.length < 1) {
      setMiddlePoint(null);
      setPlaces([]);
      return;
    }
  });

  return (
    <ul className="mt-2 space-y-1">
      {locations.map((loc, idx) => (
        <li key={idx} className="text-sm">
          <div className="flex items-center justify-between bg-primary text-primary-content rounded px-2 py-1">
            <span>
              {loc.name ||
                `Lat: ${loc.lat.toFixed(3)}, Lng: ${loc.lng.toFixed(3)}`}
            </span>
            <button
              className="btn btn-xs btn-error"
              onClick={() => removeLocation(idx)}
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

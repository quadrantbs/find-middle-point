import { useLocationContext } from "../context/LocationContext";

export default function PlaceRecommendationList() {
  const { places, handlePanTo } = useLocationContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {places.map((place) => {
        const typeLabel =
          place.type
            ?.replace(/_/g, " ")
            .split(" ")
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(" ") || "Tempat Tidak Diketahui";

        const displayName = place.name || typeLabel;

        return (
          <div
            key={place.id}
            className="card bg-base-100 shadow hover:shadow-warning transition-shadow duration-300"
          >
            <div className="card-body">
              <h2 className="card-title text-base">{displayName}</h2>
              <div className="flex gap-2 mt-1">
                <span className="badge badge-success">Rekomendasi</span>
                <span className="badge badge-outline">{typeLabel}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Lat: {place.lat?.toFixed(4)}, Lng: {place.lng?.toFixed(4)}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  className="btn btn-sm btn-outline btn-warning"
                  onClick={() => handlePanTo(place.lat, place.lng, place.id)}
                >
                  Show on Map
                </button>
                <a
                  href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline btn-info"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { useLocationContext } from "../context/LocationContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";

// fix leaflet icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const redIcon = new L.Icon({
  iconUrl:
    "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView() {
  const {
    locations,
    middlePoint,
    places,
    mapRef,
    popupRefs,
    setLocations,
    searchRadius,
    isLoading,
    setIsLoading,
  } = useLocationContext();

  const [showInputPins, setShowInputPins] = useState(true);
  const [showMiddlePin, setShowMiddlePin] = useState(true);
  const [showRecommendationPins, setShowRecommendationPins] = useState(true);

  return (
    <div className="relative">
      {/* Legend */}
      <div className="absolute top-2 left-2 bg-base-100 rounded shadow px-2 py-1 text-xs z-[9000] w-48">
        <div className="font-bold mb-1">Legenda</div>
        <div className="flex items-center gap-1 mb-1">
          <input
            type="checkbox"
            checked={showInputPins}
            onChange={() => setShowInputPins((prev) => !prev)}
            className="checkbox checkbox-xs"
          />
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          Lokasi Input
        </div>
        <div className="flex items-center gap-1 mb-1">
          <input
            type="checkbox"
            checked={showMiddlePin}
            onChange={() => setShowMiddlePin((prev) => !prev)}
            className="checkbox checkbox-xs"
          />
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          Radius Pencarian
        </div>
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showRecommendationPins}
            onChange={() => setShowRecommendationPins((prev) => !prev)}
            className="checkbox checkbox-xs"
          />
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          Rekomendasi
        </div>
      </div>

      <MapContainer
        center={middlePoint || { lat: -6.9, lng: 107.6 }}
        zoom={13}
        className="h-[400px] w-full rounded-xl shadow"
        whenReady={(map) => {
          mapRef.current = map;

          let clickTimer = null;

          map.target.on("click", (e) => {
            setIsLoading(true);
            if (clickTimer) {
              setIsLoading(false);
              return;
            };

            clickTimer = setTimeout(async () => {
              const { lat, lng } = e.latlng;
              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                );
                const data = await res.json();
                const name = data.display_name || "Unnamed location";
                setLocations((prev) => [...prev, { lat, lng, name }]);
              } catch {
                setLocations((prev) => [
                  ...prev,
                  { lat, lng, name: "Unnamed location" },
                ]);
              } finally {
                setIsLoading(false); // stop loading
              }
              clickTimer = null;
            }, 800);
          });

          map.target.on("dblclick", () => {
            if (clickTimer) {
              clearTimeout(clickTimer);
              clickTimer = null;
            }
          });
        }}
        doubleClickZoom={true}
        id="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showInputPins &&
          locations.map((loc, idx) => (
            <Marker
              key={`loc-${idx}`}
              position={[loc.lat, loc.lng]}
              icon={redIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  setIsLoading(true);
                  fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                  )
                    .then((res) => res.json())
                    .then((data) => {
                      const name = data.display_name || "Unnamed location";
                      setLocations((prev) => {
                        const updated = [...prev];
                        updated[idx] = { lat, lng, name };
                        return updated;
                      });
                    })
                    .catch(() => {
                      setLocations((prev) => {
                        const updated = [...prev];
                        updated[idx] = { lat, lng, name: "Unnamed location" };
                        return updated;
                      });
                    })
                    .finally(() => {
                      setIsLoading(false);
                    });
                },
              }}
            >
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}

        {showMiddlePin && middlePoint && (
          <Circle
            center={middlePoint}
            radius={searchRadius}
            pathOptions={{
              color: "blue",
              opacity: 0.1,
              fillColor: "blue",
              fillOpacity: 0.1,
            }}
          />
        )}

        {showRecommendationPins &&
          middlePoint &&
          places.map((place) => (
            <Marker
              key={`rec-${place.id}`}
              position={[place.lat, place.lng]}
              icon={greenIcon}
              ref={(el) => {
                if (el) popupRefs.current[place.id] = el;
              }}
            >
              <Popup>{place.name || place.type}</Popup>
            </Marker>
          ))}
      </MapContainer>

      {isLoading && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-info text-xs px-2 py-1 rounded shadow z-[9000]">
          Memuat lokasi rekomendasi...
        </div>
      )}
    </div>
  );
}

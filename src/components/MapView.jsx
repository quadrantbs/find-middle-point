import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useLocationContext } from "../context/LocationContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const blueIcon = new L.Icon({
  iconUrl:
    "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png",
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
  const { locations, middlePoint, places, mapRef, popupRefs, setLocations } =
    useLocationContext();

  function MapClickHandler() {
    useMapEvents({
      click: async (e) => {
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
        }
      },
    });
    return null;
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="absolute top-2 left-2 bg-base-100 rounded shadow px-2 py-1 text-xs z-[9000]">
        <div className="flex items-center gap-1 mb-1">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />{" "}
          Lokasi Input
        </div>
        <div className="flex items-center gap-1 mb-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />{" "}
          Titik Tengah
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />{" "}
          Rekomendasi
        </div>
      </div>
      <MapContainer
        center={middlePoint || { lat: -6.9, lng: 107.6 }}
        zoom={13}
        className="h-[400px] w-full rounded-xl shadow"
        whenReady={(map) => {
          mapRef.current = map;
        }}
        id="map"
        onclick={async (e) => {
          console.log(e);
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
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        {locations.map((loc, idx) => (
          <Marker
            key={`loc-${idx}`}
            position={[loc.lat, loc.lng]}
            icon={redIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
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
                  });
              },
            }}
          >
            <Popup>{loc.name}</Popup>
          </Marker>
        ))}
        {middlePoint && (
          <Marker position={middlePoint} icon={blueIcon}>
            <Popup>Titik Tengah</Popup>
          </Marker>
        )}
        {middlePoint &&
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
    </div>
  );
}

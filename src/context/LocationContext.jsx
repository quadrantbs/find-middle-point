import { createContext, useContext, useState, useRef } from "react";

const LocationContext = createContext();

export const useLocationContext = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [middlePoint, setMiddlePoint] = useState(null);
  const [places, setPlaces] = useState([]);
  const mapRef = useRef();
  const popupRefs = useRef({});

  const handlePanTo = (lat, lng, id) => {
    if (mapRef.current && lat && lng) {
      mapRef.current.target.setView([lat, lng], 17, { animate: true });
      if (id && popupRefs.current[id]) {
        popupRefs.current[id].openPopup();
      }
      document.getElementById("map")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <LocationContext.Provider
      value={{
        locations,
        setLocations,
        middlePoint,
        setMiddlePoint,
        places,
        setPlaces,
        mapRef,
        popupRefs,
        handlePanTo,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

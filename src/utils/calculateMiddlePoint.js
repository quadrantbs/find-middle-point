export const calculateMiddlePoint = (coords) => {
  if (coords.length === 0) return null;

  let x = 0.0,
    y = 0.0,
    z = 0.0;
  coords.forEach(({ lat, lng }) => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    x += Math.cos(latRad) * Math.cos(lngRad);
    y += Math.cos(latRad) * Math.sin(lngRad);
    z += Math.sin(latRad);
  });
  const total = coords.length;
  x /= total;
  y /= total;
  z /= total;

  const lng = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const lat = Math.atan2(z, hyp);

  return { lat: (lat * 180) / Math.PI, lng: (lng * 180) / Math.PI };
};

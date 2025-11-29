import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { database, ref, onValue } from "../firebase";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const busIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='40' height='40'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23667eea'/%3E%3Ctext x='32' y='42' font-size='32' text-anchor='middle' fill='white'%3E🚌%3C/text%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

function DriverMap({ setView }) {
  const [driverLocation, setDriverLocation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const locationRef = ref(database, "driverLocation");
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDriverLocation(data);
        setLastUpdate(new Date(data.timestamp));
      } else {
        setDriverLocation(null);
        setLastUpdate(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const getTimeAgo = () => {
    if (!lastUpdate) return "";
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000); // seconds

    if (diff < 60) return `${diff} sekund temu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minut temu`;
    return `${Math.floor(diff / 3600)} godzin temu`;
  };

  const defaultCenter = [52.2297, 21.0122]; // Warsaw
  const mapCenter = driverLocation
    ? [driverLocation.latitude, driverLocation.longitude]
    : defaultCenter;

  return (
    <>
      <div className="header">
        <button className="back-btn" onClick={() => setView("departures")}>
          ← Powrót
        </button>
        <h1>📍 Lokalizacja Kierowcy</h1>
        <p>Transport Na Żądanie - Linia 904</p>

        {driverLocation && (
          <div className="location-info">
            <div className="location-status">
              <span className="status-dot active"></span>
              <span>Kierowca online</span>
            </div>
            <div className="location-time">
              Ostatnia aktualizacja: {getTimeAgo()}
            </div>
            <div className="location-accuracy">
              Dokładność: ±{Math.round(driverLocation.accuracy)}m
            </div>
          </div>
        )}

        {!driverLocation && (
          <div className="location-info">
            <div className="location-status offline">
              <span className="status-dot"></span>
              <span>Brak danych o lokalizacji</span>
            </div>
          </div>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          key={
            driverLocation
              ? `${driverLocation.latitude}-${driverLocation.longitude}`
              : "default"
          }
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {driverLocation && (
            <Marker
              position={[driverLocation.latitude, driverLocation.longitude]}
              icon={busIcon}
            >
              <Popup>
                <div style={{ textAlign: "center" }}>
                  <strong>🚌 Autobus TNZ</strong>
                  <br />
                  <small>Linia 904</small>
                  <br />
                  <small>Aktualizacja: {getTimeAgo()}</small>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </>
  );
}

export default DriverMap;

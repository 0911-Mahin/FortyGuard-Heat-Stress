import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { mockSites, RISK_LEVELS, activeSiteId } from "../data/mockData";

export default function MapView({ theme }) {
  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const activeSite = mockSites.find((s) => s.id === activeSiteId);

  return (
    <MapContainer
      center={[33.5, -96]}
      zoom={4}
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        key={theme}
        url={tileUrl}
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />
      {mockSites.map((site) => {
        const risk = RISK_LEVELS[site.risk];
        // Black markers need a bright ring to stay visible on both basemaps
        const isBlack = site.risk === "black";
        return (
          <CircleMarker
            key={site.id}
            center={[site.lat, site.lng]}
            radius={12}
            pathOptions={{
              color: isBlack ? "#ff0000" : risk.color,
              fillColor: risk.color,
              fillOpacity: isBlack ? 0.9 : 0.55,
              weight: isBlack ? 3 : 2,
            }}
          >
            <Popup className="risk-popup">
              <div className="font-body text-ink min-w-[160px]">
                <div className="font-display font-bold uppercase text-sm mb-1">
                  {site.name}
                </div>
                <div
                  className="inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm mb-2 text-white"
                  style={{ backgroundColor: risk.color }}
                >
                  {risk.label}
                </div>
                <div className="text-xs space-y-0.5 font-mono">
                  <div>Wet-bulb: {site.wetBulb}°C</div>
                  <div>Apparent: {site.apparent}°C</div>
                  <div>Humidity: {site.humidity}%</div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}


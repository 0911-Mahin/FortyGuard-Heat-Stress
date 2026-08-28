import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { classifyWBGT, wbgtAtHorizon } from "../data/riskLevels";

function FocusController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 9, { duration: 1.1 });
  }, [target, map]);
  return null;
}

function ClickCapture({ active, onMapClick }) {
  useMapEvents({
    click(e) {
      if (active) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({ sites, activeSite, horizon, onSelectSite, pinDropMode, onMapClick, theme }) {
  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      center={[33.5, -96]}
      zoom={4}
      className={`w-full h-full ${pinDropMode ? "cursor-crosshair" : ""}`}
      zoomControl={false}
    >
      <TileLayer key={tileUrl} url={tileUrl} attribution='&copy; OpenStreetMap &copy; CARTO' />
      <FocusController target={activeSite} />
      <ClickCapture active={pinDropMode} onMapClick={onMapClick} />

      {sites.map((site) => {
        const isPending = site.status === "pending";
        const isError = site.status === "error";
        const wbgt = !isPending && !isError ? wbgtAtHorizon(site.result, horizon) : null;
        const risk = wbgt != null ? classifyWBGT(wbgt) : null;
        const color = isPending ? "#8C8880" : isError ? "#D62828" : risk?.color || "#8C8880";

        return (
          <CircleMarker
            key={site.id}
            center={[site.lat, site.lng]}
            radius={site.id === activeSite?.id ? 14 : 11}
            eventHandlers={{ click: () => onSelectSite(site.id) }}
            pathOptions={{
              color: risk?.label === 'Extreme' ? '#FFFF00' : color,
              fillColor: color,
              fillOpacity: isPending ? 0.25 : 0.55,
              weight: site.id === activeSite?.id ? 3 : 2,
              dashArray: isPending ? "4 4" : undefined,
            }}
          >
            <Popup>
              <div className="font-body text-asphalt min-w-[160px]">
                <div className="font-display font-bold uppercase text-sm mb-1">{site.name}</div>
                {isPending && <div className="text-xs font-mono">Analysing...</div>}
                {isError && <div className="text-xs font-mono text-risk-red">{site.error}</div>}
                {risk && (
                  <>
                    <div
                      className={`inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm mb-2 ${
                        risk.dark ? "text-asphalt border border-asphalt-3" : "text-white"
                      }`}
                      style={{ backgroundColor: risk.color }}
                    >
                      {risk.label}
                    </div>
                    <div className="text-xs space-y-0.5 font-mono">
                      <div>Analysis Area &asymp; 31,500 m&sup2;</div>
                      <div>WBGT: {wbgt.toFixed(1)}°C</div>
                      <div>Apparent: {site.result.apparent_temp}°C</div>
                      <div>Humidity: {site.result.humidity}%</div>
                    </div>
                  </>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

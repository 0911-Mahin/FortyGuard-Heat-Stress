import { useRef, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { RISK_LEVELS, mockSites, activeSiteId } from "../data/mockData";
import useClickOutside from "../hooks/useClickOutside";
import SafetyInfoPanel from "./SafetyInfoPanel";

export default function RiskBanner() {
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef(null);
  useClickOutside(infoRef, () => setInfoOpen(false));

  const activeSite = mockSites.find((s) => s.id === activeSiteId);
  const risk = RISK_LEVELS[activeSite.risk];
  const onLight = activeSite.risk === "black"; // needs light text on near-black bg

  return (
    <div className="relative shrink-0" style={{ backgroundColor: risk.color }}>
      <div className="absolute inset-0 hazard-stripe opacity-20 pointer-events-none" />
      <div
        className={`relative flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4
        pl-4 pr-12 sm:px-6 py-2.5 ${onLight ? "text-concrete" : "text-asphalt"}`}
      >
        <div className="flex items-center gap-2 font-display font-extrabold uppercase text-lg sm:text-xl tracking-wide">
          <AlertTriangle size={20} strokeWidth={2.5} />
          {risk.label} — {activeSite.name}
        </div>
        <div
          className={`font-mono text-xs sm:text-sm font-medium sm:border-l sm:pl-4 ${
            onLight ? "sm:border-concrete/30" : "sm:border-asphalt/30"
          }`}
        >
          {risk.action}
        </div>

        <div
          className="absolute top-2 right-3 sm:static sm:top-auto sm:right-auto sm:ml-auto"
          ref={infoRef}
        >
          <button
            onClick={() => setInfoOpen((v) => !v)}
            aria-label="Safety precautions"
            aria-expanded={infoOpen}
            className={`p-1 rounded-sm transition-colors ${
              onLight
                ? "text-concrete/80 hover:text-safety-yellow"
                : "text-asphalt/70 hover:text-asphalt"
            }`}
          >
            <Info size={18} />
          </button>
          {infoOpen && <SafetyInfoPanel risk={activeSite.risk} />}
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { AlertTriangle, Loader2, Info } from "lucide-react";
import { classifyWBGT, wbgtAtHorizon } from "../data/riskLevels";
import { RISK_INFO } from "../data/riskInfo";

export default function RiskBanner({ activeSite, horizon }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target)) setInfoOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!activeSite) {
    return (
      <div className="shrink-0 bg-paper-2 dark:bg-asphalt-2 border-b border-paper-3 dark:border-asphalt-3 px-4 sm:px-6 py-2.5">
        <p className="text-sm text-graphite dark:text-steel font-mono">
          Select or add a site to view risk status.
        </p>
      </div>
    );
  }

  if (activeSite.status === "pending") {
    return (
      <div className="shrink-0 bg-paper-2 dark:bg-asphalt-2 border-b border-paper-3 dark:border-asphalt-3 px-4 sm:px-6 py-2.5 flex items-center gap-2">
        <Loader2 size={16} className="animate-spin text-safety-yellow" />
        <span className="text-sm font-mono text-graphite dark:text-steel">
          Analysing {activeSite.name}...
        </span>
      </div>
    );
  }

  if (activeSite.status === "error") {
    return (
      <div className="shrink-0 bg-risk-red px-4 sm:px-6 py-2.5">
        <p className="text-sm font-mono text-white">
          Failed to analyse {activeSite.name}: {activeSite.error}, Try Again Later.
        </p>
      </div>
    );
  }

  const wbgt = wbgtAtHorizon(activeSite.result, horizon);
  const risk = wbgt != null ? classifyWBGT(wbgt) : null;
  if (!risk) return null;

  const points = RISK_INFO[risk.key];

  return (
    <div
      className={`relative shrink-0 ${risk.ring ? "ring-1 ring-inset ring-safety-yellow" : ""}`}
      style={{ backgroundColor: risk.color }}
    >
      <div className="absolute inset-0 hazard-stripe opacity-20 pointer-events-none" />

      {points && (
        <div ref={infoRef} className="absolute top-2 right-2 sm:top-1/2 sm:-translate-y-1/2 z-[1010]">
          <button
            onClick={() => setInfoOpen((v) => !v)}
            aria-label="Precaution details"
            className={`p-1 rounded-full transition-colors ${
              risk.dark ? "text-asphalt hover:bg-asphalt/10" : "text-white hover:bg-white/15"
            }`}
          >
            <Info size={20} />
          </button>
          {infoOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-asphalt-2 text-concrete border border-asphalt-3 rounded-sm shadow-lg p-3">
              <p className="font-display font-bold uppercase text-sm mb-1.5" style={{ color: risk.color }}>
                {risk.label} — required precautions
              </p>
              <ul className="space-y-1 text-xs font-mono list-disc list-inside">
                {points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div
        className={`relative flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 sm:px-6 py-2.5 ${
          points ? "pr-11 sm:pr-11" : ""
        } ${risk.dark ? "text-asphalt" : "text-white"}`}
      >
        <div className="flex items-center gap-2 font-display font-extrabold uppercase text-lg sm:text-xl tracking-wide">
          <AlertTriangle size={20} strokeWidth={2.5} />
          {risk.label} — {activeSite.name}
        </div>
        <div className="font-mono text-xs sm:text-sm font-medium sm:border-l sm:border-current/30 sm:pl-4">
          {risk.action} · WBGT {wbgt.toFixed(1)}°C
        </div>
      </div>
      {/*<div className={`relative px-4 sm:px-6 pb-1.5 -mt-1 text-[10px] font-mono ${risk.dark ? "text-asphalt/70" : "text-white/75"}`}>
        Based on latest forecast 12 hours ago.
      </div>*/}
    </div>
  );
}

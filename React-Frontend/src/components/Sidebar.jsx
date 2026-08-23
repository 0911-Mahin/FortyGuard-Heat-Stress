import { useState } from "react";
import { Search, Sliders, X, Leaf, Clock, Zap, RefreshCw } from "lucide-react";
import { mockSites, RISK_LEVELS, activeSiteId, shiftHorizons } from "../data/mockData";


function RiskDot({ level }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ backgroundColor: RISK_LEVELS[level].color }}
    />
  );
}

function SiteRow({ site }) {
  const isActive = site.id === activeSiteId;
  return (
    <button
      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-sm text-left transition-colors ${
        isActive
          ? "bg-paper-3 ring-1 ring-safety-orange/50 dark:bg-asphalt-3 dark:ring-safety-yellow/50"
          : "hover:bg-paper-3/60 dark:hover:bg-asphalt-3/60"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <RiskDot level={site.risk} />
        <span className="text-sm truncate">{site.name}</span>
      </div>
      <span className="font-mono text-xs text-graphite dark:text-steel shrink-0">
        {site.apparent}°
      </span>
    </button>
  );
}

function HorizonPicker({ value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-graphite dark:text-steel">
          <Clock size={13} /> Shift start
        </span>
        <span className="flex items-center gap-1 text-[10px] font-mono text-risk-green">
          <Zap size={11} /> Live
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {shiftHorizons.map((h) => (
          <button
            key={h}
            onClick={() => onChange(h)}
            className={`py-1.5 rounded-sm text-xs font-mono transition-colors ${
              value === h
                ? "bg-safety-orange dark:bg-safety-yellow text-white dark:text-asphalt font-semibold"
                : "bg-paper dark:bg-asphalt text-graphite dark:text-steel hover:text-ink dark:hover:text-concrete border border-paper-3 dark:border-asphalt-3"
            }`}
          >
            {h === 0 ? "Now" : `+${h}h`}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-graphite dark:text-steel mt-1.5 leading-snug">
        All 6 horizons pulled in one call — switching updates the map instantly.
      </p>
    </div>
  );
}

const BASE_GREENERY = 12;

function GreenerySlider({ value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-graphite dark:text-steel">
          <Leaf size={13} /> Added greenery
        </span>
        <span className="font-mono text-xs text-safety-orange dark:text-safety-yellow">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={40}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-safety-orange h-1.5 cursor-pointer"
      />
      <p className="text-[10px] text-graphite dark:text-steel mt-1.5 leading-snug">
        Changes land-cover features — needs a fresh model call.
      </p>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const [horizon, setHorizon] = useState(0);
  const [greenery, setGreenery] = useState(BASE_GREENERY);
  const greeneryChanged = greenery !== BASE_GREENERY;

  const handleRerun = () => {
    // simulate: model call fires with `greenery`, then panel resets to baseline
    setGreenery(BASE_GREENERY);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-[1001] w-[85%] max-w-sm md:w-80
        bg-paper-2 border-r border-paper-3 dark:bg-asphalt-2 dark:border-asphalt-3
        flex flex-col transition-transform duration-200 md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-paper-3 dark:border-asphalt-3 md:hidden">
          <span className="font-display uppercase font-bold tracking-wide">Control Panel</span>
          <button onClick={onClose} aria-label="Close panel">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-paper-3 dark:border-asphalt-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite dark:text-steel" />
            <input
              type="text"
              placeholder="Search site or draw AOI..."
              className="w-full bg-paper border border-paper-3 dark:bg-asphalt dark:border-asphalt-3 rounded-sm pl-9 pr-3 py-2 text-sm
              placeholder:text-graphite dark:placeholder:text-steel focus:border-safety-orange dark:focus:border-safety-yellow outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <h2 className="text-xs uppercase tracking-widest text-graphite dark:text-steel font-mono mb-2">
            Monitored Sites ({mockSites.length})
          </h2>
          {mockSites.map((s) => (
            <SiteRow key={s.id} site={s} />
          ))}
        </div>

        <div className="p-4 border-t border-paper-3 dark:border-asphalt-3 space-y-4">
          <h2 className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-graphite dark:text-steel font-mono">
            <Sliders size={13} /> Simulate
          </h2>
          <HorizonPicker value={horizon} onChange={setHorizon} />
          <GreenerySlider value={greenery} onChange={setGreenery} />
          <button
            disabled={!greeneryChanged}
            onClick={handleRerun}
            className={`w-full flex items-center justify-center gap-1.5 font-display font-bold
            uppercase tracking-wide py-2 rounded-sm text-sm transition-colors ${
              greeneryChanged
                ? "bg-safety-orange hover:bg-safety-orange/90 text-white dark:hover:bg-safety-yellow/90"
                : "bg-paper-3 dark:bg-asphalt-3 text-graphite dark:text-steel cursor-not-allowed"
            }`}
          >
            <RefreshCw size={14} /> Re-run with new greenery
          </button>
        </div>
      </aside>
    </>
  );
}

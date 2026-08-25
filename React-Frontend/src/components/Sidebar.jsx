import { useState, useEffect } from "react";
import { Sliders, X, Leaf, Clock, Zap, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { classifyWBGT, wbgtAtHorizon } from "../data/riskLevels";
import { timeAgo, ONE_HOUR_MS } from "../utils/time";
import LocationInput from "./LocationInput";

const shiftHorizons = [0, 1, 2, 3, 4, 5, 6];

function RiskDot({ site, horizon }) {
  if (site.status === "pending") {
    return <Loader2 size={11} className="animate-spin text-steel shrink-0" />;
  }
  if (site.status === "error") {
    return <span className="w-2.5 h-2.5 rounded-full bg-risk-red shrink-0" />;
  }
  const wbgt = wbgtAtHorizon(site.result, horizon);
  const risk = wbgt != null ? classifyWBGT(wbgt) : null;
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0 border border-paper-3 dark:border-asphalt-3"
      style={{ backgroundColor: risk?.color || "#8C8880" }}
    />
  );
}

function SiteRow({ site, isActive, horizon, onSelect, onRemove, onRefresh }) {
  const wbgt = site.status === "completed" ? wbgtAtHorizon(site.result, horizon) : null;
  const isStale = site.lastFetchedAt && Date.now() - site.lastFetchedAt >= ONE_HOUR_MS;
  const showRefresh = site.status === "error" || isStale;

  return (
    <div
      className={`group flex items-center gap-1 rounded-sm transition-colors ${
        isActive ? "bg-paper-3 dark:bg-asphalt-3 ring-1 ring-safety-orange/50 dark:ring-safety-yellow/50" : "hover:bg-paper-3/60 dark:hover:bg-asphalt-3/60"
      }`}
    >
      <button
        onClick={() => onSelect(site.id)}
        className="flex-1 flex items-center justify-between gap-2 px-3 py-2.5 text-left min-w-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <RiskDot site={site} horizon={horizon} />
          <span className="text-sm truncate">{site.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {wbgt != null && (
            <span className="font-mono text-xs text-graphite dark:text-steel">{wbgt.toFixed(1)}°</span>
          )}
          {site.lastFetchedAt && (
            <span className="font-mono text-[10px] text-steel hidden sm:inline">{timeAgo(site.lastFetchedAt)}</span>
          )}
        </div>
      </button>

      {site.refreshing ? (
        <span className="px-2 py-2.5 text-safety-yellow">
          <Loader2 size={14} className="animate-spin" />
        </span>
      ) : showRefresh ? (
        <button
          onClick={() => onRefresh(site.id)}
          aria-label={`Refresh ${site.name}`}
          className={`px-2 py-2.5 transition-colors ${
            site.status === "error"
              ? "text-risk-red hover:text-risk-red/80"
              : "text-safety-orange dark:text-safety-yellow hover:opacity-80"
          }`}
        >
          <RefreshCw size={14} />
        </button>
      ) : null}

      <button
        onClick={() => onRemove(site.id)}
        aria-label={`Remove ${site.name}`}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 px-2 py-2.5 text-steel hover:text-risk-red transition-opacity"
      >
        <Trash2 size={14} />
      </button>
    </div>
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
        Switching updates instantly.
      </p>
    </div>
  );
}

function GreenerySlider({ siteId, serverValue, disabled, onApply, applying }) {
  const [value, setValue] = useState(serverValue ?? 12);
  const [dirty, setDirty] = useState(false);

  // Snap to whatever the API actually returned whenever the active site
  // changes or a fresh result comes back (initial analyse or simulate).
  useEffect(() => {
    if (serverValue != null) {
      setValue(serverValue);
      setDirty(false);
    }
  }, [siteId, serverValue]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-graphite dark:text-steel">
          <Leaf size={13} /> Added greenery
        </span>
        <span className="font-mono text-xs text-safety-orange dark:text-safety-yellow">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          setValue(Number(e.target.value));
          setDirty(true);
        }}
        className="w-full accent-safety-orange h-1.5 cursor-pointer disabled:opacity-40"
      />
      <p className="text-[10px] text-graphite dark:text-steel mt-1.5 leading-snug">
        Changing land-cover features requires a fresh model call.
      </p>
      <button
        disabled={!dirty || disabled || applying}
        onClick={() => {
          onApply(value);
          setDirty(false);
        }}
        className={`w-full mt-3 flex items-center justify-center gap-1.5 font-display font-bold
        uppercase tracking-wide py-2 rounded-sm text-sm transition-colors ${
          dirty && !disabled
            ? "bg-safety-orange hover:bg-safety-orange/90 text-white"
            : "bg-paper-3 dark:bg-asphalt-3 text-graphite dark:text-steel cursor-not-allowed"
        }`}
      >
        {applying ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        Re-run with new greenery
      </button>
    </div>
  );
}

export default function Sidebar({
  open,
  onClose,
  sites,
  activeSiteId,
  onSelect,
  onRemove,
  onAddSite,
  onRefresh,
  horizon,
  onHorizonChange,
  onSimulate,
  pinDropMode,
  onTogglePinDrop,
  pendingCoords,
}) {
  const activeSite = sites.find((s) => s.id === activeSiteId);
  const [applying, setApplying] = useState(false);

  // Force a re-render every minute so "Xh ago" labels and the >=1hr
  // refresh-icon threshold stay current without user interaction.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const handleApply = async (pct) => {
    if (!activeSite) return;
    setApplying(true);
    await onSimulate(activeSite.id, pct);
    setApplying(false);
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-[1000] md:hidden" onClick={onClose} />}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-[1010] w-[85%] max-w-sm md:w-80 bg-paper-2 dark:bg-asphalt-2 border-r border-paper-3 dark:border-asphalt-3
        flex flex-col transition-transform duration-200 md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-paper-3 dark:border-asphalt-3 md:hidden">
          <span className="font-display uppercase font-bold tracking-wide">Control Panel</span>
          <button onClick={onClose} aria-label="Close panel">
            <X size={20} />
          </button>
        </div>

        <LocationInput
          pendingCoords={pendingCoords}
          pinDropMode={pinDropMode}
          onTogglePinDrop={onTogglePinDrop}
          onAddSite={onAddSite}
        />

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
          <h2 className="text-xs uppercase tracking-widest text-graphite dark:text-steel font-mono mb-2">
            Monitored Sites ({sites.length})
          </h2>
          {sites.length === 0 && (
            <p className="text-xs text-steel font-mono py-4">No sites yet.</p>
          )}
          {sites.map((s) => (
            <SiteRow
              key={s.id}
              site={s}
              isActive={s.id === activeSiteId}
              horizon={horizon}
              onSelect={onSelect}
              onRemove={onRemove}
              onRefresh={onRefresh}
            />
          ))}
        </div>

        <div className="p-4 border-t border-paper-3 dark:border-asphalt-3 space-y-4">
          <h2 className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-graphite dark:text-steel font-mono">
            <Sliders size={13} /> Simulate {activeSite ? `— ${activeSite.name}` : ""}
          </h2>
          <HorizonPicker value={horizon} onChange={onHorizonChange} />
          <GreenerySlider
            siteId={activeSite?.id}
            serverValue={activeSite?.result?.pct_greenery}
            disabled={!activeSite || activeSite.status !== "completed"}
            applying={applying}
            onApply={handleApply}
          />
        </div>
      </aside>
    </>
  );
}

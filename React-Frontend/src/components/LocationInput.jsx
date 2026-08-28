import { useState, useEffect, useRef } from "react";
import { MapPin, Plus, Crosshair, ChevronDown, Search } from "lucide-react";
import { US_PLACES } from "../data/places";

function validLat(v) {
  const n = Number(v);
  return v !== "" && !Number.isNaN(n) && n >= -90 && n <= 90;
}
function validLng(v) {
  const n = Number(v);
  return v !== "" && !Number.isNaN(n) && n >= -180 && n <= 180;
}

function CityAutocomplete({ onPick }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const boxRef = useRef(null);

  const matches =
    query.trim().length === 0
      ? US_PLACES
      : US_PLACES.filter((p) =>
          `${p.name} ${p.state}`.toLowerCase().includes(query.trim().toLowerCase())
        );

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-steel" />
        <input
          type="text"
          value={query}
          onFocus={() => setFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search US city or state..."
          className="w-full bg-paper dark:bg-asphalt border border-paper-3 dark:border-asphalt-3 rounded-sm pl-8 pr-3 py-2 text-sm
          placeholder:text-steel focus:border-safety-yellow outline-none"
        />
      </div>
      {focused && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-paper dark:bg-asphalt-2 border border-paper-3 dark:border-asphalt-3 rounded-sm shadow-lg">
          {matches.length === 0 && (
            <p className="px-3 py-2 text-xs text-steel">No match — pick from the list only.</p>
          )}
          {matches.map((p) => (
            <button
              key={`${p.name}-${p.state}`}
              onClick={() => {
                onPick(p);
                setQuery("");
                setFocused(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-safety-yellow hover:text-asphalt transition-colors"
            >
              {p.name} <span className="text-graphite dark:text-steel">— {p.state}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LocationInput({ pendingCoords, pinDropMode, onTogglePinDrop, onAddSite }) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (pendingCoords) {
      setLat(pendingCoords.lat.toFixed(4));
      setLng(pendingCoords.lng.toFixed(4));
      setName("");
      setOpen(true);
    }
  }, [pendingCoords]);

  const latOk = validLat(lat);
  const lngOk = validLng(lng);
  const canAdd = latOk && lngOk;

  const handleAddCoords = () => {
    if (!canAdd) return;
    const label = name.trim() || `Custom Site (${Number(lat).toFixed(2)}, ${Number(lng).toFixed(2)})`;
    onAddSite(label, Number(lat), Number(lng));
    setLat("");
    setLng("");
    setName("");
    setOpen(false);
  };

  const Add = (p) => {
    setOpen(false);
    onAddSite(`${p.name}, ${p.state}`, p.lat, p.lng);
  }

  return (
    <div className="border-b border-paper-3 dark:border-asphalt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest
        text-graphite dark:text-steel font-mono hover:text-ink dark:hover:text-concrete transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Plus size={13} /> Add Site
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <CityAutocomplete onPick={Add} />

          <button
            onClick={onTogglePinDrop}
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-sm text-sm font-medium transition-colors ${
              pinDropMode
                ? "bg-safety-yellow text-asphalt"
                : "bg-paper dark:bg-asphalt border border-paper-3 dark:border-asphalt-3 hover:border-safety-yellow"
            }`}
          >
            <Crosshair size={15} />
            {pinDropMode ? "Click the map to drop pin..." : "Drop pin on map"}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className={`w-full bg-paper dark:bg-asphalt border rounded-sm px-2.5 py-1.5 text-sm outline-none font-mono
              ${lat && !latOk ? "border-risk-red" : "border-paper-3 dark:border-asphalt-3 focus:border-safety-yellow"}`}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className={`w-full bg-paper dark:bg-asphalt border rounded-sm px-2.5 py-1.5 text-sm outline-none font-mono
              ${lng && !lngOk ? "border-risk-red" : "border-paper-3 dark:border-asphalt-3 focus:border-safety-yellow"}`}
            />
          </div>
          {(lat && !latOk) || (lng && !lngOk) ? (
            <p className="text-[10px] text-risk-red">Lat must be -90 to 90, lng -180 to 180.</p>
          ) : null}

          <input
            type="text"
            placeholder="Site name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-paper dark:bg-asphalt border border-paper-3 dark:border-asphalt-3 rounded-sm px-2.5 py-1.5 text-sm
            placeholder:text-steel focus:border-safety-yellow outline-none"
          />

          <button
            disabled={!canAdd}
            onClick={handleAddCoords}
            className={`w-full flex items-center justify-center gap-1.5 font-display font-bold uppercase
            tracking-wide py-2 rounded-sm text-sm transition-colors ${
              canAdd
                ? "bg-safety-orange hover:bg-safety-orange/90 text-white"
                : "bg-paper-3 dark:bg-asphalt-3 text-graphite dark:text-steel cursor-not-allowed"
            }`}
          >
            <MapPin size={14} /> Add from coordinates
          </button>
        </div>
      )}
    </div>
  );
}

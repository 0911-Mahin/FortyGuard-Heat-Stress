import { useState, useCallback, useRef, useEffect } from "react";
import { analyseSite, simulateGreenery } from "../api/riskApi";

const STORAGE_KEY = "fg-monitored-sites";
let idCounter = 1;

function loadStoredSites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    idCounter = parsed.reduce((max, s) => Math.max(max, s.id), 0) + 1;
    return parsed;
  } catch {
    return [];
  }
}

export function useSites() {
  const [sites, setSites] = useState(loadStoredSites);
  const [activeSiteId, setActiveSiteId] = useState(null);
  const sitesRef = useRef(sites);
  sitesRef.current = sites;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  }, [sites]);

  const addSite = useCallback(async (name, lat, lng) => {
    const id = idCounter++;
    setSites((prev) => [
      ...prev,
      { id, name, lat, lng, status: "pending", jobId: null, result: null, error: null, lastFetchedAt: null },
    ]);
    setActiveSiteId(id);

    try {
      const { jobId, result } = await analyseSite({ latitude: lat, longitude: lng });
      setSites((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, jobId, result, status: "completed", lastFetchedAt: Date.now() } : s
        )
      );
    } catch (err) {
      setSites((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "error", error: err.message } : s))
      );
    }
    return id;
  }, []);

  const removeSite = useCallback((id) => {
    setSites((prev) => prev.filter((s) => s.id !== id));
    setActiveSiteId((cur) => (cur === id ? null : cur));
  }, []);

  const selectSite = useCallback((id) => setActiveSiteId(id), []);

  const runSimulation = useCallback(async (id, pctGreenery) => {
    const site = sitesRef.current.find((s) => s.id === id);
    if (!site?.jobId) return;
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, simStatus: "pending" } : s)));
    try {
      const result = await simulateGreenery({ jobId: site.jobId, pctGreenery });
      setSites((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, result, simStatus: "completed", lastFetchedAt: Date.now() } : s
        )
      );
    } catch (err) {
      setSites((prev) =>
        prev.map((s) => (s.id === id ? { ...s, simStatus: "error", simError: err.message } : s))
      );
    }
  }, []);

  // Re-runs analysis for a site's coordinates. Used both for the "stale
  // data" refresh (>=1hr old) and for retrying sites that failed to fetch.
  const refreshSite = useCallback(async (id) => {
    const site = sitesRef.current.find((s) => s.id === id);
    if (!site) return;
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, refreshing: true } : s)));
    try {
      const { jobId, result } = await analyseSite({ latitude: site.lat, longitude: site.lng });
      setSites((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, jobId, result, status: "completed", error: null, refreshing: false, lastFetchedAt: Date.now() }
            : s
        )
      );
    } catch (err) {
      setSites((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "error", error: err.message, refreshing: false } : s))
      );
    }
  }, []);

  return { sites, activeSiteId, addSite, removeSite, selectSite, runSimulation, refreshSite };
}

export const RISK_LEVELS = {
  green: {
    label: "Safe",
    action: "Normal outdoor work",
    color: "#2E9E4F",
  },
  orange: {
    label: "Caution",
    action: "Mandatory 15-min breaks/hour",
    color: "#E8590C",
  },
  red: {
    label: "Danger",
    action: "Shaded/cooled work only — 45-min breaks/hour",
    color: "#D62828",
  },
  black: {
    label: "Extreme",
    action: "Stop all outdoor work — heat emergency",
    color: "#0D0D0D",
  },
};

export const mockSites = [
  { id: 1, name: "Phoenix Metro Rebar Yard", lat: 33.4484, lng: -112.0740, risk: "black", wetBulb: 32.9, apparent: 46.2, humidity: 28 },
  { id: 2, name: "Houston Ship Channel Site", lat: 29.7604, lng: -95.3698, risk: "red", wetBulb: 29.4, apparent: 40.8, humidity: 71 },
  { id: 3, name: "Miami-Dade Rooftop Crew", lat: 25.7617, lng: -80.1918, risk: "red", wetBulb: 30.1, apparent: 42.0, humidity: 76 },
  { id: 4, name: "Charlotte Delivery Hub", lat: 35.2271, lng: -80.8431, risk: "orange", wetBulb: 26.5, apparent: 33.4, humidity: 58 },
  { id: 5, name: "Denver Warehouse District", lat: 39.7392, lng: -104.9903, risk: "green", wetBulb: 21.3, apparent: 27.1, humidity: 22 },
];

export const activeSiteId = 1;

// 1-6hr forecast horizons, all fetched in a single call — switching is instant, no refetch
export const shiftHorizons = [0, 1, 2, 3, 4, 5, 6];

// Precautionary measures shown in the risk banner's info panel, per classification.
// Placeholder points — fill these in with your actual NIOSH/OSHA-based guidance.
export const PRECAUTIONS = {
  green: ["3 breaks/hour - 3 minutes each"],
  orange: ["Atleast 3 breaks each hour - 3 minutes each", "Cold water immersion tubs", "2 hours max outdoor work"],
  red: ["1 hour max outdoor work", "Atleast 20 minutes breaks distributed throughtout 1 hour", "Cold water immersion tubs"],
  black: ["No outdoor works", "Heat Emergency"],
};

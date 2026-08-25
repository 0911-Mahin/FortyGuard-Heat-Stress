// WBGT flag table (°C), per NIOSH heat-stress classification
export const WBGT_LEVELS = [
  { key: "green", max: 27.7, label: "Safe", color: "#2E9E4F", dark: true, action: "Normal outdoor work" },
  { key: "white", max: 29.4, label: "Caution", color: "#ABA695", action: "Water breaks, monitor workers" },
  { key: "yellow", max: 31.0, label: "Moderate", color: "#F2B705", action: "" },
  { key: "red", max: 32.1, label: "High", color: "#D62828", action: "" },
  { key: "black", max: Infinity, label: "Extreme", color: "#0D0D0D", ring: true, action: "Stop outdoor work" },
];

export function classifyWBGT(wbgtC) {
  return WBGT_LEVELS.find((l) => wbgtC <= l.max) || WBGT_LEVELS[WBGT_LEVELS.length - 1];
}

/** result: the `result` object from analyse/simulate. horizon 0 = current wet_bulb, 1-6 = predictions["t+Nh"] */
export function wbgtAtHorizon(result, horizon) {
  if (!result) return null;
  if (horizon === 0) return result.wet_bulb;
  return result.predictions?.[`t+${horizon}h`] ?? null;
}

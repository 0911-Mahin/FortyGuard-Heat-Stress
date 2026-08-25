// Keyed by WBGT_LEVELS key (white has no entry — no precautions beyond normal work)
export const RISK_INFO = {
  white: ["3 breaks/hour — 3 minutes each"],
  yellow: [
    "Atleast 3 breaks each hour — 3 minutes each",
    "Cold water immersion tubs",
    "2 hours max outdoor work",
  ],
  red: [
    "1 hour max outdoor work",
    "Atleast 20 minutes breaks distributed throughout 1 hour",
    "Cold water immersion tubs",
  ],
  black: ["No outdoor works", "Heat Emergency"],
};

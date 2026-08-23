import { useEffect, useState } from "react";

// Uses the browser/OS timezone (Intl) to infer local time — this comes from
// system settings, not the Geolocation API, so no permission prompt is needed.
export default function useLocalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const time = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Short tz label, e.g. "GMT+5:30" — falls back gracefully if unsupported
  let tzAbbr = "";
  try {
    tzAbbr =
      new Intl.DateTimeFormat(undefined, {
        timeZoneName: "shortOffset",
      })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    tzAbbr = timeZone;
  }

  return { time, tzAbbr, timeZone };
}

import { PRECAUTIONS } from "../data/mockData";

export default function SafetyInfoPanel({ risk }) {
  const points = PRECAUTIONS[risk] || [];

  return (
    <div
      className="absolute right-0 top-full mt-2 w-[90vw] max-w-xs sm:w-72 z-[1002]
      bg-paper-2 border border-paper-3 dark:bg-asphalt-2 dark:border-asphalt-3
      rounded-sm shadow-lg p-4"
    >
      <h2 className="font-display font-bold uppercase tracking-wide text-sm mb-2
        text-ink dark:text-concrete">
        Precautionary Measures
      </h2>
      <ul className="space-y-1 text-xs text-graphite dark:text-steel list-disc list-inside">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

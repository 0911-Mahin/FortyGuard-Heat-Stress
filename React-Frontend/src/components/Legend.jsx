import { WBGT_LEVELS } from "../data/riskLevels";

export default function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-[400] bg-paper-2/95 dark:bg-asphalt-2/95 border border-paper-3 dark:border-asphalt-3 rounded-sm px-3 py-2.5 backdrop-blur-sm">
      <div className="text-[10px] font-mono uppercase tracking-widest text-graphite dark:text-steel mb-1.5">
        WBGT Flag
      </div>
      <div className="flex flex-col gap-1">
        {WBGT_LEVELS.map((r) => (
          <div key={r.key} className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.ring ? "ring-1 ring-safety-yellow" : "border border-paper-3 dark:border-asphalt-3"}`}
              style={{ backgroundColor: r.color }}
            />
            <span className="font-medium">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

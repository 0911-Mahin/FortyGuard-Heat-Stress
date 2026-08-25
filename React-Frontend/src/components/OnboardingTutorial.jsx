import { useState } from "react";
import { X, MapPin, Clock, Leaf, Info, ChevronRight } from "lucide-react";

const STORAGE_KEY = "fg-tutorial-seen";

const STEPS = [
  {
    icon: MapPin,
    title: "Add a site",
    body: "Pick a US city from the dropdown, drop a pin on the map, or type exact lat/lng. All in the sidebar's Add Site panel.",
  },
  {
    icon: Clock,
    title: "Shift horizon",
    body: "From Now to +6h are all pulled in one call, so switching horizons updates the map instantly.",
  },
  {
    icon: Leaf,
    title: "Simulate greenery",
    body: "Adjusting greenery changes land-cover inputs, so it needs a fresh model call, hit Re-run once you've picked a value.",
  },
  {
    icon: Info,
    title: "Risk banner",
    body: "The colored bar up top shows the active site's current risk level. Tap the info icon for the required precautions.",
  },
];

export default function OnboardingTutorial() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));
  const [step, setStep] = useState(0);

  if (!visible) return null;

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const isLast = step === STEPS.length - 1;
  const { icon: Icon, title, body } = STEPS[step];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm bg-paper-2 dark:bg-asphalt-2 border border-paper-3 dark:border-asphalt-3 rounded-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-paper-3 dark:border-asphalt-3">
          <span className="font-display font-bold uppercase tracking-wide text-sm text-graphite dark:text-steel">
            Quick tour · {step + 1}/{STEPS.length}
          </span>
          <button
            onClick={close}
            aria-label="Skip tutorial"
            className="text-steel hover:text-ink dark:hover:text-concrete"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="w-10 h-10 rounded-full bg-safety-yellow/15 flex items-center justify-center mb-3">
            <Icon size={20} className="text-safety-orange dark:text-safety-yellow" />
          </div>
          <h3 className="font-display font-extrabold uppercase text-lg tracking-wide mb-1.5">
            {title}
          </h3>
          <p className="text-sm text-graphite dark:text-steel leading-relaxed">{body}</p>
        </div>

        <div className="flex items-center justify-between px-5 pb-5">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === step ? "bg-safety-orange dark:bg-safety-yellow" : "bg-paper-3 dark:bg-asphalt-3"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => (isLast ? close() : setStep((s) => s + 1))}
            className="flex items-center gap-1 bg-safety-orange hover:bg-safety-orange/90 dark:bg-safety-yellow dark:hover:bg-safety-yellow/90
            text-white dark:text-asphalt font-display font-bold uppercase tracking-wide text-sm px-4 py-1.5 rounded-sm transition-colors"
          >
            {isLast ? "Got it" : "Next"}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

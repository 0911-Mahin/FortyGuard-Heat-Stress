import { useState } from "react";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "fg-cookie-notice-seen";

export default function StorageNotice() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[1500] bg-asphalt-2 dark:bg-asphalt-2 border-t border-asphalt-3 px-4 py-3">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Cookie size={16} className="text-safety-yellow shrink-0 mt-0.5" />
          <p className="text-xs text-concrete/90 leading-relaxed">
            This website saves monitored places, theme preferences, and tutorial progress locally in the browser. This data stays on your device and is never used for tracking or marketing.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 self-end sm:self-auto bg-safety-yellow text-asphalt font-display font-bold
          uppercase tracking-wide text-xs px-4 py-1.5 rounded-sm hover:bg-safety-yellow/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

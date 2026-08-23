import { Radio, Menu, Sun, Moon } from "lucide-react";
import useLocalClock from "../hooks/useLocalClock";

export default function TopBar({ onMenuClick, theme, onToggleTheme }) {
  const { time, tzAbbr } = useLocalClock();

  return (
    <header
      className="flex items-center justify-between h-14 px-4 sm:px-6 shrink-0
      bg-paper-2 border-b border-paper-3 dark:bg-asphalt-2 dark:border-asphalt-3
      transition-colors duration-200"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-ink/70 dark:text-concrete/80 hover:text-safety-orange dark:hover:text-safety-yellow"
          aria-label="Open control panel"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 hazard-stripe rounded-[1px]" />
          <h1 className="font-display font-bold text-xl sm:text-2xl tracking-wide uppercase leading-none">
            FortyGuard{" "}
            <span className="text-safety-orange dark:text-safety-yellow">
              Heat-Stress
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-graphite dark:text-steel">
          <Radio size={14} className="text-risk-green" />
          <span className="hidden sm:inline">LIVE FEED</span>
          <span>{time} {tzAbbr}</span>
        </div>
        <button
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="p-1.5 rounded-sm text-ink/70 dark:text-concrete/80 hover:text-safety-orange
          dark:hover:text-safety-yellow hover:bg-paper-3/60 dark:hover:bg-asphalt-3/60 transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

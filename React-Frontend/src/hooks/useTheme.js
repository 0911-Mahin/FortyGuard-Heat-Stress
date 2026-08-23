import { useEffect, useState } from "react";

const STORAGE_KEY = "fg-theme";
const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export default function useTheme() {
  // No stored value = follow system. A stored value means the user
  // explicitly overrode it via the toggle.
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEY) || getSystemTheme()
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Keep tracking the OS setting live as long as there's no manual override.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return [theme, toggleTheme];
}

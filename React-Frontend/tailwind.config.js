/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: { DEFAULT: "#1A1918", 2: "#242220", 3: "#302D2A" },
        concrete: "#EDEAE2",
        steel: "#8C8880",
        paper: { DEFAULT: "#F4F1E8", 2: "#EAE6D9", 3: "#DFDACB" },
        ink: "#1A1918",
        graphite: "#6B665C",
        safety: { yellow: "#F2B705", orange: "#E8590C" },
        risk: {
          green: "#2E9E4F",
          yellow: "#F2B705",
          orange: "#E8590C",
          red: "#D62828",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

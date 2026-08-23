import { useState } from "react";
import TopBar from "./components/TopBar";
import RiskBanner from "./components/RiskBanner";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import Legend from "./components/Legend";
import useTheme from "./hooks/useTheme";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TopBar
        onMenuClick={() => setSidebarOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <RiskBanner />
      <div className="flex flex-1 min-h-0">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="relative flex-1 min-w-0 isolate">
          <MapView theme={theme} />
          <Legend />
        </main>
      </div>
    </div>
  );
}

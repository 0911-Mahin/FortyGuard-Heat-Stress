import { useState } from "react";
import TopBar from "./components/TopBar";
import RiskBanner from "./components/RiskBanner";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import Legend from "./components/Legend";
import { useSites } from "./hooks/useSites";
import useTheme from "./hooks/useTheme";
import OnboardingTutorial from "./components/OnboardingTutorial";
import StorageNotice from "./components/StorageNotice"

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [horizon, setHorizon] = useState(0);
  const [pinDropMode, setPinDropMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const { sites, activeSiteId, addSite, removeSite, selectSite, runSimulation, refreshSite } = useSites();

  const activeSite = sites.find((s) => s.id === activeSiteId) || null;

  const handleMapClick = (lat, lng) => {
    setPendingCoords({ lat, lng });
    setPinDropMode(false);
    setSidebarOpen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <OnboardingTutorial />
      <StorageNotice />
      <TopBar onMenuClick={() => setSidebarOpen(true)} theme={theme} onToggleTheme={toggleTheme} />
      <RiskBanner activeSite={activeSite} horizon={horizon} />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sites={sites}
          activeSiteId={activeSiteId}
          onSelect={(id) => {
            selectSite(id);
            setSidebarOpen(false);
          }}
          onRemove={removeSite}
          onAddSite={addSite}
          onRefresh={refreshSite}
          horizon={horizon}
          onHorizonChange={setHorizon}
          onSimulate={runSimulation}
          pinDropMode={pinDropMode}
          onTogglePinDrop={() => setPinDropMode((v) => !v)}
          pendingCoords={pendingCoords}
        />
        <main className="relative flex-1 min-w-0">
          <MapView
            sites={sites}
            activeSite={activeSite}
            horizon={horizon}
            onSelectSite={selectSite}
            pinDropMode={pinDropMode}
            onMapClick={handleMapClick}
            theme={theme}
          />
          <Legend />
        </main>
      </div>
    </div>
  );
}

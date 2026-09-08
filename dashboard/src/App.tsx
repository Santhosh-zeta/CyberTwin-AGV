import React from 'react';
import { RobotProvider, useRobot } from './context/RobotContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { ControlPage } from './pages/ControlPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { ArchitectureModal } from './components/dashboard/ArchitectureModal';

const DashboardContent: React.FC = () => {
  const { activeTab } = useRobot();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'digital_twin':
        return <DigitalTwinPage />;
      case 'telemetry':
        return <TelemetryPage />;
      case 'control':
        return <ControlPage />;
      case 'diagnostics':
        return <DiagnosticsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col antialiased">
      {/* Top persistent Navbar */}
      <Navbar />

      {/* Main Container with Sidebar + Dynamic Page Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Page View Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>
      </div>

      {/* Architecture & MQTT Integration Modal */}
      <ArchitectureModal />
    </div>
  );
};

export function App() {
  return (
    <RobotProvider>
      <DashboardContent />
    </RobotProvider>
  );
}

export default App;

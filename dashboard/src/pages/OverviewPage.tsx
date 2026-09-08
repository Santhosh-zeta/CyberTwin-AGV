import React from 'react';
import { useRobot } from '../context/RobotContext';
import { DigitalTwin2D } from '../components/dashboard/DigitalTwin2D';
import { StatusPanel } from '../components/dashboard/StatusPanel';
import { SensorCard } from '../components/dashboard/SensorCard';
import { BatteryPanel } from '../components/dashboard/BatteryPanel';
import { TelemetryChart } from '../components/dashboard/TelemetryChart';
import { ControlPanel } from '../components/dashboard/ControlPanel';
import { Radio, Activity } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { state, history, setIsArchModalOpen } = useRobot();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0f1d]/80 border border-slate-800/90 glass-panel select-none">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight font-mono text-slate-100">
              Robot Digital Twin Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Raspberry Pi 5 + ESP32 Embedded Platform Real-Time Virtual Representation
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SYSTEM ONLINE</span>
          </div>

          <button
            onClick={() => setIsArchModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>SIMULATION MODE</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 h-full min-h-[420px]">
          <DigitalTwin2D state={state} />
        </div>

        <div className="lg:col-span-5 h-full">
          <StatusPanel state={state} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 font-bold uppercase tracking-wider px-1">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>LIVE HARDWARE SENSOR TELEMETRY</span>
        </div>
        <SensorCard state={state} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <BatteryPanel state={state} history={history} />
        </div>

        <div className="lg:col-span-6">
          <ControlPanel />
        </div>
      </div>

      <div>
        <TelemetryChart history={history} />
      </div>
    </div>
  );
};

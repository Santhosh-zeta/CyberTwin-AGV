import React from 'react';
import { useRobot } from '../context/RobotContext';
import { ControlPanel } from '../components/dashboard/ControlPanel';
import { ArenaMap } from '../components/dashboard/ArenaMap';
import { Gamepad2, ShieldAlert } from 'lucide-react';

export const ControlPage: React.FC = () => {
  const { state, triggerEmergencyStop } = useRobot();

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0f1d]/80 border border-slate-800/90 glass-panel">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <Gamepad2 className="w-6 h-6 text-cyan-400" />
            <span>Teleoperation & Waypoint Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct Drive Command Interface & Autonomous Target Navigator
          </p>
        </div>

        <button
          onClick={triggerEmergencyStop}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-600/40 transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]"
        >
          <ShieldAlert className="w-5 h-5" />
          <span>EMERGENCY STOP (E-STOP)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 h-full">
          <ControlPanel />
        </div>

        <div className="lg:col-span-6 h-full min-h-[420px]">
          <ArenaMap state={state} />
        </div>
      </div>
    </div>
  );
};

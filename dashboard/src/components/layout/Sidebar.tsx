import React from 'react';
import { useRobot, type ActiveTab } from '../../context/RobotContext';
import { LayoutDashboard, Bot, Activity, Gamepad2, Cpu, Battery, Wifi, ShieldAlert } from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Main Command Center' },
  { id: 'digital_twin', label: 'Digital Twin', icon: Bot, description: 'Virtual Robot & 2D Arena' },
  { id: 'telemetry', label: 'Telemetry', icon: Activity, description: 'Live Sensor Analytics' },
  { id: 'control', label: 'Control', icon: Gamepad2, description: 'Teleoperation & Mode' },
  { id: 'diagnostics', label: 'Diagnostics', icon: Cpu, description: 'System Health & MQTT' },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, state, triggerEmergencyStop } = useRobot();

  return (
    <aside className="w-16 md:w-64 bg-[#080c16]/95 border-r border-slate-800/80 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 z-20 transition-all">
      <div className="p-2 md:p-3 space-y-1 md:space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 hidden md:block">
          Navigation Menu
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-105'}`} />
              <div className="hidden md:block text-left truncate">
                <div className="leading-none text-xs md:text-sm">{item.label}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 group-hover:text-slate-400 transition-colors">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r shadow-[0_0_8px_#06b6d4]"></span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-2 md:p-3 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
        <div className="hidden md:block p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>RPi 5 + ESP32</span>
            </span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ONLINE</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center space-x-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>Battery</span>
            </span>
            <span className="text-slate-200 font-bold">{state.batteryPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${state.batteryPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
            <span className="flex items-center space-x-1">
              <Wifi className="w-3 h-3 text-cyan-400" />
              <span>Wi-Fi Signal</span>
            </span>
            <span className="text-slate-300 font-semibold">{state.hardware.esp32.rssiDbm} dBm</span>
          </div>
        </div>

        <button
          onClick={triggerEmergencyStop}
          className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all group"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline tracking-wider">EMERGENCY STOP</span>
        </button>
      </div>
    </aside>
  );
};

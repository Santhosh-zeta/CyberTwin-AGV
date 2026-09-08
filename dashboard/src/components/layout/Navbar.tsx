import React, { useState, useEffect } from 'react';
import { useRobot } from '../../context/RobotContext';
import { Activity, ShieldAlert, Info, Play, Pause, Cpu, Wifi, Radio } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isPaused, togglePauseSimulation, setIsArchModalOpen, triggerEmergencyStop } = useRobot();
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#0a0e1a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base md:text-lg font-bold tracking-wider text-slate-100 font-mono">
              ROBOT DIGITAL TWIN
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              v1.0-SIM
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Autonomous Embedded Systems Monitoring Platform
          </p>
        </div>
      </div>

      <div className="hidden lg:flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4"></span>
          <span className="font-semibold tracking-wide">SYSTEM ONLINE</span>
        </div>

        <button
          onClick={() => setIsArchModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono hover:bg-amber-500/20 transition-all cursor-pointer group"
          title="Click to view MQTT & hardware architecture"
        >
          <Radio className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">SIMULATION MODE</span>
          <Info className="w-3 h-3 text-amber-400 opacity-70 group-hover:opacity-100" />
        </button>

        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
          <Wifi className="w-3 h-3 text-cyan-400" />
          <span>Source: <strong className="text-slate-200 font-normal">Simulated Telemetry</strong></span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={togglePauseSimulation}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            isPaused
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
          title={isPaused ? 'Resume live simulation stream' : 'Pause simulation stream'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isPaused ? 'RESUME' : 'PAUSE'}</span>
        </button>

        <button
          onClick={() => setIsArchModalOpen(true)}
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-all"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>MQTT ARCH</span>
        </button>

        <button
          onClick={triggerEmergencyStop}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/40 text-rose-300 font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(244,63,94,0.15)] active:scale-95"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="hidden sm:inline">E-STOP</span>
        </button>

        <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-cyan-400 font-mono text-xs tracking-widest font-semibold hidden md:block">
          {time}
        </div>
      </div>
    </header>
  );
};

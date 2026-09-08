import React from 'react';
import type { RobotState } from '../../types/robot';
import { Bot, Gauge, Wifi, Cpu, Battery, Activity, Compass } from 'lucide-react';

interface Props {
  state: RobotState;
}

export const StatusPanel: React.FC<Props> = ({ state }) => {
  const movementLabels: Record<string, { label: string; color: string }> = {
    stopped: { label: 'Stopped', color: 'text-slate-300 bg-slate-800/80 border-slate-700' },
    moving_forward: { label: 'Moving Forward', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
    moving_reverse: { label: 'Moving Reverse', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
    turning_left: { label: 'Turning Left', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
    turning_right: { label: 'Turning Right', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
  };

  const currMovement = movementLabels[state.movement] || movementLabels.stopped;

  return (
    <div className="bg-[#0f172a]/70 rounded-2xl border border-slate-800 p-4 md:p-5 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
            ROBOT STATUS MONITOR
          </h3>
        </div>
        <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ONLINE</span>
        </span>
      </div>

      {/* Grid of Key Status Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 font-mono">
        {/* Operating Mode */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Operating Mode</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 capitalize">
            {state.mode}
          </div>
        </div>

        {/* Movement */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Movement</span>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className={`text-xs font-bold px-2 py-0.5 rounded border w-fit ${currMovement.color}`}>
            {currMovement.label}
          </div>
        </div>

        {/* Speed */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Speed</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-cyan-300">
            {state.speedMs.toFixed(2)} <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
        </div>

        {/* Battery */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Battery</span>
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400">
            {state.batteryPercent}%
          </div>
        </div>
      </div>

      {/* Embedded Hardware Node Connections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-1">
        {/* ESP32 Status */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">ESP32 Controller</div>
              <div className="text-[10px] text-slate-400">{state.hardware.esp32.rssiDbm} dBm | {state.hardware.esp32.dataRateHz} Hz</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            CONNECTED
          </span>
        </div>

        {/* Raspberry Pi 5 Status */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Raspberry Pi 5</div>
              <div className="text-[10px] text-slate-400">CPU: {state.hardware.raspberryPi5.cpuPercent}% | Temp: {state.hardware.raspberryPi5.tempC}°C</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            ONLINE
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useRobot } from '../context/RobotContext';
import { DigitalTwin2D } from '../components/dashboard/DigitalTwin2D';
import { ArenaMap } from '../components/dashboard/ArenaMap';
import { Bot, Compass, Gauge, Zap, Sliders } from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const { state } = useRobot();

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0f1d]/80 border border-slate-800/90 glass-panel">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-slate-100 flex items-center space-x-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            <span>Digital Twin Virtual Simulation Arena</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Synchronized 2D Kinematic Model & Environment Obstacle SLAM Grid
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
            POSE: ({state.position.x.toFixed(2)}m, {state.position.y.toFixed(2)}m)
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            HEADING: {state.position.headingDeg.toFixed(0)}°
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 h-full min-h-[420px]">
          <DigitalTwin2D state={state} />
        </div>

        <div className="lg:col-span-6 h-full min-h-[420px]">
          <ArenaMap state={state} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-2 glass-card">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="font-bold">Motor PWM Duty</span>
            <Sliders className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <div className="text-[9px] text-slate-500">LEFT MOTOR</div>
              <div className="text-sm font-bold text-cyan-300">{state.motors.leftDuty}% ({state.motors.leftRpm} RPM)</div>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
              <div className="text-[9px] text-slate-500">RIGHT MOTOR</div>
              <div className="text-sm font-bold text-cyan-300">{state.motors.rightDuty}% ({state.motors.rightRpm} RPM)</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-2 glass-card">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="font-bold">Linear Speed</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 pt-1">
            {state.speedMs.toFixed(2)} <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
          <div className="text-[10px] text-slate-500">Max Limit: {state.maxSpeedMs.toFixed(2)} m/s</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-2 glass-card">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="font-bold">3D Orientation</span>
            <Compass className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="grid grid-cols-3 gap-1 text-center pt-1 text-xs">
            <div>
              <span className="text-[9px] text-slate-500 block">PITCH</span>
              <strong className="text-slate-200">{state.imu.pitch}°</strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">ROLL</span>
              <strong className="text-slate-200">{state.imu.roll}°</strong>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">YAW</span>
              <strong className="text-slate-200">{state.imu.yaw}°</strong>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-2 glass-card">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="font-bold">Power Draw</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 pt-1">
            {state.powerW.toFixed(2)} <span className="text-xs font-normal text-slate-400">W</span>
          </div>
          <div className="text-[10px] text-slate-500">{state.voltageV.toFixed(2)} V @ {state.currentA.toFixed(2)} A</div>
        </div>
      </div>
    </div>
  );
};

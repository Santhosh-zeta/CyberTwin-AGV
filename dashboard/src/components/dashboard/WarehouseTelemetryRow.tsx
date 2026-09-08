import React from 'react';
import type { RobotState } from '../../types/robot';
import { useRobot } from '../../context/RobotContext';
import { Bot, Radio, Eye, Box, Layers } from 'lucide-react';

interface Props {
  state: RobotState;
}

export const WarehouseTelemetryRow: React.FC<Props> = ({ state }) => {
  const { simulatePick, simulateDrop } = useRobot();

  const isCarrying = state.loadHandling.gripperState === 'Holding' || state.loadHandling.actionStatus === 'Carrying';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono select-none">
      <div className="p-3.5 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-2 glass-card">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-1.5">
            <Bot className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-100 uppercase">Robot Status</h4>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            state.movement !== 'stopped'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            ● {state.movement !== 'stopped' ? 'Moving' : 'Stopped'}
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Mode</span>
            <strong className="text-slate-200 capitalize">{state.mode}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Speed</span>
            <strong className="text-cyan-300">{state.speedMs.toFixed(2)} m/s</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Battery</span>
            <strong className="text-emerald-400">{state.batteryPercent}%</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Task</span>
            <strong className="text-amber-300">{state.currentTask?.taskCode || 'None'}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Position</span>
            <strong className="text-slate-200">X: {state.position.x.toFixed(1)}m, Y: {state.position.y.toFixed(1)}m</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Heading</span>
            <strong className="text-slate-200">{state.position.headingDeg.toFixed(0)}° East</strong>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-2 glass-card">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-100 uppercase">Distance Sensors</h4>
          </div>
          <span className="text-[10px] text-slate-500">HC-SR04</span>
        </div>

        <div className="space-y-1.5 text-xs pt-0.5">
          <div className="flex justify-between text-slate-400">
            <span>Front (HC-SR04)</span>
            <strong className="text-emerald-400">{state.ultrasonic.frontM.toFixed(2)} m</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Left</span>
            <strong className="text-emerald-400">{state.ultrasonic.leftM.toFixed(2)} m</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Right</span>
            <strong className="text-emerald-400">{state.ultrasonic.rightM.toFixed(2)} m</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Rear</span>
            <strong className="text-emerald-400">{state.ultrasonic.rearM.toFixed(2)} m</strong>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-2 glass-card">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
          <div className="flex items-center space-x-1.5">
            <Eye className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-100 uppercase">LiDAR</h4>
          </div>
          <span className="text-[10px] text-emerald-400">Range: 5m</span>
        </div>

        <div className="relative w-full h-24 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 overflow-hidden radar-grid">
          <div className="w-16 h-16 rounded-full border border-cyan-500/30 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
            </div>
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-500/20"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-500/20"></div>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-2 glass-card">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-1.5">
            <Box className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-100 uppercase">Load Handling</h4>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isCarrying ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
          }`}>
            {state.loadHandling.actionStatus}
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Gripper</span>
            <strong className="text-slate-200">{state.loadHandling.gripperState}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Box Detected</span>
            <strong className={state.loadHandling.boxDetected ? 'text-emerald-400' : 'text-slate-400'}>
              {state.loadHandling.boxDetected ? 'Yes' : 'No'}
            </strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Box ID</span>
            <strong className="text-amber-300">{state.loadHandling.boxId || '-'}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Weight</span>
            <strong className="text-slate-200">{state.loadHandling.weightKg} kg</strong>
          </div>
        </div>

        <div className="flex space-x-1.5 pt-1">
          <button
            onClick={simulatePick}
            className="flex-1 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition-all"
          >
            Simulate Pick
          </button>
          <button
            onClick={simulateDrop}
            className="flex-1 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold transition-all"
          >
            Simulate Drop
          </button>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-2 glass-card">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-violet-400" />
            <h4 className="text-xs font-bold text-slate-100 uppercase">Environment</h4>
          </div>
          <span className="text-[10px] text-slate-500">Sector 04</span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Obstacles</span>
            <strong className="text-rose-400">{state.warehouseStats.obstaclesCount}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Free Paths</span>
            <strong className="text-emerald-400">{state.warehouseStats.freePathsCount}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Blocked Paths</span>
            <strong className="text-rose-400">{state.warehouseStats.blockedPathsCount}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Pick Locations</span>
            <strong className="text-emerald-400">{state.warehouseStats.pickLocationsCount}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Drop Locations</span>
            <strong className="text-purple-400">{state.warehouseStats.dropLocationsCount}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

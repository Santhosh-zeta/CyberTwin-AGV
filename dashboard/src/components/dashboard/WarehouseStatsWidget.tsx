import React from 'react';
import type { RobotState } from '../../types/robot';
import { Layers, Clock, CheckCircle2, Bot } from 'lucide-react';

interface Props {
  state: RobotState;
}

export const WarehouseStatsWidget: React.FC<Props> = ({ state }) => {
  const stats = state.warehouseStats;

  return (
    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-xs select-none">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
        Warehouse Stats
      </div>

      <div className="grid grid-cols-2 gap-2 text-center pt-0.5">
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[9px] text-slate-500 flex items-center justify-center space-x-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Locations</span>
          </div>
          <div className="text-sm font-bold text-cyan-300 pt-0.5">{stats.totalLocations}</div>
        </div>

        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[9px] text-slate-500 flex items-center justify-center space-x-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Pending</span>
          </div>
          <div className="text-sm font-bold text-amber-300 pt-0.5">{stats.pendingTasks}</div>
        </div>

        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[9px] text-slate-500 flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Completed</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 pt-0.5">{stats.completedTasks}</div>
        </div>

        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[9px] text-slate-500 flex items-center justify-center space-x-1">
            <Bot className="w-3 h-3 text-indigo-400" />
            <span>Active AGV</span>
          </div>
          <div className="text-sm font-bold text-indigo-300 pt-0.5">{stats.activeRobots}</div>
        </div>
      </div>
    </div>
  );
};

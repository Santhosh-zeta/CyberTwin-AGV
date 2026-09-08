import React, { useState } from 'react';
import type { RobotState } from '../../types/robot';
import { useRobot } from '../../context/RobotContext';
import { Clock, Plus, Box } from 'lucide-react';

interface Props {
  state: RobotState;
}

export const TaskPanel: React.FC<Props> = ({ state }) => {
  const { selectTaskFromQueue } = useRobot();
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);

  const task = state.currentTask;

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. CURRENT TASK CARD */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 space-y-3 glass-card shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <Box className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              CURRENT TASK
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            task?.status === 'In Progress'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse'
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
          }`}>
            {task?.status?.toUpperCase() || 'NO ACTIVE TASK'}
          </span>
        </div>

        {task && (
          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] block">TASK ID</span>
                <strong className="text-cyan-300 font-bold">{task.taskCode}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ACTION</span>
                <strong className="text-slate-100">{task.action}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">PICK LOCATION</span>
                <strong className="text-emerald-400 font-bold">{task.pickLoc}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">DROP LOCATION</span>
                <strong className="text-purple-400 font-bold">{task.dropLoc}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">BOX ID</span>
                <strong className="text-amber-300">{task.boxId}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">PRIORITY</span>
                <strong className="text-slate-200">{task.priority}</strong>
              </div>
            </div>

            {/* Task Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{task.currentStepMessage}</span>
                <strong className="text-cyan-400">{Math.round(task.progressPercent)}%</strong>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${task.progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. TASK QUEUE CARD */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 space-y-3 glass-card shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              TASK QUEUE
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            {state.taskQueue.length} Tasks
          </span>
        </div>

        {/* List of Tasks */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {state.taskQueue.map((item) => {
            const isSelected = item.id === task?.id;
            return (
              <div
                key={item.id}
                onClick={() => selectTaskFromQueue(item.id)}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span className="font-bold">{item.taskCode}</span>
                  <span className="text-slate-400 text-[11px]">
                    Pick {item.pickLoc} → {item.dropLoc}
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  item.status === 'In Progress'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Add New Task Button */}
        <button
          onClick={() => setShowAddTaskModal(true)}
          className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Warehouse Task</span>
        </button>
      </div>

      {/* Quick Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#090d16] border border-slate-800 p-5 rounded-2xl space-y-4 max-w-sm w-full font-mono text-slate-200">
            <h3 className="text-sm font-bold text-cyan-400 uppercase">Create New Task</h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Pick Location:</label>
                <input type="text" defaultValue="A3" className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Drop Location:</label>
                <input type="text" defaultValue="B1" className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowAddTaskModal(false)} className="px-3 py-1.5 rounded bg-slate-800 text-xs">Cancel</button>
              <button onClick={() => setShowAddTaskModal(false)} className="px-3 py-1.5 rounded bg-cyan-500 text-slate-950 text-xs font-bold">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

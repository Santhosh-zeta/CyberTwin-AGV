import React from 'react';
import { useRobot } from '../context/RobotContext';
import { WarehouseCanvas2D } from '../components/dashboard/WarehouseCanvas2D';
import { TaskPanel } from '../components/dashboard/TaskPanel';
import { WarehouseTelemetryRow } from '../components/dashboard/WarehouseTelemetryRow';
import { Bot, RefreshCw, AlertTriangle } from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const {
    state,
    resetSimulation,
    injectObstacle,
    setViewMode,
    toggleLayer
  } = useRobot();

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none font-mono">
      {/* 1. HEADER & CONTROL BAR */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0f1d]/80 border border-slate-800/90 glass-panel">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2.5">
            <Bot className="w-6 h-6 text-cyan-400" />
            <span>Warehouse Digital Twin</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live simulation of robot navigation, task execution, and warehouse environment
          </p>
        </div>

        {/* Top Controls: 2D/3D View Switcher + Show Layer Checkboxes + Simulation Actions */}
        <div className="flex flex-wrap items-center gap-3 text-xs w-full xl:w-auto">
          {/* 2D View / 3D View Toggle */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                state.viewMode === '2D'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D View
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                state.viewMode === '3D'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D View
            </button>
          </div>

          {/* Show Layer Checkboxes */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
            <span className="text-slate-500">Show:</span>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={state.layerToggles.showPaths}
                onChange={() => toggleLayer('showPaths')}
                className="accent-cyan-400 rounded"
              />
              <span>Paths</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={state.layerToggles.showObstacles}
                onChange={() => toggleLayer('showObstacles')}
                className="accent-cyan-400 rounded"
              />
              <span>Obstacles</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="checkbox"
                checked={state.layerToggles.showTasks}
                onChange={() => toggleLayer('showTasks')}
                className="accent-cyan-400 rounded"
              />
              <span>Tasks</span>
            </label>
          </div>

          {/* Simulation Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={injectObstacle}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold transition-all"
              title="Inject an obstacle on active route to trigger reroute simulation"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Inject Obstacle</span>
            </button>

            <button
              onClick={resetSimulation}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
              title="Reset simulation state"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WAREHOUSE SIMULATION GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-8 h-full min-h-[460px]">
          <WarehouseCanvas2D state={state} />
        </div>

        <div className="xl:col-span-4 h-full">
          <TaskPanel state={state} />
        </div>
      </div>

      {/* 3. BOTTOM HARDWARE & SENSOR TELEMETRY ROW */}
      <WarehouseTelemetryRow state={state} />
    </div>
  );
};

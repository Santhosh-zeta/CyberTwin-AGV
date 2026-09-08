import React, { useEffect } from 'react';
import { useRobot } from '../../context/RobotContext';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Octagon, Gamepad2 } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const { state, setMovement, setMode, setSpeedLimit, triggerEmergencyStop } = useRobot();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setMovement('moving_forward');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setMovement('moving_reverse');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setMovement('turning_left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setMovement('turning_right');
          break;
        case ' ':
          setMovement('stopped');
          break;
        case 'Escape':
          triggerEmergencyStop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMovement, triggerEmergencyStop]);

  return (
    <div className="bg-[#0f172a]/70 rounded-2xl border border-slate-800 p-4 md:p-5 space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
            ROBOT CONTROL INTERFACE
          </h3>
        </div>

        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              state.mode === 'manual'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ○ MANUAL
          </button>
          <button
            onClick={() => setMode('autonomous')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              state.mode === 'autonomous'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ○ AUTONOMOUS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-2">
          <button
            onClick={() => setMovement('moving_forward')}
            className={`w-28 py-2.5 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center border transition-all active:scale-95 ${
              state.movement === 'moving_forward'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ArrowUp className="w-5 h-5 mb-0.5" />
            <span>FORWARD</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMovement('turning_left')}
              className={`w-24 py-2.5 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center border transition-all active:scale-95 ${
                state.movement === 'turning_left'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ArrowLeft className="w-5 h-5 mb-0.5" />
              <span>LEFT</span>
            </button>

            <button
              onClick={() => setMovement('stopped')}
              className={`w-24 py-3 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center border transition-all active:scale-95 ${
                state.movement === 'stopped'
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-rose-950/40 border-rose-800 text-rose-400 hover:bg-rose-900/60'
              }`}
            >
              <Octagon className="w-5 h-5 mb-0.5" />
              <span>STOP</span>
            </button>

            <button
              onClick={() => setMovement('turning_right')}
              className={`w-24 py-2.5 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center border transition-all active:scale-95 ${
                state.movement === 'turning_right'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ArrowRight className="w-5 h-5 mb-0.5" />
              <span>RIGHT</span>
            </button>
          </div>

          <button
            onClick={() => setMovement('moving_reverse')}
            className={`w-28 py-2.5 rounded-xl font-mono text-xs font-bold flex flex-col items-center justify-center border transition-all active:scale-95 ${
              state.movement === 'moving_reverse'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ArrowDown className="w-5 h-5 mb-0.5" />
            <span>REVERSE</span>
          </button>
        </div>

        <div className="space-y-4 font-mono">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold">Max Speed Throttle Limit:</span>
              <span className="text-cyan-400 font-bold">{state.maxSpeedMs.toFixed(2)} m/s</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.5"
              step="0.05"
              value={state.maxSpeedMs}
              onChange={(e) => setSpeedLimit(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.20 m/s (Low)</span>
              <span>0.85 m/s (Nominal)</span>
              <span>1.50 m/s (Max)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-200 text-[11px] uppercase tracking-wider flex items-center justify-between">
              <span>Keyboard Controls</span>
              <span className="text-cyan-400 text-[10px]">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">W / ↑</kbd> Forward</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">S / ↓</kbd> Reverse</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">A / ←</kbd> Left</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">D / →</kbd> Right</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Space</kbd> Stop</div>
              <div><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Esc</kbd> E-Stop</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

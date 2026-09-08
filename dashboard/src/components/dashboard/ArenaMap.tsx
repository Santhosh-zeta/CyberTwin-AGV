import React, { useRef } from 'react';
import type { RobotState } from '../../types/robot';
import { useRobot } from '../../context/RobotContext';
import { Target, Layers } from 'lucide-react';

interface Props {
  state: RobotState;
}

export const ArenaMap: React.FC<Props> = ({ state }) => {
  const { setWaypoint } = useRobot();
  const mapRef = useRef<HTMLDivElement>(null);

  const meterToPercent = (m: number) => ((m + 3.0) / 6.0) * 100;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = (clickX / rect.width) * 100;
    const percentY = (clickY / rect.height) * 100;

    const meterX = Number(((percentX / 100) * 6.0 - 3.0).toFixed(2));
    const meterY = Number(((percentY / 100) * 6.0 - 3.0).toFixed(2));

    setWaypoint(meterX, meterY);
  };

  const obstacles = [
    { x: 2.5, y: 1.5, radius: 0.4, label: 'Obs A' },
    { x: -1.8, y: 2.2, radius: 0.5, label: 'Obs B' },
    { x: 1.2, y: -2.0, radius: 0.6, label: 'Obs C' },
    { x: -2.0, y: -1.5, radius: 0.4, label: 'Obs D' },
  ];

  const robotLeft = meterToPercent(state.position.x);
  const robotTop = meterToPercent(state.position.y);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#060911] rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between select-none overflow-hidden radar-grid">
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
            2D ENVIRONMENT ARENA MAP
          </span>
          <span className="text-[10px] font-mono text-slate-500 border border-slate-800 rounded px-1.5 py-0.5">
            LIDAR SLAM SIM
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Target WP: <strong className="text-slate-200">{state.activeWaypoint ? `(${state.activeWaypoint.x.toFixed(1)}, ${state.activeWaypoint.y.toFixed(1)})` : 'None'}</strong></span>
          </span>
        </div>
      </div>

      <div
        ref={mapRef}
        onClick={handleMapClick}
        className="relative flex-1 my-3 bg-[#0a0e1a]/90 rounded-xl border border-slate-800/90 cursor-crosshair overflow-hidden group shadow-inner"
      >
        <div className="absolute left-2 top-2 text-[9px] font-mono text-slate-600">(-3.0m, -3.0m)</div>
        <div className="absolute right-2 top-2 text-[9px] font-mono text-slate-600">(+3.0m, -3.0m)</div>
        <div className="absolute left-2 bottom-2 text-[9px] font-mono text-slate-600">(-3.0m, +3.0m)</div>
        <div className="absolute right-2 bottom-2 text-[9px] font-mono text-slate-600">(+3.0m, +3.0m)</div>

        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-800/60 border-t border-dashed border-slate-700/40"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-800/60 border-l border-dashed border-slate-700/40"></div>

        {obstacles.map((obs, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-rose-950/40 border border-rose-500/50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105"
            style={{
              left: `${meterToPercent(obs.x)}%`,
              top: `${meterToPercent(obs.y)}%`,
              width: `${(obs.radius / 3.0) * 100}%`,
              height: `${(obs.radius / 3.0) * 100}%`,
            }}
          >
            <span className="text-[9px] font-mono text-rose-400/80 font-bold">{obs.label}</span>
          </div>
        ))}

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {state.pathHistory.length > 1 && (
            <polyline
              points={state.pathHistory
                .map(pt => `${meterToPercent(pt.x) * (mapRef.current?.clientWidth || 300) / 100},${meterToPercent(pt.y) * (mapRef.current?.clientHeight || 300) / 100}`)
                .join(' ')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeOpacity="0.6"
            />
          )}

          {state.activeWaypoint && (
            <line
              x1={(meterToPercent(state.position.x) * (mapRef.current?.clientWidth || 300)) / 100}
              y1={(meterToPercent(state.position.y) * (mapRef.current?.clientHeight || 300)) / 100}
              x2={(meterToPercent(state.activeWaypoint.x) * (mapRef.current?.clientWidth || 300)) / 100}
              y2={(meterToPercent(state.activeWaypoint.y) * (mapRef.current?.clientHeight || 300)) / 100}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {state.lidar.scanAngles.map((pt, i) => {
            const rad = ((pt.angle + state.position.headingDeg) * Math.PI) / 180;
            const endX = state.position.x + Math.cos(rad) * pt.distanceM;
            const endY = state.position.y + Math.sin(rad) * pt.distanceM;

            const startPxX = (meterToPercent(state.position.x) * (mapRef.current?.clientWidth || 300)) / 100;
            const startPxY = (meterToPercent(state.position.y) * (mapRef.current?.clientHeight || 300)) / 100;
            const endPxX = (meterToPercent(endX) * (mapRef.current?.clientWidth || 300)) / 100;
            const endPxY = (meterToPercent(endY) * (mapRef.current?.clientHeight || 300)) / 100;

            return (
              <g key={i}>
                <line
                  x1={startPxX}
                  y1={startPxY}
                  x2={endPxX}
                  y2={endPxY}
                  stroke="#10b981"
                  strokeWidth="0.8"
                  strokeOpacity="0.25"
                />
                <circle cx={endPxX} cy={endPxY} r="1.5" fill="#34d399" opacity="0.7" />
              </g>
            );
          })}
        </svg>

        {state.activeWaypoint && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 animate-bounce"
            style={{
              left: `${meterToPercent(state.activeWaypoint.x)}%`,
              top: `${meterToPercent(state.activeWaypoint.y)}%`,
            }}
          >
            <div className="relative flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-400" />
              <span className="absolute -top-4 text-[9px] font-mono text-amber-300 font-bold whitespace-nowrap bg-slate-900/90 px-1 rounded border border-amber-500/40">
                WP ({state.activeWaypoint.x.toFixed(1)}, {state.activeWaypoint.y.toFixed(1)})
              </span>
            </div>
          </div>
        )}

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-20 pointer-events-none"
          style={{
            left: `${robotLeft}%`,
            top: `${robotTop}%`,
          }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ transform: `rotate(${state.position.headingDeg}deg)` }}
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-cyan-300 -rotate-90"></div>
            </div>
            <div className="absolute inset-0 rounded-lg bg-cyan-400/20 animate-ping"></div>
          </div>
        </div>
      </div>

      <div className="z-10 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Click anywhere on map to set autonomous navigation waypoint</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-300">
          <span>X: <strong className="text-cyan-400">{state.position.x.toFixed(2)}m</strong></span>
          <span>Y: <strong className="text-cyan-400">{state.position.y.toFixed(2)}m</strong></span>
        </div>
      </div>
    </div>
  );
};

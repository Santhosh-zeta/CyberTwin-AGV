import React, { useRef } from 'react';
import type { RobotState } from '../../types/robot';
import { useRobot } from '../../context/RobotContext';

interface Props {
  state: RobotState;
}

export const WarehouseCanvas2D: React.FC<Props> = ({ state }) => {
  const { setWaypoint } = useRobot();
  const mapRef = useRef<HTMLDivElement>(null);

  const isIsometric = state.viewMode === '3D';
  const showPaths = state.layerToggles.showPaths;
  const showObstacles = state.layerToggles.showObstacles;

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

  const robotPxX = meterToPercent(state.position.x);
  const robotPxY = meterToPercent(state.position.y);
  const isCarryingBox = state.loadHandling.gripperState === 'Holding' || state.loadHandling.actionStatus === 'Carrying';

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#070b14] rounded-2xl border border-slate-800/90 tech-grid flex flex-col justify-between p-4 overflow-hidden select-none">
      <div
        ref={mapRef}
        onClick={handleMapClick}
        className={`relative flex-1 my-1 bg-[#090d19]/95 rounded-xl border border-slate-800/90 cursor-crosshair overflow-hidden shadow-2xl transition-all duration-500 ${
          isIsometric ? 'perspective-isometric' : ''
        }`}
      >
        <div className="absolute left-4 top-16 text-xs font-mono font-bold text-slate-600/80 tracking-widest uppercase">
          Dock A
        </div>
        <div className="absolute left-4 bottom-16 text-xs font-mono font-bold text-slate-600/80 tracking-widest uppercase">
          Dock B
        </div>
        <div className="absolute right-6 bottom-4 text-xs font-mono font-bold text-slate-600/80 tracking-widest uppercase">
          Packing Zone
        </div>
        <div className="absolute left-1/2 top-3 -translate-x-1/2 text-[10px] font-mono text-cyan-500/50 tracking-widest uppercase">
          AUTOMATED WAREHOUSE SECTOR 04
        </div>

        <div className="absolute inset-2 border-2 border-slate-800/60 rounded-lg pointer-events-none"></div>

        {state.racks.map((rack) => {
          const leftPct = meterToPercent(rack.x);
          const topPct = meterToPercent(rack.y);

          return (
            <div
              key={rack.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-[#131d33] border border-slate-700/80 flex flex-col justify-between p-1 shadow-lg transition-transform hover:border-cyan-500/40 ${
                isIsometric ? 'shadow-[4px_8px_16px_rgba(0,0,0,0.6)]' : ''
              }`}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: '64px',
                height: '110px'
              }}
            >
              <div className="text-[9px] font-mono font-bold text-cyan-400/90 text-center bg-slate-900/90 rounded py-0.5 border border-slate-800">
                {rack.label}
              </div>

              <div className="flex-1 my-1 grid grid-rows-3 gap-1">
                {[0, 1, 2].map((shelfIdx) => {
                  const boxOnShelf = rack.boxes.find(b => b.shelfIndex === shelfIdx);
                  return (
                    <div
                      key={shelfIdx}
                      className="border-t border-b border-slate-700/60 bg-slate-950/60 rounded flex items-center justify-around px-1"
                    >
                      {boxOnShelf ? (
                        <div className="w-5 h-5 rounded bg-amber-700/80 border border-amber-500/60 flex items-center justify-center text-[7px] font-mono font-bold text-amber-200 shadow-sm">
                          📦
                        </div>
                      ) : (
                        <div className="w-4 h-1 bg-slate-800/40 rounded"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {state.locations.map((loc) => {
          if (loc.type !== 'pick' && loc.type !== 'drop') return null;

          const isPick = loc.type === 'pick';

          return (
            <div
              key={loc.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 animate-pulse"
              style={{
                left: `${meterToPercent(loc.x)}%`,
                top: `${meterToPercent(loc.y)}%`
              }}
            >
              <div
                className={`px-2 py-1 rounded-lg border font-mono text-xs font-bold flex items-center space-x-1.5 shadow-lg ${
                  isPick
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-purple-950/90 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                }`}
              >
                <span>{isPick ? 'P1' : 'D1'}</span>
                <span className="text-[10px] opacity-80">({loc.code})</span>
              </div>
            </div>
          );
        })}

        {showObstacles && state.obstacles.map((obs) => (
          <div
            key={obs.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-950/50 border border-rose-500/60 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.3)] z-10"
            style={{
              left: `${meterToPercent(obs.x)}%`,
              top: `${meterToPercent(obs.y)}%`,
              width: '42px',
              height: '42px'
            }}
          >
            <span className="text-xs">⚠️</span>
            <span className="text-[8px] font-mono text-rose-300 font-bold leading-none">{obs.label}</span>
          </div>
        ))}

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {showPaths && state.routes.plannedPath.length > 1 && (
            <polyline
              points={state.routes.plannedPath
                .map(pt => `${meterToPercent(pt.x) * (mapRef.current?.clientWidth || 400) / 100},${meterToPercent(pt.y) * (mapRef.current?.clientHeight || 400) / 100}`)
                .join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          )}

          {showPaths && state.routes.alternativeRoute.length > 1 && (
            <polyline
              points={state.routes.alternativeRoute
                .map(pt => `${meterToPercent(pt.x) * (mapRef.current?.clientWidth || 400) / 100},${meterToPercent(pt.y) * (mapRef.current?.clientHeight || 400) / 100}`)
                .join(' ')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
          )}

          {showPaths && state.routes.blockedRoute.length > 1 && (
            <polyline
              points={state.routes.blockedRoute
                .map(pt => `${meterToPercent(pt.x) * (mapRef.current?.clientWidth || 400) / 100},${meterToPercent(pt.y) * (mapRef.current?.clientHeight || 400) / 100}`)
                .join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="3 3"
            />
          )}

          {state.lidar.scanAngles.map((pt, i) => {
            const rad = ((pt.angle + state.position.headingDeg) * Math.PI) / 180;
            const endX = state.position.x + Math.cos(rad) * pt.distanceM;
            const endY = state.position.y + Math.sin(rad) * pt.distanceM;

            const startPxX = (meterToPercent(state.position.x) * (mapRef.current?.clientWidth || 400)) / 100;
            const startPxY = (meterToPercent(state.position.y) * (mapRef.current?.clientHeight || 400)) / 100;
            const endPxX = (meterToPercent(endX) * (mapRef.current?.clientWidth || 400)) / 100;
            const endPxY = (meterToPercent(endY) * (mapRef.current?.clientHeight || 400)) / 100;

            return (
              <line
                key={i}
                x1={startPxX}
                y1={startPxY}
                x2={endPxX}
                y2={endPxY}
                stroke="#10b981"
                strokeWidth="0.6"
                strokeOpacity="0.2"
              />
            );
          })}
        </svg>

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-20 pointer-events-none"
          style={{
            left: `${robotPxX}%`,
            top: `${robotPxY}%`
          }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ transform: `rotate(${state.position.headingDeg}deg)` }}
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.5)]">
              {isCarryingBox ? (
                <div className="w-6 h-6 rounded bg-amber-600 border border-amber-300 flex items-center justify-center text-[9px] font-mono font-bold text-amber-100 animate-bounce">
                  📦
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
              )}
            </div>

            <div className="absolute -right-2 w-3 h-3 bg-cyan-400 rotate-45 rounded-sm"></div>
          </div>
        </div>

        <div className="absolute left-3 bottom-3 bg-[#0a0f1d]/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 font-mono text-[10px] space-y-1.5 z-20 shadow-xl">
          <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-800 pb-1">
            Map Legend
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400"></span>
              <span>Robot</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-3 h-1 bg-emerald-400 rounded"></span>
              <span>Planned Path</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-3 h-1 border-b border-cyan-400 border-dashed"></span>
              <span>Alternative</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-3 h-1 border-b border-rose-500 border-dashed"></span>
              <span>Blocked</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="text-rose-400 text-xs">✖</span>
              <span>Obstacle</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span>Pick (P1)</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-purple-500"></span>
              <span>Drop (D1)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { RobotState } from '../../types/robot';
import { Eye, Radio, Compass } from 'lucide-react';

interface Props {
  state: RobotState;
}

export const DigitalTwin2D: React.FC<Props> = ({ state }) => {
  const [activeHoverComponent, setActiveHoverComponent] = useState<string | null>(null);

  const isMoving = state.movement !== 'stopped';
  const heading = state.position.headingDeg;
  const ultrasonicDist = state.ultrasonic.distanceCm;
  const isUltrasonicAlert = ultrasonicDist < 45;

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#070b14] rounded-2xl border border-slate-800/80 tech-grid flex flex-col justify-between p-4 overflow-hidden select-none">
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
            VIRTUAL CHASSIS TWIN
          </span>
          <span className="text-[10px] font-mono text-slate-500 border border-slate-800 rounded px-1.5 py-0.5">
            2D CAD VIEW
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Heading: <strong className="text-slate-200">{heading.toFixed(0)}°</strong></span>
          </div>
          <div className="flex items-center space-x-1">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Speed: <strong className="text-slate-200">{state.speedMs.toFixed(2)} m/s</strong></span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center my-2">
        <svg
          viewBox="0 0 500 400"
          className="w-full max-w-[480px] h-auto drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <defs>
            <linearGradient id="ultrasonicGradNormal" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="ultrasonicGradAlert" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
            <radialGradient id="lidarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform="translate(250, 60)">
            <path
              d="M 0,0 L -80,-80 A 110,110 0 0,1 80,-80 Z"
              fill={isUltrasonicAlert ? 'url(#ultrasonicGradAlert)' : 'url(#ultrasonicGradNormal)'}
              stroke={isUltrasonicAlert ? '#ef4444' : '#06b6d4'}
              strokeWidth="1.5"
              strokeDasharray="4 3"
              className="transition-colors duration-300"
            />
            <line
              x1="-40"
              y1="-40"
              x2="40"
              y2="-40"
              stroke={isUltrasonicAlert ? '#f43f5e' : '#22d3ee'}
              strokeWidth="2"
            />
            <text
              x="0"
              y="-50"
              fill={isUltrasonicAlert ? '#f43f5e' : '#22d3ee'}
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              HC-SR04: {ultrasonicDist} cm
            </text>
          </g>

          <rect
            x="160"
            y="70"
            width="180"
            height="260"
            rx="24"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="2.5"
          />
          <rect
            x="170"
            y="80"
            width="160"
            height="240"
            rx="16"
            fill="#090d16"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />

          <path
            d="M 240,88 L 250,75 L 260,88 Z"
            fill="#06b6d4"
          />
          <text
            x="250"
            y="102"
            fill="#94a3b8"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            FRONT
          </text>

          <g
            onMouseEnter={() => setActiveHoverComponent('Left Motor & Wheel (DC Geared)')}
            onMouseLeave={() => setActiveHoverComponent(null)}
            className="cursor-pointer"
          >
            <rect
              x="125"
              y="150"
              width="30"
              height="80"
              rx="6"
              fill="#1e293b"
              stroke={isMoving ? '#06b6d4' : '#475569'}
              strokeWidth="2"
            />
            <g stroke={isMoving ? '#06b6d4' : '#64748b'} strokeWidth="1.5">
              <line x1="125" y1="165" x2="155" y2="165" className={isMoving ? 'animate-pulse' : ''} />
              <line x1="125" y1="190" x2="155" y2="190" className={isMoving ? 'animate-pulse' : ''} />
              <line x1="125" y1="215" x2="155" y2="215" className={isMoving ? 'animate-pulse' : ''} />
            </g>
            <text x="140" y="242" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">WHEEL L</text>
          </g>

          <g
            onMouseEnter={() => setActiveHoverComponent('Right Motor & Wheel (DC Geared)')}
            onMouseLeave={() => setActiveHoverComponent(null)}
            className="cursor-pointer"
          >
            <rect
              x="345"
              y="150"
              width="30"
              height="80"
              rx="6"
              fill="#1e293b"
              stroke={isMoving ? '#06b6d4' : '#475569'}
              strokeWidth="2"
            />
            <g stroke={isMoving ? '#06b6d4' : '#64748b'} strokeWidth="1.5">
              <line x1="345" y1="165" x2="375" y2="165" className={isMoving ? 'animate-pulse' : ''} />
              <line x1="345" y1="190" x2="375" y2="190" className={isMoving ? 'animate-pulse' : ''} />
              <line x1="345" y1="215" x2="375" y2="215" className={isMoving ? 'animate-pulse' : ''} />
            </g>
            <text x="360" y="242" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">WHEEL R</text>
          </g>

          <circle cx="250" cy="295" r="16" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          <circle cx="250" cy="295" r="8" fill="#475569" />
          <text x="250" y="322" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">CASTER</text>

          <g
            transform="translate(185, 115)"
            onMouseEnter={() => setActiveHoverComponent('Raspberry Pi 5 (Edge Computer / MQTT Server)')}
            onMouseLeave={() => setActiveHoverComponent(null)}
            className="cursor-pointer group"
          >
            <rect x="0" y="0" width="70" height="50" rx="4" fill="#065f46" stroke="#10b981" strokeWidth="1.5" />
            <rect x="5" y="5" width="20" height="20" fill="#047857" stroke="#34d399" strokeWidth="1" />
            <text x="15" y="18" fill="#ecfdf5" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">RPi 5</text>
            <text x="35" y="42" fill="#a7f3d0" fontSize="8" fontFamily="monospace">Edge Platform</text>
            <circle cx="60" cy="10" r="3" fill="#10b981" className="animate-ping" />
          </g>

          <g
            transform="translate(265, 115)"
            onMouseEnter={() => setActiveHoverComponent('ESP32 Microcontroller (Wi-Fi Sensor Hub / Motor Controller)')}
            onMouseLeave={() => setActiveHoverComponent(null)}
            className="cursor-pointer group"
          >
            <rect x="0" y="0" width="50" height="50" rx="4" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
            <rect x="10" y="10" width="30" height="20" fill="#312e81" stroke="#818cf8" strokeWidth="1" />
            <text x="25" y="23" fill="#e0e7ff" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ESP32</text>
            <text x="25" y="42" fill="#a5b4fc" fontSize="8" fontFamily="monospace" textAnchor="middle">Wi-Fi Node</text>
          </g>

          <g
            transform="translate(185, 175)"
            onMouseEnter={() => setActiveHoverComponent('L298N H-Bridge Motor Driver Module')}
            onMouseLeave={() => setActiveHoverComponent(null)}
            className="cursor-pointer"
          >
            <rect x="0" y="0" width="60" height="40" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="10" y="5" width="40" height="15" fill="#450a0a" stroke="#f87171" strokeWidth="1" />
            <text x="30" y="15" fill="#fee2e2" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">L298N</text>
            <text x="30" y="32" fill="#fca5a5" fontSize="7" fontFamily="monospace" textAnchor="middle">Motor Driver</text>
          </g>

          <g
            transform="translate(255, 175)"
            onMouseEnter={() => setActiveHoverComponent('MPU6050 Accelerometer + Gyroscope IMU')}
            onMouseLeave={() => setActiveHoverComponent(null)}
            className="cursor-pointer"
          >
            <rect x="0" y="0" width="40" height="40" rx="4" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" />
            <text x="20" y="16" fill="#f0fdf4" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MPU6050</text>
            <path d="M 12,28 L 20,28 L 20,20" fill="none" stroke="#86efac" strokeWidth="1.5" />
            <text x="26" y="33" fill="#86efac" fontSize="7" fontFamily="monospace">6-DOF</text>
          </g>

          <g
            transform="translate(185, 225)"
            onMouseEnter={() => setActiveHoverComponent('INA219 Power Monitor + LM2596 Buck Converter')}
            onMouseLeave={() => setActiveHoverComponent(null)}
            className="cursor-pointer"
          >
            <rect x="0" y="0" width="55" height="35" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="27" y="14" fill="#fef3c7" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">INA219</text>
            <text x="27" y="27" fill="#fcd34d" fontSize="7" fontFamily="monospace" textAnchor="middle">7.8V / 0.84A</text>
          </g>

          <g
            transform="translate(250, 225)"
            onMouseEnter={() => setActiveHoverComponent('2 x 3.7V Li-ion 18650 Batteries (7.4V Nominal Pack)')}
            onMouseLeave={() => setActiveHoverComponent(null)}
            className="cursor-pointer"
          >
            <rect x="0" y="0" width="65" height="35" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
            <rect x="5" y="8" width="24" height="18" rx="2" fill="#0284c7" />
            <rect x="34" y="8" width="24" height="18" rx="2" fill="#0284c7" />
            <text x="32" y="31" fill="#7dd3fc" fontSize="7" fontFamily="monospace" textAnchor="middle">2x 3.7V Li-ion</text>
          </g>

          <g
            transform="translate(250, 140)"
            onMouseEnter={() => setActiveHoverComponent('360° Rotating LiDAR Scanner')}
            onMouseLeave={() => setActiveHoverComponent(null)}
            className="cursor-pointer"
          >
            <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <circle cx="0" cy="0" r="14" fill="url(#lidarGlow)" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-20"
              stroke="#34d399"
              strokeWidth="2"
              className="animate-[spin_3s_linear_infinite]"
              style={{ transformOrigin: '0px 0px' }}
            />
            <circle cx="0" cy="0" r="4" fill="#10b981" />
            <text x="0" y="32" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">LiDAR</text>
          </g>
        </svg>
      </div>

      <div className="z-10 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-300">
          <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">
            {activeHoverComponent ? (
              <strong className="text-cyan-300">{activeHoverComponent}</strong>
            ) : (
              <span className="text-slate-400">Hover over hardware modules for component specs</span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
            L298N Active
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px]">
            IMU 6-DOF
          </span>
        </div>
      </div>
    </div>
  );
};

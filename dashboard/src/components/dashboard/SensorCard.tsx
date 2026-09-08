import React from 'react';
import type { RobotState } from '../../types/robot';
import { Radio, Eye, Activity, Zap } from 'lucide-react';

interface Props {
  state: RobotState;
}

export const SensorCard: React.FC<Props> = ({ state }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-mono select-none">
      <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 glass-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">HC-SR04</h4>
              <p className="text-[10px] text-slate-500">Ultrasonic Distance</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            state.ultrasonic.status === 'normal'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {state.ultrasonic.status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div className="text-2xl font-bold text-slate-100">
            {state.ultrasonic.distanceCm} <span className="text-sm font-normal text-slate-400">cm</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Range: 2 - 400 cm
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              state.ultrasonic.distanceCm < 45 ? 'bg-rose-500' : 'bg-cyan-400'
            }`}
            style={{ width: `${Math.min(100, (state.ultrasonic.distanceCm / 350) * 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 glass-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">LiDAR 360°</h4>
              <p className="text-[10px] text-slate-500">Optical Laser Range</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            SCANNING
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div className="text-2xl font-bold text-emerald-400">
            {state.lidar.rangeM.toFixed(2)} <span className="text-sm font-normal text-slate-400">m</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Freq: 10 Hz
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
          <span>Obstacle: <strong className={state.lidar.obstacleDetected ? 'text-rose-400' : 'text-slate-300'}>{state.lidar.obstacleDetected ? 'DETECTED' : 'CLEAR'}</strong></span>
          <span>Point Cloud: <strong className="text-emerald-400">24 pts/rev</strong></span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3 glass-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">MPU6050 IMU</h4>
              <p className="text-[10px] text-slate-500">6-DOF Accel & Gyro</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 text-center bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
          <div>
            <div className="text-[9px] text-slate-500">ACCEL X</div>
            <div className="text-xs font-bold text-slate-200">{state.imu.accel.x.toFixed(2)}g</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500">ACCEL Y</div>
            <div className="text-xs font-bold text-slate-200">{state.imu.accel.y.toFixed(2)}g</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500">ACCEL Z</div>
            <div className="text-xs font-bold text-slate-200">{state.imu.accel.z.toFixed(2)}g</div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
          <span>Gyro Z: <strong className="text-indigo-300">{state.imu.gyro.z.toFixed(1)}°/s</strong></span>
          <span>Pitch: <strong className="text-slate-300">{state.imu.pitch}°</strong></span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 glass-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">INA219 Monitor</h4>
              <p className="text-[10px] text-slate-500">Power Delivery</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {state.powerMonitor.powerW.toFixed(2)} W
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
            <div className="text-[9px] text-slate-500">VOLTAGE</div>
            <div className="text-sm font-bold text-amber-300">{state.voltageV.toFixed(2)} V</div>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
            <div className="text-[9px] text-slate-500">CURRENT</div>
            <div className="text-sm font-bold text-amber-300">{state.currentA.toFixed(2)} A</div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
          <span>I2C Addr: <strong className="text-slate-300">0x40</strong></span>
          <span>Status: <strong className="text-emerald-400">NORMAL</strong></span>
        </div>
      </div>
    </div>
  );
};

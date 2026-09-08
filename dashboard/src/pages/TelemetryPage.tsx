import React from 'react';
import { useRobot } from '../context/RobotContext';
import { TelemetryChart } from '../components/dashboard/TelemetryChart';
import { SensorCard } from '../components/dashboard/SensorCard';
import { Activity, Download, Play, Pause, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const TelemetryPage: React.FC = () => {
  const { state, history, exportCSV, isPaused, togglePauseSimulation } = useRobot();

  const chartData = history.slice(-40);

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0f1d]/80 border border-slate-800/90 glass-panel">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Detailed Telemetry & Sensor Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-Sensor Deep-Dive Stream — HC-SR04, LiDAR, MPU6050 IMU & INA219 Monitor
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={togglePauseSimulation}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              isPaused
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <SensorCard state={state} />

      <TelemetryChart history={history} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f172a]/70 rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase">MPU6050 Accelerometer & Gyroscope Stream</h3>
            </div>
            <span className="text-[10px] text-slate-500">I2C 0x68</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="accelX" name="Accel X (g)" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="accelY" name="Accel Y (g)" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="accelZ" name="Accel Z (g)" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f172a]/70 rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase">INA219 Voltage & Current Load Curve</h3>
            </div>
            <span className="text-[10px] text-slate-500">I2C 0x40</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="voltageV" name="Voltage (V)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="currentA" name="Current (A)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

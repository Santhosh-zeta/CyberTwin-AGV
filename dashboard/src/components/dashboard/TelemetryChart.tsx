import React, { useState } from 'react';
import type { TelemetryHistoryPoint } from '../../types/robot';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity } from 'lucide-react';

interface Props {
  history: TelemetryHistoryPoint[];
}

type StreamMetric = 'distance' | 'voltage' | 'current' | 'power' | 'acceleration' | 'gyroscope';

export const TelemetryChart: React.FC<Props> = ({ history }) => {
  const [activeMetric, setActiveMetric] = useState<StreamMetric>('distance');

  const metricTabs: Array<{ id: StreamMetric; label: string; unit: string; color: string }> = [
    { id: 'distance', label: 'Distance', unit: 'cm / m', color: '#06b6d4' },
    { id: 'voltage', label: 'Voltage', unit: 'V', color: '#38bdf8' },
    { id: 'current', label: 'Current', unit: 'A', color: '#f59e0b' },
    { id: 'power', label: 'Power', unit: 'W', color: '#10b981' },
    { id: 'acceleration', label: 'Accel X/Y/Z', unit: 'g', color: '#818cf8' },
    { id: 'gyroscope', label: 'Gyro X/Y/Z', unit: '°/s', color: '#c084fc' },
  ];

  return (
    <div className="bg-[#0f172a]/70 rounded-2xl border border-slate-800 p-4 md:p-5 space-y-4 select-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              REAL-TIME TELEMETRY GRAPH
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Live Sensor Stream @ 5Hz Telemetry Rate
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 font-mono text-xs">
          {metricTabs.map((tab) => {
            const isActive = activeMetric === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMetric(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.slice(-30)} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#1e293b',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />

            {activeMetric === 'distance' && (
              <>
                <Line type="monotone" dataKey="distanceCm" name="HC-SR04 (cm)" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="lidarRangeM" name="LiDAR (m)" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </>
            )}

            {activeMetric === 'voltage' && (
              <Line type="monotone" dataKey="voltageV" name="Battery Voltage (V)" stroke="#38bdf8" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            )}

            {activeMetric === 'current' && (
              <Line type="monotone" dataKey="currentA" name="Load Current (A)" stroke="#f59e0b" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            )}

            {activeMetric === 'power' && (
              <Line type="monotone" dataKey="powerW" name="Total Power (W)" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            )}

            {activeMetric === 'acceleration' && (
              <>
                <Line type="monotone" dataKey="accelX" name="Accel X (g)" stroke="#f43f5e" strokeWidth={1.8} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="accelY" name="Accel Y (g)" stroke="#38bdf8" strokeWidth={1.8} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="accelZ" name="Accel Z (g)" stroke="#10b981" strokeWidth={1.8} dot={false} isAnimationActive={false} />
              </>
            )}

            {activeMetric === 'gyroscope' && (
              <>
                <Line type="monotone" dataKey="gyroX" name="Gyro X (°/s)" stroke="#f43f5e" strokeWidth={1.8} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="gyroY" name="Gyro Y (°/s)" stroke="#38bdf8" strokeWidth={1.8} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="gyroZ" name="Gyro Z (°/s)" stroke="#c084fc" strokeWidth={2.0} dot={false} isAnimationActive={false} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

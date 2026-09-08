import React from 'react';
import type { RobotState, TelemetryHistoryPoint } from '../../types/robot';
import { Battery, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  state: RobotState;
  history: TelemetryHistoryPoint[];
}

export const BatteryPanel: React.FC<Props> = ({ state, history }) => {
  const chartData = history.slice(-20).map(h => ({
    time: h.time,
    power: h.powerW,
    voltage: h.voltageV,
    current: h.currentA,
  }));

  return (
    <div className="bg-[#0f172a]/70 rounded-2xl border border-slate-800 p-4 md:p-5 space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Battery className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
            BATTERY & POWER MANAGEMENT
          </h3>
        </div>
        <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>STATUS: GOOD</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 flex flex-col items-center justify-center space-y-3 font-mono">
          <div className="relative w-full max-w-[200px] h-12 bg-slate-950 border-2 border-slate-700 rounded-xl p-1 flex items-center shadow-inner">
            <div className="absolute -right-3 top-3 bottom-3 w-2.5 bg-slate-700 rounded-r-md"></div>
            <div
              className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-xs font-bold text-slate-950 ${
                state.batteryPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : state.batteryPercent > 20
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-rose-600 to-red-400 animate-pulse'
              }`}
              style={{ width: `${state.batteryPercent}%` }}
            >
              {state.batteryPercent > 25 && `${state.batteryPercent}%`}
            </div>
          </div>

          <div className="flex items-center justify-between w-full text-xs text-slate-400 pt-1">
            <span>2x 3.7V Li-ion (7.4V Pack)</span>
            <span className="font-bold text-slate-200">{state.batteryPercent}%</span>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-3 gap-2 font-mono">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Voltage</span>
              <Zap className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-base sm:text-lg font-bold text-cyan-300">
              {state.voltageV.toFixed(2)} <span className="text-xs font-normal text-slate-400">V</span>
            </div>
            <div className="text-[9px] text-slate-500">Nominal: 7.4V - 8.4V</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Current</span>
              <Zap className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-base sm:text-lg font-bold text-amber-300">
              {state.currentA.toFixed(2)} <span className="text-xs font-normal text-slate-400">A</span>
            </div>
            <div className="text-[9px] text-slate-500">Draw: INA219 Shunt</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Power</span>
              <Zap className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              {state.powerW.toFixed(2)} <span className="text-xs font-normal text-slate-400">W</span>
            </div>
            <div className="text-[9px] text-slate-500">V × I Calculate</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Power Consumption Timeline (Watts)</span>
          </span>
          <span className="text-[10px] text-slate-500">INA219 Live Feed</span>
        </div>

        <div className="h-28 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
              <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={[0, 'dataMax + 4']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Area type="monotone" dataKey="power" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#powerGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { SystemEventLog } from '../../types/robot';
import { ShieldAlert, Info, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface Props {
  logs: SystemEventLog[];
}

export const EventLogTable: React.FC<Props> = ({ logs }) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const levelBadge = (level: SystemEventLog['level']) => {
    switch (level) {
      case 'info':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1"><Info className="w-3 h-3" /><span>INFO</span></span>;
      case 'warn':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>WARN</span></span>;
      case 'error':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center space-x-1"><ShieldAlert className="w-3 h-3" /><span>ERROR</span></span>;
      case 'success':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1"><CheckCircle className="w-3 h-3" /><span>OK</span></span>;
    }
  };

  return (
    <div className="bg-[#0f172a]/70 rounded-2xl border border-slate-800 p-4 md:p-5 space-y-4 select-none font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
            SYSTEM EVENT LOG STREAM
          </h3>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/60 divide-y divide-slate-800/60 text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-4 text-center text-slate-500">No event logs matching current criteria.</div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-2.5 flex items-start sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors">
              <div className="flex items-center space-x-3 text-slate-300">
                <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
                {levelBadge(log.level)}
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold shrink-0">{log.source}</span>
                <span className="text-slate-200 text-xs">{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

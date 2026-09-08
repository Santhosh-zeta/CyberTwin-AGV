import React from 'react';
import { useRobot } from '../context/RobotContext';
import { EventLogTable } from '../components/dashboard/EventLogTable';
import { Cpu, Wifi, Server, ShieldCheck, CheckCircle2, Layers } from 'lucide-react';

export const DiagnosticsPage: React.FC = () => {
  const { state, eventLogs, setIsArchModalOpen } = useRobot();

  const hardware = state.hardware;

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0f1d]/80 border border-slate-800/90 glass-panel">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>Embedded Diagnostics & System Health</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hardware Infrastructure Diagnostics — RPi 5 Edge Node, ESP32 Microcontroller & Sensor Health Matrix
          </p>
        </div>

        <button
          onClick={() => setIsArchModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold hover:bg-amber-500/20 transition-all cursor-pointer text-xs"
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>View Pipeline Topology</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-3 glass-card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase">Raspberry Pi 5</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              ONLINE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>CPU Usage:</span>
              <strong className="text-slate-100">{hardware.raspberryPi5.cpuPercent}%</strong>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${hardware.raspberryPi5.cpuPercent}%` }}></div>
            </div>

            <div className="flex justify-between text-slate-400 pt-1">
              <span>RAM Memory:</span>
              <strong className="text-slate-100">{hardware.raspberryPi5.ramPercent}% (8GB LPDDR4X)</strong>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${hardware.raspberryPi5.ramPercent}%` }}></div>
            </div>

            <div className="flex justify-between text-slate-400 pt-1">
              <span>SoC Temperature:</span>
              <strong className="text-amber-400">{hardware.raspberryPi5.tempC}°C</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Disk Space:</span>
              <strong className="text-slate-200">{hardware.raspberryPi5.diskPercent}% Used (64GB NVMe)</strong>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-3 glass-card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase">ESP32 Controller</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              CONNECTED
            </span>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex justify-between text-slate-400">
              <span>Wi-Fi Signal (RSSI):</span>
              <strong className="text-cyan-300">{hardware.esp32.rssiDbm} dBm</strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Data Streaming Rate:</span>
              <strong className="text-emerald-400">{hardware.esp32.dataRateHz} Hz (100ms tick)</strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Packet Drop Rate:</span>
              <strong className="text-slate-200">{hardware.esp32.packetDropPercent}%</strong>
            </div>

            <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2">
              <span>IP Address:</span>
              <strong className="text-slate-300">192.168.1.104</strong>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-slate-800 space-y-3 glass-card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase">MQTT Broker</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
              SIMULATED
            </span>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex justify-between text-slate-400">
              <span>Broker Status:</span>
              <strong className="text-emerald-400">Connected / Simulated</strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Messages Processed:</span>
              <strong className="text-cyan-300">{hardware.mqtt.messageCount} msgs</strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Topic Latency:</span>
              <strong className="text-slate-200">{hardware.mqtt.latencyMs} ms</strong>
            </div>

            <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Broker URI:</span>
              <strong className="text-slate-300">mqtt://localhost:1883</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a]/70 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase">Hardware Sensor Diagnostic Matrix</h3>
          </div>
          <span className="text-[10px] text-slate-500">6 Connected Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'HC-SR04', desc: 'Ultrasonic Distance', status: 'Healthy' },
            { name: 'LiDAR', desc: '360 Laser Scanner', status: 'Healthy' },
            { name: 'MPU6050', desc: '6-DOF IMU', status: 'Healthy' },
            { name: 'INA219', desc: 'Voltage / Current', status: 'Healthy' },
            { name: 'L298N', desc: 'Motor Driver', status: 'Healthy' },
            { name: 'LM2596', desc: 'Buck Converter', status: 'Healthy' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-slate-100">{item.name}</div>
              <div className="text-[10px] text-slate-500">{item.desc}</div>
              <div className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1 pt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EventLogTable logs={eventLogs} />
    </div>
  );
};

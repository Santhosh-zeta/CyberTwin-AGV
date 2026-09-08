import React from 'react';
import { useRobot } from '../../context/RobotContext';
import { X, Cpu, Radio, Server, Database, Layout, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ArchitectureModal: React.FC = () => {
  const { isArchModalOpen, setIsArchModalOpen } = useRobot();

  if (!isArchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#090d16] border border-slate-800 w-full max-w-3xl rounded-2xl p-6 space-y-6 shadow-2xl relative font-mono text-slate-200">
        {/* Close Button */}
        <button
          onClick={() => setIsArchModalOpen(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Badge */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              SYSTEM ARCHITECTURE & INTEGRATION
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs">
              FINAL YEAR EMBEDDED PROJECT
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-100">
            Digital Twin Hardware & MQTT Communication Pipeline
          </h2>
        </div>

        {/* Data Honesty Alert Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs space-y-1">
          <div className="font-bold text-amber-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>DATA HONESTY NOTICE: TELEMETRY SOURCE IS SIMULATED</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            This first version of the software operates with a high-fidelity frontend simulation engine. It mimics physical kinematics, INA219 battery load curves, LiDAR point cloud scans, MPU6050 6-DOF IMU vectors, and HC-SR04 ultrasonic distance readings.
          </p>
        </div>

        {/* Pipeline Architecture Diagram */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Intended End-to-End System Pipeline
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <Radio className="w-5 h-5 text-indigo-400 mx-auto" />
              <div className="font-bold text-slate-100">ESP32</div>
              <div className="text-[10px] text-slate-400">Sensors & Motor PWM</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <Cpu className="w-5 h-5 text-emerald-400 mx-auto" />
              <div className="font-bold text-slate-100">RPi 5</div>
              <div className="text-[10px] text-slate-400">Edge Compute & Wi-Fi</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <Server className="w-5 h-5 text-amber-400 mx-auto" />
              <div className="font-bold text-slate-100">MQTT Broker</div>
              <div className="text-[10px] text-slate-400">Mosquitto / WebSocket</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <Database className="w-5 h-5 text-violet-400 mx-auto" />
              <div className="font-bold text-slate-100">Backend API</div>
              <div className="text-[10px] text-slate-400">State Persistence</div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-1.5">
              <Layout className="w-5 h-5 text-cyan-400 mx-auto" />
              <div className="font-bold text-cyan-300">Web Twin</div>
              <div className="text-[10px] text-cyan-400 font-bold">This UI Dashboard</div>
            </div>
          </div>
        </div>

        {/* Modular Decoupling Architecture Explanation */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-slate-200 text-xs">
            Zero-Refactor MQTT Integration Readiness
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            The frontend is engineered with a strict service abstraction (<code className="text-cyan-300">telemetryService.ts</code>). When physical hardware testing begins:
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-semibold pt-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Simply replace <code className="text-slate-200 font-mono">SimulatedTelemetryProvider</code> with <code className="text-slate-200 font-mono">MQTTTelemetryProvider</code>. All 2D visualizations, graphs, charts, and control interfaces will bind seamlessly!</span>
          </div>
        </div>

        {/* Footer Close */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setIsArchModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

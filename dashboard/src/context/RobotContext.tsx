import React, { createContext, useContext, useEffect, useState } from 'react';
import type { RobotState, TelemetryHistoryPoint, SystemEventLog, MovementState, OperatingMode } from '../types/robot';
import { telemetryService } from '../services/telemetryService';

export type ActiveTab = 'overview' | 'digital_twin' | 'telemetry' | 'control' | 'diagnostics';

interface RobotContextType {
  state: RobotState;
  history: TelemetryHistoryPoint[];
  eventLogs: SystemEventLog[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setMovement: (movement: MovementState) => void;
  setMode: (mode: OperatingMode) => void;
  setSpeedLimit: (speed: number) => void;
  setWaypoint: (x: number, y: number) => void;
  triggerEmergencyStop: () => void;
  isPaused: boolean;
  togglePauseSimulation: () => void;
  exportCSV: () => void;
  isArchModalOpen: boolean;
  setIsArchModalOpen: (open: boolean) => void;

  // WAREHOUSE DIGITAL TWIN DISPATCHERS
  injectObstacle: () => void;
  simulatePick: () => void;
  simulateDrop: () => void;
  selectTaskFromQueue: (taskId: string) => void;
  setViewMode: (mode: '2D' | '3D') => void;
  toggleLayer: (layer: keyof RobotState['layerToggles']) => void;
  resetSimulation: () => void;
}

const RobotContext = createContext<RobotContextType | null>(null);

export const RobotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<RobotState>(() => (telemetryService as any).state);
  const [history, setHistory] = useState<TelemetryHistoryPoint[]>([]);
  const [eventLogs, setEventLogs] = useState<SystemEventLog[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = telemetryService.subscribe((newState, newHistory) => {
      setState({ ...newState });
      setHistory([...newHistory]);
      setEventLogs([...telemetryService.getEventLogs()]);
    });
    return () => unsubscribe();
  }, []);

  const setMovement = (movement: MovementState) => {
    telemetryService.setMovement(movement);
  };

  const setMode = (mode: OperatingMode) => {
    telemetryService.setMode(mode);
  };

  const setSpeedLimit = (speed: number) => {
    telemetryService.setSpeedLimit(speed);
  };

  const setWaypoint = (x: number, y: number) => {
    telemetryService.setWaypoint(x, y);
  };

  const triggerEmergencyStop = () => {
    telemetryService.triggerEmergencyStop();
  };

  const togglePauseSimulation = () => {
    if (isPaused) {
      telemetryService.resumeSimulation();
      setIsPaused(false);
    } else {
      telemetryService.pauseSimulation();
      setIsPaused(true);
    }
  };

  const exportCSV = () => {
    const csvContent = telemetryService.exportTelemetryCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `robot_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const injectObstacle = () => telemetryService.injectObstacle();
  const simulatePick = () => telemetryService.simulatePick();
  const simulateDrop = () => telemetryService.simulateDrop();
  const selectTaskFromQueue = (id: string) => telemetryService.selectTaskFromQueue(id);
  const setViewMode = (mode: '2D' | '3D') => telemetryService.setViewMode(mode);
  const toggleLayer = (layer: keyof RobotState['layerToggles']) => telemetryService.toggleLayer(layer);
  const resetSimulation = () => telemetryService.resetSimulation();

  return (
    <RobotContext.Provider
      value={{
        state,
        history,
        eventLogs,
        activeTab,
        setActiveTab,
        setMovement,
        setMode,
        setSpeedLimit,
        setWaypoint,
        triggerEmergencyStop,
        isPaused,
        togglePauseSimulation,
        exportCSV,
        isArchModalOpen,
        setIsArchModalOpen,
        injectObstacle,
        simulatePick,
        simulateDrop,
        selectTaskFromQueue,
        setViewMode,
        toggleLayer,
        resetSimulation
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};

export const useRobot = () => {
  const context = useContext(RobotContext);
  if (!context) {
    throw new Error('useRobot must be used within a RobotProvider');
  }
  return context;
};

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

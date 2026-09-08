export type RobotStatus = 'online' | 'offline' | 'warning' | 'error';
export type OperatingMode = 'manual' | 'autonomous';
export type MovementState = 'stopped' | 'moving_forward' | 'moving_reverse' | 'turning_left' | 'turning_right';

export interface HcSr04Data {
  distanceCm: number;
  minCm: number;
  maxCm: number;
  status: 'normal' | 'warning' | 'critical';
  frontM: number;
  leftM: number;
  rightM: number;
  rearM: number;
}

export interface LidarPoint {
  angle: number;
  distanceM: number;
}

export interface LidarData {
  rangeM: number;
  scanStatus: 'scanning' | 'idle' | 'warning';
  obstacleDetected: boolean;
  obstacleDistanceM: number;
  scanAngles: LidarPoint[];
}

export interface Mpu6050Data {
  accel: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
  pitch: number;
  roll: number;
  yaw: number;
}

export interface Ina219Data {
  voltageV: number;
  currentA: number;
  powerW: number;
  batteryPercent: number;
  batteryStatus: 'GOOD' | 'CHARGING' | 'LOW' | 'CRITICAL';
}

export interface Position2D {
  x: number;
  y: number;
  headingDeg: number;
  speedMs: number;
}

export interface MotorState {
  leftRpm: number;
  rightRpm: number;
  leftDuty: number;
  rightDuty: number;
  direction: 'forward' | 'reverse' | 'stopped' | 'turning_left' | 'turning_right';
}

export interface SystemHardware {
  raspberryPi5: {
    status: 'online' | 'warning' | 'offline';
    cpuPercent: number;
    ramPercent: number;
    tempC: number;
    diskPercent: number;
    uptimeSec: number;
  };
  esp32: {
    status: 'connected' | 'reconnecting' | 'offline';
    rssiDbm: number;
    dataRateHz: number;
    packetDropPercent: number;
  };
  mqtt: {
    status: 'connected_simulated' | 'disconnected';
    messageCount: number;
    latencyMs: number;
    brokerUrl: string;
  };
  sensorHealth: {
    hcSr04: 'healthy' | 'degraded' | 'fault';
    lidar: 'healthy' | 'degraded' | 'fault';
    mpu6050: 'healthy' | 'degraded' | 'fault';
    ina219: 'healthy' | 'degraded' | 'fault';
    l298n: 'healthy' | 'degraded' | 'fault';
    lm2596: 'healthy' | 'degraded' | 'fault';
  };
}

export interface SystemEventLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source: 'ESP32' | 'RPi5' | 'LiDAR' | 'IMU' | 'INA219' | 'SYSTEM' | 'CONTROL';
}

// --- WAREHOUSE DIGITAL TWIN DOMAIN MODELS ---

export interface WarehouseRack {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shelvesCount: number;
  boxes: Array<{ id: string; shelfIndex: number; color?: string }>;
}

export interface WarehouseLocation {
  id: string;
  code: string; // e.g. A3, B1, P1, D1
  label: string;
  x: number;
  y: number;
  type: 'pick' | 'drop' | 'dock' | 'storage';
}

export interface WarehouseObstacle {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  isTemporary?: boolean;
}

export interface WarehouseTask {
  id: string;
  taskCode: string; // e.g. #T-004
  action: string; // e.g. Pick and Place
  pickLoc: string; // e.g. A3
  dropLoc: string; // e.g. B1
  boxId: string; // e.g. BX-1024
  priority: 'Low' | 'Normal' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  progressPercent: number; // 0 - 100
  currentStepMessage: string;
  assignedTime: string;
}

export interface WarehouseBox {
  id: string;
  boxCode: string;
  currentLoc: string;
  status: 'Waiting' | 'Picked' | 'Carried' | 'Placed';
  weightKg: number;
}

export interface RoutePoint {
  x: number;
  y: number;
}

export interface NavigationRoutes {
  plannedPath: RoutePoint[];
  alternativeRoute: RoutePoint[];
  blockedRoute: RoutePoint[];
}

export interface LoadHandlingState {
  gripperState: 'Idle' | 'Picking' | 'Holding' | 'Placing';
  boxDetected: boolean;
  boxId: string | null;
  weightKg: number;
  actionStatus: 'Idle' | 'Picking' | 'Carrying' | 'Placing';
}

export interface WarehouseStats {
  totalLocations: number;
  pendingTasks: number;
  completedTasks: number;
  activeRobots: number;
  obstaclesCount: number;
  freePathsCount: number;
  blockedPathsCount: number;
  pickLocationsCount: number;
  dropLocationsCount: number;
}

export interface RobotState {
  status: RobotStatus;
  mode: OperatingMode;
  movement: MovementState;
  speedMs: number;
  maxSpeedMs: number;
  batteryPercent: number;
  voltageV: number;
  currentA: number;
  powerW: number;
  ultrasonic: HcSr04Data;
  lidar: LidarData;
  imu: Mpu6050Data;
  powerMonitor: Ina219Data;
  position: Position2D;
  motors: MotorState;
  hardware: SystemHardware;
  connection: {
    esp32: boolean;
    raspberryPi: boolean;
    mqttSimulated: boolean;
  };
  lastUpdated: string;
  activeWaypoint: { x: number; y: number } | null;
  pathHistory: Array<{ x: number; y: number }>;

  // WAREHOUSE DIGITAL TWIN EXTENSIONS
  viewMode: '2D' | '3D';
  layerToggles: {
    showPaths: boolean;
    showObstacles: boolean;
    showTasks: boolean;
    showZones: boolean;
  };
  currentTask: WarehouseTask | null;
  taskQueue: WarehouseTask[];
  completedTasks: WarehouseTask[];
  loadHandling: LoadHandlingState;
  warehouseStats: WarehouseStats;
  routes: NavigationRoutes;
  racks: WarehouseRack[];
  locations: WarehouseLocation[];
  obstacles: WarehouseObstacle[];
}

export interface TelemetryHistoryPoint {
  time: string;
  timestamp: number;
  distanceCm: number;
  lidarRangeM: number;
  voltageV: number;
  currentA: number;
  powerW: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  batteryPercent: number;
  speedMs: number;
}

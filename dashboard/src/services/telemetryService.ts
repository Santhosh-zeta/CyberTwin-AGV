import type {
  RobotState,
  TelemetryHistoryPoint,
  SystemEventLog,
  OperatingMode,
  MovementState,
  WarehouseTask,
  RoutePoint
} from '../types/robot';

type TelemetryListener = (state: RobotState, history: TelemetryHistoryPoint[]) => void;

class TelemetryService {
  private listeners: Set<TelemetryListener> = new Set();
  private state: RobotState;
  private history: TelemetryHistoryPoint[] = [];
  private eventLogs: SystemEventLog[] = [];
  private isPaused: boolean = false;
  private ws: WebSocket | null = null;
  private isLiveWsConnected: boolean = false;

  constructor() {
    this.state = this.getInitialState();
    this.seedInitialHistory();
    this.seedInitialLogs();
    this.startSimulationLoop();
    this.connectLiveWebSocket();
  }

  private getInitialState(): RobotState {
    const now = new Date().toLocaleTimeString();

    // Racks setup
    const racks = [
      {
        id: 'r1', label: 'RACK A', x: -1.8, y: -1.5, width: 0.8, height: 1.8, shelvesCount: 3,
        boxes: [{ id: 'b1', shelfIndex: 0 }, { id: 'b2', shelfIndex: 1 }, { id: 'b3', shelfIndex: 2 }]
      },
      {
        id: 'r2', label: 'RACK B', x: 0.0, y: -1.5, width: 0.8, height: 1.8, shelvesCount: 3,
        boxes: [{ id: 'b4', shelfIndex: 0 }, { id: 'b5', shelfIndex: 2 }]
      },
      {
        id: 'r3', label: 'RACK C', x: 1.8, y: -1.5, width: 0.8, height: 1.8, shelvesCount: 3,
        boxes: [{ id: 'b6', shelfIndex: 1 }, { id: 'b7', shelfIndex: 2 }]
      },
      {
        id: 'r4', label: 'RACK D', x: -1.8, y: 1.0, width: 0.8, height: 1.8, shelvesCount: 3,
        boxes: [{ id: 'b8', shelfIndex: 0 }, { id: 'b9', shelfIndex: 1 }]
      },
      {
        id: 'r5', label: 'RACK E', x: 1.8, y: 1.0, width: 0.8, height: 1.8, shelvesCount: 3,
        boxes: [{ id: 'b10', shelfIndex: 0 }]
      },
      {
        id: 'r6', label: 'RACK F', x: -0.2, y: 1.2, width: 0.8, height: 1.6, shelvesCount: 3,
        boxes: [{ id: 'b11', shelfIndex: 1 }, { id: 'b12', shelfIndex: 2 }]
      }
    ];

    // Warehouse locations
    const locations = [
      { id: 'loc1', code: 'A1', label: 'Shelf A1', x: -2.0, y: -2.2, type: 'storage' as const },
      { id: 'loc2', code: 'A2', label: 'Shelf A2', x: -2.0, y: -1.0, type: 'storage' as const },
      { id: 'loc3', code: 'A3', label: 'Pick P1 (A3)', x: 1.8, y: -2.2, type: 'pick' as const },
      { id: 'loc4', code: 'B1', label: 'Drop D1 (B1)', x: 0.6, y: 2.2, type: 'drop' as const },
      { id: 'loc5', code: 'B2', label: 'Shelf B2', x: 0.0, y: -0.8, type: 'storage' as const },
      { id: 'loc6', code: 'B3', label: 'Shelf B3', x: 0.0, y: 0.2, type: 'storage' as const },
      { id: 'loc7', code: 'C1', label: 'Shelf C1', x: 2.0, y: -0.8, type: 'storage' as const },
      { id: 'loc8', code: 'C2', label: 'Shelf C2', x: 2.0, y: 0.2, type: 'storage' as const },
      { id: 'loc9', code: 'Dock A', label: 'Receiving Dock A', x: -2.5, y: -2.0, type: 'dock' as const },
      { id: 'loc10', code: 'Dock B', label: 'Dispatch Dock B', x: -2.5, y: 0.5, type: 'dock' as const },
    ];

    // Obstacles
    const obstacles = [
      { id: 'obs1', x: 1.2, y: -0.2, radius: 0.35, label: 'Pallet Stator' },
      { id: 'obs2', x: -0.8, y: -0.5, radius: 0.3, label: 'Box Container' },
      { id: 'obs3', x: 0.8, y: 0.8, radius: 0.35, label: 'Maintenance Barrier', isTemporary: true }
    ];

    // Current Task #T-004
    const currentTask: WarehouseTask = {
      id: 't-004',
      taskCode: '#T-004',
      action: 'Pick and Place',
      pickLoc: 'A3',
      dropLoc: 'B1',
      boxId: 'BX-1024',
      priority: 'Normal',
      status: 'In Progress',
      progressPercent: 40,
      currentStepMessage: 'Navigating to pick location A3...',
      assignedTime: '14:30:10'
    };

    // Task Queue
    const taskQueue: WarehouseTask[] = [
      currentTask,
      {
        id: 't-005',
        taskCode: '#T-005',
        action: 'Pick and Place',
        pickLoc: 'C1',
        dropLoc: 'A2',
        boxId: 'BX-1088',
        priority: 'Normal',
        status: 'Pending',
        progressPercent: 0,
        currentStepMessage: 'Queued for pickup',
        assignedTime: '14:32:00'
      },
      {
        id: 't-006',
        taskCode: '#T-006',
        action: 'Pick and Place',
        pickLoc: 'B3',
        dropLoc: 'C4',
        boxId: 'BX-2041',
        priority: 'High',
        status: 'Pending',
        progressPercent: 0,
        currentStepMessage: 'Queued for pickup',
        assignedTime: '14:35:12'
      },
      {
        id: 't-007',
        taskCode: '#T-007',
        action: 'Pick and Transfer',
        pickLoc: 'A1',
        dropLoc: 'Dock A',
        boxId: 'BX-3012',
        priority: 'Normal',
        status: 'Pending',
        progressPercent: 0,
        currentStepMessage: 'Queued for pickup',
        assignedTime: '14:38:40'
      },
      {
        id: 't-008',
        taskCode: '#T-008',
        action: 'Pick and Place',
        pickLoc: 'C2',
        dropLoc: 'B2',
        boxId: 'BX-4009',
        priority: 'Low',
        status: 'Pending',
        progressPercent: 0,
        currentStepMessage: 'Queued for pickup',
        assignedTime: '14:40:00'
      }
    ];

    // Routes
    const plannedPath: RoutePoint[] = [
      { x: 0.0, y: 0.0 },
      { x: 0.8, y: -0.6 },
      { x: 1.8, y: -1.2 },
      { x: 1.8, y: -2.2 } // P1 Pick A3
    ];

    const alternativeRoute: RoutePoint[] = [
      { x: 0.0, y: 0.0 },
      { x: -0.6, y: -0.6 },
      { x: -0.6, y: -2.0 },
      { x: 1.0, y: -2.2 },
      { x: 1.8, y: -2.2 }
    ];

    const blockedRoute: RoutePoint[] = [
      { x: 0.0, y: 0.0 },
      { x: 0.8, y: 0.8 }, // Obstacle at 0.8, 0.8
      { x: 0.6, y: 2.2 }
    ];

    return {
      status: 'online',
      mode: 'autonomous',
      movement: 'moving_forward',
      speedMs: 0.45,
      maxSpeedMs: 0.8,
      batteryPercent: 78,
      voltageV: 11.8,
      currentA: 0.84,
      powerW: 9.91,
      ultrasonic: {
        distanceCm: 124,
        minCm: 12,
        maxCm: 350,
        status: 'normal',
        frontM: 1.24,
        leftM: 2.18,
        rightM: 1.96,
        rearM: 2.50
      },
      lidar: {
        rangeM: 1.84,
        scanStatus: 'scanning',
        obstacleDetected: false,
        obstacleDistanceM: 1.84,
        scanAngles: this.generateLidarScan(0, 0, 0)
      },
      imu: {
        accel: { x: 0.15, y: 0.02, z: 0.98 },
        gyro: { x: 0.1, y: 0.1, z: 2.4 },
        pitch: 1.2,
        roll: -0.4,
        yaw: 90.0
      },
      powerMonitor: {
        voltageV: 11.8,
        currentA: 0.84,
        powerW: 9.91,
        batteryPercent: 78,
        batteryStatus: 'GOOD'
      },
      position: {
        x: 0.2,
        y: -0.2,
        headingDeg: 90,
        speedMs: 0.45
      },
      motors: {
        leftRpm: 140,
        rightRpm: 140,
        leftDuty: 70,
        rightDuty: 70,
        direction: 'forward'
      },
      hardware: {
        raspberryPi5: {
          status: 'online',
          cpuPercent: 42,
          ramPercent: 61,
          tempC: 48,
          diskPercent: 38,
          uptimeSec: 4820
        },
        esp32: {
          status: 'connected',
          rssiDbm: -48,
          dataRateHz: 10,
          packetDropPercent: 0
        },
        mqtt: {
          status: 'connected_simulated',
          messageCount: 1248,
          latencyMs: 18,
          brokerUrl: 'mqtt://localhost:1883'
        },
        sensorHealth: {
          hcSr04: 'healthy',
          lidar: 'healthy',
          mpu6050: 'healthy',
          ina219: 'healthy',
          l298n: 'healthy',
          lm2596: 'healthy'
        }
      },
      connection: {
        esp32: true,
        raspberryPi: true,
        mqttSimulated: true
      },
      lastUpdated: now,
      activeWaypoint: { x: 1.8, y: -2.2 },
      pathHistory: [{ x: 0, y: 0 }, { x: 0.1, y: -0.1 }, { x: 0.2, y: -0.2 }],

      // WAREHOUSE DIGITAL TWIN EXTENSIONS
      viewMode: '2D',
      layerToggles: {
        showPaths: true,
        showObstacles: true,
        showTasks: true,
        showZones: true
      },
      currentTask,
      taskQueue,
      completedTasks: [],
      loadHandling: {
        gripperState: 'Idle',
        boxDetected: true,
        boxId: 'BX-1024',
        weightKg: 2.4,
        actionStatus: 'Idle'
      },
      warehouseStats: {
        totalLocations: 24,
        pendingTasks: 3,
        completedTasks: 12,
        activeRobots: 1,
        obstaclesCount: 3,
        freePathsCount: 5,
        blockedPathsCount: 1,
        pickLocationsCount: 4,
        dropLocationsCount: 4
      },
      routes: {
        plannedPath,
        alternativeRoute,
        blockedRoute
      },
      racks,
      locations,
      obstacles
    };
  }

  private connectLiveWebSocket() {
    try {
      const hostname = window.location.hostname || 'localhost';
      const port = window.location.port === '5173' ? '8000' : window.location.port || '8000';
      const wsUrl = `ws://${hostname}:${port}/ws/telemetry`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isLiveWsConnected = true;
        this.state.connection.mqttSimulated = false;
        this.state.hardware.mqtt.status = 'connected_simulated';
        this.addLog('success', 'Connected to CyberTwin-AGV FastAPI WebSocket Telemetry Feed', 'SYSTEM');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleLiveTelemetry(data);
        } catch (e) {
          // Ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.isLiveWsConnected = false;
        this.state.connection.mqttSimulated = true;
        setTimeout(() => this.connectLiveWebSocket(), 5000);
      };

      this.ws.onerror = () => {
        this.isLiveWsConnected = false;
      };
    } catch (e) {
      this.isLiveWsConnected = false;
    }
  }

  private handleLiveTelemetry(data: any) {
    if (!data) return;
    const s = { ...this.state };
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (data.x !== undefined) s.position.x = data.x;
    if (data.y !== undefined) s.position.y = data.y;
    if (data.theta !== undefined) s.position.headingDeg = data.theta;
    if (data.speed !== undefined) s.speedMs = data.speed;
    if (data.battery !== undefined) {
      s.voltageV = data.battery;
      let pct = ((data.battery - 10.0) / (12.6 - 10.0)) * 100;
      s.batteryPercent = Math.max(0, Math.min(100, Math.round(pct)));
    }
    if (data.obstacle !== undefined) {
      s.lidar.obstacleDetected = data.obstacle;
      s.ultrasonic.distanceCm = data.obstacle ? 20 : 150;
      s.ultrasonic.status = data.obstacle ? 'critical' : 'normal';
    }

    s.lastUpdated = timeStr;
    s.hardware.mqtt.messageCount += 1;
    this.state = s;
    this.notify();
  }

  private async dispatchBackendCommand(cmd: string, lin: number, ang: number) {
    try {
      const hostname = window.location.hostname || 'localhost';
      const port = window.location.port === '5173' ? '8000' : window.location.port || '8000';
      const apiUrl = `http://${hostname}:${port}/command`;

      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          linear_velocity: lin,
          angular_velocity: ang,
        }),
      });
    } catch (e) {
      // Backend not running locally
    }
  }

  private seedInitialHistory() {
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now - i * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.history.push({
        time,
        timestamp: now - i * 1000,
        distanceCm: 124 + Math.floor(Math.sin(i / 3) * 6),
        lidarRangeM: Number((1.84 + Math.cos(i / 4) * 0.1).toFixed(2)),
        voltageV: Number((11.8 - i * 0.001).toFixed(2)),
        currentA: Number((0.84 + Math.sin(i / 2) * 0.05).toFixed(2)),
        powerW: Number((9.91 + Math.sin(i / 2) * 0.4).toFixed(2)),
        accelX: Number((0.15 + Math.sin(i) * 0.02).toFixed(2)),
        accelY: Number((0.02 + Math.cos(i) * 0.02).toFixed(2)),
        accelZ: Number((0.98 + (Math.random() - 0.5) * 0.02).toFixed(2)),
        gyroX: Number((0.1 + (Math.random() - 0.5) * 0.1).toFixed(1)),
        gyroY: Number((0.1 + (Math.random() - 0.5) * 0.1).toFixed(1)),
        gyroZ: 2.4,
        batteryPercent: 78,
        speedMs: 0.45,
      });
    }
  }

  private seedInitialLogs() {
    const time = (secAgo: number) => new Date(Date.now() - secAgo * 1000).toLocaleTimeString();
    this.eventLogs = [
      { id: '1', timestamp: time(60), level: 'info', message: 'ESP32 connected via Wi-Fi (192.168.1.104)', source: 'ESP32' },
      { id: '2', timestamp: time(58), level: 'success', message: 'MPU6050 6-DOF IMU calibrated successfully', source: 'IMU' },
      { id: '3', timestamp: time(55), level: 'info', message: 'LiDAR 360° point cloud stream active @ 10Hz', source: 'LiDAR' },
      { id: '4', timestamp: time(50), level: 'info', message: 'Task #T-004 assigned: Pick A3 -> Drop B1', source: 'CONTROL' },
      { id: '5', timestamp: time(40), level: 'success', message: 'Warehouse Digital Twin simulation initialized', source: 'SYSTEM' },
    ];
  }

  private generateLidarScan(posX: number, posY: number, heading: number): Array<{ angle: number; distanceM: number }> {
    const points: Array<{ angle: number; distanceM: number }> = [];
    const step = 15;
    for (let angle = 0; angle < 360; angle += step) {
      const rad = ((angle + heading) * Math.PI) / 180;
      let dist = 3.5 + Math.sin(rad * 3) * 0.5;

      const rayDx = Math.cos(rad);
      const rayDy = Math.sin(rad);

      const distsToWalls: number[] = [];
      if (rayDx > 0) distsToWalls.push((3.0 - posX) / rayDx);
      if (rayDx < 0) distsToWalls.push((-3.0 - posX) / rayDx);
      if (rayDy > 0) distsToWalls.push((3.0 - posY) / rayDy);
      if (rayDy < 0) distsToWalls.push((-3.0 - posY) / rayDy);

      const validWallDists = distsToWalls.filter(d => d > 0);
      if (validWallDists.length > 0) {
        dist = Math.min(dist, Math.min(...validWallDists));
      }

      for (const obs of this.state.obstacles || []) {
        const dx = obs.x - posX;
        const dy = obs.y - posY;
        const distToObsCenter = Math.hypot(dx, dy);
        const angleToObs = (Math.atan2(dy, dx) * 180) / Math.PI;
        const normAngleToObs = (angleToObs + 360) % 360;
        const angleDiff = Math.abs(((angle + heading - normAngleToObs + 540) % 360) - 180);
        if (angleDiff < 20) {
          const obsDist = Math.max(0.2, distToObsCenter - obs.radius);
          dist = Math.min(dist, obsDist);
        }
      }

      dist = Math.max(0.15, Number((dist + (Math.random() - 0.5) * 0.05).toFixed(2)));
      points.push({ angle, distanceM: dist });
    }
    return points;
  }

  private startSimulationLoop() {
    window.setInterval(() => {
      if (this.isPaused) return;
      this.tick();
    }, 200);
  }

  private tick() {
    const s = { ...this.state };
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Progress current warehouse task & AGV kinematics
    this.handleWarehouseTaskProgression(s);

    // Battery slow discharge
    if (!this.isLiveWsConnected && Math.random() < 0.05) {
      s.batteryPercent = Math.max(15, Number((s.batteryPercent - 0.01).toFixed(2)));
      s.voltageV = Number((10.0 + (s.batteryPercent / 100) * 2.6).toFixed(2));
    }

    const currentMult = s.movement === 'stopped' ? 1.0 : 2.1;
    s.currentA = Number((0.75 * currentMult + (Math.random() - 0.5) * 0.08).toFixed(2));
    s.powerW = Number((s.voltageV * s.currentA).toFixed(2));

    // Distance sensor readings simulation (Front, Left, Right, Rear)
    const frontScanAngles = this.generateLidarScan(s.position.x, s.position.y, s.position.headingDeg);
    const frontPt = frontScanAngles.find(p => p.angle === 0) || { distanceM: 1.24 };
    const leftPt = frontScanAngles.find(p => p.angle === 270) || { distanceM: 2.18 };
    const rightPt = frontScanAngles.find(p => p.angle === 90) || { distanceM: 1.96 };
    const rearPt = frontScanAngles.find(p => p.angle === 180) || { distanceM: 2.50 };

    s.ultrasonic = {
      distanceCm: Math.round(frontPt.distanceM * 100),
      minCm: 12,
      maxCm: 350,
      status: frontPt.distanceM < 0.45 ? 'critical' : frontPt.distanceM < 0.8 ? 'warning' : 'normal',
      frontM: Number(frontPt.distanceM.toFixed(2)),
      leftM: Number(leftPt.distanceM.toFixed(2)),
      rightM: Number(rightPt.distanceM.toFixed(2)),
      rearM: Number(rearPt.distanceM.toFixed(2))
    };

    s.lidar = {
      rangeM: Number(frontPt.distanceM.toFixed(2)),
      scanStatus: 'scanning',
      obstacleDetected: frontPt.distanceM < 0.5,
      obstacleDistanceM: Number(frontPt.distanceM.toFixed(2)),
      scanAngles: frontScanAngles
    };

    // IMU fluctuations
    const linearAccel = s.movement === 'moving_forward' ? 0.25 : 0;
    s.imu = {
      accel: {
        x: Number((linearAccel + (Math.random() - 0.5) * 0.04).toFixed(2)),
        y: Number(((Math.random() - 0.5) * 0.04).toFixed(2)),
        z: Number((0.98 + (Math.random() - 0.5) * 0.02).toFixed(2))
      },
      gyro: {
        x: Number(((Math.random() - 0.5) * 0.4).toFixed(1)),
        y: Number(((Math.random() - 0.5) * 0.4).toFixed(1)),
        z: Number(((Math.random() - 0.5) * 0.8).toFixed(1))
      },
      pitch: 1.2,
      roll: -0.4,
      yaw: Number(s.position.headingDeg.toFixed(1))
    };

    s.hardware.mqtt.messageCount += 1;
    s.lastUpdated = timeStr;

    this.state = s;

    // History log
    const historyPoint: TelemetryHistoryPoint = {
      time: timeStr,
      timestamp: Date.now(),
      distanceCm: s.ultrasonic.distanceCm,
      lidarRangeM: s.lidar.rangeM,
      voltageV: s.voltageV,
      currentA: s.currentA,
      powerW: s.powerW,
      accelX: s.imu.accel.x,
      accelY: s.imu.accel.y,
      accelZ: s.imu.accel.z,
      gyroX: s.imu.gyro.x,
      gyroY: s.imu.gyro.y,
      gyroZ: s.imu.gyro.z,
      batteryPercent: s.batteryPercent,
      speedMs: s.speedMs
    };
    this.history = [...this.history.slice(-59), historyPoint];

    this.notify();
  }

  private handleWarehouseTaskProgression(s: RobotState) {
    if (!s.currentTask || s.mode !== 'autonomous' || this.isLiveWsConnected) return;

    const task = s.currentTask;

    // Kinematic waypoint progression along active planned route
    const activeRoute = s.routes.plannedPath;
    if (activeRoute.length > 0) {
      const targetPt = activeRoute[Math.min(activeRoute.length - 1, Math.floor((task.progressPercent / 100) * activeRoute.length))];
      const dx = targetPt.x - s.position.x;
      const dy = targetPt.y - s.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.05) {
        s.position.x += (dx / dist) * s.speedMs * 0.15;
        s.position.y += (dy / dist) * s.speedMs * 0.15;
        s.position.headingDeg = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        s.movement = 'moving_forward';
      }
    }

    // Advance task percentage
    if (task.progressPercent < 100) {
      task.progressPercent = Math.min(100, task.progressPercent + 0.8);

      if (task.progressPercent < 50) {
        task.currentStepMessage = `Navigating to pick location (${task.pickLoc})...`;
        s.loadHandling.actionStatus = 'Idle';
      } else if (task.progressPercent >= 50 && task.progressPercent < 60) {
        task.currentStepMessage = `Picking package ${task.boxId} at ${task.pickLoc}...`;
        s.loadHandling.gripperState = 'Holding';
        s.loadHandling.boxId = task.boxId;
        s.loadHandling.actionStatus = 'Carrying';
      } else if (task.progressPercent >= 60 && task.progressPercent < 95) {
        task.currentStepMessage = `Transporting box ${task.boxId} to drop location ${task.dropLoc}...`;
        s.loadHandling.actionStatus = 'Carrying';
      } else if (task.progressPercent >= 95 && task.progressPercent < 100) {
        task.currentStepMessage = `Placing box ${task.boxId} at ${task.dropLoc}...`;
        s.loadHandling.gripperState = 'Placing';
        s.loadHandling.actionStatus = 'Placing';
      }
    } else {
      // Task Complete!
      task.status = 'Completed';
      task.currentStepMessage = `Task ${task.taskCode} Completed successfully!`;
      s.loadHandling.gripperState = 'Idle';
      s.loadHandling.actionStatus = 'Idle';
      s.loadHandling.boxId = null;

      // Update warehouse stats
      s.warehouseStats.completedTasks += 1;
      this.addLog('success', `Task ${task.taskCode} COMPLETED: Delivered ${task.boxId} to ${task.dropLoc}`, 'CONTROL');

      // Move completed task & promote next queued task
      if (!s.completedTasks.find(t => t.id === task.id)) {
        s.completedTasks = [task, ...s.completedTasks];
      }

      // Promote next pending task from queue
      const nextPending = s.taskQueue.find(t => t.status === 'Pending');
      if (nextPending) {
        nextPending.status = 'In Progress';
        nextPending.progressPercent = 0;
        s.currentTask = nextPending;
        s.warehouseStats.pendingTasks = Math.max(0, s.warehouseStats.pendingTasks - 1);
        this.addLog('info', `Promoted task ${nextPending.taskCode} to IN PROGRESS`, 'CONTROL');
      }
    }
  }

  // --- INTERACTIVE ACTIONS & SCENARIOS ---

  public injectObstacle() {
    const newObs = {
      id: `obs_${Date.now()}`,
      x: 0.8,
      y: -0.6,
      radius: 0.4,
      label: 'Injected Obstacle',
      isTemporary: true
    };

    this.state.obstacles = [newObs, ...this.state.obstacles];
    this.state.warehouseStats.obstaclesCount = this.state.obstacles.length;
    this.state.warehouseStats.blockedPathsCount += 1;

    // Block current planned route and switch to alternative route
    this.state.routes.blockedRoute = [
      { x: this.state.position.x, y: this.state.position.y },
      { x: 0.8, y: -0.6 },
      { x: 1.8, y: -2.2 }
    ];

    this.state.routes.plannedPath = [...this.state.routes.alternativeRoute];

    if (this.state.currentTask) {
      this.state.currentTask.currentStepMessage = 'OBSTACLE DETECTED! Recalculating alternative route...';
    }

    this.addLog('error', 'HAZARD INJECTED: Obstacle detected on Primary Route A! Initiating reroute...', 'CONTROL');
    this.notify();
  }

  public simulatePick() {
    this.state.loadHandling = {
      gripperState: 'Holding',
      boxDetected: true,
      boxId: this.state.currentTask?.boxId || 'BX-1024',
      weightKg: 2.4,
      actionStatus: 'Carrying'
    };
    this.addLog('success', `Manual simulation: Package ${this.state.loadHandling.boxId} picked by AGV gripper`, 'CONTROL');
    this.notify();
  }

  public simulateDrop() {
    const droppedBox = this.state.loadHandling.boxId || 'BX-1024';
    this.state.loadHandling = {
      gripperState: 'Idle',
      boxDetected: false,
      boxId: null,
      weightKg: 0,
      actionStatus: 'Idle'
    };
    this.addLog('info', `Manual simulation: Package ${droppedBox} placed at destination`, 'CONTROL');
    this.notify();
  }

  public selectTaskFromQueue(taskId: string) {
    const found = this.state.taskQueue.find(t => t.id === taskId);
    if (found) {
      this.state.taskQueue.forEach(t => {
        if (t.status === 'In Progress') t.status = 'Pending';
      });
      found.status = 'In Progress';
      found.progressPercent = 10;
      this.state.currentTask = found;
      this.addLog('info', `Switched active task to ${found.taskCode}`, 'CONTROL');
      this.notify();
    }
  }

  public setViewMode(mode: '2D' | '3D') {
    this.state.viewMode = mode;
    this.notify();
  }

  public toggleLayer(layer: keyof RobotState['layerToggles']) {
    this.state.layerToggles[layer] = !this.state.layerToggles[layer];
    this.notify();
  }

  public resetSimulation() {
    this.state = this.getInitialState();
    this.addLog('info', 'Warehouse Digital Twin simulation RESET to initial state', 'SYSTEM');
    this.notify();
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    listener(this.state, this.history);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.state, this.history));
  }

  public setMovement(movement: MovementState) {
    this.state.movement = movement;
    const labels: Record<MovementState, string> = {
      stopped: 'Stopped',
      moving_forward: 'Moving Forward',
      moving_reverse: 'Moving Reverse',
      turning_left: 'Turning Left',
      turning_right: 'Turning Right',
    };
    this.addLog('info', `Command issued: ${labels[movement]}`, 'CONTROL');

    let cmdStr = 'STOP';
    let lin = 0.0, ang = 0.0;
    if (movement === 'moving_forward') { cmdStr = 'FORWARD'; lin = 0.5; }
    if (movement === 'moving_reverse') { cmdStr = 'BACKWARD'; lin = -0.5; }
    if (movement === 'turning_left') { cmdStr = 'LEFT'; ang = 1.0; }
    if (movement === 'turning_right') { cmdStr = 'RIGHT'; ang = -1.0; }

    this.dispatchBackendCommand(cmdStr, lin, ang);
    this.notify();
  }

  public setMode(mode: OperatingMode) {
    this.state.mode = mode;
    this.addLog('info', `Operating mode switched to ${mode.toUpperCase()}`, 'CONTROL');
    this.notify();
  }

  public setSpeedLimit(maxSpeed: number) {
    this.state.maxSpeedMs = maxSpeed;
    this.addLog('info', `Max speed limit set to ${maxSpeed.toFixed(2)} m/s`, 'CONTROL');
    this.notify();
  }

  public setWaypoint(x: number, y: number) {
    this.state.activeWaypoint = { x, y };
    this.state.mode = 'autonomous';
    this.addLog('info', `New target waypoint set at (${x.toFixed(2)}m, ${y.toFixed(2)}m)`, 'CONTROL');
    this.notify();
  }

  public triggerEmergencyStop() {
    this.state.movement = 'stopped';
    this.state.mode = 'manual';
    this.state.activeWaypoint = null;
    this.addLog('error', 'EMERGENCY STOP (E-STOP) ACTIVATED — All motor channels disabled!', 'CONTROL');
    this.dispatchBackendCommand('STOP', 0, 0);
    this.notify();
  }

  public addLog(level: 'info' | 'warn' | 'error' | 'success', message: string, source: SystemEventLog['source']) {
    const timeStr = new Date().toLocaleTimeString();
    const newLog: SystemEventLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: timeStr,
      level,
      message,
      source,
    };
    this.eventLogs = [newLog, ...this.eventLogs.slice(0, 99)];
  }

  public getEventLogs(): SystemEventLog[] {
    return this.eventLogs;
  }

  public pauseSimulation() {
    this.isPaused = true;
    this.addLog('warn', 'Telemetry simulation stream PAUSED', 'SYSTEM');
  }

  public resumeSimulation() {
    this.isPaused = false;
    this.addLog('info', 'Telemetry simulation stream RESUMED', 'SYSTEM');
  }

  public isSimulationPaused(): boolean {
    return this.isPaused;
  }

  public exportTelemetryCSV(): string {
    const headers = ['Time', 'Distance_cm', 'Lidar_m', 'Voltage_V', 'Current_A', 'Power_W', 'AccelX_g', 'AccelY_g', 'AccelZ_g', 'GyroX_dps', 'GyroY_dps', 'GyroZ_dps', 'Battery_pct', 'Speed_mps'];
    const rows = this.history.map(h => [
      h.time,
      h.distanceCm,
      h.lidarRangeM,
      h.voltageV,
      h.currentA,
      h.powerW,
      h.accelX,
      h.accelY,
      h.accelZ,
      h.gyroX,
      h.gyroY,
      h.gyroZ,
      h.batteryPercent,
      h.speedMs
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
}

export const telemetryService = new TelemetryService();

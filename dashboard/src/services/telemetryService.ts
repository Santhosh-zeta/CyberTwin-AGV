import type { RobotState, TelemetryHistoryPoint, SystemEventLog, OperatingMode, MovementState } from '../types/robot';

type TelemetryListener = (state: RobotState, history: TelemetryHistoryPoint[]) => void;

class TelemetryService {
  private listeners: Set<TelemetryListener> = new Set();
  private state: RobotState;
  private history: TelemetryHistoryPoint[] = [];
  private eventLogs: SystemEventLog[] = [];
  private isPaused: boolean = false;
  private ws: WebSocket | null = null;
  private isLiveWsConnected: boolean = false;

  private arenaObstacles = [
    { x: 2.5, y: 1.5, radius: 0.4 },
    { x: -1.8, y: 2.2, radius: 0.5 },
    { x: 1.2, y: -2.0, radius: 0.6 },
    { x: -2.0, y: -1.5, radius: 0.4 },
  ];

  constructor() {
    this.state = this.getInitialState();
    this.seedInitialHistory();
    this.seedInitialLogs();
    this.startSimulationLoop();
    this.connectLiveWebSocket();
  }

  private getInitialState(): RobotState {
    const now = new Date().toLocaleTimeString();
    return {
      status: 'online',
      mode: 'manual',
      movement: 'stopped',
      speedMs: 0,
      maxSpeedMs: 0.8,
      batteryPercent: 78,
      voltageV: 11.8,
      currentA: 0.84,
      powerW: 9.91,
      ultrasonic: {
        distanceCm: 42,
        minCm: 12,
        maxCm: 350,
        status: 'normal',
      },
      lidar: {
        rangeM: 1.84,
        scanStatus: 'scanning',
        obstacleDetected: false,
        obstacleDistanceM: 1.84,
        scanAngles: this.generateLidarScan(0, 0, 0),
      },
      imu: {
        accel: { x: 0.12, y: 0.03, z: 0.98 },
        gyro: { x: 0.2, y: 0.1, z: 0.0 },
        pitch: 1.2,
        roll: -0.4,
        yaw: 45.0,
      },
      powerMonitor: {
        voltageV: 11.8,
        currentA: 0.84,
        powerW: 9.91,
        batteryPercent: 78,
        batteryStatus: 'GOOD',
      },
      position: {
        x: 0,
        y: 0,
        headingDeg: 45,
        speedMs: 0,
      },
      motors: {
        leftRpm: 0,
        rightRpm: 0,
        leftDuty: 0,
        rightDuty: 0,
        direction: 'stopped',
      },
      hardware: {
        raspberryPi5: {
          status: 'online',
          cpuPercent: 42,
          ramPercent: 61,
          tempC: 48,
          diskPercent: 38,
          uptimeSec: 4820,
        },
        esp32: {
          status: 'connected',
          rssiDbm: -48,
          dataRateHz: 10,
          packetDropPercent: 0,
        },
        mqtt: {
          status: 'connected_simulated',
          messageCount: 1248,
          latencyMs: 18,
          brokerUrl: 'mqtt://localhost:1883',
        },
        sensorHealth: {
          hcSr04: 'healthy',
          lidar: 'healthy',
          mpu6050: 'healthy',
          ina219: 'healthy',
          l298n: 'healthy',
          lm2596: 'healthy',
        },
      },
      connection: {
        esp32: true,
        raspberryPi: true,
        mqttSimulated: true,
      },
      lastUpdated: now,
      activeWaypoint: null,
      pathHistory: [{ x: 0, y: 0 }],
    };
  }

  // Live WebSocket Connection to CyberTwin-AGV FastAPI Backend (/ws/telemetry)
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
          // Ignore JSON parse errors
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
      // Backend not running locally or CORS restriction
    }
  }

  private seedInitialHistory() {
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now - i * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.history.push({
        time,
        timestamp: now - i * 1000,
        distanceCm: 42 + Math.floor(Math.sin(i / 3) * 4),
        lidarRangeM: Number((1.84 + Math.cos(i / 4) * 0.1).toFixed(2)),
        voltageV: Number((11.8 - i * 0.001).toFixed(2)),
        currentA: Number((0.84 + Math.sin(i / 2) * 0.05).toFixed(2)),
        powerW: Number((9.91 + Math.sin(i / 2) * 0.4).toFixed(2)),
        accelX: Number((0.12 + Math.sin(i) * 0.02).toFixed(2)),
        accelY: Number((0.03 + Math.cos(i) * 0.02).toFixed(2)),
        accelZ: Number((0.98 + (Math.random() - 0.5) * 0.02).toFixed(2)),
        gyroX: Number((0.2 + (Math.random() - 0.5) * 0.1).toFixed(1)),
        gyroY: Number((0.1 + (Math.random() - 0.5) * 0.1).toFixed(1)),
        gyroZ: 0,
        batteryPercent: 78,
        speedMs: 0,
      });
    }
  }

  private seedInitialLogs() {
    const time = (secAgo: number) => new Date(Date.now() - secAgo * 1000).toLocaleTimeString();
    this.eventLogs = [
      { id: '1', timestamp: time(60), level: 'info', message: 'ESP32 connected via Wi-Fi (192.168.1.104)', source: 'ESP32' },
      { id: '2', timestamp: time(58), level: 'success', message: 'MPU6050 6-DOF IMU calibrated successfully', source: 'IMU' },
      { id: '3', timestamp: time(55), level: 'info', message: 'LiDAR 360° point cloud stream active @ 10Hz', source: 'LiDAR' },
      { id: '4', timestamp: time(50), level: 'info', message: 'INA219 power telemetry monitoring active', source: 'INA219' },
      { id: '5', timestamp: time(40), level: 'success', message: 'CyberTwin-AGV digital twin framework initialized', source: 'SYSTEM' },
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

      for (const obs of this.arenaObstacles) {
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

    if (s.mode === 'autonomous') {
      this.handleAutonomousBehavior(s);
    }

    let targetSpeed = 0;
    let turnRate = 0;
    let currentMult = 1.0;

    switch (s.movement) {
      case 'moving_forward':
        targetSpeed = s.maxSpeedMs;
        turnRate = (Math.random() - 0.5) * 0.5;
        currentMult = 2.1;
        s.motors = { leftRpm: 180, rightRpm: 180, leftDuty: 85, rightDuty: 85, direction: 'forward' };
        break;
      case 'moving_reverse':
        targetSpeed = -s.maxSpeedMs * 0.6;
        turnRate = (Math.random() - 0.5) * 0.5;
        currentMult = 1.9;
        s.motors = { leftRpm: 120, rightRpm: 120, leftDuty: 60, rightDuty: 60, direction: 'reverse' };
        break;
      case 'turning_left':
        targetSpeed = s.maxSpeedMs * 0.3;
        turnRate = -45.0;
        currentMult = 2.4;
        s.motors = { leftRpm: 40, rightRpm: 160, leftDuty: 30, rightDuty: 80, direction: 'turning_left' };
        break;
      case 'turning_right':
        targetSpeed = s.maxSpeedMs * 0.3;
        turnRate = 45.0;
        currentMult = 2.4;
        s.motors = { leftRpm: 160, rightRpm: 40, leftDuty: 80, rightDuty: 30, direction: 'turning_right' };
        break;
      case 'stopped':
      default:
        targetSpeed = 0;
        turnRate = 0;
        currentMult = 1.0;
        s.motors = { leftRpm: 0, rightRpm: 0, leftDuty: 0, rightDuty: 0, direction: 'stopped' };
        break;
    }

    // Only update position via kinematics if not connected to live WS odometry feed
    if (!this.isLiveWsConnected) {
      s.speedMs = Number((s.speedMs * 0.7 + targetSpeed * 0.3).toFixed(2));
      if (Math.abs(s.speedMs) < 0.01) s.speedMs = 0;

      s.position.headingDeg = (s.position.headingDeg + turnRate * 0.2 + 360) % 360;
      const radHeading = (s.position.headingDeg * Math.PI) / 180;
      s.position.x += Math.cos(radHeading) * s.speedMs * 0.2;
      s.position.y += Math.sin(radHeading) * s.speedMs * 0.2;

      s.position.x = Math.max(-2.8, Math.min(2.8, s.position.x));
      s.position.y = Math.max(-2.8, Math.min(2.8, s.position.y));
    }

    if (Math.abs(s.speedMs) > 0.05 || turnRate !== 0) {
      const lastPt = s.pathHistory[s.pathHistory.length - 1];
      if (!lastPt || Math.hypot(s.position.x - lastPt.x, s.position.y - lastPt.y) > 0.15) {
        s.pathHistory = [...s.pathHistory.slice(-49), { x: s.position.x, y: s.position.y }];
      }
    }

    if (!this.isLiveWsConnected && Math.random() < 0.05) {
      s.batteryPercent = Math.max(15, Number((s.batteryPercent - 0.01).toFixed(2)));
      s.voltageV = Number((10.0 + (s.batteryPercent / 100) * 2.6).toFixed(2));
    }
    s.currentA = Number((0.75 * currentMult + (Math.random() - 0.5) * 0.08).toFixed(2));
    s.powerW = Number((s.voltageV * s.currentA).toFixed(2));
    s.powerMonitor = {
      voltageV: s.voltageV,
      currentA: s.currentA,
      powerW: s.powerW,
      batteryPercent: s.batteryPercent,
      batteryStatus: s.batteryPercent > 20 ? 'GOOD' : 'LOW',
    };

    const frontScanAngles = this.generateLidarScan(s.position.x, s.position.y, s.position.headingDeg);
    const frontPoint = frontScanAngles.find(p => p.angle === 0) || { distanceM: 1.84 };
    const ultrasonicCm = Math.max(5, Math.min(350, Math.round(frontPoint.distanceM * 100)));

    if (!this.isLiveWsConnected) {
      s.ultrasonic = {
        distanceCm: ultrasonicCm,
        minCm: 12,
        maxCm: 350,
        status: ultrasonicCm < 25 ? 'critical' : ultrasonicCm < 45 ? 'warning' : 'normal',
      };

      s.lidar = {
        rangeM: frontPoint.distanceM,
        scanStatus: 'scanning',
        obstacleDetected: ultrasonicCm < 45,
        obstacleDistanceM: Number((ultrasonicCm / 100).toFixed(2)),
        scanAngles: frontScanAngles,
      };
    } else {
      s.lidar.scanAngles = frontScanAngles;
    }

    const accelNoiseX = (Math.random() - 0.5) * 0.04;
    const accelNoiseY = (Math.random() - 0.5) * 0.04;
    const linearAccel = s.movement === 'moving_forward' ? 0.25 : s.movement === 'moving_reverse' ? -0.2 : 0;
    s.imu = {
      accel: {
        x: Number((linearAccel + accelNoiseX).toFixed(2)),
        y: Number((accelNoiseY + (s.movement.startsWith('turning') ? 0.15 : 0)).toFixed(2)),
        z: Number((0.98 + (Math.random() - 0.5) * 0.02).toFixed(2)),
      },
      gyro: {
        x: Number(((Math.random() - 0.5) * 0.4).toFixed(1)),
        y: Number(((Math.random() - 0.5) * 0.4).toFixed(1)),
        z: Number((turnRate + (Math.random() - 0.5) * 0.8).toFixed(1)),
      },
      pitch: Number((1.2 + Math.sin(Date.now() / 800) * 0.5).toFixed(1)),
      roll: Number((-0.4 + Math.cos(Date.now() / 900) * 0.4).toFixed(1)),
      yaw: Number(s.position.headingDeg.toFixed(1)),
    };

    s.hardware.mqtt.messageCount += 1;
    s.hardware.raspberryPi5.cpuPercent = Math.min(90, Math.max(25, Math.round(40 + (Math.abs(s.speedMs) > 0 ? 15 : 0) + Math.sin(Date.now() / 2000) * 5)));
    s.hardware.raspberryPi5.tempC = Number((46 + s.hardware.raspberryPi5.cpuPercent * 0.1).toFixed(1));
    s.lastUpdated = timeStr;

    this.state = s;

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
      speedMs: s.speedMs,
    };
    this.history = [...this.history.slice(-59), historyPoint];

    this.notify();
  }

  private handleAutonomousBehavior(s: RobotState) {
    if (s.ultrasonic.distanceCm < 45) {
      if (s.movement !== 'turning_right' && s.movement !== 'turning_left') {
        s.movement = Math.random() > 0.5 ? 'turning_right' : 'turning_left';
        this.addLog('warn', `Obstacle detected at ${s.ultrasonic.distanceCm}cm — Autonomous avoidance turn initiated`, 'CONTROL');
      }
    } else if (s.activeWaypoint) {
      const dx = s.activeWaypoint.x - s.position.x;
      const dy = s.activeWaypoint.y - s.position.y;
      const distToWp = Math.hypot(dx, dy);
      if (distToWp < 0.25) {
        this.addLog('success', `Waypoint (${s.activeWaypoint.x.toFixed(1)}, ${s.activeWaypoint.y.toFixed(1)}) reached!`, 'CONTROL');
        s.activeWaypoint = null;
        s.movement = 'stopped';
      } else {
        const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const normTarget = (targetAngle + 360) % 360;
        const angleDiff = ((normTarget - s.position.headingDeg + 540) % 360) - 180;
        if (Math.abs(angleDiff) > 20) {
          s.movement = angleDiff > 0 ? 'turning_right' : 'turning_left';
        } else {
          s.movement = 'moving_forward';
        }
      }
    } else {
      if (s.movement === 'stopped' || Math.random() < 0.05) {
        s.movement = 'moving_forward';
      }
    }
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

    // Dispatch real REST API command to CyberTwin-AGV FastAPI Backend if live
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

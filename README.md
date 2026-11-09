<div align="center">
  <h1>🤖 CyberTwin-AGV (v1.3)</h1>
  <p><strong>An Edge-Based Cyber-Physical Digital Twin Framework for Autonomous Warehouse AGVs</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Version-1.3-00f0ff-00f0ff?style=for-the-badge&logo=react" alt="Version 1.3" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
    <img src="https://img.shields.io/badge/Platform-Raspberry%20Pi%205%20%2B%20ESP32-10b981?style=for-the-badge&logo=raspberrypi" alt="Hardware Platform" />
  </p>
</div>

---

## 📖 Overview

**CyberTwin-AGV** is a full-stack, edge-computed digital twin ecosystem designed for autonomous warehouse robotics and embedded systems monitoring. It seamlessly mirrors the real-time physical state of an Automated Guided Vehicle (AGV) into a live, high-density React Digital Twin web dashboard.

By leveraging an **ESP32** for low-level motor & sensor hardware control and a **Raspberry Pi 5** for edge processing, MQTT broker hosting, and digital twin orchestration, this framework demonstrates the core principles of modern Cyber-Physical Systems (CPS).

---

## 🚀 Key Features

- **Next-Gen Digital Twin Command Center**: Modern React + TypeScript + Vite + Tailwind CSS dashboard with dark mission-control styling.
- **Synchronized 2D Virtual Twin & SLAM Grid Arena**:
  - High-precision 2D CAD chassis visualization showing RPi 5, ESP32, L298N motor driver, drive wheels, HC-SR04 ultrasonic cone, rotating LiDAR radar sweep, MPU6050 IMU, INA219 power monitor, and battery pack.
  - Interactive 2D environment map with obstacle rendering, LiDAR raycasting, trajectory history, and **click-to-set waypoint navigation**.
- **Live Multi-Sensor Telemetry Stream**: Real-time graphs for HC-SR04 ultrasonic distance, 360° LiDAR scanning, MPU6050 6-DOF IMU (accel & gyro), and INA219 power delivery (V, I, P).
- **Tactical Teleoperation & E-Stop**: D-Pad control interface, active keyboard bindings (`WASD` / Arrow keys), throttle limit slider, and emergency stop button.
- **Embedded System Diagnostics & System Logs**: Health gauges for Raspberry Pi 5 (CPU %, RAM %, Temp °C), ESP32 RSSI & data rate, MQTT message statistics, and searchable system log feed.
- **Dual Telemetry Modes**: Auto-detects live FastAPI WebSocket telemetry streams (`ws://<host>:8000/ws/telemetry`) while seamlessly maintaining standalone high-fidelity simulation mode when disconnected.

---

## 🏗️ System Architecture

The ecosystem is divided into three distinct operational layers:

1. **The Edge Node (Raspberry Pi 5)**
   - Runs a **FastAPI** backend to orchestrate the digital twin state.
   - Hosts an **Eclipse Mosquitto** MQTT broker (`mqtt://localhost:1883`) for ultra-low latency messaging.
   - Manages an **SQLite** database (`twinware.db`) to log telemetry and mission data.
   - Uses **WebSockets** (`/ws/telemetry`) to stream live data instantly to connected client dashboards.
   - Containerized using **Docker** & **Docker Compose**.

2. **The Frontend Dashboard (React / TypeScript / Vite / Tailwind)**
   - High-density dark mission-control dashboard served directly from the Edge Node (`http://localhost:8000`).
   - Built with decoupled service abstraction (`telemetryService.ts`) for zero-refactor hardware integration.
   - One-click CSV Telemetry logging export.

3. **The Embedded Firmware (ESP32)**
   - C++ firmware configured via **PlatformIO**.
   - Handles motor control (PWM/DIR), encoder interrupts, and sensor polling.
   - Communicates with the Edge Node via UART/Wi-Fi sending odometry and receiving target velocity commands in **JSON** format.

---

## 📁 Repository Structure

```text
CyberTwin-AGV/
├── dashboard/               # React + TypeScript Digital Twin UI (Vite App)
│   ├── src/                 # React components, pages, context & telemetry engine
│   ├── package.json         # Dashboard dependencies
│   ├── vite.config.ts       # Vite bundler configuration
│   └── index.html           # Main HTML entry point
│
├── firmware/
│   └── esp32/               # ESP32 C++ Codebase (PlatformIO)
│       ├── platformio.ini   # Board config and dependencies (ArduinoJson)
│       └── src/main.cpp     # Motor control, UART parsing, and simulation loops
│
├── raspberry-pi/            # The Edge Node Stack (Dockerized)
│   ├── backend/             # FastAPI Server (WebSockets, REST Commands & DB)
│   │   ├── main.py          # WebSocket Manager & MQTT Background thread
│   │   └── requirements.txt # Python dependencies
│   ├── database/            # SQLite models (SQLAlchemy)
│   ├── mqtt/                # Mosquitto Broker configuration
│   ├── uart/                # Python UART-to-MQTT Bridge script
│   ├── docker-compose.yml   # Multi-container orchestration
│   └── Dockerfile           # Builds backend/bridge containers
│
└── documentation/           # Comprehensive project guides and PDFs
```

---

## 🚀 Getting Started

### 1. Running Local Frontend Dev Server
```bash
cd dashboard
npm install
npm run dev
```
Open browser at `http://localhost:5173`.

### 2. Running Full Edge Stack via Docker
```bash
cd dashboard && npm ci && npm run build && cd ..   # backend serves dashboard/dist
cd raspberry-pi
docker compose up -d --build
```
Open browser at `http://localhost:8000`.

---

## 📚 Documentation
For a deep dive into the system's architecture, work division, and precise deployment guides, please review:
- **[Complete Project Guide (PDF)](documentation/Complete_Project_Guide.pdf)**

## 🔒 Security Note
The default stack is for local/lab use (anonymous MQTT, open CORS). See [SECURITY.md](SECURITY.md) before exposing it to a network.

## 🤝 Contributing & License
See [CONTRIBUTING.md](CONTRIBUTING.md). Released under the [MIT License](LICENSE).

**Author:** [Santhosh-zeta](https://github.com/Santhosh-zeta)

---
*Built for the future of autonomous embedded systems & smart warehousing.*

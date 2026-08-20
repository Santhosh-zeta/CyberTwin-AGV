<div align="center">
  <h1>🤖 CyberTwin-AGV</h1>
  <p><strong>An Edge-Based Cyber-Physical Digital Twin Framework for Autonomous Warehouse AGVs</strong></p>
</div>

---

## 📖 Overview

**CyberTwin-AGV** is a full-stack, edge-computed digital twin ecosystem designed for autonomous warehouse robotics. It seamlessly mirrors the real-time physical state of an Automated Guided Vehicle (AGV) into a live web dashboard. 

By leveraging an **ESP32** for low-level embedded hardware control and a **Raspberry Pi 5** for edge processing and digital orchestration, this framework demonstrates the core principles of modern Cyber-Physical Systems (CPS).

---

## 🏗️ System Architecture

The ecosystem is divided into three distinct operational layers:

1. **The Edge Node (Raspberry Pi 5)**
   - Runs a **FastAPI** backend to orchestrate the digital twin state.
   - Hosts an **Eclipse Mosquitto** MQTT broker for ultra-low latency messaging.
   - Manages an **SQLite** database to log telemetry and mission data.
   - Uses **WebSockets** to stream live data instantly to connected clients.
   - Entirely containerized using **Docker** & **Docker Compose**.

2. **The Frontend Dashboard (HTML/JS/CSS)**
   - A premium, glassmorphism UI served directly from the Edge Node.
   - Features a 2D HTML5 `<canvas>` that renders the AGV's exact position and orientation in real-time.
   - Provides manual overrides, a D-Pad control system, and live telemetry gauges (Speed, Battery, Obstacles).

3. **The Embedded Firmware (ESP32)**
   - C++ firmware configured via **PlatformIO**.
   - Handles motor control (PWM/DIR), encoder interrupts, and sensor polling.
   - Communicates with the Edge Node via UART, sending odometry and receiving target velocity commands in **JSON** format.

---

## 📁 Repository Structure

```text
CyberTwin-AGV/
├── dashboard/               # Frontend Digital Twin UI
│   ├── index.html           # Layout and structure
│   ├── style.css            # Premium styling and animations
│   └── app.js               # WebSocket logic and Canvas rendering
│
├── firmware/
│   └── esp32/               # ESP32 C++ Codebase (PlatformIO)
│       ├── platformio.ini   # Board config and dependencies (ArduinoJson)
│       └── src/main.cpp     # Motor control, UART parsing, and simulation loops
│
├── raspberry-pi/            # The Edge Node Stack (Dockerized)
│   ├── backend/             # FastAPI Server
│   │   ├── main.py          # WebSocket Manager & MQTT Background thread
│   │   └── requirements.txt # Python dependencies
│   ├── database/            # SQLite models (SQLAlchemy)
│   ├── mqtt/                # Mosquitto Broker configuration
│   ├── uart/                # Python UART-to-MQTT Bridge script
│   ├── docker-compose.yml   # Multi-container orchestration
│   └── Dockerfile           # Builds the backend/bridge containers
│
└── documentation/           # Comprehensive project guides and PDFs
```

---

## 🚀 Getting Started (Local Simulation Mode)

You can run the entire software stack on your local laptop without the physical robot using the built-in simulation mode.

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine.

### Instructions
1. Clone this repository to your machine.
2. Open a terminal and navigate to the edge stack directory:
   ```bash
   cd raspberry-pi
   ```
3. Start the Docker containers:
   ```bash
   docker compose up -d --build
   ```
4. Open your web browser and navigate to:
   ```text
   http://localhost:8000
   ```
5. *You will see the Dashboard connect. Since no physical ESP32 is attached, the `serial_mqtt_bridge.py` will automatically enter Simulation Mode and generate mock telemetry to move the Digital Twin on your screen!*

---

## 🛠️ Hardware Deployment (Physical Robot)

Once the local simulation is verified, you can deploy to the physical hardware.

### 1. Flash the ESP32
1. Open the `firmware/esp32/` folder in VS Code with the **PlatformIO** extension.
2. Connect your ESP32 via USB and click **Upload**.

### 2. Prepare the Raspberry Pi
1. SSH into your Raspberry Pi.
2. Install Docker on the Pi:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
   ```
3. Transfer this repository to the Pi (via `scp` or `git clone`).

### 3. Connect and Launch
1. Plug the ESP32 into the Raspberry Pi's USB port.
2. Check the assigned port (e.g., `/dev/ttyUSB0`) and update the `SERIAL_PORT` variable in `raspberry-pi/docker-compose.yml`.
3. CD into `raspberry-pi` and run the docker stack:
   ```bash
   docker compose up -d --build
   ```
4. Access the dashboard from any device on the network: `http://<raspberry-pi-ip>:8000`.

---

## 📚 Documentation

For a deep dive into the system's architecture, work division, and precise deployment guides, please review the comprehensive PDF included in this repository:
- **[Complete Project Guide (PDF)](documentation/Complete_Project_Guide.pdf)**

---
*Built for the future of smart warehousing.*

# Project Status & Hardware Deployment Guide

## ✅ What Has Been Completed (Phase 1)

We have successfully completed all local software scaffolding and simulation setup for the CyberTwin-AGV project. Here is the current state of the repository:

1. **Edge Backend Server (`raspberry-pi/backend/`)**
   - Built a FastAPI server to manage the Digital Twin state.
   - Connected an SQLite database with SQLAlchemy to store telemetry records.
   - Integrated WebSockets and a background MQTT client (`paho-mqtt`) to broadcast real-time telemetry instantly without page reloads.
   - Configured FastAPI to serve the Frontend Dashboard directly, so everything runs from a single port (8000).

2. **MQTT Broker & Bridge (`raspberry-pi/uart/` & `mqtt/`)**
   - Added an Eclipse Mosquitto MQTT broker to the stack.
   - Developed `serial_mqtt_bridge.py`: a Python script that bridges the physical UART connection (to the ESP32) to the MQTT broker. It includes a built-in simulation mode that generates mock odometry data when the serial port isn't available.

3. **Digital Twin Web Dashboard (`dashboard/`)**
   - Designed a premium, glassmorphism-style UI using pure HTML/JS/CSS.
   - Features real-time telemetry gauges (Battery, Speed, Obstacles).
   - Features a live 2D HTML5 `<canvas>` rendering of the AGV's exact position and orientation based on live data.
   - Features a control pad that sends REST API commands to the backend, which are then pushed via MQTT down to the firmware.

4. **ESP32 Firmware Scaffold (`firmware/esp32/`)**
   - Set up a standard PlatformIO project.
   - Wrote `main.cpp` with UART initialization (115200 baud).
   - Implemented JSON parsing (via `ArduinoJson`) to read incoming target velocities, and JSON serialization to transmit odometry/telemetry back to the Pi.
   - Implemented a temporary simulation physics loop on the ESP32 so it can be tested independently of physical motors.

5. **Dockerization (`raspberry-pi/`)**
   - Created a complete `docker-compose.yml` and `Dockerfile` that packages the backend, the bridge, the MQTT broker, and mounts the dashboard into a unified, reproducible stack.

---

## 🚀 Exact Next Steps: Phase 2 (Hardware Deployment)

You are now ready to deploy this software stack onto your physical hardware. Follow these exact steps:

### Step 1: Flash the ESP32 Firmware
1. Open the `firmware/esp32/` folder in Visual Studio Code (ensure you have the **PlatformIO** extension installed).
2. Connect your ESP32 to your laptop via USB.
3. Click the PlatformIO "Upload" button (the right-arrow icon in the bottom taskbar). This will compile the C++ code and flash it to the microcontroller.
4. *Note: For the real physical robot, you will eventually replace the simulation logic in `main.cpp` with actual PWM `analogWrite()` commands to your motor drivers and interrupts for your encoders.*

### Step 2: Prepare the Raspberry Pi
1. Ensure the Raspberry Pi is running Ubuntu Server or Raspberry Pi OS and is connected to your Wi-Fi network.
2. SSH into your Raspberry Pi from your laptop:
   ```bash
   ssh <username>@<raspberry-pi-ip>
   ```
3. Install Docker on the Pi (if not already installed):
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```
   *(Log out and log back in for docker permissions to apply).*

### Step 3: Transfer the Code to the Pi
Since we need the `raspberry-pi` folder and the `dashboard` folder, transfer them using Secure Copy (`scp`) from your laptop's terminal:
```bash
scp -r "c:\Users\santh\OneDrive - vit.ac.in\Desktop\XXX\CyberTwin-AGV\raspberry-pi" <username>@<raspberry-pi-ip>:~/
scp -r "c:\Users\santh\OneDrive - vit.ac.in\Desktop\XXX\CyberTwin-AGV\dashboard" <username>@<raspberry-pi-ip>:~/
```
*(Alternatively, push the code to a GitHub repository and `git clone` it on the Pi).*

### Step 4: Hardware Connections
1. Plug the flashed ESP32 into the Raspberry Pi using a USB cable.
2. On the Pi (via SSH), check which serial port was assigned:
   ```bash
   ls /dev/ttyUSB*
   # or
   ls /dev/ttyACM*
   ```
3. Open `~/raspberry-pi/docker-compose.yml` on the Pi (using `nano` or `vim`).
4. Update the `SERIAL_PORT` environment variable under the `bridge` service to match the port you found (e.g., `/dev/ttyUSB0`).
5. Also, ensure the `devices` mapping in `docker-compose.yml` is uncommented and points to the correct port so the Docker container can access the physical USB port.

### Step 5: Launch the Stack on the Pi
1. On the Pi (via SSH), navigate to the folder:
   ```bash
   cd ~/raspberry-pi
   ```
2. Build and start the edge servers:
   ```bash
   docker compose up -d --build
   ```
3. **Verify**: Open a web browser on your laptop and go to:
   ```text
   http://<raspberry-pi-ip>:8000
   ```
   You should see the Digital Twin Dashboard. Use the D-Pad to send commands—these will travel via WebSockets -> FastAPI -> MQTT -> UART Bridge -> ESP32!

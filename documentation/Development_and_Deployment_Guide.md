# Development and Deployment Guide

This guide outlines our exact workflow. We will complete **Phase 1** entirely on your local laptop using simulation tools. Only when everything is working perfectly will we proceed to **Phase 2** (the physical Raspberry Pi).

---

## Phase 1: Local Development (Laptop)
*Goal: Build and test the complete software ecosystem (Backend, Frontend, and Embedded stubs) locally before touching the hardware.*

### ✅ Completed So Far
- Scaffolded the Edge Node backend (`raspberry-pi/backend`).
- Created the UART-to-MQTT python bridge with a built-in **simulation mode** (`raspberry-pi/uart`).
- Containerized the entire edge stack using Docker and Docker Compose.

### ⏳ Exact Next Steps (To Do Now)

We will execute these steps one by one on your laptop:

1. **Build the Web Dashboard (Frontend)**
   - Create a `dashboard/` folder.
   - Build the HTML/JS/CSS interface to display the AGV's live position (Digital Twin), battery status, and provide a control panel for missions.

2. **Enhance the FastAPI Backend**
   - Add **WebSocket** support to `backend/main.py`. The dashboard needs WebSockets to receive instant telemetry updates without constantly refreshing the page.

3. **Scaffold the ESP32 Firmware**
   - Create a `firmware/esp32/` folder.
   - Set up the basic C++ files (PlatformIO/Arduino) that will later be uploaded to the ESP32 to handle motors, encoders, and UART communication.

4. **Local End-to-End Simulation Testing**
   - Run `docker compose up -d` on your laptop.
   - The simulation mode will generate fake AGV telemetry.
   - We will open the Dashboard in your laptop's browser and ensure the Digital Twin moves based on the simulated data.

---

## Phase 2: Raspberry Pi Deployment
*Goal: Move the completed, tested software onto the physical hardware.*

Once Phase 1 is fully tested, follow these exact steps to deploy to the Raspberry Pi:

### Step 1: Prepare the Pi
1. Flash **Ubuntu Server OS** onto the Raspberry Pi's SD card.
2. Connect the Pi to your Wi-Fi network.
3. From your laptop, **SSH** into the Pi: 
   ```bash
   ssh username@<raspberry-pi-ip>
   ```
4. Install Docker on the Pi:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```
   *(Log out and log back in for docker permissions to apply).*

### Step 2: Transfer the Code
You can use `scp` (Secure Copy) to send the required folders from your laptop to the Pi, or push everything to GitHub and clone it on the Pi.

Using `scp` from your laptop terminal:
```bash
scp -r "c:\Users\santh\OneDrive - vit.ac.in\Desktop\XXX\CyberTwin-AGV\raspberry-pi" username@<raspberry-pi-ip>:~/
scp -r "c:\Users\santh\OneDrive - vit.ac.in\Desktop\XXX\CyberTwin-AGV\dashboard" username@<raspberry-pi-ip>:~/
```

### Step 3: Connect Hardware & Run
1. SSH into the Pi again.
2. Plug the ESP32 into the Pi via USB.
3. Check what port the ESP32 was assigned:
   ```bash
   ls /dev/ttyUSB*
   ```
   *(If it says `/dev/ttyACM0` instead, update the `SERIAL_PORT` variable inside your `docker-compose.yml` file).*
4. Navigate into the folder:
   ```bash
   cd ~/raspberry-pi
   ```
5. Start the edge servers:
   ```bash
   docker compose up -d --build
   ```
6. **Success!** You can now open a browser on your laptop and go to `http://<raspberry-pi-ip>:8000` to see the live Digital Twin communicating with the physical robot!

// Configuration
const WS_URL = `ws://${window.location.hostname}:8000/ws/telemetry`;
const API_URL = `http://${window.location.hostname}:8000`;

// DOM Elements
const connectionLed = document.getElementById('connection-led');
const connectionStatus = document.getElementById('connection-status');
const posX = document.getElementById('pos-x');
const posY = document.getElementById('pos-y');
const posTheta = document.getElementById('pos-theta');
const batteryVal = document.getElementById('battery-val');
const batteryFill = document.getElementById('battery-fill');
const speedVal = document.getElementById('speed-val');
const obstacleVal = document.getElementById('obstacle-val');
const canvas = document.getElementById('twinCanvas');
const ctx = canvas.getContext('2d');

// State
let agvState = {
    x: 0,
    y: 0,
    theta: 0,
    width: 60,
    length: 90
};

// --- WebSocket Setup ---
let ws;

function connectWebSocket() {
    connectionStatus.innerText = "Connecting...";
    connectionLed.className = "led";
    
    // Fallback to localhost if not served from a server
    const url = window.location.hostname === '' ? 'ws://localhost:8000/ws/telemetry' : WS_URL;
    
    ws = new WebSocket(url);

    ws.onopen = () => {
        connectionStatus.innerText = "Connected";
        connectionLed.className = "led connected";
        console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            updateDashboard(data);
        } catch (e) {
            console.error("Error parsing telemetry", e);
        }
    };

    ws.onclose = () => {
        connectionStatus.innerText = "Disconnected";
        connectionLed.className = "led disconnected";
        console.log("WebSocket disconnected. Retrying in 3s...");
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
    };
}

// --- Update UI ---
function updateDashboard(data) {
    // Update Text
    posX.innerText = data.x.toFixed(2);
    posY.innerText = data.y.toFixed(2);
    posTheta.innerText = data.theta.toFixed(1);
    
    speedVal.innerText = `${data.speed.toFixed(2)} m/s`;
    
    // Battery logic (Assuming 12V max, 10V min for percentage)
    const v = data.battery;
    batteryVal.innerText = `${v.toFixed(1)} V`;
    let pct = ((v - 10.0) / (12.6 - 10.0)) * 100;
    pct = Math.max(0, Math.min(100, pct)); // clamp 0-100
    batteryFill.style.width = `${pct}%`;
    
    if (pct > 50) batteryFill.style.backgroundColor = 'var(--success)';
    else if (pct > 20) batteryFill.style.backgroundColor = 'var(--warning)';
    else batteryFill.style.backgroundColor = 'var(--danger)';

    // Obstacle
    if (data.obstacle) {
        obstacleVal.innerText = "DETECTED";
        obstacleVal.className = "danger";
    } else {
        obstacleVal.innerText = "Clear";
        obstacleVal.className = "safe";
    }

    // Update Twin State
    // Assuming simulation sends x,y in meters. We map it to pixels.
    // Let's center it and scale it.
    agvState.x = data.x * 50; // 50 pixels per meter
    agvState.y = data.y * 50;
    agvState.theta = data.theta;
}

// --- Digital Twin Rendering ---
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 50; // 1 meter grid
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawAGV() {
    // We map AGV coordinate origin to the center of the canvas
    const cx = canvas.width / 2 + agvState.x;
    const cy = canvas.height / 2 - agvState.y; // Y goes up in real world, down in canvas
    
    ctx.save();
    ctx.translate(cx, cy);
    // Convert degrees to radians and adjust so 0 is up
    ctx.rotate((agvState.theta - 90) * Math.PI / 180);

    // Draw Body
    ctx.fillStyle = 'rgba(0, 210, 255, 0.2)';
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-agvState.width/2, -agvState.length/2, agvState.width, agvState.length, 10);
    ctx.fill();
    ctx.stroke();

    // Draw Front Indicator (Triangle)
    ctx.fillStyle = '#00d2ff';
    ctx.beginPath();
    ctx.moveTo(0, -agvState.length/2 - 10);
    ctx.lineTo(-10, -agvState.length/2 + 10);
    ctx.lineTo(10, -agvState.length/2 + 10);
    ctx.closePath();
    ctx.fill();

    // Draw Wheels
    ctx.fillStyle = '#333';
    ctx.fillRect(-agvState.width/2 - 5, -20, 10, 40); // Left wheel
    ctx.fillRect(agvState.width/2 - 5, -20, 10, 40);  // Right wheel

    ctx.restore();
}

function renderLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawAGV();
    requestAnimationFrame(renderLoop);
}

// --- Commands ---
async function sendCommand(cmd) {
    console.log(`Sending command: ${cmd}`);
    
    // Default velocities
    let lin = 0.0, ang = 0.0;
    if (cmd === 'FORWARD') lin = 0.5;
    if (cmd === 'BACKWARD') lin = -0.5;
    if (cmd === 'LEFT') ang = 1.0;
    if (cmd === 'RIGHT') ang = -1.0;
    
    const payload = {
        command: cmd,
        linear_velocity: lin,
        angular_velocity: ang
    };

    try {
        const url = window.location.hostname === '' ? 'http://localhost:8000/command' : `${API_URL}/command`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Command response:", data);
    } catch (e) {
        console.error("Failed to send command", e);
        // Visual feedback for failure could go here
    }
}

// Add keyboard controls
window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': case 'w': sendCommand('FORWARD'); break;
        case 'ArrowDown': case 's': sendCommand('BACKWARD'); break;
        case 'ArrowLeft': case 'a': sendCommand('LEFT'); break;
        case 'ArrowRight': case 'd': sendCommand('RIGHT'); break;
        case ' ': sendCommand('STOP'); break;
    }
});

// Init
window.onload = () => {
    // Handle canvas resizing for HDPI displays
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    window.addEventListener('resize', () => {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    });

    connectWebSocket();
    renderLoop();
};

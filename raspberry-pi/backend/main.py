import os
import json
import threading
import asyncio
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import paho.mqtt.client as mqtt
import paho.mqtt.publish as publish

# Try to import from database (if running from raspberry-pi dir)
# or from app.database (if running in Docker)
try:
    from database.models import Base, Telemetry, MissionLog
except ModuleNotFoundError:
    from app.database.models import Base, Telemetry, MissionLog

# Use an environment variable for the DB path, default to local SQLite file
DB_PATH = os.getenv("DB_PATH", "sqlite:///./twinware.db")
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))

engine = create_engine(DB_PATH, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()
mqtt_client = None
main_loop = None

# Background MQTT Thread
def on_mqtt_connect(client, userdata, flags, rc, properties=None):
    # Depending on paho-mqtt version, arguments might differ, we catch both signatures
    if rc == 0:
        print("Backend connected to MQTT broker")
        client.subscribe("agv/telemetry")
    else:
        print(f"Backend MQTT connection failed with code {rc}")

def on_mqtt_connect_v1(client, userdata, flags, rc):
    on_mqtt_connect(client, userdata, flags, rc, None)

def on_mqtt_message(client, userdata, msg):
    payload = msg.payload.decode()
    
    # Save to DB
    try:
        data = json.loads(payload)
        db = SessionLocal()
        new_telem = Telemetry(
            x=data.get("x", 0.0),
            y=data.get("y", 0.0),
            theta=data.get("theta", 0.0),
            speed=data.get("speed", 0.0),
            battery_voltage=data.get("battery", 0.0),
            obstacle_detected=data.get("obstacle", False)
        )
        db.add(new_telem)
        db.commit()
        db.close()
    except Exception as e:
        print(f"Failed to save telemetry to DB: {e}")

    # Broadcast to WebSockets safely from the sync thread to the async loop
    if main_loop:
        try:
            asyncio.run_coroutine_threadsafe(manager.broadcast(payload), main_loop)
        except Exception as e:
            print(f"Failed to broadcast websocket msg: {e}")

def mqtt_loop_in_thread(client):
    while True:
        try:
            client.connect(MQTT_BROKER, MQTT_PORT, 60)
            client.loop_forever()
        except Exception as e:
            print(f"MQTT Client Error: {e}. Reconnecting in 5s...")
            import time
            time.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global mqtt_client, main_loop
    main_loop = asyncio.get_running_loop()
    
    try:
        # paho-mqtt v2 initialization
        mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        mqtt_client.on_connect = on_mqtt_connect
    except AttributeError:
        # Fallback for paho-mqtt v1
        mqtt_client = mqtt.Client()
        mqtt_client.on_connect = on_mqtt_connect_v1
        
    mqtt_client.on_message = on_mqtt_message
    
    # Run the MQTT loop in a background thread to prevent blocking the event loop
    thread = threading.Thread(target=mqtt_loop_in_thread, args=(mqtt_client,), daemon=True)
    thread.start()
    
    yield
    
    if mqtt_client:
        mqtt_client.loop_stop()
        mqtt_client.disconnect()

app = FastAPI(title="TwinWare Digital Twin Backend", lifespan=lifespan)

# Add CORS Middleware so frontend can access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class CommandRequest(BaseModel):
    command: str
    linear_velocity: float = 0.0
    angular_velocity: float = 0.0



@app.get("/telemetry/latest")
def get_latest_telemetry(db: Session = Depends(get_db)):
    record = db.query(Telemetry).order_by(Telemetry.timestamp.desc()).first()
    if not record:
        return {"status": "no data"}
    return record

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect the client to send us data here, but we wait just in case
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/command")
def send_command(cmd: CommandRequest):
    payload = json.dumps({
        "command": cmd.command,
        "linear_velocity": cmd.linear_velocity,
        "angular_velocity": cmd.angular_velocity
    })
    
    try:
        publish.single("agv/commands", payload=payload, hostname=MQTT_BROKER, port=MQTT_PORT)
        return {"status": "success", "message": f"Command {cmd.command} dispatched"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

DASHBOARD_DIR = os.getenv("DASHBOARD_DIR", "/app/dashboard" if os.path.exists("/app/dashboard") else "../dashboard")

if os.path.exists(DASHBOARD_DIR):
    app.mount("/", StaticFiles(directory=DASHBOARD_DIR, html=True), name="dashboard")
else:
    @app.get("/")
    def read_root():
        return {"status": "online", "system": "TwinWare Digital Twin API", "warning": "Dashboard not found"}

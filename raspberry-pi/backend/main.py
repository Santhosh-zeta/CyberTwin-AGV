import os
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

# Try to import from database (if running from raspberry-pi dir)
# or from app.database (if running in Docker)
try:
    from database.models import Base, Telemetry, MissionLog
except ModuleNotFoundError:
    from app.database.models import Base, Telemetry, MissionLog

# Use an environment variable for the DB path, default to local SQLite file
DB_PATH = os.getenv("DB_PATH", "sqlite:///./twinware.db")

engine = create_engine(DB_PATH, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TwinWare Digital Twin Backend")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Request Models
class CommandRequest(BaseModel):
    command: str
    linear_velocity: float = 0.0
    angular_velocity: float = 0.0

@app.get("/")
def read_root():
    return {"status": "online", "system": "TwinWare Digital Twin API"}

@app.get("/telemetry/latest")
def get_latest_telemetry(db: Session = Depends(get_db)):
    record = db.query(Telemetry).order_by(Telemetry.timestamp.desc()).first()
    if not record:
        return {"status": "no data"}
    return record

@app.post("/command")
def send_command(cmd: CommandRequest):
    # In a real scenario, this endpoint would either publish directly to MQTT
    # or save the command to the database for a worker to pick up.
    # For now, we simulate success. We will build the MQTT bridge next.
    import paho.mqtt.publish as publish
    import json
    
    mqtt_broker = os.getenv("MQTT_BROKER", "localhost")
    payload = json.dumps({
        "command": cmd.command,
        "linear_velocity": cmd.linear_velocity,
        "angular_velocity": cmd.angular_velocity
    })
    
    try:
        publish.single("agv/commands", payload=payload, hostname=mqtt_broker)
        return {"status": "success", "message": f"Command {cmd.command} dispatched"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from sqlalchemy import Column, Integer, Float, Boolean, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Telemetry(Base):
    __tablename__ = "telemetry_logs"

    id = Column(Integer, primary_key=True, index=True)
    agv_id = Column(String, index=True)
    timestamp = Column(Float, index=True)
    x = Column(Float)
    y = Column(Float)
    theta = Column(Float)
    speed = Column(Float)
    left_rpm = Column(Integer)
    right_rpm = Column(Integer)
    battery = Column(Float)
    obstacle = Column(Boolean)

class MissionLog(Base):
    __tablename__ = "mission_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(String, index=True)
    start_time = Column(Float)
    end_time = Column(Float, nullable=True)
    status = Column(String) # e.g., IN_PROGRESS, COMPLETED, FAILED
    target_station = Column(String)

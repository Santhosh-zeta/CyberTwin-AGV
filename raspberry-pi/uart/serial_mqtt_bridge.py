import serial
import json
import time
import threading
import paho.mqtt.client as mqtt
import os

# Configuration from environment variables
SERIAL_PORT = os.getenv("SERIAL_PORT", "/dev/ttyUSB0")
BAUD_RATE = int(os.getenv("BAUD_RATE", "115200"))
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))

# Topics
TOPIC_TELEMETRY = "agv/telemetry"
TOPIC_COMMANDS = "agv/commands"

ser = None

def init_serial():
    global ser
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print(f"Connected to serial port {SERIAL_PORT} at {BAUD_RATE} baud.")
    except Exception as e:
        print(f"Failed to connect to serial port {SERIAL_PORT}: {e}")
        print("Running in simulation mode (no serial port).")
        ser = None

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker at {MQTT_BROKER} with result code {rc}")
    client.subscribe(TOPIC_COMMANDS)
    print(f"Subscribed to topic: {TOPIC_COMMANDS}")

def on_message(client, userdata, msg):
    print(f"Received command on {msg.topic}: {msg.payload.decode()}")
    if ser and ser.is_open:
        try:
            # Send the command JSON string over UART terminated by a newline
            command_str = msg.payload.decode().strip() + "\n"
            ser.write(command_str.encode('utf-8'))
            print("Command forwarded to ESP32.")
        except Exception as e:
            print(f"Error writing to serial: {e}")
    else:
        print("Serial not connected. Cannot forward command.")

def serial_read_loop(client):
    while True:
        if ser and ser.is_open:
            try:
                line = ser.readline().decode('utf-8').strip()
                if line:
                    try:
                        # Validate JSON
                        data = json.loads(line)
                        # Publish to MQTT
                        client.publish(TOPIC_TELEMETRY, json.dumps(data))
                        # print(f"Published telemetry: {data}")
                    except json.JSONDecodeError:
                        print(f"Received invalid JSON from serial: {line}")
            except Exception as e:
                print(f"Error reading from serial: {e}")
                time.sleep(1)
        else:
            # Simulation mode: mock telemetry every 1 second
            time.sleep(1)
            mock_telemetry = {
                "agv_id": "AGV01",
                "timestamp": time.time(),
                "x": 1.25,
                "y": 2.50,
                "theta": 90.0,
                "speed": 0.0,
                "left_rpm": 0,
                "right_rpm": 0,
                "battery": 11.4,
                "obstacle": False
            }
            client.publish(TOPIC_TELEMETRY, json.dumps(mock_telemetry))

if __name__ == "__main__":
    init_serial()
    
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    while True:
        try:
            client.connect(MQTT_BROKER, MQTT_PORT, 60)
            break
        except Exception as e:
            print(f"MQTT connection failed: {e}. Retrying in 5s...")
            time.sleep(5)
            
    client.loop_start()
    
    print("Starting serial read loop...")
    serial_read_loop(client)

#include <Arduino.h>
#include <ArduinoJson.h>

// --- Configuration & Stubs ---
#define BAUD_RATE 115200
#define TELEMETRY_INTERVAL 1000 // Send telemetry every 1000ms

// Motor Control Pins (Stubs)
const int PIN_MOTOR_L_PWM = 32;
const int PIN_MOTOR_L_DIR = 33;
const int PIN_MOTOR_R_PWM = 25;
const int PIN_MOTOR_R_DIR = 26;

// Encoder Pins (Stubs)
const int PIN_ENC_L_A = 27;
const int PIN_ENC_L_B = 14;
const int PIN_ENC_R_A = 12;
const int PIN_ENC_R_B = 13;

// --- State Variables ---
unsigned long lastTelemetryTime = 0;

// Fake Odometry for Phase 1 Simulation
float currentX = 0.0;
float currentY = 0.0;
float currentTheta = 90.0;
float currentSpeed = 0.0;

// Target velocities (from commanded JSON)
float targetLinearVelocity = 0.0;
float targetAngularVelocity = 0.0;

void setup() {
    // Initialize Serial (UART to Raspberry Pi)
    Serial.begin(BAUD_RATE);
    
    // Initialize Motor Pins
    pinMode(PIN_MOTOR_L_PWM, OUTPUT);
    pinMode(PIN_MOTOR_L_DIR, OUTPUT);
    pinMode(PIN_MOTOR_R_PWM, OUTPUT);
    pinMode(PIN_MOTOR_R_DIR, OUTPUT);
    
    // Initialize Encoder Pins
    pinMode(PIN_ENC_L_A, INPUT_PULLUP);
    pinMode(PIN_ENC_L_B, INPUT_PULLUP);
    pinMode(PIN_ENC_R_A, INPUT_PULLUP);
    pinMode(PIN_ENC_R_B, INPUT_PULLUP);
    
    // Give time for serial to initialize
    delay(100);
}

void handleCommand(const char* commandStr) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, commandStr);

    if (error) {
        // Serial.print(F("deserializeJson() failed: "));
        // Serial.println(error.f_str());
        return;
    }

    const char* cmd = doc["command"]; // e.g. "FORWARD", "STOP"
    targetLinearVelocity = doc["linear_velocity"] | 0.0f;
    targetAngularVelocity = doc["angular_velocity"] | 0.0f;
    
    // Execute command logically
    if (strcmp(cmd, "STOP") == 0) {
        targetLinearVelocity = 0.0;
        targetAngularVelocity = 0.0;
    }
}

void updateSimulation(float dt) {
    // In Phase 2, this will be replaced by actual PID control and encoder readings.
    // For now, simply apply target velocities to our fake state.
    
    currentSpeed = targetLinearVelocity;
    
    // Simple kinematics update
    currentTheta += targetAngularVelocity * dt * (180.0 / PI); // Convert rad/s to deg/s
    
    // Normalize theta to 0-360
    if (currentTheta >= 360.0) currentTheta -= 360.0;
    if (currentTheta < 0.0) currentTheta += 360.0;
    
    float thetaRad = currentTheta * (PI / 180.0);
    currentX += currentSpeed * cos(thetaRad) * dt;
    currentY += currentSpeed * sin(thetaRad) * dt;
}

void sendTelemetry() {
    StaticJsonDocument<256> doc;
    
    doc["agv_id"] = "AGV_ESP32";
    doc["timestamp"] = millis(); // We don't have RTC yet, use millis
    doc["x"] = currentX;
    doc["y"] = currentY;
    doc["theta"] = currentTheta;
    doc["speed"] = currentSpeed;
    doc["left_rpm"] = (targetLinearVelocity - targetAngularVelocity) * 10; // Mock calculation
    doc["right_rpm"] = (targetLinearVelocity + targetAngularVelocity) * 10;
    doc["battery"] = 12.1; // Mock battery voltage
    doc["obstacle"] = false;
    
    // Serialize to Serial
    serializeJson(doc, Serial);
    Serial.println(); // Send newline as delimiter for the Raspberry Pi
}

void loop() {
    unsigned long currentMillis = millis();
    
    // 1. Check for incoming commands from Raspberry Pi (UART)
    if (Serial.available()) {
        String inputStr = Serial.readStringUntil('\n');
        inputStr.trim();
        if (inputStr.length() > 0) {
            handleCommand(inputStr.c_str());
        }
    }
    
    // 2. Update physical state (or simulation state)
    float dt = (currentMillis - lastTelemetryTime) / 1000.0;
    
    // 3. Send telemetry at regular intervals
    if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL) {
        updateSimulation(dt);
        sendTelemetry();
        lastTelemetryTime = currentMillis;
    }
    
    // Small delay to prevent tight looping and yield to RTOS
    delay(10);
}

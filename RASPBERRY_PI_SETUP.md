# 🔌 Raspberry Pi Intelligent Sprinkling System Setup

This guide explains how to set up the software and hardware for your Intelligent Sprinkling System.

## System Architecture

1.  **Central Server (Node.js)**: Hosts the Dashboard and manages state (`server.js`).
2.  **Hardware Controller (Python)**: Runs on Raspberry Pi, reads sensors, controls pumps/servos, and talks to Server (`rpi_smart_sprinkler.py`).
3.  **Client (Browser)**: Visualizes data and sends commands.

---

## 🛠️ Step 1: Server Setup (PC or Pi)

1.  Navigate to the project directory:
    ```bash
    cd "d:\iot dashboard"
    ```
2.  Install Node.js dependencies:
    ```bash
    npm install
    # Ensures 'socket.io', 'express', 'cors', etc. are installed
    ```
3.  Start the Server:
    ```bash
    node server.js
    ```
    *Server runs on `http://localhost:3000`*

---

## 🍓 Step 2: Raspberry Pi Setup

### A. Prerequisites
Ensure your Pi is updated and I2C/GPIO are enabled.
```bash
sudo apt-get update
sudo apt-get upgrade
sudo raspi-config
# Enable I2C, SPI, GPIO, and Camera in Interface Options
```

### B. Python Configuration
The controller logic requires Python 3.

1.  **Install System Dependencies**:
    ```bash
    sudo apt-get install python3-pip python3-dev
    ```

2.  **Install Python Libraries**:
    ```bash
    pip3 install RPi.GPIO adafruit-circuitpython-ads1x15 Adafruit_DHT python-socketio[client] requests
    ```

### C. Deploy & Run Client
1.  Copy `rpi_smart_sprinkler.py` to your Raspberry Pi user folder (e.g., `/home/pi/`).
2.  **Edit the Configuration** in `rpi_smart_sprinkler.py`:
    ```python
    SERVER_URL = "http://YOUR_SERVER_IP:3000" # Update this!
    PLANT_ID = 5 # Match the plant you want to monitor
    ```
3.  **Run the Script**:
    ```bash
    python3 rpi_smart_sprinkler.py
    ```

---

## 🔌 Hardware Wiring Guide

### 1. Soil Moisture (Analog) via ADS1115
*   **VCC** -> 3.3V
*   **GND** -> GND
*   **OUT** -> ADS1115 A0
*   *ADS1115 to Pi*: VCC(3.3V), GND(GND), SDA(GPIO2), SCL(GPIO3)

### 2. DHT22 (Temp & Humidity)
*   **VCC** -> 3.3V
*   **GND** -> GND
*   **DATA** -> GPIO4

### 3. Servo (Robotic Arm)
*   **VCC** -> External 6V (Do NOT use Pi 5V)
*   **GND** -> Common Ground
*   **Signal** -> GPIO18

### 4. Water Pump (Relay)
*   **IN** -> GPIO23
*   **VCC** -> 5V
*   **GND** -> GND
*   *Pump Power* -> External Battery via Relay COM/NO

---

## 📷 Camera Streaming (Fixed)

To enable the live camera view in the dashboard (compatible with the `<img>` tag), we use a Python MJPEG streamer.

1.  **Transfer the Script**: Copy `rpi_camera.py` to your Pi.
2.  **Run the Streamer**:
    ```bash
    python3 rpi_camera.py
    ```
3.  **Configure Dashboard**:
    *   Go to **Dashboard Settings** (PC).
    *   Enter URL: `http://[YOUR-PI-IP]:8000/stream.mjpg`
    *   Click **Update Layout**.

    *Or use `mjpg-streamer` if preferred.*

2.  The dashboard will need to be configured to point to this stream URL (Currently set to look for `captures/live.jpg`). You may need to edit `app.js` or `index.html` if you use a direct video stream URL.

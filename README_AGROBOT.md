# 🌱 Agrobot Detection System - Setup Guide

Welcome to the **Intelligent Sprinkling & Agrobot System**. This guide will help you connect your hardware and run the software.

---

## 🏗️ 1. Hardware Setup (Wiring)
Refer to `wiring_manual.html` in this folder for the complete pinout table.

**Key Connections:**
*   **Raspberry Pi 4**: Main Controller
*   **Motor Driver (L298N)**: Controls Chassis Movement (GPIO 5, 6, 13, 19).
*   **Robotic Arm (Servos)**: Base (GPIO 18), Shoulder (GPIO 27), Elbow (GPIO 22).
*   **Relays**: Water Pump (GPIO 23), Weedicide Spray (GPIO 24).
*   **Camera**: Pi Camera or USB Webcam connected to Pi USB.

---

## 💻 2. Running the Dashboard (Server PC)
1.  Navigate to this folder.
2.  Double-click **`START_AGROBOT.bat`**.
3.  A black window (terminal) will open, and your browser should launch `http://localhost:3002`.
4.  Login with any username/password (Register if new).

---

## 🍓 3. Running the Robot Brain (Raspberry Pi)
Requires Python 3 installed on the Raspberry Pi.

1.  **Transfer Files**: Copy the following files to your Raspberry Pi:
    *   `rpi_smart_sprinkler.py`
    *   `weed_model.tflite` (If you have your trained model)
    *   `disease_model.tflite` (If you have your trained model)

2.  **Configure IP**:
    *   Find your PC's IP Address (Open CMD on PC, type `ipconfig`, look for IPv4 Address, e.g., `192.168.1.5`).
    *   Open `rpi_smart_sprinkler.py` on the Pi.
    *   Edit Line 9:
        ```python
        SERVER_URL = "http://192.168.1.5:3002"  # <-- Replace with YOUR PC's IP
        ```

3.  **Install Dependencies** (On Pi Terminal):
    ```bash
    pip3 install python-socketio[client] opencv-python RPi.GPIO adafruit-circuitpython-dht
    # If using AI models:
    pip3 install tflite-runtime
    ```

4.  **Start the Robot**:
    ```bash
    python3 rpi_smart_sprinkler.py
    ```

---

## 🎮 4. How to Use
1.  **Dashboard Home**: Check System Status ("Active", "Scanning", or "Spraying").
2.  **Live Activity**: Watch the live camera feed from the robot.
3.  **Robot Control**:
    *   Use **Arrow Keys** (Up/Down/Left/Right) to drive the chassis.
    *   Use **Sliders** to move the Robotic Arm.
    *   **Toggle "Plant & Disease Monitor"**: The robot will scan for diseases and spray/water automatically.
    *   **Toggle "Weed Detection"**: The robot will hunt for weeds and spray herbicide.

---
**Status**: Ready for Deployment 🚀

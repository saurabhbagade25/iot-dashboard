# AgroBot Dashboard - Flask Version

## ✨ What Changed?

The entire backend has been **migrated from Node.js to Flask (Python)**! This consolidates everything into a single technology stack.

### Key Changes:
- ✅ **Removed**: `server.js`, `package.json`, Node.js dependencies
- ✅ **New**: Fully-featured Flask server with Flask-SocketIO
- ✅ **All Features Migrated**:
  - Real-time WebSocket communication (Socket.IO)
  - SQLite database operations
  - User authentication (login/register)
  - Activity logs and system settings
  - Camera streaming with AI detection
  - Static file serving for dashboard

## 📋 Requirements

- **Python 3.8+**
- **Required Libraries**: See `requirements.txt`

## 🚀 Quick Start

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Server
**Option A - Use the Batch File (Windows):**
```bash
START_AGROBOT.bat
```

**Option B - Run Manually:**
```bash
python app.py
```

### 3. Access the Dashboard
Open your browser and navigate to:
```
http://localhost:3002
```

**Default Login:**
- Username: `admin`
- Password: `admin`

## 📁 Project Structure

```
project_clone/
├── app.py                  # 🆕 Main Flask server (replaces server.js)
├── requirements.txt        # 🆕 Python dependencies
├── START_AGROBOT.bat      # 🆕 Updated to run Flask
├── database/
│   └── farm.db            # SQLite database (auto-created)
├── public/
│   ├── index.html         # Dashboard frontend
│   ├── css/               # Stylesheets
│   ├── js/                # Frontend JavaScript
│   └── history.csv        # Sensor data log
├── esp32_cam/             # ESP32-CAM Arduino sketch
└── rasp_pi/               # Raspberry Pi Python scripts
```

## 🔌 ESP32-CAM Setup

1. Open `esp32_cam/esp32_cam.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* station_ssid = "YOUR_WIFI_NAME";
   const char* station_password = "YOUR_WIFI_PASSWORD";
   ```
3. Upload to ESP32-CAM
4. Note the IP address from Serial Monitor
5. Update `app.py` line 37 with your ESP32 IP:
   ```python
   CAM_URL = "http://YOUR_ESP32_IP/stream"
   ```

## 🌐 API Endpoints

All endpoints remain the same for frontend compatibility:

- `GET /` - Dashboard homepage
- `GET /video` - AI-processed camera stream
- `GET /api/settings` - Get system settings
- `POST /api/settings` - Update settings
- `GET /api/logs` - Get activity logs
- `POST /api/logs` - Add new log entry
- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `POST /command` - Send robot commands

## 📡 WebSocket Events

**Client → Server:**
- `sensor_data` - Raspberry Pi sensor readings
- `camera_frame` - Camera frame from RPi
- `control_command` - Control commands from dashboard

**Server → Client:**
- `update_one` - Single plant status update
- `new_log` - New system log entry
- `control_signal` - Relay commands to Raspberry Pi
- `stream_frame` - Camera frames to dashboard

## 🔧 Features

### ✅ Fully Working
- Real-time dashboard with glassmorphism UI
- Live camera feed with AI detection (YOLO)
- WebSocket communication for real-time updates
- SQLite database for logs, settings, users
- Robot control interface
- Robotic arm control
- Component management
- Multi-language support (English/Marathi)
- CSV data logging

### 🎯 AI Detection
- Automatic YOLO model loading
- Fallback to simulation if camera unavailable
- Plant and weed detection support

## 💡 Troubleshooting

### Port 3002 already in use
```bash
# Find and kill the process using port 3002
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### Dependencies installation fails
Try installing one by one:
```bash
pip install flask flask-socketio flask-cors
pip install opencv-python numpy
pip install ultralytics  # Optional (AI detection)
```

### Camera stream not showing
1. Check ESP32-CAM IP is correct in `app.py`
2. Verify ESP32 is on the same network
3. Test stream directly: `http://YOUR_ESP32_IP/stream`

## 🎨 Dashboard Features

- **Home**: System overview, metrics, weather
- **Live Activity**: Real-time field monitoring
- **Robot Control**: Manual control, AI mode, spray system
- **Components**: System status, robotic arm, sensors
- **Activity**: System logs and history
- **Analytics**: CSV data visualization

## 🚨 Important Notes

- The old Node.js files (`server.js`, `package.json`) are no longer needed
- Database location: `database/farm.db`
- Session data stored in browser localStorage
- All Python dependencies are in `requirements.txt`

## 📞 Support

For issues or questions, check:
1. Python and pip are installed
2. All dependencies are installed
3. Port 3002 is available
4. ESP32-CAM IP is correct

---

**Made with 🌱 by Team AgroSense**

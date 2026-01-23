import time
import os
import sys
import sqlite3
from datetime import datetime
import base64
from pathlib import Path

# -------------------------------------------------------------------------
# ROBUST IMPORT LOADING
# -------------------------------------------------------------------------
print("🔄 Initializing AgroBot AI Server...")

try:
    from flask import Flask, Response, request, jsonify, send_from_directory
    from flask_socketio import SocketIO, emit
    from flask_cors import CORS
except ImportError:
    print("❌ Critical: Flask dependencies not installed.")
    print("Run: pip install flask flask-socketio flask-cors python-socketio")
    sys.exit(1)

# Optional Imports (Simulation Fallback if missing)
try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
    print("✅ OpenCV & Numpy Loaded")
except ImportError as e:
    CV2_AVAILABLE = False
    print(f"⚠️ OpenCV/Numpy not found ({e}). Video will be Simulation only.")

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
    print("✅ YOLO Loaded")
except Exception as e:
    YOLO_AVAILABLE = False
    print(f"⚠️ YOLO not available ({type(e).__name__}). Object detection disabled.")

# -------------------------------------------------------------------------
# CONFIGURATION
# -------------------------------------------------------------------------
CAM_URL = "http://10.207.99.239/stream" 
ESP32_IP = "http://10.207.99.239" 
MODEL_PATH = "best.pt"
FRAME_W, FRAME_H = 640, 480
PORT = 5000
last_received_frame = None  # Global buffer for Socket.IO frames

# -------------------------------------------------------------------------
# FLASK & SOCKETIO SETUP
# -------------------------------------------------------------------------
app = Flask(__name__, static_folder='public', static_url_path='')
app.config['SECRET_KEY'] = 'agrobot_secret_key_2024'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# -------------------------------------------------------------------------
# DATABASE SETUP
# -------------------------------------------------------------------------
DB_PATH = Path(__file__).parent / 'database' / 'farm.db'
DB_PATH.parent.mkdir(exist_ok=True)

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db()
    c = conn.cursor()
    
    # Settings table
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
    )''')
    
    # Activity logs table
    c.execute('''CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        message TEXT,
        type TEXT
    )''')
    
    # Plants table
    c.execute('''CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bed_id INTEGER,
        plant_id INTEGER,
        moisture REAL,
        disease TEXT,
        status TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(bed_id, plant_id)
    )''')
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )''')
    
    # Seed default settings
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", ("beds", "2"))
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", ("plants_per_bed", "6"))
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", ("plant_size", "28"))
    
    # Seed default admin
    c.execute("INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin')")
    
    conn.commit()
    conn.close()
    print("✅ Database initialized")

# Initialize database on startup
init_db()

# -------------------------------------------------------------------------
# AI MODEL LOADER
# -------------------------------------------------------------------------
model = None
if YOLO_AVAILABLE:
    try:
        model_name = MODEL_PATH if os.path.exists(MODEL_PATH) else "yolov8n.pt"
        model = YOLO(model_name)
        print(f"✅ Loaded Model: {model_name}")
    except Exception as e:
        print(f"⚠️ Failed to load YOLO: {e}")
        model = None

# Global Status
status = { "mode": "Idle", "detection": "None", "pump": "OFF" }
cap = None

# -------------------------------------------------------------------------
# CAMERA STREAMING LOGIC
# -------------------------------------------------------------------------
def get_camera():
    """Lazy camera initialization"""
    global cap
    if CV2_AVAILABLE and (cap is None or not cap.isOpened()):
        cap = cv2.VideoCapture(CAM_URL)
    return cap

def generate_frames():
    global cap
    
    # Initialize camera lazily
    if cap is None:
        get_camera()
    
    # SIMULATION VARIABLES
    sim_x = 0
    sim_dir = 5
    
    while True:
        frame = None
        
        # 0. PRIO: SOCKET.IO STREAM (From RPi)
        if last_received_frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + last_received_frame + b'\r\n')
            time.sleep(0.04) # ~25fps
            continue

        # 1. TRY REAL CAMERA (If OpenCV is available)
        if CV2_AVAILABLE:
            if not cap.isOpened():
                cap.open(CAM_URL)
            
            success, read_frame = cap.read()
            if success:
                frame = cv2.resize(read_frame, (FRAME_W, FRAME_H))
        
        # 2. GENERATE SIMULATION (If real cam failed or no OpenCV)
        if frame is None:
            if CV2_AVAILABLE:
                # Generate Synthetic Frame with Numpy
                frame = np.zeros((FRAME_H, FRAME_W, 3), dtype=np.uint8)
                cv2.rectangle(frame, (0,0), (FRAME_W, FRAME_H), (30,30,30), -1)
                
                # Sim Text
                cv2.putText(frame, "SIMULATION MODE", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
                cv2.putText(frame, "Waiting for ESP32...", (20, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (100, 100, 200), 1)

                # Sim Object
                sim_x += sim_dir
                if sim_x > FRAME_W or sim_x < 0: sim_dir *= -1
                cv2.circle(frame, (sim_x, 240), 25, (0, 200, 0), -1)
                cv2.putText(frame, "Target", (sim_x-20, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
                
                # Throttle simulation to ~30fps
                time.sleep(0.03)
            else:
                # NO OPENCV: Return a simple MJPEG of a static bytes (Fallback-Fallback)
                time.sleep(1)
                continue

        # 3. AI DETECTION (Local Server Logic - Optional if RPi does it)
        # Only run if we generated a local frame and have model
        if model and frame is not None and not last_received_frame:
            try:
                results = model(frame, conf=0.5, verbose=False)
                for r in results:
                    for box in r.boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        label = model.names[int(box.cls[0])]
                        status["detection"] = label
                        status["mode"] = "Targeting"
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            except Exception:
                pass 

        # 4. ENCODE & YIELD (For local frames)
        if CV2_AVAILABLE and frame is not None:
            ret, buffer = cv2.imencode('.jpg', frame)
            if ret:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

# -------------------------------------------------------------------------
# ROUTES - Static Files
# -------------------------------------------------------------------------
@app.route("/")
def index():
    return send_from_directory('public', 'index.html')

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory('public', path)

# -------------------------------------------------------------------------
# ROUTES - API Endpoints
# -------------------------------------------------------------------------
@app.route("/video")
@app.route("/video_feed")
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/status")
def get_status():
    return jsonify(status)

# Settings API
@app.route("/api/settings", methods=['GET'])
def get_settings():
    conn = get_db()
    rows = conn.execute("SELECT key, value FROM settings").fetchall()
    conn.close()
    
    settings = {row['key']: row['value'] for row in rows}
    return jsonify({"message": "success", "data": settings})

@app.route("/api/settings", methods=['POST'])
def update_settings():
    data = request.json
    key = data.get('key')
    value = data.get('value')
    
    conn = get_db()
    conn.execute("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?", 
                 (key, value, value))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "success", "data": {key: value}})

# Logs API
@app.route("/api/logs", methods=['GET'])
def get_logs():
    conn = get_db()
    rows = conn.execute("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 20").fetchall()
    conn.close()
    
    logs = [dict(row) for row in rows]
    return jsonify({"message": "success", "data": logs})

@app.route("/api/logs", methods=['POST'])
def add_log():
    data = request.json
    message = data.get('message')
    log_type = data.get('type', 'info')
    
    conn = get_db()
    cursor = conn.execute("INSERT INTO activity_logs (message, type) VALUES (?, ?)", (message, log_type))
    log_id = cursor.lastrowid
    conn.commit()
    
    # Get timestamp
    timestamp = conn.execute("SELECT timestamp FROM activity_logs WHERE id = ?", (log_id,)).fetchone()
    conn.close()
    
    # Broadcast to all connected clients via SocketIO
    socketio.emit('new_log', {
        'id': log_id,
        'message': message,
        'type': log_type,
        'timestamp': timestamp[0] if timestamp else str(datetime.now())
    })
    
    return jsonify({"message": "success", "id": log_id})

# Plant Data API
@app.route("/api/plant/<int:bed_id>/<int:plant_id>", methods=['GET'])
def get_plant(bed_id, plant_id):
    conn = get_db()
    plant = conn.execute("SELECT * FROM plants WHERE bed_id = ? AND plant_id = ?", 
                         (bed_id, plant_id)).fetchone()
    conn.close()
    
    if plant:
        return jsonify({"message": "success", "data": dict(plant)})
    return jsonify({"message": "success", "data": {}})

# Auth Routes
@app.route("/api/login", methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username = ? AND password = ?", 
                        (username, password)).fetchone()
    conn.close()
    
    if user:
        return jsonify({"message": "success", "user": {"id": user['id'], "username": user['username']}})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route("/api/register", methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db()
    
    # Check if user exists
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"message": "User already exists"}), 400
    
    # Insert new user
    cursor = conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({"message": "success", "userId": user_id})

@app.route("/command", methods=["POST"])
def command():
    data = request.json
    print(f"Command received: {data}")
    # Broadcast command to connected clients
    socketio.emit('control_signal', data)
    return jsonify({"success": True, "message": "Command Received"})

# -------------------------------------------------------------------------
# SOCKETIO EVENT HANDLERS
# -------------------------------------------------------------------------
@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')

@socketio.on('sensor_data')
def handle_sensor_data(data):
    """Handle sensor data from Raspberry Pi"""
    print(f"Sensor data received: {data}")
    
    # Relay to all clients
    socketio.emit('update_one', {
        'id': f"b0-p{data.get('plant', 0)}",
        **data
    })
    
    # Log to CSV
    csv_path = Path(__file__).parent / 'public' / 'history.csv'
    now = datetime.now().isoformat().replace('T', ' ')[:19]
    csv_line = f"{now},{data.get('moisture', 0)},{data.get('temp', 0)},{data.get('humidity', 0)}\n"
    
    # Create CSV with header if it doesn't exist
    if not csv_path.exists():
        csv_path.write_text("Timestamp,Moisture,Temperature,Humidity\n")
    
    # Append data
    with open(csv_path, 'a') as f:
        f.write(csv_line)

@socketio.on('camera_frame')
def handle_camera_frame(base64_data):
    """Handle camera frames from Raspberry Pi"""
    global last_received_frame
    try:
        # Decode and store for MJPEG stream
        last_received_frame = base64.b64decode(base64_data)
        
        # Relay to dashboard (Optional, keeping as per original design for flexibility)
        socketio.emit('stream_frame', base64_data, broadcast=True, include_self=False)
    except Exception as e:
        print(f"Error processing frame: {e}")

@socketio.on('control_command')
def handle_control_command(data):
    """Handle control commands from dashboard"""
    print(f"Control command: {data}")
    # Relay to Raspberry Pi
    socketio.emit('control_signal', data)

# -------------------------------------------------------------------------
# MAIN
# -------------------------------------------------------------------------
if __name__ == "__main__":
    print(f"🚀 AgroBot Server Running on Port {PORT}")
    print(f"📡 Dashboard: http://localhost:{PORT}")
    print(f"📹 Video Stream: http://localhost:{PORT}/video")
    socketio.run(app, host="0.0.0.0", port=PORT, debug=False, allow_unsafe_werkzeug=True)

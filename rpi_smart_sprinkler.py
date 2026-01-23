import time
import json
import random
import socketio
import threading
import base64

# --- CONFIGURATION ---
# IMPORTANT: When running on Raspberry Pi, replace 'localhost' with your PC's IP Address (e.g., "http://192.168.1.10:3002")
SERVER_URL = "http://localhost:5000" 
PLANT_ID = 5 # As per user spec
UPDATE_INTERVAL = 2 # Seconds (Sensors)
CAMERA_FPS = 5 # Target FPS for streaming

# --- HARDWARE PINS ---
# --- HARDWARE PINS ---
PIN_DHT = 4        # GPIO4
PIN_RELAY_WATER = 23   # GPIO23 (Main Water/Crop Spray)
PIN_RELAY_WEED = 24    # GPIO24 (Weedicide Spray) - NEW

# Robotic Arm Servos (3 Degrees of Freedom)
PIN_SERVO_BASE = 18    # GPIO18 (Base Rotation)
PIN_SERVO_SHOULDER = 27 # GPIO27 (Arm Lift)
PIN_SERVO_ELBOW = 22   # GPIO22 (Arm Reach)

# Motor Driver (L298N)
PIN_IN1 = 5  # Left Fwd
PIN_IN2 = 6  # Left Rev
PIN_IN3 = 13 # Right Fwd
PIN_IN4 = 19 # Right Rev

# --- I2C ADDRESS ---
ADS_ADDR = 0x48

# --- LIBRARIES ---
try:
    import RPi.GPIO as GPIO
    import Adafruit_DHT
    import board
    import busio
    import adafruit_ads1x15.ads1115 as ADS
    from adafruit_ads1x15.analog_in import AnalogIn
    import cv2 
    import numpy as np # Added for AI processing
    HARDWARE_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Hardware libraries not found ({e}). Running in SEMI-SIMULATION mode.")
    HARDWARE_AVAILABLE = False
    
    # Mock GPIO
    class MockGPIO:
        BCM = 'BCM'
        OUT = 'OUT'
        HIGH = 'HIGH'
        LOW = 'LOW'
        def setmode(self, mode): pass
        def setup(self, pin, mode): pass
        def output(self, pin, state): pass
        def cleanup(self): pass
        def PWM(self, pin, freq): return MockPWM()
    class MockPWM:
        def start(self, dc): pass
        def ChangeDutyCycle(self, dc): pass
    GPIO = MockGPIO()
    
    # Try importing OpenCV again for Windows
    try:
        import cv2
        print("📷 OpenCV loaded for Simulation Mode.")
    except ImportError:
        # True Mock Camera
        class MockCV2:
            def VideoCapture(self, idx): return self
            def isOpened(self): return True
            def read(self): 
                # Create a dummy image (noise)
                dummy = np.random.randint(0, 255, (240, 320, 3), dtype=np.uint8)
                return True, dummy
            def imencode(self, fmt, frame): 
                # Return a valid 1x1 pixel grey jpg header (minimal) or just rely on fake
                # But better: just use cv2 if possible.
                # Since we failed importing cv2, we can't really encode to jpg easily without it or PIL.
                # Let's send a fixed hardcoded tiny header for a black image if needed,
                # BUT 'np' might be available.
                return False, None # Fail encoding if no cv2
            def resize(self, frame, dim, interpolation): return frame
            def destroyAllWindows(self): pass
            def waitKey(self, delay): pass
            def cvtColor(self, src, code): return src
            def inRange(self, src, lower, upper): return np.zeros((100,100))
            COLOR_BGR2HSV = 40
            INTER_AREA = 1
            IMWRITE_JPEG_QUALITY = 1
        
        cv2 = MockCV2()
        print("⚠️ OpenCV missing. Video stream will be disabled in output.")
    
    if 'np' not in locals():
        import numpy as np

# --- SOCKET.IO CLIENT ---
sio = socketio.Client(logger=True, engineio_logger=True)

# --- STATE ---
pump_water_state = "OFF"
pump_weed_state = "OFF"
# Servo Angles
servo_angles = {"base": 90, "shoulder": 90, "elbow": 90}

video_running = True
pwm_servos = {} # Dict to hold PWM instances

# --- SETUP HARDWARE ---
def setup_hardware():
    global i2c, ads, chan, cap, pwm_servos
    
    # Camera Setup
    try:
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
        cap.set(cv2.CAP_PROP_FPS, 10)
    except:
        print("Camera Open Failed")
        cap = None

    if not HARDWARE_AVAILABLE: return

    # GPIO Setup
    GPIO.setmode(GPIO.BCM)
    
    # Relays
    GPIO.setup(PIN_RELAY_WATER, GPIO.OUT)
    GPIO.setup(PIN_RELAY_WEED, GPIO.OUT)
    GPIO.output(PIN_RELAY_WATER, GPIO.LOW)
    GPIO.output(PIN_RELAY_WEED, GPIO.LOW)

    # Motor Pins
    for p in [PIN_IN1, PIN_IN2, PIN_IN3, PIN_IN4]:
        GPIO.setup(p, GPIO.OUT)
        GPIO.output(p, GPIO.LOW)

    # Servo Pins
    servo_pins = {"base": PIN_SERVO_BASE, "shoulder": PIN_SERVO_SHOULDER, "elbow": PIN_SERVO_ELBOW}
    for name, pin in servo_pins.items():
        GPIO.setup(pin, GPIO.OUT)
        pwm = GPIO.PWM(pin, 50) # 50Hz
        pwm.start(7.5) # Center 90
        pwm_servos[name] = pwm

    # I2C / ADC Setup
    try:
        i2c = busio.I2C(board.SCL, board.SDA)
        ads = ADS.ADS1115(i2c)
        chan = AnalogIn(ads, ADS.P0) 
    except Exception as e:
        print("Error initializing I2C/ADC:", e)

def set_pump(type, state):
    global pump_water_state, pump_weed_state
    
    pin = PIN_RELAY_WATER if type == "water" else PIN_RELAY_WEED
    
    if type == "water": pump_water_state = state
    else: pump_weed_state = state
    
    print(f"💧 {type.upper()} Pump turned {state}")
    
    if HARDWARE_AVAILABLE:
        level = GPIO.HIGH if state == "ON" else GPIO.LOW
        GPIO.output(pin, level)

def set_servo(name, angle):
    global servo_angles
    if name not in servo_angles: return
    
    servo_angles[name] = angle
    # print(f"🤖 Servo {name} moved to {angle}°")

    if HARDWARE_AVAILABLE and name in pwm_servos:
        # Map 0-180 to Duty Cycle 2.5 - 12.5
        duty = 2.5 + (angle / 18.0)
        pwm_servos[name].ChangeDutyCycle(duty)
        # We don't sleep/stop here to allow smooth simultaneous moves if needed, 
        # but in loop we might want to detach to save jitter.
        
# --- ESP32 INTEGRATION ---
ESP32_IP = "10.207.99.90"
try:
    import requests
except ImportError:
    requests = None
    print("⚠️ 'requests' module not found. Using 'urllib' fallback.")

def set_motors(left_speed, right_speed):
    print(f"🚜 Motors: L={left_speed}, R={right_speed}")
    
    cmd = "stop"
    if left_speed > 0 and right_speed > 0: cmd = "forward"
    elif left_speed < 0 and right_speed < 0: cmd = "backward"
    elif left_speed < 0 and right_speed > 0: cmd = "left"
    elif left_speed > 0 and right_speed < 0: cmd = "right"
    else: cmd = "stop"

    url = f"http://{ESP32_IP}/{cmd}"

    try:
        if requests:
            # Use requests if available
            try:
                requests.get(url, timeout=0.2)
            except requests.exceptions.Timeout:
                pass 
            except requests.exceptions.RequestException as e:
                print(f"⚠️ ESP32 Connection Error: {e}")
        else:
            # Fallback to urllib
            import urllib.request
            try:
                with urllib.request.urlopen(url, timeout=0.2):
                    pass
            except Exception:
                pass # Ignore timeouts/errors in fast loop
            
    except Exception as e:
        print(f"Motor Error: {e}")

# --- SENSOR READING ---
def read_sensors():
    # (Same as before)
    if not HARDWARE_AVAILABLE:
        return random.randint(30, 80), 25 + random.uniform(-2, 2), 60 + random.uniform(-5, 5)
    
    try:
        raw = chan.value
        moisture = 100 - ((raw - 10000) / (26000 - 10000) * 100)
        moisture = max(0, min(100, moisture))
    except: moisture = 0
    
    try:
        hum, temp = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, PIN_DHT)
        if hum is None: hum = 0; temp = 0
    except: hum, temp = 0, 0
    
    return round(moisture, 1), round(temp, 1), round(hum, 1)

# --- DUAL AI MODEL CLASS ---
class DualAI_Processor:
    def __init__(self):
        self.weed_interpreter = self.load_model("weed_model.tflite")
        self.disease_interpreter = self.load_model("disease_model.tflite")
        self.active_mode = "WEED" # Default Mode
        
        self.last_result = "NONE"
        self.confidence = 0

    def load_model(self, path):
        try:
            import tflite_runtime.interpreter as tflite
            interpreter = tflite.Interpreter(model_path=path)
            interpreter.allocate_tensors()
            print(f"🧠 Loaded Model: {path}")
            return interpreter
        except:
            print(f"⚠️ Model {path} missing. Using Mock.")
            return None

    def set_mode(self, mode):
        self.active_mode = mode
        print(f"🔄 AI Switched to: {mode} ONLY")

    def predict(self, interpreter, img):
        if interpreter is None: return None
        # (Same preload logic)
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        h, w = input_details[0]['shape'][1], input_details[0]['shape'][2]
        img_resized = cv2.resize(img, (w, h))
        if input_details[0]['shape'][3] == 3: img_resized = img_resized.astype(np.float32) / 255.0
        input_data = np.expand_dims(img_resized, axis=0)
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        return interpreter.get_tensor(output_details[0]['index'])[0]

    def process_frame(self, frame):
        if frame is None: return "NONE", 0, [0,0,0,0]
        
        bbox = [0,0,0,0]
        detection = "NONE"
        conf = 0

        # --- EXCLUSIVE MODE LOGIC ---
        
        # MODE 1: WEED ONLY
        if self.active_mode == "WEED":
            weed_out = self.predict(self.weed_interpreter, frame)
            
            if weed_out is not None:
                # Assuming output [0=NotWeed, 1=Weed]
                if weed_out[1] > 0.6: 
                    detection = "WEED"
                    conf = int(weed_out[1] * 100)
                    bbox = [random.randint(50, 250), 100, 100, 100] # Mock box
            else:
                # Simulation
                if random.random() < 0.05: 
                    detection = "WEED"
                    bbox = [200, 100, 80, 80]
                    conf = random.randint(80, 99)

        # MODE 2: DISEASE ONLY
        elif self.active_mode == "DISEASE":
            disease_out = self.predict(self.disease_interpreter, frame)
            
            if disease_out is not None:
                idx = np.argmax(disease_out)
                if idx > 0: # 0=Healthy, 1+=Diseases
                    det_map = {0:"HEALTHY", 1:"RUST", 2:"BLIGHT"}
                    detection = det_map.get(idx, "DISEASE")
                    conf = int(disease_out[idx] * 100)
                    bbox = [140, 80, 100, 100]
            else:
                 # Simulation
                 if random.random() < 0.05:
                    detection = "BLIGHT"
                    bbox = [100, 100, 80, 80]
                    conf = random.randint( 80, 99)
                 elif random.random() < 0.1:
                    detection = "HEALTHY"

        self.last_result = detection
        self.confidence = conf
        return detection, conf, bbox

ai_brain = DualAI_Processor()
current_detection = "NONE"
current_ai_confidence = 0

# --- VIDEO STREAMING THREAD ---
def stream_video():
    global video_running, current_ai_confidence, current_detection
    frame_count = 0
    
    while video_running:
        if sio.connected and cap and cap.isOpened():
            ret, frame = cap.read()
            if ret:
                frame_count += 1
                frame_small = cv2.resize(frame, (320, 240), interpolation=cv2.INTER_AREA)

                # --- RUN DUAL AI ---
                if frame_count % 10 == 0:
                    det, conf, bbox = ai_brain.process_frame(frame_small)
                    current_detection = det
                    current_ai_confidence = conf

                    # --- ADVANCED ACTION LOGIC ---
                    
                    if det == "WEED":
                         print("🌿 WEED DETECTED. Applying Herbicide.")
                         target_and_spray(bbox, "chemical") 
                         
                    elif det in ["RUST", "BLIGHT", "DISEASE"]:
                         print(f"🦠 {det} DETECTED. Applying Pesticide.")
                         target_and_spray(bbox, "chemical") # Same pump for now, or use Pump 3
                         
                    elif det == "HEALTHY":
                         # Water only if dry
                         if moisture < 40:
                             print("🥬 HEALTHY CROP (Dry). Watering.")
                             target_and_spray(bbox, "water")

                # --- DRAW DETECTION ON FRAME ---
                if current_detection != "NONE" and bbox:
                    # bbox format: [x, y, w, h]
                    x, y, w, h = bbox
                    cv2.rectangle(frame_small, (x, y), (x+w, y+h), (0, 0, 255), 2)
                    label = f"{current_detection} ({current_ai_confidence}%)"
                    cv2.putText(frame_small, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

                # Encode
                _, buffer = cv2.imencode('.jpg', frame_small, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
                jpg_as_text = base64.b64encode(buffer).decode('utf-8')
                try: sio.emit('camera_frame', jpg_as_text)
                except: pass
            else: pass 
        time.sleep(1.0 / 15)

def target_and_spray(bbox, fluid_type):
    # 1. Stop
    set_motors(0, 0)
    
    # 2. Aim (Simple Proportional Control)
    center_x = bbox[0] + (bbox[2]//2)
    err = center_x - 160
    angle = 90 - int(err/3.5)
    angle = max(0, min(180, angle))
    
    # 3. Execute Sequence
    print(f"⚔️ Engaging Target at {angle}° with {fluid_type.upper()}")
    set_servo("base", angle)
    time.sleep(0.8)
    set_servo("shoulder", 140) # Dip
    set_servo("elbow", 150)
    time.sleep(0.8)
    
    # Pump
    pump_name = "weed" if fluid_type == "chemical" else "water"
    set_pump(pump_name, "ON")
    time.sleep(2)
    set_pump(pump_name, "OFF")
    
    # Reset
    set_servo("shoulder", 90)
    set_servo("elbow", 90)
    set_servo("base", 90)
    time.sleep(0.5)
    
    # Cooldown to prevent spam
    time.sleep(2)

def calibrate_arm():
    print("🔧 Calibrating Arm...")
    set_servo("base", 0)
    time.sleep(0.5)
    set_servo("base", 180)
    time.sleep(0.5)
    set_servo("base", 90)
    
    set_servo("shoulder", 130)
    time.sleep(0.5)
    set_servo("shoulder", 90)
    print("✅ Calibration Complete")

# --- MAIN LOOP ---
def main_loop():
    t = threading.Thread(target=stream_video, daemon=True)
    t.start()
    
    while True:
        if sio.connected:
            moisture, temp, hum = read_sensors()
            
            packet = {
                "plant": PLANT_ID,
                "moisture": moisture,
                "temp": temp,
                "pump_water": pump_water_state,
                "pump_weed": pump_weed_state,
                "detection": current_detection,
                "confidence": current_ai_confidence
            }
            # print(f"📡 Data: {packet}")
            # --- CSV LOGGING ---
            try:
                import os
                from datetime import datetime
                csv_file = "sensor_log.csv"
                file_exists = os.path.isfile(csv_file)
                
                with open(csv_file, mode='a') as f:
                    if not file_exists:
                        f.write("Timestamp,Moisture,Temperature,Humidity\n")
                    
                    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    f.write(f"{timestamp},{moisture},{temp},{hum}\n")
            except Exception as e:
                print(f"⚠️ CSV Write Error: {e}")

            sio.emit('sensor_data', packet)
            
        time.sleep(UPDATE_INTERVAL)

# --- SOCKET EVENTS ---
@sio.event
def connect(): print("✅ Connected to Local Server")
@sio.event
def disconnect(): print("❌ Disconnected")

@sio.event
def control_signal(data):
    # print("📩 Command:", data)
    action = data.get('action')

    if action == "SET_COMPONENT":
        comp = data.get('component')
        state = data.get('state') # ON / OFF
        
        if comp == 'pump': set_pump("water", state)
        elif comp == 'weed_sprayer': set_pump("weed", state)
        
    elif action == "ARM_MOVE":
        # expects {axis: 'base'|'shoulder'|'elbow', angle: 0-180}
        axis = data.get('axis')
        angle = int(data.get('angle', 90))
        set_servo(axis, angle)

    elif action == "SET_AI_MODE":
        mode = data.get('mode') # WEED or DISEASE
        ai_brain.set_mode(mode)

    elif action == "QUICK_ACTION":
        cmd = data.get('type')
        print(f"⚡ QUICK ACTION RECEIVED: {cmd}")
        
        if cmd == "STOP_ALL":
            set_motors(0, 0)
            set_pump("water", "OFF")
            set_pump("weed", "OFF")
            # Create a thread to safely home arm without blocking
            threading.Thread(target=perform_targeted_spray, args=("reset", 90)).start()
            
        elif cmd == "WATER_ALL":
            set_pump("water", "ON")
            # Auto-off after 5 seconds safety
            threading.Timer(5.0, set_pump, args=["water", "OFF"]).start()
            
        elif cmd == "CALIBRATE":
            # Wiggle Arm
            threading.Thread(target=calibrate_arm).start()
            
        elif cmd == "PATROL":
            # Move forward for 2 seconds
            set_motors(1, 1)
            threading.Timer(2.0, set_motors, args=[0, 0]).start()

    elif action == "MOVE":
        direction = data.get('dir')
        if direction == "F": set_motors(1, 1)
        elif direction == "B": set_motors(-1, -1)
        elif direction == "L": set_motors(-1, 1)
        elif direction == "R": set_motors(1, -1)
        elif direction == "S": set_motors(0, 0)


# --- MAIN ENTRY ---
if __name__ == "__main__":
    setup_hardware()
    
    print(f"🚀 RPi Client Started (Plant ID: {PLANT_ID})")
    print(f"🔌 Connecting to {SERVER_URL}...")
    
    try:
        # Retry loop for robust connection (handling Server spin-up)
        connected = False
        while not connected:
            try:
                print(f"🔌 Connecting to {SERVER_URL}...")
                # Increased wait_timeout for Render free tier spin-up
                sio.connect(SERVER_URL, wait_timeout=60, transports=['websocket', 'polling'])
                connected = True
            except Exception as e:
                print(f"❌ Connection Failed: {e}")
                print("⏳ Retrying in 5 seconds...")
                time.sleep(5)

        main_loop()

    except KeyboardInterrupt:
        print("Stopping...")
        video_running = False
        if cap: cap.release()
        if HARDWARE_AVAILABLE: GPIO.cleanup()
    except Exception as e:
        print("Fatal Error:", e)
        if HARDWARE_AVAILABLE: GPIO.cleanup()

import time
import json
import random
import socketio
import threading
import base64

# --- CONFIGURATION ---
SERVER_URL = "http://localhost:3000" # Change to your Cloud/PC IP
PLANT_ID = 5 # As per user spec
UPDATE_INTERVAL = 2 # Seconds (Sensors)
CAMERA_FPS = 5 # Target FPS for streaming

# --- HARDWARE PINS ---
PIN_DHT = 4        # GPIO4
PIN_SERVO = 18     # GPIO18
PIN_RELAY = 23     # GPIO23 (Pump)

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
    import cv2 # OpenCV for Camera
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
    
    # Mock Camera (if OpenCV missing or hardware missing)
    class MockCV2:
        def VideoCapture(self, idx): return self
        def isOpened(self): return True
        def read(self): return True, None # Return None frame to simulate
        def imencode(self, fmt, frame): return True, bytearray([255, 216, 255]) # Fake JPG
        def resize(self, frame, dim, interpolation): return frame
        def destroyAllWindows(self): pass
        def waitKey(self, delay): pass
        INTER_AREA = 1
    
    if 'cv2' not in locals():
        cv2 = MockCV2()

# --- SOCKET.IO CLIENT ---
sio = socketio.Client()

# --- STATE ---
current_pump_state = "OFF"
current_servo_angle = 90
video_running = True

# --- SETUP HARDWARE ---
def setup_hardware():
    global i2c, ads, chan, pwm_servo, cap
    
    # Camera Setup (Always try to setup, even if simulation mode for GPIO)
    try:
        cap = cv2.VideoCapture(0) # 0 for default camera
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)
        cap.set(cv2.CAP_PROP_FPS, 10)
    except:
        print("Camera Open Failed")
        cap = None

    if not HARDWARE_AVAILABLE: return

    # GPIO Setup
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PIN_RELAY, GPIO.OUT)
    GPIO.output(PIN_RELAY, GPIO.LOW) # Pump OFF

    # Motor Pins
    for p in [PIN_IN1, PIN_IN2, PIN_IN3, PIN_IN4]:
        GPIO.setup(p, GPIO.OUT)
        GPIO.output(p, GPIO.LOW)

    GPIO.setup(PIN_SERVO, GPIO.OUT)
    # 50Hz PWM for Servo
    pwm_servo = GPIO.PWM(PIN_SERVO, 50) 
    pwm_servo.start(7.5) # Center (approx 90 deg)

    # I2C / ADC Setup
    try:
        i2c = busio.I2C(board.SCL, board.SDA)
        ads = ADS.ADS1115(i2c)
        chan = AnalogIn(ads, ADS.P0) # A0
    except Exception as e:
        print("Error initializing I2C/ADC:", e)

def set_pump(state):
    global current_pump_state
    current_pump_state = state
    print(f"💧 Pump turned {state}")
    
    if HARDWARE_AVAILABLE:
        if state == "ON":
            GPIO.output(PIN_RELAY, GPIO.HIGH)
        else:
            GPIO.output(PIN_RELAY, GPIO.LOW)

def set_servo(angle):
    global current_servo_angle
    current_servo_angle = angle
    print(f"🤖 Servo moved to {angle}°")

    if HARDWARE_AVAILABLE:
        # Map 0-180 to Duty Cycle 2.5 - 12.5
        duty = 2.5 + (angle / 18.0)
        pwm_servo.ChangeDutyCycle(duty)
        time.sleep(0.5) # Allow time to move
        pwm_servo.ChangeDutyCycle(0) # Stop sending signal to prevent jitter

def set_motors(left_speed, right_speed):
    """
    Control L298N Motors.
    Speed: 1 (Fwd), -1 (Rev), 0 (Stop)
    """
    print(f"🚜 Motors: L={left_speed}, R={right_speed}")
    
    if not HARDWARE_AVAILABLE: return

    # Left Motor
    if left_speed > 0:
        GPIO.output(PIN_IN1, GPIO.HIGH)
        GPIO.output(PIN_IN2, GPIO.LOW)
    elif left_speed < 0:
        GPIO.output(PIN_IN1, GPIO.LOW)
        GPIO.output(PIN_IN2, GPIO.HIGH)
    else:
        GPIO.output(PIN_IN1, GPIO.LOW)
        GPIO.output(PIN_IN2, GPIO.LOW)
        
    # Right Motor
    if right_speed > 0:
        GPIO.output(PIN_IN3, GPIO.HIGH)
        GPIO.output(PIN_IN4, GPIO.LOW)
    elif right_speed < 0:
        GPIO.output(PIN_IN3, GPIO.LOW)
        GPIO.output(PIN_IN4, GPIO.HIGH)
    else:
        GPIO.output(PIN_IN3, GPIO.LOW)
        GPIO.output(PIN_IN4, GPIO.LOW)

# --- SENSOR READING ---
def read_sensors():
    if not HARDWARE_AVAILABLE:
        # Simulate
        moisture = random.randint(30, 80)
        temp = 25 + random.uniform(-2, 2)
        hum = 60 + random.uniform(-5, 5)
        return moisture, temp, hum
    
    # 1. Moisture (ADS1115)
    try:
        raw_moisture = chan.value
        # Map inversely: Higher value = Drier
        # Dry=26000 (0%), Wet=10000 (100%)
        moisture = 100 - ((raw_moisture - 10000) / (26000 - 10000) * 100)
        moisture = max(0, min(100, moisture)) # Clamp
    except:
        moisture = 0

    # 2. DHT22
    try:
        hum, temp = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, PIN_DHT)
        if hum is None: hum = 0
        if temp is None: temp = 0
    except:
        hum, temp = 0, 0

    return round(moisture, 1), round(temp, 1), round(hum, 1)

# --- VIDEO STREAMING THREAD ---
def stream_video():
    global video_running
    while video_running:
        if sio.connected and cap and cap.isOpened():
            ret, frame = cap.read()
            if ret:
                # Resize for bandwidth optimization
                frame = cv2.resize(frame, (320, 240), interpolation=cv2.INTER_AREA)
                # Encode to JPEG
                _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
                # Convert to Base64
                jpg_as_text = base64.b64encode(buffer).decode('utf-8')
                
                # Emit
                try:
                    sio.emit('camera_frame', jpg_as_text)
                except:
                    pass # Ignore send errors
            else:
                 # Simulation fallback
                 pass 
                 
        time.sleep(1.0 / CAMERA_FPS)

# --- MAIN LOOP ---
def main_loop():
    # Start Video Thread
    t = threading.Thread(target=stream_video, daemon=True)
    t.start()
    
    while True:
        if sio.connected:
            moisture, temp, hum = read_sensors()
            
            # Determine Status
            status = "WORKING"
            if moisture < 30: status = "NEEDS WATER"
            
            # Create Data Packet
            packet = {
                "plant": PLANT_ID,
                "moisture": moisture,
                "temp": temp,
                "pump": current_pump_state,
                "status": status
            }
            
            print(f"📡 Sending Sensor Data: {packet}")
            sio.emit('sensor_data', packet)
            
        time.sleep(UPDATE_INTERVAL)

# --- SOCKET EVENTS ---
@sio.event
def connect():
    print("✅ Connected to Cloud Server")

@sio.event
def connect_error(data):
    # print("❌ Connection Error:", data)
    pass # Reduce spam

@sio.event
def disconnect():
    print("❌ Disconnected")

@sio.event
def control_signal(data):
    print("📩 Received Command:", data)
    
    action = data.get('action')
    
    if action == "WATER":
        set_pump("ON")
        time.sleep(5) 
        set_pump("OFF")
    
    elif action == "STOP":
        set_pump("OFF")
        set_motors(0, 0)
        
    elif action == "SERVO":
        angle = int(data.get('angle', 90))
        set_servo(angle)

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
        sio.connect(SERVER_URL)
        main_loop()
    except KeyboardInterrupt:
        print("Stopping...")
        video_running = False
        if cap: cap.release()
        if HARDWARE_AVAILABLE: GPIO.cleanup()
    except Exception as e:
        print("Fatal Error:", e)
        if HARDWARE_AVAILABLE: GPIO.cleanup()

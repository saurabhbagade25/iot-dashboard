const axios = require('axios');
const path = require('path');
const { exec } = require('child_process');
// const { Gpio } = require('onoff'); // UNCOMMENT ON PI

/*
 *  HARDWARE CONFIGURATION
 *  ----------------------
 *  Moisture Sensor: Pin 17 (BCM) -> Digital Output (DO) on Sensor
 *  Pump Relay: Pin 27 (BCM)
 *  Camera: Pi Camera Module connected via CSI interface
 */

const DASHBOARD_URL = 'http://localhost:3000';
const SENSOR_PIN = 17;
const PUMP_PIN = 27;
const IMG_PATH = path.join(__dirname, 'public', 'captures', 'live.jpg');

// HARDWARE INIT (Uncomment on Pi)
// const moistureSensor = new Gpio(SENSOR_PIN, 'in', 'both');
// const pump = new Gpio(PUMP_PIN, 'out');

console.log("🍓 RPi Hardware Connect Started");

// 1. DATA COLLECTION LOOP (Every 5 Seconds)
setInterval(async () => {
    // A. CAPTURE IMAGE
    // Trying 'libcamera' first (New RPi OS), falling back to 'raspistill'
    const cmd = `libcamera-jpeg -o "${IMG_PATH}" -t 500 --width 640 --height 480 --nopreview || raspistill -o "${IMG_PATH}" -t 500 -w 640 -h 480 -n`;

    exec(cmd, (err) => {
        if (err) console.error("Camera Error (Ignored if no camera):", err.message.split('\n')[0]);
        else console.log("📸 Snap taken");
    });

    // B. READ MOISTURE
    // const isDry = moistureSensor.readSync() === 1; // 1 = Dry, 0 = Wet usually
    const isDry = Math.random() > 0.5; // SIMULATION (Remove on Pi)

    const moistureValue = isDry ? 30 : 85;
    const status = isDry ? 'Warning' : 'Healthy';

    console.log(`[Sensor] Moisture: ${moistureValue}% (${status})`);

    // C. SEND TO DASHBOARD
    try {
        await axios.put(`${DASHBOARD_URL}/api/plant/0/1`, { // Updating Bed 1, Plant 1
            moisture: moistureValue,
            disease: 'None',
            status: status
        });
    } catch (e) {
        console.error("API Error", e.message);
    }

}, 5000);

// 2. LISTEN FOR PUMP COMMANDS
// We poll the logs/settings to see if "Manual Water" was triggered recently?
// Or better: The Dashboard should have a dedicated /api/commands endpoint.
// For now, we simulate pump action if moisture is low.
// if(isDry) pump.writeSync(1); else pump.writeSync(0);

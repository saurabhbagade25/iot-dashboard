const axios = require('axios');
// const Gpio = require('onoff').Gpio; // Uncomment this line on Raspberry Pi

// CONFIGURATION
const DASHBOARD_URL = 'http://localhost:3000'; // Change to your PC IP if running separately
const POLL_INTERVAL = 5000; // 5 Seconds

// HARDWARE SETUP (Example)
// const moistureSensor = new Gpio(4, 'in'); // Example GPIO pin 4
// const pumpRelay = new Gpio(17, 'out');    // Example GPIO pin 17

console.log("Starting IoT Hardware Bridge...");
console.log(`Targeting Dashboard: ${DASHBOARD_URL}`);

// Main Loop
setInterval(async () => {
    try {
        // 1. READ SENSORS
        // In reality, you'd read from GPIO or I2C sensors here.
        // Example: const rawValue = moistureSensor.readSync(); 

        // Simulating data for demonstration:
        const bedId = 0; // Bed 1
        const plantId = 1; // Plant 1
        const realMoisture = (Math.random() * 20 + 40).toFixed(1); // Read your real sensor here
        const healthStatus = realMoisture < 30 ? 'Critical' : 'Healthy';

        console.log(`[Sensor Read] Bed ${bedId + 1} Plant ${plantId}: Moisture ${realMoisture}%`);

        // 2. SEND DATA TO DASHBOARD
        // We use the PUT endpoint we created earlier
        await axios.put(`${DASHBOARD_URL}/api/plant/${bedId}/${plantId}`, {
            moisture: realMoisture,
            disease: 'None', // You could use a camera script to detect this
            status: healthStatus
        });

        // 3. CHECK FOR COMMANDS (Optional)
        // You could poll the logs endpoint or a new 'commands' endpoint to see if 
        // the user clicked "Manual Water" and then trigger 'pumpRelay'.

    } catch (error) {
        console.error("Error communicating with Dashboard:", error.message);
    }
}, POLL_INTERVAL);

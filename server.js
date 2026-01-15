const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in this project
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- DATA ACCESS API ROUTES ---

// API: Get Settings
app.get('/api/settings', (req, res) => {
    db.all("SELECT key, value FROM settings", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json({ "message": "success", "data": settings });
    });
});

// API: Update Setting
app.post('/api/settings', (req, res) => {
    const { key, value } = req.body;
    db.run(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?`,
        [key, value, value],
        function (err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ "message": "success", "data": { key, value } });
        });
});

// API: Get Logs
app.get('/api/logs', (req, res) => {
    db.all("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 20", [], (err, rows) => {
        if (err) { return res.status(400).json({ "error": err.message }); }
        res.json({ "message": "success", "data": rows });
    });
});

// API: Add Log
app.post('/api/logs', (req, res) => {
    const { message, type } = req.body;
    db.run(`INSERT INTO activity_logs (message, type) VALUES (?, ?)`, [message, type], function (err) {
        if (err) { return res.status(400).json({ "error": err.message }); }
        // Broadcast Log to Dashboard
        io.emit('new_log', { id: this.lastID, message, type, timestamp: new Date() });
        res.json({ "message": "success", "id": this.lastID });
    });
});

// APIs for Plant Data (Persisted but updated via Socket)
app.get('/api/plant/:bedId/:plantId', (req, res) => {
    // In a cloud-only real setup, we might fetch latest from DB if we stored it,
    // or just return empty if waiting for live data.
    // For now, let's keep it simple: Real-time data is ephemeral in this demo,
    // but you could persist last known state to DB here.
    res.json({ "message": "success", "data": {} });
});


// --- AUTH ROUTES ---

// API: Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ message: "success", user: { id: row.id, username: row.username } });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

// API: Register
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ message: "User already exists" });

        // Insert new user
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "success", userId: this.lastID });
        });
    });
});

// --- CLOUD RELAY LOGIC (Socket.IO) ---

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 1. Handle Sensor Data from Raspberry Pi
    socket.on('sensor_data', (data) => {
        // Data: { plant: 5, moisture: 42, temp: 25, pump: "OFF", ... }
        // Relay to Dashboard
        io.emit('update_one', {
            id: `b0-p${data.plant}`, // Mapping to Bed 0 for simplicity, or send bed in data
            ...data
        });
    });

    // 2. Handle Camera Frames from Raspberry Pi
    socket.on('camera_frame', (base64Data) => {
        // Relay video frame to Dashboard
        // Using volatile to drop frames if network is slow
        socket.broadcast.emit('stream_frame', base64Data);
    });

    // 3. Handle Control Commands from Dashboard
    socket.on('control_command', (data) => {
        console.log("Control Command:", data);
        // Relay to Raspberry Pi
        io.emit('control_signal', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Cloud Server is running on port ${PORT}`);
});

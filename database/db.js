const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'farm.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.exec('PRAGMA journal_mode = WAL');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Table for settings
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            value TEXT
        )`);

        // Table for logs/activity
        db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            message TEXT,
            type TEXT
        )`);

        // NEW: Table for Plant Data
        db.run(`CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bed_id INTEGER,
            plant_id INTEGER,
            moisture REAL,
            disease TEXT,
            status TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(bed_id, plant_id)
        )`);

        // NEW: Table for Users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);

        // Seed default settings if not exists
        const stmt = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
        stmt.run("beds", "2");
        stmt.run("plants_per_bed", "6");
        stmt.run("plant_size", "28");
        stmt.finalize();

        // Seed default admin (Password is simple text for demo, use hashing in prod)
        db.run("INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin')");
    });
}

module.exports = db;

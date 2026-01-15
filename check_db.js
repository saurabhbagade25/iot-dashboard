const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database/farm.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to database.');
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
            if (err) console.error(err);
            console.log('Tables:', rows);

            // Check users
            db.all("SELECT * FROM users", [], (err, rows) => {
                if (err) console.log("Error querying users (Table might be missing):", err.message);
                else console.log("Users in DB:", rows);
            });
        });
    }
});

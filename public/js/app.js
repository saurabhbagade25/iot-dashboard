const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api')
    : 'http://RASPBERRY_PI_IP:5000/api';
console.log("API Base set to:", API_BASE);

// Translations
const translations = {
    en: {
        navHome: "Home",
        navDashboard: "Dashboard",
        navLive: "Live Activity",
        navActivity: "Activity",
        navComponents: "Components",
        appTitle: "Intelligent Sprinkling System",
        systemLabel: "System:",
        greeting: "🌱 Good Morning!",
        systemSummary: "System is running optimally. Here is your farm summary.",
        viewLiveFeed: "View Live Feed",
        weatherDesc: "Sunny • Humidity 45%",
        avgMoisture: "Avg Soil Moisture",
        trendMoisture: "2% vs yesterday",
        plantHealth: "Plant Health",
        statusStable: "Stable condition",
        activeAlerts: "Active Alerts",
        statusNominal: "All systems nominal",
        quickActions: "⚡ Quick Actions",
        actInject: "Inject Water",
        actCalibrate: "Calibrate Sensors",
        actPatrol: "Start Patrol",
        actStop: "Emergency Stop",
        systemActivity: "📋 System Activity",
        loadingLogs: "Loading logs...",
        liveField: "🌾 Live Field View",
        liveMonitor: "📷 Real-time Monitoring",
        liveTelemetry: "📊 Live Telemetry",
        sysComponents: "System Components Status",
        compSensors: "📡 Sensor Nodes",
        compArm: "🤖 Robotic Arm",
        armBase: "Base Rotation",
        armShoulder: "Shoulder Lift",
        armElbow: "Elbow Reach",
        compActuators: "⚙️ Manual Controls",
        compWeedSprayer: "Weed Sprayer",
        compNetwork: "🌐 Network & Power",
        loginTitle: "Welcome Back",
        loginSubtitle: "Sign in to monitor your field",
        btnLogin: "Login"
    },
    mr: {
        navHome: "मुख्यपृष्ठ",
        navDashboard: "डॅशबोर्ड",
        navLive: "थेट क्रियाकलाप",
        navActivity: "क्रियाकलाप",
        navComponents: "घटक",
        appTitle: "बुद्धिमान सिंचन प्रणाली",
        systemLabel: "प्रणाली:",
        greeting: "🌱 शुभ प्रभात!",
        systemSummary: "प्रणाली उत्तम प्रकारे चालू आहे. येथे तुमचा शेती सारांश आहे.",
        viewLiveFeed: "थेट फीड पहा",
        weatherDesc: "सूर्यप्रकाश • आर्द्रता 45%",
        avgMoisture: "सरासरी मातीची आर्द्रता",
        trendMoisture: "कालच्या तुलनेत 2% वाढ",
        plantHealth: "वनस्पती आरोग्य",
        statusStable: "स्थिर स्थिती",
        activeAlerts: "सक्रिय सूचना",
        statusNominal: "सर्व प्रणाली सामान्य",
        quickActions: "⚡ त्वरित कृती",
        actInject: "पाणी सोडा",
        actCalibrate: "सेन्सर कॅलिब्रेट करा",
        actPatrol: "गस्त सुरू करा",
        actStop: "आपत्कालीन थांबा",
        systemActivity: "📋 प्रणाली क्रियाकलाप",
        loadingLogs: "लॉग लोड होत आहेत...",
        liveField: "🌾 थेट क्षेत्र दृश्य",
        liveMonitor: "📷 रिअल-टाइम देखरेख",
        liveTelemetry: "📊 थेट टेलीमेट्री",
        sysComponents: "प्रणाली घटक स्थिती",
        compSensors: "📡 सेन्सर नोड्स",
        compArm: "🤖 रोबोटिक हात",
        armBase: "बेस रोटेशन",
        armShoulder: "खांदा लिफ्ट",
        armElbow: "कोपर पोहोच",
        compActuators: "⚙️ मॅन्युअल नियंत्रणे",
        compWeedSprayer: "तण फवारणी यंत्र",
        compNetwork: "🌐 नेटवर्क आणि पॉवर",
        loginTitle: "स्वागत आहे",
        loginSubtitle: "तुमच्या शेतीवर लक्ष ठेवण्यासाठी लॉग इन करा",
        btnLogin: "लॉगिन करा"
    }
};

let currentLang = 'en';

// Auth Logic
let isLoginMode = true;

function togglePasswordVisibility(icon) {
    const input = icon.previousElementSibling;
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    }
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.querySelector('[data-i18n="loginTitle"]');
    const sub = document.querySelector('[data-i18n="loginSubtitle"]');
    const btnText = document.querySelector('#authBtn span');
    const toggleText = document.getElementById('authToggleText');
    const toggleLink = document.getElementById('authToggleLink');
    const err = document.getElementById('loginError');

    err.style.display = 'none'; // reset error

    if (isLoginMode) {
        title.innerText = translations[currentLang].loginTitle || "Welcome Back";
        sub.innerText = translations[currentLang].loginSubtitle;
        btnText.innerText = translations[currentLang].btnLogin;
        toggleText.innerText = currentLang === 'en' ? "New user?" : "नवीन वापरकर्ता?";
        toggleLink.innerText = currentLang === 'en' ? "Create Account" : "खाते तयार करा";
    } else {
        title.innerText = currentLang === 'en' ? "Create Account" : "खाते तयार करा";
        sub.innerText = currentLang === 'en' ? "Join Team AgroSense" : "Team AgroSense मध्ये सामील व्हा";
        btnText.innerText = currentLang === 'en' ? "Sign Up" : "साइन अप करा";
        toggleText.innerText = currentLang === 'en' ? "Already have an account?" : "आधीच खाते आहे?";
        toggleLink.innerText = currentLang === 'en' ? "Login" : "लॉगिन करा";
    }
}

async function handleAuth() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const err = document.getElementById('loginError');

    if (!u || !p) {
        err.style.display = 'block';
        err.innerText = "Please fill in all fields.";
        return;
    }

    const endpoint = isLoginMode ? `${API_BASE}/login` : `${API_BASE}/register`;

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        const json = await res.json();

        if (res.ok && json.message === "success") {
            if (isLoginMode) {
                // Login Success
                document.getElementById('loginPage').style.display = 'none';
                document.getElementById('loginBg').style.display = 'none';
                document.getElementById('mainApp').style.display = 'flex';
                loadSettings();
                connectWebSocket();
                showPage('live');
            } else {
                // Register Success
                alert("Account created! Please login.");
                toggleAuthMode(); // Switch back to login
            }
        } else {
            err.style.display = 'block';
            err.innerText = json.message || "Authentication failed";
        }
    } catch (e) {
        err.style.display = 'block';
        err.innerText = "Server Error. Try again.";
    }
}




function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'mr' : 'en';
    applyLanguage();
}

function applyLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
    // Update button text
    const btn = document.getElementById('langBtn');
    if (btn) btn.innerText = currentLang === 'en' ? '🌐 EN/MR (English)' : '🌐 EN/MR (मराठी)';
}

// State
let farmConfig = {
    beds: 2,
    plants_per_bed: 6,
    plant_size: 28
};

// initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session
    const session = localStorage.getItem('session');
    if (session) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('loginBg').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        loadSettings();
        connectWebSocket();

        // Restore last page or default to home
        // const lastPage = localStorage.getItem('lastPage') || 'home';
        showPage('live'); // Prioritize Live Activity
    }

    applyLanguage(); // Apply default language to Login Page

    // Keyboard Controls for Robot
    document.addEventListener('keydown', (e) => {
        if (!socket || socket.readyState !== WebSocket.OPEN && !socket.connected) return;

        let dir = null;
        if (e.key === 'ArrowUp') dir = 'F';
        if (e.key === 'ArrowDown') dir = 'B';
        if (e.key === 'ArrowLeft') dir = 'L';
        if (e.key === 'ArrowRight') dir = 'R';

        if (dir) {
            socket.emit('control_command', { action: 'MOVE', dir: dir });
        }
    });

    document.addEventListener('keyup', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            socket.emit('control_command', { action: 'MOVE', dir: 'S' }); // Stop
        }
    });

    initSparklines();
    initWeather();
});

// Weather Integration
function initWeather() {
    // Using Pune, India coordinates (default)
    const url = "https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current_weather=true&hourly=relativehumidity_2m";

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.current_weather) return;

            const temp = data.current_weather.temperature;
            const wind = data.current_weather.windspeed;
            const weathercode = data.current_weather.weathercode;
            // Approximation: take current hour humidity
            const currentHour = new Date().getHours();
            const humidity = data.hourly.relativehumidity_2m[currentHour] || 60;

            // Update UI
            const elTemp = document.getElementById('weatherTemp');
            const elWind = document.getElementById('weatherWind');
            const elHum = document.getElementById('weatherHum');
            const elDesc = document.getElementById('weatherDesc');
            const elIcon = document.getElementById('weatherIcon');

            if (elTemp) elTemp.innerText = `${temp}°C`;
            if (elWind) elWind.innerText = `${wind} km/h`;
            if (elHum) elHum.innerText = `${humidity}%`;

            // WMO Weather Code Mapping
            let desc = "Clear Sky";
            let icon = "fa-sun";

            if (weathercode === 1 || weathercode === 2 || weathercode === 3) { desc = "Partly Cloudy"; icon = "fa-cloud-sun"; }
            else if (weathercode === 45 || weathercode === 48) { desc = "Foggy"; icon = "fa-smog"; }
            else if (weathercode >= 51 && weathercode <= 67) { desc = "Rainy"; icon = "fa-cloud-rain"; }
            else if (weathercode >= 71 && weathercode <= 77) { desc = "Snow"; icon = "fa-snowflake"; }
            else if (weathercode >= 80 && weathercode <= 82) { desc = "Heavy Rain"; icon = "fa-cloud-showers-heavy"; }
            else if (weathercode >= 95) { desc = "Thunderstorm"; icon = "fa-bolt"; }

            if (elDesc) elDesc.innerText = desc;
            if (elIcon) elIcon.className = `fa-solid ${icon} sun-anim`;
        })
        .catch(err => console.error("Weather fetch failed", err));
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    ['home', 'live', 'activity', 'robot', 'components', 'analytics'].forEach(p => {
        const el = document.getElementById(p + 'Page');
        if (el) el.style.display = 'none';

        // Update Nav Active State
        const btn = document.getElementById('btn-' + p);
        if (btn) btn.classList.remove('active');
    });

    // Show target page
    const target = document.getElementById(pageId + 'Page');
    if (target) {
        target.style.display = 'block';

        // Specific init for pages
        if (pageId === 'live') {
            // Re-render farm if needed
            if (typeof renderFarm === 'function') renderFarm();
        }
        if (pageId === 'activity') {
            if (typeof loadActivityLogs === 'function') loadActivityLogs();
        }
        if (pageId === 'analytics') {
            if (typeof initCSVChart === 'function') initCSVChart(); // Will trigger auto-fetch
        }
    }

    const activeBtn = document.getElementById('btn-' + pageId);
    if (activeBtn) activeBtn.classList.add('active');

    // Save state
    localStorage.setItem('lastPage', pageId);
}

// Sparkline Charts
function initSparklines() {
    const moistureCtx = document.getElementById('moistureSparkline');
    const healthCtx = document.getElementById('healthSparkline');

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        elements: { point: { radius: 0 } }
    };

    if (moistureCtx) {
        new Chart(moistureCtx, {
            type: 'line',
            data: {
                labels: Array(20).fill(''), // Dummy labels
                datasets: [{
                    data: Array.from({ length: 20 }, () => 50 + Math.random() * 25), // Random 50-75
                    borderColor: 'rgba(33, 150, 243, 0.5)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: {
                        target: 'origin',
                        above: 'rgba(33, 150, 243, 0.1)'
                    }
                }]
            },
            options: {
                ...commonOptions,
                scales: { x: { display: false }, y: { display: false, min: 0, max: 100 } }
            }
        });
    }

    if (healthCtx) {
        new Chart(healthCtx, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: Array.from({ length: 20 }, () => 90 + Math.random() * 10), // Random 90-100
                    borderColor: 'rgba(76, 175, 80, 0.5)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: {
                        target: 'origin',
                        above: 'rgba(76, 175, 80, 0.1)'
                    }
                }]
            },
            options: {
                ...commonOptions,
                scales: { x: { display: false }, y: { display: false, min: 80, max: 100 } }
            }
        });
    }
}

// Navigation
function showPage(pageId) {
    // Save state
    localStorage.setItem('lastPage', pageId);

    // Hide all pages
    document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
    // Show target page
    const target = document.getElementById(pageId + 'Page');
    if (target) {
        target.style.display = 'block';
        if (target.classList.contains('fade-in')) {
            target.classList.remove('fade-in');
            void target.offsetWidth; // trigger reflow
            target.classList.add('fade-in');
        }
    }

    // Update Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-' + pageId);
    if (activeBtn) activeBtn.classList.add('active');

    // Page specific loads
    if (pageId === 'home' || pageId === 'components' || pageId === 'activity') loadLogs();
    if (pageId === 'live') renderLiveFarm();
    if (pageId === 'components') loadComponents();
}

// Components Logic
function loadComponents() {
    const list = document.getElementById('sensorList');
    if (!list) return; // guard
    list.innerHTML = '';

    // Simulate dynamic nodes based on beds
    const totalPlants = farmConfig.beds * farmConfig.plants_per_bed;
    const groups = Math.ceil(totalPlants / 4); // 1 node per 4 plants

    for (let i = 1; i <= groups; i++) {
        const status = Math.random() > 0.1 ? 'active' : 'warn';
        list.innerHTML += `
            <div class="comp-item ${status}">
                <i class="fa-solid fa-tower-broadcast"></i>
                <div>
                    <strong>Sensor Group ${i}</strong>
                    <span>Zone: Bed ${i} • Battery: ${Math.floor(Math.random() * 60 + 40)}%</span>
                </div>
                <span class="status-badge ${status}">${status === 'active' ? 'Online' : 'Low Batt'}</span>
            </div>
        `;
    }
}

async function toggleComponent(id, checkbox) {
    try {
        // Enforce state preservation
        localStorage.setItem('lastPage', 'components');

        const state = checkbox.checked ? 'ON' : 'OFF';
        const type = 'manual_control';
        const msg = `${id.toUpperCase()} switched ${state}`;

        // Update Text UI
        const txtIds = {
            'pump': 'txt-pump',
            'weed_sprayer': 'txt-weed_sprayer',
            'sprayer': 'txt-weed_sprayer', // Fallback
            'camera': 'txt-camera',
            'lights': 'txt-lights'
        };
        const txtEl = document.getElementById(txtIds[id]);

        if (!txtEl) {
            console.warn(`UI Element for ${id} not found.`);
        } else {
            if (checkbox.checked) {
                if (id === 'pump') txtEl.innerText = 'Active • Flow: 12L/min';
                if (id === 'weed_sprayer' || id === 'sprayer') txtEl.innerText = 'Active • Spraying Weedicide...';
                if (id === 'camera') txtEl.innerText = 'Active • Scanning for Diseases...';
                if (id === 'lights') txtEl.innerText = 'On • 100% Brightness';
                checkbox.closest('.comp-item').className = 'comp-item active';
            } else {
                txtEl.innerText = 'Off • Idle';
                checkbox.closest('.comp-item').className = 'comp-item inactive';
            }
        }

        // Log to backend
        try {
            await fetch(`${API_BASE}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, type: type })
            });
            // Instant Log Update (Client-side Optimistic)
            prependLog({ message: msg, timestamp: new Date() });

            // Persist State
            saveSetting(id, state); // Save to DB

        } catch (e) {
            console.error("Log fetch error:", e);
        }

        // Send Control Command to RPi via Socket
        if (socket && socket.connected) {
            console.log(`Sending generic command: SET_COMPONENT ${id} = ${state}`);
            socket.emit('control_command', {
                action: 'SET_COMPONENT',
                component: id,
                state: state
            });
        }
    } catch (err) {
        console.error("Critical error in toggleComponent:", err);
    }
}

// Arm Control
function updateArm(axis, angle) {
    document.getElementById(`angle-${axis}`).innerText = angle;
    if (socket && socket.connected) {
        socket.emit('control_command', {
            action: 'ARM_MOVE',
            axis: axis,
            angle: angle
        });
    }
}


function setAIMode(mode) {
    try {
        // UI Update
        document.querySelectorAll('.mode-card').forEach(el => el.classList.remove('active'));
        const activeId = mode === 'WEED' ? 'mode-weed' : 'mode-disease';
        const el = document.getElementById(activeId);
        if (el) el.classList.add('active');

        // Log
        console.log("Switched AI Mode to:", mode);

        if (socket && socket.connected) {
            socket.emit('control_command', {
                action: 'SET_AI_MODE',
                mode: mode
            });
        }

        // --- PROACTIVE: Send directly to Robot Python Brain ---
        if (typeof ROBOT_API !== 'undefined') {
            fetch(`${ROBOT_API}/cmd`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'SET_AI_MODE', mode: mode })
            }).catch(err => console.warn("Robot Offline? Could not switch mode locally."));
        }

        // Log to system
        fetch(`${API_BASE}/logs`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `AI Mode switched to ${mode}`, type: 'system' })
        }).catch(e => console.error(e));

    } catch (e) {
        console.error("setAIMode error:", e);
    }
}

function toggleAIModel(modelType, checkbox) {
    try {
        const isChecked = checkbox.checked;
        const otherId = modelType === 'plan' ? 'weedDetectionToggle' : 'planDetectionToggle';
        const otherCheckbox = document.getElementById(otherId);

        // Mutual Exclusion: If turning ON, turn OFF the other
        if (isChecked && otherCheckbox) {
            otherCheckbox.checked = false;
        }

        // Determine AI Mode for Backend (Python Script expects 'DISEASE' or 'WEED')
        let modeToSend = 'STANDBY';
        if (isChecked) {
            modeToSend = modelType === 'plan' ? 'DISEASE' : 'WEED'; // 'plan' maps to 'DISEASE'
        } else {
            // If turning OFF, we check if the other is ON (shouldn't be if we just enforced exclusion, but good for safety)
            // Actually, if we turn OFF the active one, we go to STANDBY.
            modeToSend = 'STANDBY';
        }

        const modelName = modelType === 'plan' ? 'Plant & Disease Monitor' : 'Weed Detection';
        console.log(`${modelName} switched ${isChecked ? 'ON' : 'OFF'} -> Mode: ${modeToSend}`);

        // Send 'SET_AI_MODE' which is what rpi_smart_sprinkler.py listens for
        if (socket && socket.connected) {
            socket.emit('control_command', {
                action: 'SET_AI_MODE',
                mode: modeToSend
            });
        }

        // Log to system
        const logMsg = isChecked ? `${modelName} Activated` : `AI Mode set to Standby`;
        fetch(`${API_BASE}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: logMsg, type: 'system' })
        }).then(() => {
            prependLog({ message: logMsg, timestamp: new Date() });
        }).catch(e => console.error(e));

    } catch (e) {
        console.error("toggleAIModel error:", e);
    }
}

// Enhanced Arm Control with Visualizer
function updateArmPreview() {
    const base = document.getElementById('sliderBase').value;
    const shoulder = document.getElementById('sliderShoulder').value;
    const elbow = document.getElementById('sliderElbow').value;

    // Update Text Labels
    document.getElementById('labelBase').innerText = base + '°';
    document.getElementById('labelShoulder').innerText = shoulder + '°';
    document.getElementById('labelElbow').innerText = elbow + '°';

    // Update Visualizer (Forward Kinematics Simulation)
    // Mapping: 90 is "Up/Center". 
    // Shoulder: 90 -> 0deg rotation (Up). <90 leans left/forward? Let's assume <90 is Forward (Left in side view?)
    // Let's assume Robot Side View: Left is "Front". 
    // If logic: 90 is Vertical. 
    // Shoulder: Decrease to lean forward (Left). Rotate negative. (val - 90)
    const shoulderAngle = (parseInt(shoulder) - 90) * -1; // Invert for logical feel
    const elbowAngle = (parseInt(elbow) - 90) * -1;
    // Wrist compensates to stay somewhat level or just moves with it. Let's make it fixed relative to elbow for now or fun.
    const wristAngle = (elbowAngle * -0.5);

    const shoulderEl = document.getElementById('vis-shoulder-pivot');
    const elbowEl = document.getElementById('vis-elbow-pivot');
    const wristEl = document.getElementById('vis-wrist-pivot');

    if (shoulderEl) shoulderEl.style.transform = `rotate(${shoulderAngle}deg)`;
    if (elbowEl) elbowEl.style.transform = `rotate(${elbowAngle}deg)`;
    if (wristEl) wristEl.style.transform = `rotate(${wristAngle}deg)`;

    // Update Slider Gradients (Fill effect)
    updateSliderFill('sliderBase', base, 30, 150, '#03A9F4');
    updateSliderFill('sliderShoulder', shoulder, 40, 150, '#FF9800');
    updateSliderFill('sliderElbow', elbow, 50, 160, '#E91E63');

    // Debounce/Throttle Socket Send could be good, but for now send direct
    if (socket && socket.connected) {
        // Send composite command
        socket.emit('control_command', {
            action: 'ARM_SET',
            base: base,
            shoulder: shoulder,
            elbow: elbow
        });
    }
}

function updateSliderFill(id, val, min, max, color) {
    const el = document.getElementById(id);
    if (!el) return;
    const percentage = ((val - min) / (max - min)) * 100;
    el.style.background = `linear-gradient(to right, ${color} ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`;
}

function resetArm() {
    const ids = ['sliderBase', 'sliderShoulder', 'sliderElbow'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 90;
    });
    updateArmPreview();
}

// Initialize Visuals on Load
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init ...
    setTimeout(updateArmPreview, 500); // Trigger once to set initial state
});


async function triggerAction(actionName) {
    if (confirm(`Are you sure you want to trigger: ${actionName}?`)) {

        let cmdType = 'NONE';
        if (actionName === 'All Sprinklers ON' || actionName === 'Inject Water') cmdType = 'WATER_ALL';
        if (actionName === 'System Calibration') cmdType = 'CALIBRATE';
        if (actionName === 'Emergency Stop') cmdType = 'STOP_ALL';
        if (actionName === 'Drone Patrol' || actionName === 'Start Patrol') cmdType = 'PATROL';

        // Send to backend log
        try {
            await fetch(`${API_BASE}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Quick Action: ${actionName}`, type: 'system' })
            });

            // Client-side Log Update
            prependLog({ message: `Quick Action: ${actionName}`, timestamp: new Date() });

        } catch (e) {
            console.error("Error triggering action", e);
        }

        // Send Command to Robot
        if (socket && socket.connected) {
            console.log(`Sending QUICK_ACTION: ${cmdType}`);
            socket.emit('control_command', {
                action: 'QUICK_ACTION',
                type: cmdType
            });
            alert(`Command "${cmdType}" sent to robot.`);
        } else {
            alert("Robot disconnected. Action logged but not sent.");
        }
    }
}

// Settings & Farm Generation
async function loadSettings() {
    try {
        const res = await fetch(`${API_BASE}/settings`);
        const json = await res.json();
        if (json.message === 'success' && json.data) {
            if (json.data.beds) document.getElementById('beds').value = json.data.beds;
            if (json.data.plants_per_bed) document.getElementById('plants').value = json.data.plants_per_bed;
            if (json.data.plant_size) {
                document.getElementById('plantSize').value = json.data.plant_size;
                updatePlantSize(json.data.plant_size);
            }

            // Camera URL
            // Camera URL
            // Force usage of the local AI stream (Simulation or Relay)
            // const forcedIP = "http://localhost:5000/video";
            // const streamImg = document.getElementById('liveStream');
            // if (streamImg) {
            //     streamImg.src = forcedIP;
            //     streamImg.style.opacity = '1';
            //     document.getElementById('camOfflineMsg').style.display = 'none';
            // }
            // const camInput = document.getElementById('cameraUrlInput'); // Fixed ID from cameraUrl to cameraUrlInput
            // if (camInput) camInput.value = forcedIP;

            // Update DB in background so next reload is correct
            saveSetting('camera_url', forcedIP);

            // Restore Component States
            const compIds = ['pump', 'weed_sprayer', 'camera', 'lights'];
            const txtIds = { 'pump': 'txt-pump', 'weed_sprayer': 'txt-weed_sprayer', 'camera': 'txt-camera', 'lights': 'txt-lights' };

            compIds.forEach(id => {
                if (json.data[id]) {
                    const state = json.data[id]; // 'ON' or 'OFF'
                    const isOn = state === 'ON';

                    // Find checkbox (assumes structure: input -> label -> div.comp-item)
                    // We need to hunt down the specific checkbox. IDK the ID of component checkbox.
                    // Actually, we pass 'this' in HTML. We don't have IDs on the checkboxes.
                    // Let's use the toggleComponent logic to "refresh" text, but we need the element.
                    // Easier: Loop through toggleComponent buttons if we had IDs.
                    // For now, let's just update the known text elements and maybe try to find inputs?
                    // The inputs in HTML don't have IDs. 
                    // Strategy: Map txtId back to parent? 

                    const txtEl = document.getElementById(txtIds[id]);
                    if (txtEl) {
                        const parentChange = txtEl.closest('.comp-item').querySelector('input[type="checkbox"]');
                        if (parentChange) {
                            parentChange.checked = isOn;
                            // Update Visuals
                            if (isOn) {
                                if (id === 'pump') txtEl.innerText = 'Active • Flow: 12L/min';
                                if (id === 'weed_sprayer') txtEl.innerText = 'Active • Spraying Weedicide...';
                                if (id === 'camera') txtEl.innerText = 'Tracking • 30fps';
                                if (id === 'lights') txtEl.innerText = 'On • 100% Brightness';
                                txtEl.closest('.comp-item').className = 'comp-item active';
                            } else {
                                txtEl.innerText = 'Off • Idle';
                                txtEl.closest('.comp-item').className = 'comp-item inactive';
                            }
                        }
                    }
                }
            });

            // Update local state
            farmConfig = {
                beds: parseInt(json.data.beds) || 2,
                plants_per_bed: parseInt(json.data.plants_per_bed) || 6,
                plant_size: parseInt(json.data.plant_size) || 28
            };

            generateFarm(); // Render with loaded config
            loadLogs(); // Ensure logs are populated
        }
    } catch (e) {
        console.error("Failed to load settings", e);
        generateFarm(); // Fallback
    }
}

async function generateFarmAndSave() {
    const beds = document.getElementById('beds').value;
    const plants = document.getElementById('plants').value;
    const size = document.getElementById('plantSize').value;
    const camUrl = document.getElementById('cameraUrl') ? document.getElementById('cameraUrl').value : '';

    // Save to backend
    await saveSetting('beds', beds);
    await saveSetting('plants_per_bed', plants);
    await saveSetting('plant_size', size);
    if (camUrl) await saveSetting('camera_url', camUrl);

    // Update local state
    farmConfig.beds = parseInt(beds);
    farmConfig.plants_per_bed = parseInt(plants);
    farmConfig.plant_size = parseInt(size);

    generateFarm();
    alert('Layout updated and saved!');
}

async function saveSetting(key, value) {
    await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
    });
}

function generateFarm() {
    const farm = document.getElementById('farm');
    farm.innerHTML = '';
    farm.style.gridTemplateColumns = `repeat(auto-fill, minmax(250px, 1fr))`;

    for (let b = 0; b < farmConfig.beds; b++) {
        const bed = document.createElement('div');
        bed.className = 'bed';

        const title = document.createElement('div');
        title.className = 'bed-title';
        title.innerText = `Bed ${b + 1}`;
        bed.appendChild(title);

        for (let p = 1; p <= farmConfig.plants_per_bed; p++) {
            const plant = document.createElement('div');
            plant.className = 'plant';
            plant.innerText = p;
            plant.id = `dash-b${b}-p${p}`; // Added ID
            plant.onclick = () => selectPlant(b, p);

            // Initial color
            const id = `b${b}-p${p}`;
            if (plantDataCache[id]) {
                plant.style.backgroundColor = getStatusColor(plantDataCache[id].status, plantDataCache[id].moisture);
            }

            bed.appendChild(plant);
        }

        farm.appendChild(bed);
    }
}

function updatePlantSize(size) {
    document.documentElement.style.setProperty('--plant-size', size + 'px');
    document.getElementById('sizeValue').innerText = size + 'px';
}

// Interaction
let moistureChartInstance = null;

async function selectPlant(bedIndex, plantIndex) {
    const name = `Bed ${bedIndex + 1} - Plant ${plantIndex}`;

    // Show sidebar
    const sidebar = document.getElementById('detailsSidebar');
    sidebar.classList.add('active');
    document.getElementById('plantName').innerHTML = `<i class="fa-solid fa-seedling"></i> ${name}`;

    // Reset UI
    document.getElementById('aiConfidenceFill').style.width = '0%';
    document.getElementById('aiConfidence').innerText = '--%';

    // Fetch Data from Backend
    try {
        const res = await fetch(`${API_BASE}/plant/${bedIndex}/${plantIndex}`);
        const json = await res.json();

        if (json.data) {
            const d = json.data;
            document.getElementById('liveMoisture').innerText = d.moisture + '%';
            document.getElementById('liveDisease').innerText = d.disease;
            document.getElementById('liveStatus').innerText = d.status;

            // Color coding
            const diseaseEl = document.getElementById('liveDisease');
            diseaseEl.className = d.disease === 'None' ? 'good' : 'bad';

            const statusEl = document.getElementById('liveStatus');
            statusEl.className = d.status === 'Healthy' ? 'good' : 'warn';

            // AI Confidence Logic (Simulation)
            const confidence = Math.floor(Math.random() * 15 + 85); // 85-99%
            document.getElementById('aiConfidence').innerText = confidence + '%';
            setTimeout(() => {
                document.getElementById('aiConfidenceFill').style.width = confidence + '%';
            }, 100);

            // Render Chart
            renderChart(d.moisture);
        }
    } catch (e) {
        console.error("Error fetching plant data", e);
    }

    // Update Images (Simulation)
    const seed = (bedIndex * 100) + plantIndex;
    document.getElementById('refImg').src = `https://picsum.photos/seed/${seed + 'ref'}/200`;
    // Live Scan Image (Try Real RPi Image, failover to Simulation)
    // Live Scan Image (Try Real RPi Image, failover to Simulation)
    const imgEl = document.getElementById('liveScanImg');
    // We add a timestamp to prevent browser caching of the static file
    // Handle Cross-Origin Image Loading
    const baseUrl = (API_BASE.startsWith('http')) ? API_BASE.replace('/api', '') : '';
    const realImgPath = `${baseUrl}/captures/live.jpg?t=${new Date().getTime()}`;

    // Check if real image exists (HEAD request)
    fetch(realImgPath, { method: 'HEAD' })
        .then(res => {
            if (res.ok) {
                imgEl.src = realImgPath;
            } else {
                // Fallback to Simulation
                imgEl.src = `https://picsum.photos/seed/${seed + 'scan'}/200`;
            }
        })
        .catch(() => {
            imgEl.src = `https://picsum.photos/seed/${seed + 'scan'}/200`;
        });

    // Store current selection for actions
    sidebar.dataset.currentBed = bedIndex;
    sidebar.dataset.currentPlant = plantIndex;
}

function renderChart(currentMoisture) {
    const ctx = document.getElementById('moistureChart').getContext('2d');

    // Generate fake history
    const labels = ['-24h', '-20h', '-16h', '-12h', '-8h', '-4h', 'Now'];
    const dataPoints = [];
    let prev = parseFloat(currentMoisture) || 50;
    for (let i = 0; i < 6; i++) {
        prev = prev + (Math.random() * 10 - 5);
        if (prev > 100) prev = 100; if (prev < 0) prev = 0;
        dataPoints.unshift(prev.toFixed(1));
    }
    dataPoints.push(currentMoisture);

    if (moistureChartInstance) {
        moistureChartInstance.destroy();
    }

    moistureChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Moisture %',
                data: dataPoints,
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

function closeSidebar() {
    document.getElementById('detailsSidebar').classList.remove('active');
}

async function triggerWatering() {
    const sidebar = document.getElementById('detailsSidebar');
    const b = sidebar.dataset.currentBed;
    const p = sidebar.dataset.currentPlant;
    const name = `Bed ${parseInt(b) + 1} - Plant ${parseInt(p)}`;

    if (!b || !p) return;

    alert(`Watering sequence initiated for ${name}!`);

    // Log action to backend
    try {
        await fetch(`${API_BASE}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Manual watering triggered for ${name}`, type: 'manual' })
        });
        loadLogs(); // Refresh log list if on home page
    } catch (e) { console.error("Log error", e); }
}

// Live Page Logic
function renderLiveFarm() {
    const liveFarm = document.getElementById('liveFarm');
    liveFarm.innerHTML = '';
    liveFarm.style.display = 'grid';
    liveFarm.style.gridTemplateColumns = `repeat(auto-fit, minmax(100px, 1fr))`;
    liveFarm.style.gap = '10px';

    for (let b = 0; b < farmConfig.beds; b++) {
        const bed = document.createElement('div');
        bed.className = 'bed';
        bed.style.transform = 'scale(0.8)'; // Mini view

        for (let p = 1; p <= farmConfig.plants_per_bed; p++) {
            const plant = document.createElement('div');
            plant.className = 'plant';
            plant.id = `live-b${b}-p${p}`;
            bed.appendChild(plant);
        }
        liveFarm.appendChild(bed);
    }
}

// Logs
async function loadLogs() {
    const lists = [document.getElementById('logList'), document.getElementById('logListComp'), document.getElementById('logListHome')];

    try {
        const res = await fetch(`${API_BASE}/logs`);
        const json = await res.json();

        if (json.message === 'success') {
            const html = json.data.map(l => `<li><span style="color:#888">[${new Date(l.timestamp).toLocaleTimeString()}]</span> ${l.message}</li>`).join('');
            lists.forEach(list => {
                if (list) list.innerHTML = html;
            });
        }
    } catch (e) {
        lists.forEach(list => {
            if (list) list.innerHTML = '<li>Error loading logs via API.</li>';
        });
    }
}

function prependLog(log) {
    const lists = [document.getElementById('logList'), document.getElementById('logListComp'), document.getElementById('logListHome')];

    lists.forEach(list => {
        if (!list) return;

        const item = document.createElement('li');
        item.innerHTML = `<span style="color:#888">[${new Date(log.timestamp).toLocaleTimeString()}]</span> ${log.message}`;
        item.style.animation = 'fadeIn 0.5s';
        list.prepend(item);

        if (list.children.length > 20) list.lastElementChild.remove();
    });
}

// WebSocket Connection
let socket;
let plantDataCache = {};


function connectWebSocket() {
    console.log("Connecting to Socket.IO...");

    // If we are on port 5000, use relative path (default). 
    // If on Live Server (5500+), force connection to localhost:5000
    const socketUrl = (window.location.port === '5000') ? undefined : 'http://localhost:5000';

    socket = io(socketUrl);

    socket.on('connect', () => {
        console.log("Connected to Real-Time Server");
        const term = document.getElementById('liveLogTerminal');
        if (term) term.innerHTML += `<div>> [${new Date().toLocaleTimeString()}] Connected to Farm Server</div>`;
    });

    socket.on('init', (data) => handleServerMessage({ type: 'INIT', data }));
    socket.on('update_all', (data) => handleServerMessage({ type: 'UPDATE_ALL', data }));
    socket.on('update_one', (data) => handleServerMessage({ type: 'UPDATE_ONE', data }));
    socket.on('new_log', (data) => handleServerMessage({ type: 'NEW_LOG', data }));

    socket.on('disconnect', () => {
        console.log("Disconnected from server");
        showOfflineBanner(true); // Show
        const term = document.getElementById('liveLogTerminal');
        if (term) term.innerHTML += `<div>> [${new Date().toLocaleTimeString()}] Disconnected</div>`;
    });

    socket.on('connect_error', () => {
        showOfflineBanner(true);
    });

    // Handle Stream Source Auto-Fix for Localhost
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        const streamImg = document.getElementById('liveStream');
        if (streamImg) {
            // If we are local, and src is placeholder, switch to localhost:5000
            if (streamImg.src.includes('RASPBERRY_PI_IP')) {
                streamImg.src = 'http://localhost:5000/video_feed';
                console.log("Automatically switched stream to localhost:5000 for local dev.");
            }
        }
    } else {
        // If not localhost, we assume the user has set the IP correctly in HTML or we try to use the current host if port 5000
        // But for now, let's just leave the placeholder if they haven't touched it, as we can't guess the RPi IP easily from a client unless the client IS the RPi.
        // Option 2: If we are on the RPi (e.g. accessing 192.168.1.5:5000), using relative path might be best?
        // But the <img> tag needs a full URL often if the port differs (e.g. 5000 vs 80).
        // Actually, if we are serving from port 5000, we can use relative `/video_feed`.
        if (window.location.port === '5000') {
            const streamImg = document.getElementById('liveStream');
            // If served from Flask directly
            if (streamImg && streamImg.src.includes('RASPBERRY_PI_IP')) {
                streamImg.src = '/video_feed';
            }
        }
    }

    // Handle MJPEG Video Stream
    // socket.on('stream_frame', (base64Data) => {
    //     // base64Data is just the raw string from Python (without data:image/jpg;base64 prefix usually, or check Python output)
    //     // Python sends: base64.b64encode(buffer).decode('utf-8')
    //     // We need to prefix it
    //     const src = `data:image/jpeg;base64,${base64Data}`;

    //     // Update Live Stream Element
    //     const liveStream = document.getElementById('liveStream');
    //     if (liveStream) {
    //         liveStream.src = src;
    //         liveStream.style.opacity = '1';
    //     }

    //     // Update Scan Image in Sidebar (if open)
    //     const scanImg = document.getElementById('liveScanImg');
    //     if (scanImg && document.getElementById('detailsSidebar').classList.contains('active')) {
    //         scanImg.src = src;
    //     }
    // });
}

function showOfflineBanner(show) {
    let banner = document.getElementById('offlineBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'offlineBanner';
        banner.style.position = 'fixed';
        banner.style.top = '0';
        banner.style.left = '0';
        banner.style.width = '100%';
        banner.style.background = '#d32f2f';
        banner.style.color = 'white';
        banner.style.textAlign = 'center';
        banner.style.padding = '5px';
        banner.style.zIndex = '9999';
        banner.style.fontSize = '12px';
        banner.style.fontWeight = 'bold';
        banner.innerText = '⚠️ System Offline - Reconnecting...';
        banner.style.display = 'none';
        document.body.prepend(banner);
    }
    banner.style.display = show ? 'block' : 'none';
}


function handleServerMessage(payload) {
    const { type, data } = payload;

    if (type === 'INIT' || type === 'UPDATE_ALL') {
        plantDataCache = data;
        updateFarmVisuals();
        updateSidebarIfOpen();
    }

    if (type === 'UPDATE_ONE') {
        plantDataCache[data.id] = data;
        updateFarmVisuals();
        updateSidebarIfOpen();

        // ---------------------------------------------------------
        // REAL-TIME SYSTEM STATUS & AI UPDATE (From RPi)
        // ---------------------------------------------------------
        const idleBadge = document.getElementById('state-idle');
        const scanBadge = document.getElementById('state-scanning');
        const sprayBadge = document.getElementById('state-spraying');

        // Reset all first
        if (idleBadge) idleBadge.style.display = 'none';
        if (scanBadge) scanBadge.style.display = 'none';
        if (sprayBadge) sprayBadge.style.display = 'none';

        // 1. Check Spraying State
        if (data.pump_weed === 'ON' || data.pump_water === 'ON') {
            if (sprayBadge) {
                sprayBadge.style.display = 'inline-flex';
                // Update Text contextually
                sprayBadge.innerHTML = data.pump_weed === 'ON'
                    ? '<i class="fa-solid fa-skull-crossbones"></i> Spraying Weedicide...'
                    : '<i class="fa-solid fa-droplet"></i> Watering...';
            }
        }
        // 2. Check Detection/Scanning State
        else if (data.detection && data.detection !== 'NONE') {
            if (scanBadge) {
                scanBadge.style.display = 'inline-flex';
                scanBadge.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Found: ${data.detection}`;
            }

            // Update Home Page AI Stats (Mocking counters for demo)
            updateAIStats(data.detection, data.confidence);
        }
        // 3. Default Idle
        else {
            if (idleBadge) idleBadge.style.display = 'inline-flex';
        }
    }

    if (type === 'NEW_LOG') {
        prependLog(data);
    }
}

// Helper to update AI Card Stats on Home Page
function updateAIStats(detection, confidence) {
    // Only update if we have a valid detection
    if (!detection || detection === 'NONE') return;

    // Simple visual update to "Last Detect" and "Today" count
    // In a real app, these would be separate socket events or persisted data
    const timeEls = document.querySelectorAll('[title="Last Detection Time"] strong');
    timeEls.forEach(el => el.innerText = 'Just now');

    // Update Confidence dynamically
    const confEls = document.querySelectorAll('[title="Average Confidence"] strong');
    confEls.forEach(el => {
        el.innerText = confidence + '%';
        el.style.color = confidence > 80 ? '#4CAF50' : '#FF9800';
    });
}

function updateFarmVisuals() {
    Object.values(plantDataCache).forEach(p => {
        const color = getStatusColor(p.status, p.moisture);

        // Live View
        const liveEl = document.getElementById(`live-b${p.bed}-p${p.plant}`);
        if (liveEl) liveEl.style.backgroundColor = color;

        // Dashboard View
        const dashEl = document.getElementById(`dash-b${p.bed}-p${p.plant}`);
        if (dashEl) dashEl.style.backgroundColor = color;
    });
}

function getStatusColor(status, moisture) {
    if (status === 'Critical') return '#d32f2f'; // Red
    if (status === 'Warning') return '#f57c00'; // Orange
    if (parseFloat(moisture) < 30) return '#ffd600'; // Yellow (Dry)
    return '#81c784'; // Green
}

function updateSidebarIfOpen() {
    const sidebar = document.getElementById('detailsSidebar');
    if (sidebar.classList.contains('active') && !isEditMode) {
        const b = parseInt(sidebar.dataset.currentBed);
        const p = parseInt(sidebar.dataset.currentPlant);
        const id = `b${b}-p${p}`;

        const data = plantDataCache[id];
        if (data) {
            document.getElementById('liveMoisture').innerText = data.moisture + '%';
            document.getElementById('liveDisease').innerText = data.detection || "None"; // Show detection class
            document.getElementById('liveStatus').innerText = data.status;

            // AI Confidence Update (Real-time)
            if (data.confidence !== undefined) {
                document.getElementById('aiConfidence').innerText = data.confidence + '%';
                document.getElementById('aiConfidenceFill').style.width = data.confidence + '%';
            }

            // Re-render chart with new point
            if (window.addChartPoint) {
                window.addChartPoint(data.moisture);
            } else {
                // Or just full re-render if function not exposed
                // renderChart(data.moisture); // This regenerates random history, maybe bad.
            }
        }
    }
}

function prependLog(log) {
    const lists = [document.getElementById('logList'), document.getElementById('logListComp')];

    lists.forEach(list => {
        if (!list) return;

        const item = document.createElement('li');
        item.innerHTML = `<span style="color:#888">[${new Date(log.timestamp).toLocaleTimeString()}]</span> ${log.message}`;
        item.style.animation = 'fadeIn 0.5s';
        list.prepend(item);

        if (list.children.length > 20) list.lastElementChild.remove();
    });
}

// ... existing code ...

// Chart live update helper
window.addChartPoint = function (value) {
    if (moistureChartInstance) {
        const data = moistureChartInstance.data.datasets[0].data;
        const labels = moistureChartInstance.data.labels;

        // Remove oldest
        data.shift();
        // Add new
        data.push(value);

        moistureChartInstance.update();
    }
};


// Edit Mode Logic
let isEditMode = false;

function toggleEditMode() {
    const sidebar = document.getElementById('detailsSidebar');
    const group = sidebar.querySelector('.data-group');

    if (!isEditMode) {
        // Switch to Edit
        isEditMode = true;
        const currentStatus = document.getElementById('liveStatus').innerText;
        const currentDisease = document.getElementById('liveDisease').innerText;
        const currentMoisture = parseFloat(document.getElementById('liveMoisture').innerText);

        group.innerHTML = `
            <div class="data-row">
                <span>Status:</span> 
                <select id="editStatus" style="padding:4px; border-radius:4px;">
                    <option value="Healthy" ${currentStatus === 'Healthy' ? 'selected' : ''}>Healthy</option>
                    <option value="Critical" ${currentStatus === 'Critical' ? 'selected' : ''}>Critical</option>
                    <option value="Warning" ${currentStatus === 'Warning' ? 'selected' : ''}>Warning</option>
                </select>
            </div>
            <div class="data-row">
                <span>Disease:</span> 
                <select id="editDisease" style="padding:4px; border-radius:4px;">
                    <option value="None" ${currentDisease === 'None' ? 'selected' : ''}>None</option>
                    <option value="Fungal Spot" ${currentDisease === 'Fungal Spot' ? 'selected' : ''}>Fungal Spot</option>
                    <option value="Yellow Rust" ${currentDisease === 'Yellow Rust' ? 'selected' : ''}>Yellow Rust</option>
                    <option value="Bight" ${currentDisease === 'Bight' ? 'selected' : ''}>Bight</option>
                </select>
            </div>
            <div class="data-row">
                <span>Moisture (%):</span> 
                <input type="number" id="editMoisture" value="${currentMoisture}" style="width:60px; padding:4px;">
            </div>
            <div style="margin-top:10px;">
                <button class="btn-primary" onclick="savePlantData()" style="width:100%; background:#1976d2;">
                    <i class="fa-solid fa-save"></i> Save Changes
                </button>
            </div>
        `;
    } else {
        // Cancel Edit (Re-fetch to reset)
        isEditMode = false;
        selectPlant(parseInt(sidebar.dataset.currentBed), parseInt(sidebar.dataset.currentPlant));
    }
}

async function savePlantData() {
    const sidebar = document.getElementById('detailsSidebar');
    const bedId = sidebar.dataset.currentBed;
    const plantId = sidebar.dataset.currentPlant;

    // Get values
    const status = document.getElementById('editStatus').value;
    const disease = document.getElementById('editDisease').value;
    const moisture = document.getElementById('editMoisture').value;

    // Optimistic Update
    isEditMode = false;

    try {
        await fetch(`${API_BASE}/plant/${bedId}/${plantId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moisture, disease, status })
        });

        // Refresh View
        selectPlant(parseInt(bedId), parseInt(plantId));
        alert("Plant data updated successfully!");

        // Log it
        await fetch(`${API_BASE}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Manual Data Override: Bed ${parseInt(bedId) + 1} Plant ${plantId}`, type: 'system' })
        });

    } catch (e) {
        console.error("Save failed", e);
        alert("Failed to save data");
    }
}

function sendMove(dir) {
    if (!socket || socket.readyState !== WebSocket.OPEN && !socket.connected) return;

    // Vibrate on mobile for feedback
    if (navigator.vibrate) navigator.vibrate(10);

    socket.emit('control_command', { action: 'MOVE', dir: dir });
}

// --- ROBOT MODE SWITCHING ---
function setRobotMode(mode) {
    const btnManualVector = [document.getElementById('btnManualMode'), document.getElementById('btnManualModeRobot')];
    const btnAutoVector = [document.getElementById('btnAutoMode'), document.getElementById('btnAutoModeRobot')];
    const autoStatusVector = [document.getElementById('autoModeStatus'), document.getElementById('autoModeStatusRobot')];
    const manualSectionVector = [document.getElementById('manualControlsSection'), document.getElementById('manualControlsSectionRobot')];

    if (mode === 'AUTO') {
        btnManualVector.forEach(el => { if (el) { el.style.background = ''; el.style.color = ''; } });
        btnAutoVector.forEach(el => { if (el) { el.style.background = 'var(--primary)'; el.style.color = '#000'; } });
        autoStatusVector.forEach(el => { if (el) el.style.display = 'block'; });
        manualSectionVector.forEach(el => { if (el) el.style.opacity = '0.3'; });
        sendRobotCommand('AUTO_ON');
    } else {
        btnAutoVector.forEach(el => { if (el) { el.style.background = ''; el.style.color = ''; } });
        btnManualVector.forEach(el => { if (el) { el.style.background = 'var(--primary)'; el.style.color = '#000'; } });
        autoStatusVector.forEach(el => { if (el) el.style.display = 'none'; });
        manualSectionVector.forEach(el => { if (el) el.style.opacity = '1'; });
        sendRobotCommand('AUTO_OFF');
    }
}

// --- ADVANCED ROBOT CONTROL FUNCTIONS ---
function updateSpeed(value) {
    document.getElementById('speedValue').innerText = value;
    document.getElementById('robotSpeedDisplay').innerText = (value * 0.5).toFixed(1) + ' km/h';
    logCommand(`Speed set to ${value}%`);
}

function updateArmBase(value) {
    document.getElementById('armBase').innerText = value;
    sendRobotCommand(`ARM,${value},${document.getElementById('armShoulder').innerText},${document.getElementById('armElbow').innerText}`);
    logCommand(`Arm Base  ${value}`);
}

function updateArmShoulder(value) {
    document.getElementById('armShoulder').innerText = value;
    sendRobotCommand(`ARM,${document.getElementById('armBase').innerText},${value},${document.getElementById('armElbow').innerText}`);
    logCommand(`Arm Shoulder  ${value}`);
}

function updateArmElbow(value) {
    document.getElementById('armElbow').innerText = value;
    sendRobotCommand(`ARM,${document.getElementById('armBase').innerText},${document.getElementById('armShoulder').innerText},${value}`);
    logCommand(`Arm Elbow  ${value}`);
}

function setArmPreset(preset) {
    const presets = {
        home: { base: 90, shoulder: 90, elbow: 90 },
        reach: { base: 90, shoulder: 45, elbow: 135 },
        rest: { base: 90, shoulder: 135, elbow: 45 },
        spray: { base: 90, shoulder: 60, elbow: 120 }
    };
    const pos = presets[preset];
    if (pos) {
        document.getElementById('armBaseSlider').value = pos.base;
        document.getElementById('armShoulderSlider').value = pos.shoulder;
        document.getElementById('armElbowSlider').value = pos.elbow;
        updateArmBase(pos.base);
        updateArmShoulder(pos.shoulder);
        updateArmElbow(pos.elbow);
        logCommand(`Preset: ${preset.toUpperCase()}`);
    }
}

function updateSprayDuration(value) {
    document.getElementById('sprayDuration').innerText = value;
    logCommand(`Spray duration set to ${value}s`);
}

function logCommand(msg) {
    const terminal = document.getElementById('robotLogTerminal');
    if (terminal) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.innerHTML = `<span style="color:#888;">[${timestamp}]</span> <span style="color:#4CAF50;">${msg}</span>`;
        terminal.appendChild(entry);
        terminal.scrollTop = terminal.scrollHeight;
    }
}

// KEYBOARD CONTROLS (WASD and Arrow Keys)
let activeKeys = new Set();

document.addEventListener('keydown', (e) => {
    // Only activate when on robot page
    const robotPage = document.getElementById('robotPage');
    if (!robotPage || robotPage.style.display === 'none') return;

    // Prevent duplicate events
    if (activeKeys.has(e.key)) return;
    activeKeys.add(e.key);

    let command = null;

    // WASD Controls
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') command = 'FORWARD';
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') command = 'BACK';
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') command = 'LEFT';
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') command = 'RIGHT';
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        command = 'STOP';
    }

    if (command) {
        e.preventDefault();
        sendRobotCommand(command);
        logCommand(`Keyboard: ${command}`);

        // Visual feedback - highlight button
        const btnMap = { 'FORWARD': 'btnUp', 'BACK': 'btnDown', 'LEFT': 'btnLeft', 'RIGHT': 'btnRight', 'STOP': 'btnStop' };
        const btn = document.getElementById(btnMap[command]);
        if (btn) btn.style.transform = 'scale(0.95)';
    }
});

document.addEventListener('keyup', (e) => {
    activeKeys.delete(e.key);

    // Stop movement on key release (except for space which is already stop)
    if (['w', 'W', 's', 'S', 'a', 'A', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        sendRobotCommand('STOP');

        // Remove visual feedback
        const btnMap = { 'w': 'btnUp', 'W': 'btnUp', 'ArrowUp': 'btnUp', 's': 'btnDown', 'S': 'btnDown', 'ArrowDown': 'btnDown', 'a': 'btnLeft', 'A': 'btnLeft', 'ArrowLeft': 'btnLeft', 'd': 'btnRight', 'D': 'btnRight', 'ArrowRight': 'btnRight' };
        const btn = document.getElementById(btnMap[e.key]);
        if (btn) btn.style.transform = '';
    }
});

// --- CHATBOT LOGIC ---
function toggleChat() {
    const chatWin = document.getElementById('chatWindow');
    chatWin.classList.toggle('hidden');
    if (!chatWin.classList.contains('hidden')) {
        document.getElementById('chatInput').focus();
    }
}

function handleChatKey(e) {
    if (e.key === 'Enter') sendChat();
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    // User Message
    addChatMsg(msg, 'user');
    input.value = '';

    // Simulate Bot Thinking
    const chatBody = document.getElementById('chatMessages');
    const loadingId = 'bot-typing-' + Date.now();

    // Add temporary loading indicator
    const loadDiv = document.createElement('div');
    loadDiv.className = 'chat-msg bot';
    loadDiv.id = loadingId;
    loadDiv.innerHTML = '<i class="fa-solid fa-ellipsis fa-bounce"></i>';
    chatBody.appendChild(loadDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        const response = getBotResponse(msg);
        addChatMsg(response, 'bot');
    }, 600);
}

function addChatMsg(text, sender) {
    const chatBody = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    div.innerHTML = text; // Allow HTML in bot responses
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function getBotResponse(input) {
    const lower = input.toLowerCase();

    // --- SYSTEM COMMANDS ---
    if (lower.includes('status') || lower.includes('system')) {
        const idle = document.getElementById('state-idle');
        const scan = document.getElementById('state-scanning');
        const spray = document.getElementById('state-spraying');

        if (spray && spray.style.display !== 'none') return "⚠️ **System is SPRAYING!** Please stand clear. Treating area...";
        if (scan && scan.style.display !== 'none') return "👀 **System is SCANNING.** Monitoring crop health...";
        return "✅ **System is IDLE.** Ready for commands.";
    }
    if (lower.includes('reset')) {
        resetArm();
        return "🤖 **Arm Reset!** Moving to home position (90°).";
    }

    // --- AGRICULTURAL KNOWLEDGE BASE ---

    // 1. CROP GUIDES
    if (lower.includes('tomato')) return "🍅 **Tomato Farming**:<br>• **Soil**: Loamy, pH 6.0-6.8<br>• **Water**: Regular, avoid wetting leaves (prevents Blight)<br>• **Pests**: Aphids, Hornworms<br>• **Tip**: Stake plants for support.";
    if (lower.includes('potato')) return "🥔 **Potato Farming**:<br>• **Soil**: Loose, sandy, acidic (pH 4.8-5.5)<br>• **Water**: Moderate, consistent moisture<br>• **Diseases**: Late Blight (Scan using our AI!)<br>• **Harvest**: When vines die back.";
    if (lower.includes('wheat')) return "🌾 **Wheat Farming**:<br>• **Climate**: Cool winters, warm summers<br>• **Soil**: Fertile loam<br>• **Sowing**: Late autumn (Winter wheat) or Spring<br>• **Uses**: Flour, feed, straw.";
    if (lower.includes('corn') || lower.includes('maize')) return "🌽 **Corn (Maize)**:<br>• **Feeder**: Heavy nitrogen feeder (Use manure/urea)<br>• **Water**: Critical during tasseling<br>• **Spacing**: 12 inches apart<br>• **Pests**: Corn borers.";
    if (lower.includes('rice')) return "🍚 **Rice Farming**:<br>• **Method**: Flooded fields (paddies) or dryland<br>• **Water**: High requirement<br>• **Climate**: Hot and humid<br>• **Harvest**: When grain turns golden.";
    if (lower.includes('cotton')) return "🧶 **Cotton**:<br>• **Soil**: Black soil (Regur) is best<br>• **Climate**: Long frost-free period<br>• **Pests**: Bollworm (Requires pest management).";

    // 2. SOIL & FERTILIZERS
    if (lower.includes('soil') || lower.includes('dirt')) return "🌱 **Soil Types**:<br>• **Sandy**: Drains fast, low nutrients.<br>• **Clay**: Holds water, hard to work.<br>• **Loam**: Best for farming (Sand+Silt+Clay mixture).<br>• **Tip**: Test pH before planting!";
    if (lower.includes('fertilizer') || lower.includes('npk')) return "🧪 **Fertilizers (NPK)**:<br>• **N (Nitrogen)**: Leaf growth (Green).<br>• **P (Phosphorus)**: Root & Flower development.<br>• **K (Potassium)**: Overall health & disease resistance.";
    if (lower.includes('ph')) return "⚖️ **Soil pH**:<br>• **Acidic (<7)**: Blueberry, Potato.<br>• **Neutral (7)**: Most vegetables.<br>• **Alkaline (>7)**: Asparagus, Spinach.<br>• **Fix**: Add Lime to raise pH, Sulfur to lower it.";

    // 3. IRRIGATION & WATER
    if (lower.includes('water') || lower.includes('irrigation')) return "💧 **Irrigation Methods**:<br>• **Drip**: Efficient, delivers water to roots (Saves up to 50%).<br>• **Sprinkler**: Simulates rain, good for coverage.<br>• **Flood**: Simple but wasteful.<br>• **Smart**: Use moisture sensors (Like ours!) to water only when needed.";
    if (lower.includes('hydroponic')) return "🧪 **Hydroponics**: Growing plants without soil using nutrient-rich water. Fast growth, saves water, but requires technical setup.";

    // 4. PESTS & DISEASES
    if (lower.includes('pest') || lower.includes('insect')) return "🐛 **Common Pests**:<br>• **Aphids**: Spray Neem Oil or soapy water.<br>• **Caterpillars**: Handpick or use BT spray.<br>• **Whiteflies**: Yellow sticky traps.<br>Our robot can detect weeds which often harbor pests!";
    if (lower.includes('weed')) return "🌿 **Weeds**: Unwanted plants that steal nutrients.<br>• **Control**: Mulching, hand-pulling, or Herbicides.<br>• **Our Bot**: Uses AI to detect and selectively spray weeds to reduce chemical usage.";
    if (lower.includes('disease') || lower.includes('fungus')) return "🦠 **Plant Diseases**:<br>• **Fungal**: Powdery Mildew, Rust, Blight (High humidity).<br>• **Bacterial**: Wilts, spots.<br>• **Viral**: Mosaic virus (Spread by insects).<br>• **Prevention**: Crop rotation, proper spacing.";

    // 5. MODERN TECHNIQUES
    if (lower.includes('rotation')) return "🔄 **Crop Rotation**: Growing different crops in succession on the same land. Prevents soil depletion and breaks pest cycles. (e.g., Corn -> Beans -> Wheat).";
    if (lower.includes('organic')) return "🍃 **Organic Farming**: Avoids synthetic chemicals. Uses compost, manure, crop rotation, and biological pest control for sustainable food.";
    if (lower.includes('iot') || lower.includes('smart')) return "🤖 **Smart Farming (IoAg)**: Using sensors, drones, and robots (like AgroBot!) to monitor precision metrics (Moisture, Temp, Health) and automate tasks.";

    // GREETINGS & HELP
    if (lower.includes('hello') || lower.includes('hi')) return "👋 Hello! I am the AgroBot Knowledge Base. Ask me about specific crops (Tomato, Wheat...), techniques (Irrigation, Hydroponics), or pests!";
    if (lower.includes('help')) return "Try asking about:<br>• 🍅 **Crops**: 'How to grow tomato?'<br>• 🧪 **Soil**: 'Explain NPK' or 'Soil types'<br>• 🐛 **Pests**: 'Common pests'<br>• 💧 **Water**: 'Drip irrigation'<br>• 🤖 **System**: 'Status' or 'Weed mode'";

    return "🤔 I don't have that in my database yet. Try searching for a specific Crop, Pest, or Farming Technique (e.g., 'Soil', 'Corn', 'Irrigation').";
}

// --- CSV DATA VISUALIZATION ---
// --- CSV DATA VISUALIZATION ---
let csvChartInstance = null;

function initCSVChart() {
    const ctx = document.getElementById('csvChart').getContext('2d');
    if (csvChartInstance) {
        csvChartInstance.destroy();
    }

    // Empty Placeholder Chart
    csvChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Fetching Data from Server...' },
                legend: { position: 'bottom' }
            },
            scales: {
                x: { title: { display: true, text: 'Time' }, ticks: { maxTicksLimit: 10 } },
                y: { beginAtZero: true }
            }
        }
    });

    // Auto-Load Server Data
    loadServerCSV();
}

function loadServerCSV() {
    fetch('/history.csv') // Served by Express static from public/
        .then(response => {
            if (!response.ok) throw new Error("No history found");
            return response.text();
        })
        .then(csvText => {
            console.log("Loaded history.csv from server");
            processCSVData(csvText);
        })
        .catch(err => {
            console.log("Using manual upload mode:", err);
            if (csvChartInstance) csvChartInstance.options.plugins.title.text = "No Server History Found. Upload local CSV.";
            if (csvChartInstance) csvChartInstance.update();
        });
}

function handleCSVUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        processCSVData(text);
    };
    reader.readAsText(file);
}

function processCSVData(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
        alert("CSV File is empty or invalid!");
        return;
    }

    // Assume Header: Timestamp, Moisture, Temperature
    // Or just generic: Label, Val1, Val2...
    const headers = lines[0].split(',').map(h => h.trim());
    const labels = [];
    const dataset1 = []; // e.g. Moisture
    const dataset2 = []; // e.g. Temp

    // Generic parser for 3 columns: Time, Val1, Val2
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length < 2) continue;

        labels.push(row[0].trim()); // Time
        dataset1.push(parseFloat(row[1]));
        if (row[2]) dataset2.push(parseFloat(row[2]));
    }

    updateCSVChart(headers, labels, dataset1, dataset2);
}

function updateCSVChart(headers, labels, d1, d2) {
    if (!csvChartInstance) initCSVChart();

    csvChartInstance.data.labels = labels;
    csvChartInstance.data.datasets = [
        {
            label: headers[1] || 'Sensor 1',
            data: d1,
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4,
            fill: true
        }
    ];

    if (d2 && d2.length > 0) {
        csvChartInstance.data.datasets.push({
            label: headers[2] || 'Sensor 2',
            data: d2,
            borderColor: '#FFC107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            tension: 0.4,
            fill: true
        });
    }

    csvChartInstance.options.plugins.title.text = `Data Analysis: ${labels.length} Data Points`;
    csvChartInstance.update();
}

// --- CAMERA CONFIGURATION ---
function toggleCamConfig() {
    const p = document.getElementById('camConfigPanel');
    if (p.style.display === 'none') {
        p.style.display = 'block';
        p.style.animation = 'fadeIn 0.3s';

        // Pre-fill if known and valid
        const currentSrc = document.getElementById('liveStream').src;
        // Don't pre-fill with the offline placeholder or empty
        if (currentSrc && !currentSrc.includes('picsum') && !currentSrc.includes('localhost:5000')) {
            document.getElementById('cameraUrlInput').value = currentSrc;
        }
    } else {
        p.style.display = 'none';
    }
}

async function saveCameraUrl() {
    const url = document.getElementById('cameraUrlInput').value.trim();
    if (!url) {
        alert("Please enter a valid URL");
        return;
    }

    // Update Image Immediate
    const img = document.getElementById('liveStream');
    if (img) {
        img.style.opacity = '1';
        img.src = url;
        // Hide offline message if it was showing
        const offlineMsg = document.getElementById('camOfflineMsg');
        if (offlineMsg) offlineMsg.style.display = 'none';
    }

    // Save to Settings API
    try {
        await saveSetting('camera_url', url);

        // Log it
        prependLog({ message: `Camera Source updated`, timestamp: new Date() });

        // Close panel
        toggleCamConfig();

    } catch (e) {
        console.error("Error saving camera url", e);
    }
}

// --- RETRY VIDEO STREAM ---
function retryVideoStream() {
    const streamImg = document.getElementById('liveStream');
    const offlineMsg = document.getElementById('camOfflineMsg');

    if (streamImg) {
        // Hide offline message for a moment
        if (offlineMsg) offlineMsg.style.display = 'none';

        // Reset opacity to show loading/image
        streamImg.style.opacity = '1';

        // Force reload by updating src with timestamp (prevents cache)
        // Check if src is localhost, or placeholder
        let baseSrc = streamImg.src.split('?')[0];

        // Ensure we don't accidentally retry a broken placeholder URL if we can help it
        // If we are on localhost, and src is placeholder, fix it again
        if ((window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') && baseSrc.includes('RASPBERRY_PI_IP')) {
            baseSrc = 'http://localhost:5000/video_feed';
        }

        streamImg.src = `${baseSrc}?t=${new Date().getTime()}`;

        console.log("Retrying video stream:", streamImg.src);
    }
}

const API_BASE = (window.location.port === '3000') ? '/api' : 'http://localhost:3000/api';
console.log("API Base set to:", API_BASE);

// Translations
const translations = {
    en: {
        navHome: "Home",
        navDashboard: "Dashboard",
        navLive: "Live Activity",
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
        compActuators: "⚙️ Manual Controls",
        compNetwork: "🌐 Network & Power",
        loginTitle: "Welcome Back",
        loginSubtitle: "Sign in to monitor your field",
        btnLogin: "Login"
    },
    mr: {
        navHome: "मुख्यपृष्ठ",
        navDashboard: "डॅशबोर्ड",
        navLive: "थेट क्रियाकलाप",
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
        compActuators: "⚙️ मॅन्युअल नियंत्रणे",
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
        sub.innerText = currentLang === 'en' ? "Join Team Agrosense" : "Team Agrosense मध्ये सामील व्हा";
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
                showPage('home');
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
    // loadSettings(); // Wait for login
    // startSimulation();
    // showPage('home');
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
});

// Navigation
function showPage(pageId) {
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
    if (pageId === 'home') loadLogs();
    if (pageId === 'live') renderLiveFarm();
    if (pageId === 'components') loadComponents();
}

// Components Logic
function loadComponents() {
    const list = document.getElementById('sensorList');
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
    const state = checkbox.checked ? 'Active' : 'Off';
    const type = 'manual_control';
    const msg = `${id.toUpperCase()} switched ${state.toUpperCase()}`;

    // Update Text UI
    const txtIds = { 'pump': 'txt-pump', 'sprayer': 'txt-sprayer', 'camera': 'txt-camera', 'lights': 'txt-lights' };
    const txtEl = document.getElementById(txtIds[id]);

    if (checkbox.checked) {
        if (id === 'pump') txtEl.innerText = 'Active • Flow: 12L/min';
        if (id === 'sprayer') txtEl.innerText = 'Active • Spraying...';
        if (id === 'camera') txtEl.innerText = 'Tracking • 30fps';
        if (id === 'lights') txtEl.innerText = 'On • 100% Brightness';

        checkbox.closest('.comp-item').className = 'comp-item active';
    } else {
        txtEl.innerText = 'Off • Idle';
        checkbox.closest('.comp-item').className = 'comp-item inactive';
    }

    // Log to backend
    try {
        await fetch(`${API_BASE}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, type: type })
        });
    } catch (e) { console.error(e); }
}

async function triggerAction(actionName) {
    if (confirm(`Are you sure you want to trigger: ${actionName}?`)) {
        // Send to backend
        try {
            await fetch(`${API_BASE}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Quick Action Triggered: ${actionName}`, type: 'system' })
            });
            alert(`Action "${actionName}" initiated.`);
            loadLogs(); // Refresh logs
        } catch (e) {
            console.error("Error triggering action", e);
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
            if (json.data.camera_url) {
                const streamImg = document.getElementById('liveStream');
                if (streamImg) {
                    streamImg.src = json.data.camera_url;
                    streamImg.style.opacity = '1';
                    document.getElementById('camOfflineMsg').style.display = 'none';
                }
                const camInput = document.getElementById('cameraUrl');
                if (camInput) camInput.value = json.data.camera_url;
            }

            // Update local state
            farmConfig = {
                beds: parseInt(json.data.beds) || 2,
                plants_per_bed: parseInt(json.data.plants_per_bed) || 6,
                plant_size: parseInt(json.data.plant_size) || 28
            };

            generateFarm(); // Render with loaded config
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
    const list = document.getElementById('logList');
    try {
        const res = await fetch(`${API_BASE}/logs`);
        const json = await res.json();
        if (json.message === 'success') {
            list.innerHTML = json.data.map(l => `<li><span style="color:#888">[${new Date(l.timestamp).toLocaleTimeString()}]</span> ${l.message}</li>`).join('');
        }
    } catch (e) {
        list.innerHTML = '<li>Error loading logs via API.</li>';
    }
}

// WebSocket Connection
let socket;
let plantDataCache = {};


function connectWebSocket() {
    console.log("Connecting to Socket.IO...");

    // If we are on port 3000, use relative path (default). 
    // If on Live Server (5500), force connection to localhost:3000
    const socketUrl = (window.location.port === '3000') ? undefined : 'http://localhost:3000';

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

    // Handle MJPEG Video Stream
    socket.on('stream_frame', (base64Data) => {
        // base64Data is just the raw string from Python (without data:image/jpg;base64 prefix usually, or check Python output)
        // Python sends: base64.b64encode(buffer).decode('utf-8')
        // We need to prefix it
        const src = `data:image/jpeg;base64,${base64Data}`;

        // Update Live Stream Element
        const liveStream = document.getElementById('liveStream');
        if (liveStream) {
            liveStream.src = src;
            liveStream.style.opacity = '1';
        }

        // Update Scan Image in Sidebar (if open)
        const scanImg = document.getElementById('liveScanImg');
        if (scanImg && document.getElementById('detailsSidebar').classList.contains('active')) {
            scanImg.src = src;
        }
    });
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
        updateFarmVisuals(); // specific optimization could be done here
        updateSidebarIfOpen();
    }

    if (type === 'NEW_LOG') {
        prependLog(data);
    }
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
            document.getElementById('liveDisease').innerText = data.disease;
            document.getElementById('liveStatus').innerText = data.status;

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
    const list = document.getElementById('logList');
    if (!list) return;

    const item = document.createElement('li');
    item.innerHTML = `<span style="color:#888">[${new Date(log.timestamp).toLocaleTimeString()}]</span> ${log.message}`;
    item.style.animation = 'fadeIn 0.5s';
    list.prepend(item);

    if (list.children.length > 20) list.lastElementChild.remove();
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

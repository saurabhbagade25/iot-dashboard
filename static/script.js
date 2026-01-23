function send(cmd) {
    // Visual Feedback
    if (navigator.vibrate) navigator.vibrate(10);

    fetch("/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd: cmd })
    })
        .then(res => res.json())
        .then(data => {
            console.log(`Command ${cmd}:`, data.success ? "Sent" : "Failed");
        })
        .catch(err => console.error("Command Error:", err));
}

function updateStatus() {
    fetch("/status")
        .then(res => res.json())
        .then(data => {
            const modeEl = document.getElementById("mode");
            const detectEl = document.getElementById("detection");
            const pumpEl = document.getElementById("pump");

            modeEl.innerText = data.mode;
            detectEl.innerText = data.detection;

            // Dynamic Styling
            if (data.detection !== "None") {
                detectEl.className = "value highlight";
                detectEl.style.color = "#4caf50";
            } else {
                detectEl.className = "value";
                detectEl.style.color = "#333";
            }

            pumpEl.innerText = data.pump;

            if (data.pump === "SPRAYING" || data.pump === "Action") {
                pumpEl.style.color = "#d32f2f";
                pumpEl.style.fontWeight = "bold";
            } else {
                pumpEl.style.color = "#2e7d32";
            }
        })
        .catch(err => console.error("Status Poll Error:", err));
}

// Poll Status every 1 second
setInterval(updateStatus, 1000);

// Keyboard Control
document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    switch (e.key) {
        case "ArrowUp": send('forward'); break;
        case "ArrowDown": send('backward'); break;
        case "ArrowLeft": send('left'); break;
        case "ArrowRight": send('right'); break;
        case " ": send('stop'); break; // Spacebar
    }
});

const digitalClock = document.getElementById('digitalClock');
const toggleTheme = document.getElementById('toggleTheme');
const toggleFormat = document.getElementById('toggleFormat');
const minutes = document.getElementById('minutes');
const startTimer = document.getElementById('startTimer');
const countdownDisplay = document.getElementById('countdownDisplay');
const alarmTime = document.getElementById('alarmTime');
const setAlarm = document.getElementById('setAlarm');
const alarmsList = document.getElementById('alarmsList');
const stopAlarm = document.getElementById('stopAlarm');
const alarmAudio = document.getElementById('alarmAudio');

let is24Hour = false;
let alarms = JSON.parse(localStorage.getItem("alarms")) || [];
let countdownValue = null;

function renderClockDigits(timeStr) {
    digitalClock.innerHTML = "";
    timeStr.split("").forEach(char => {
        const span = document.createElement('span');
        span.classList.add('flip-digit');
        span.textContent = char;
        digitalClock.appendChild(span);
    });
}

function updateClock() {
    const now = new Date();
    let h = now.getHours();
    let m = String(now.getMinutes()).padStart(2, "0");
    let s = String(now.getSeconds()).padStart(2, "0");
    let ampm = "";

    if (!is24Hour) {
        ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
    }

    const timeStr = `${String(h).padStart(2, "0")}:${m}:${s}${ampm}`;
    renderClockDigits(timeStr);
}
updateClock();
setInterval(updateClock, 1000);

toggleFormat.addEventListener("click", () => {
    is24Hour = !is24Hour;
    toggleFormat.textContent = is24Hour ? "Switch to 12Hr" : "Switch to 24Hr";
});

toggleTheme.addEventListener("click", () => {
    const isLight = document.body.classList.contains("light");
    document.body.classList.toggle("light", !isLight);
    document.body.classList.toggle("dark", isLight);
    const savedTheme = !isLight ? "light" : "dark";
    localStorage.setItem("theme", savedTheme);
    toggleTheme.textContent = savedTheme === "light" ? "🌙" : "☀️";
})

startTimer.addEventListener("click", () => {
    const mins = parseInt(minutes.value);
    if (!mins || mins <= 0) return alert("Please enter valid countdown time in minutes!");

    let totalSecs = mins * 60;
    countdownValue = Date.now() + totalSecs * 1000;
    localStorage.setItem("countdownValue", countdownValue);

    const interval = setInterval(() => {
        const remaining = Math.floor((countdownValue - Date.now()) / 1000);
        const mins = Math.floor(remaining / 60);
        const secs = String(remaining % 60).padStart(2, "0");

        if (remaining <= 0) {
            clearInterval(interval);
            countdownDisplay.textContent = "Time's Up!";
            triggerAlarm();
            localStorage.removeItem("countdownValue");
        } else {
            countdownDisplay.textContent = `${mins}:${secs}`;
        }
    }, 1000);
});

window.addEventListener("load", () => {
    const savedCountdown = localStorage.getItem("countdownValue");
    if (savedCountdown) {
        countdownValue = parseInt(savedCountdown);
        const remaining = Math.floor((countdownValue - Date.now()) / 1000);

        if (remaining > 0) {
            let interval = setInterval(() => {
                const timeLeft = Math.floor((countdownValue - Date.now()) / 1000);
                const mins = Math.floor(timeLeft / 60);
                const secs = String(timeLeft % 60).padStart(2, "0");

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    countdownDisplay.textContent = "Time's Up!";
                    triggerAlarm();
                    localStorage.removeItem("countdownValue");
                } else {
                    countdownDisplay.textContent = `${mins}:${secs}`;
                }
            }, 1000);
        } else {
            countdownDisplay.textContent = "Time's Up!";
            triggerAlarm();
            localStorage.removeItem("countdownValue");
        }
    }
});

function saveAlarms() {
    localStorage.setItem("alarms", JSON.stringify(alarms));
}

function renderAlarms() {
    alarmsList.innerHTML = "";
    alarms.forEach((alarm) => {
        const li = document.createElement('li');
        li.textContent = `⏰ ${alarm}`;
        alarmsList.appendChild(li);
    });
}
renderAlarms();

setAlarm.addEventListener("click", () => {
    const time = alarmTime.value;
    if (time && !alarms.includes(time)) {
        alarms.push(time);
        saveAlarms();
        renderAlarms();
    }
});

setInterval(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    alarms.forEach((alarm, index) => {
        if (alarm === currentTime) {
            alarms.splice(index, 1);
            saveAlarms();
            renderAlarms();
            triggerAlarm();
        }
    });
}, 1000);

function triggerAlarm() {
    alarmAudio.play();
    stopAlarm.classList.remove("hidden");
}

stopAlarm.addEventListener("click", () => {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    stopAlarm.classList.add("hidden");
});
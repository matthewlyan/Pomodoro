// ============================================================
// timer.js — Core timer logic (modes, countdown, alarm)
// ============================================================

// Default durations for each timer mode (in seconds).
// These can be overridden by the user via the Settings panel.
const MODES = {
  work:  { time: 25 * 60, label: 'Focus Time',  color: 'work'  },
  short: { time: 5 * 60,  label: 'Short Break',  color: 'short' },
  long:  { time: 15 * 60, label: 'Long Break',   color: 'long'  },
};

// Circumference of the SVG ring (2πr, r=130) — used to animate the progress arc
const CIRC = 2 * Math.PI * 130;

// ============================================================
// STATE VARIABLES
// ============================================================
let mode = 'work';                // Current timer mode: 'work', 'short', or 'long'
let timeLeft = MODES.work.time;   // Seconds remaining in the current timer
let totalTime = MODES.work.time;  // Total seconds for the current mode (used for progress %)
let running = false;              // Whether the timer is actively counting down
let interval = null;              // Reference to setInterval so we can clear it
let sessionsCompleted = 0;        // Focus sessions completed in this browser session

// Persistent daily session count (survives page reloads)
let totalToday = parseInt(localStorage.getItem('pomo_today') || '0');
let todayDate = localStorage.getItem('pomo_date') || '';

// If the stored date doesn't match today, reset the daily counter
const today = new Date().toDateString();
if (todayDate !== today) { totalToday = 0; localStorage.setItem('pomo_date', today); }

// ============================================================
// MODE SWITCHING
// Stops the timer (if running) and switches to the selected mode,
// resetting the countdown to that mode's full duration.
// ============================================================
function setMode(m) {
  if (running) toggleTimer();  // Stop the timer before switching
  mode = m;
  timeLeft = MODES[m].time;
  totalTime = MODES[m].time;
  updateDisplay();
  updateTabs();
  updateRing();
}

// ============================================================
// TIMER CONTROLS
// ============================================================

// Toggles the timer between running (START) and paused (PAUSE)
function toggleTimer() {
  if (running) {
    clearInterval(interval);
    running = false;
    document.getElementById('start-btn').textContent = 'START';
  } else {
    running = true;
    document.getElementById('start-btn').textContent = 'PAUSE';
    interval = setInterval(tick, 1000);  // Fire every 1 second
  }
  updateTabs();
}

// Called every second while the timer is running.
// When it reaches 0, plays an alarm and auto-switches to the next mode.
function tick() {
  timeLeft--;
  if (timeLeft < 0) {
    clearInterval(interval);
    running = false;
    playAlarm();

    // After a focus session, increment counters and switch to a break
    if (mode === 'work') {
      sessionsCompleted++;
      totalToday++;
      localStorage.setItem('pomo_today', totalToday);
      // Log the completed session duration to metrics
      logSession(Math.round(MODES.work.time / 60));
      // Every 4th session gets a long break instead of short
      if (sessionsCompleted % 4 === 0) setMode('long');
      else setMode('short');
    } else {
      // After a break, go back to focus mode
      setMode('work');
    }
    updateSessions();
    return;
  }
  updateDisplay();
  updateRing();
}

// Resets the current timer back to full duration without changing the mode
function resetTimer() {
  if (running) toggleTimer();
  timeLeft = MODES[mode].time;
  totalTime = MODES[mode].time;
  updateDisplay();
  updateRing();
}

// Skips the current timer and moves to the next mode
function skipTimer() {
  if (running) toggleTimer();
  if (mode === 'work') {
    sessionsCompleted++;
    totalToday++;
    localStorage.setItem('pomo_today', totalToday);
    if (sessionsCompleted % 4 === 0) setMode('long');
    else setMode('short');
  } else {
    setMode('work');
  }
  updateSessions();
}

// Resets the daily session counter to 0
function resetSessions() {
  sessionsCompleted = 0;
  totalToday = 0;
  localStorage.setItem('pomo_today', '0');
  updateSessions();
}

// ============================================================
// ALARM & NOTIFICATIONS
// Plays a 5-note chime via Web Audio API and sends a desktop notification.
// ============================================================
function playAlarm() {
  try {
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 659, 523];  // C5, E5, G5, E5, C5
    notes.forEach((freq, i) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.connect(gain); gain.connect(actx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, actx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + i * 0.25 + 0.3);
      osc.start(actx.currentTime + i * 0.25);
      osc.stop(actx.currentTime + i * 0.25 + 0.3);
    });
  } catch (e) {}

  if (Notification.permission === 'granted') {
    new Notification('Pomodoro', {
      body: mode === 'work' ? 'Focus session complete! Take a break.' : 'Break over! Time to focus.'
    });
  }
}

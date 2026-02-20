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
const TIMER_STATE_KEY = 'pomo_timer_state';

// ============================================================
// STATE VARIABLES
// ============================================================
let mode = 'work';                // Current timer mode: 'work', 'short', or 'long'
let timeLeft = MODES.work.time;   // Seconds remaining in the current timer
let totalTime = MODES.work.time;  // Total seconds for the current mode (used for progress %)
let running = false;              // Whether the timer is actively counting down
let interval = null;              // Reference to setInterval so we can clear it
let endTime = null;               // UNIX ms timestamp when the current run ends
let sessionsCompleted = 0;        // Focus sessions completed in this browser session
let timerStateRestored = false;   // Whether timer mode/progress came from persisted state

// Persistent daily session count (survives page reloads)
let totalToday = parseInt(localStorage.getItem('pomo_today') || '0');
let todayDate = localStorage.getItem('pomo_date') || '';

// If the stored date doesn't match today, reset the daily counter
const today = new Date().toDateString();
if (todayDate !== today) { totalToday = 0; localStorage.setItem('pomo_date', today); }

loadTimerState();

if (running && endTime !== null) {
  if (Date.now() >= endTime) {
    running = false;
    endTime = null;
    handleTimerEnd(false);
  } else {
    startIntervalLoop();
  }
}

// ============================================================
// STATE PERSISTENCE / HELPERS
// ============================================================
function ensureTodayCounter() {
  const current = new Date().toDateString();
  if (todayDate !== current) {
    todayDate = current;
    totalToday = 0;
    localStorage.setItem('pomo_date', todayDate);
    localStorage.setItem('pomo_today', String(totalToday));
  }
}

function remainingSeconds() {
  if (!running || endTime === null) return timeLeft;
  return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
}

function saveTimerState() {
  ensureTodayCounter();
  localStorage.setItem('pomo_today', String(totalToday));
  localStorage.setItem('pomo_date', todayDate);
  localStorage.setItem(
    TIMER_STATE_KEY,
    JSON.stringify({
      mode,
      timeLeft: remainingSeconds(),
      totalTime,
      running,
      endTime,
      sessionsCompleted,
    })
  );
}

function loadTimerState() {
  const raw = localStorage.getItem(TIMER_STATE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !MODES[parsed.mode]) return;
    mode = parsed.mode;
    timeLeft = Number.isFinite(parsed.timeLeft) ? Math.max(0, Math.floor(parsed.timeLeft)) : MODES[mode].time;
    totalTime = Number.isFinite(parsed.totalTime) ? Math.max(1, Math.floor(parsed.totalTime)) : MODES[mode].time;
    sessionsCompleted = Number.isFinite(parsed.sessionsCompleted) ? Math.max(0, Math.floor(parsed.sessionsCompleted)) : 0;
    running = !!parsed.running;
    endTime = Number.isFinite(parsed.endTime) ? parsed.endTime : null;
    if (running && endTime === null) running = false;
    timerStateRestored = true;
  } catch (e) {}
}

function startIntervalLoop() {
  clearInterval(interval);
  interval = setInterval(tick, 250);
  document.getElementById('start-btn').textContent = 'PAUSE';
}

function stopIntervalLoop() {
  clearInterval(interval);
  interval = null;
}

function completeFocusSession() {
  ensureTodayCounter();
  sessionsCompleted++;
  totalToday++;
  localStorage.setItem('pomo_today', String(totalToday));
  logSession(Math.round(MODES.work.time / 60));
}

function handleTimerEnd(playSound) {
  if (playSound) playAlarm();

  if (mode === 'work') {
    completeFocusSession();
    if (sessionsCompleted % 4 === 0) setMode('long');
    else setMode('short');
  } else {
    setMode('work');
  }
  updateSessions();
  saveTimerState();
}

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
  saveTimerState();
}

// ============================================================
// TIMER CONTROLS
// ============================================================

// Toggles the timer between running (START) and paused (PAUSE)
function toggleTimer() {
  if (running) {
    timeLeft = remainingSeconds();
    stopIntervalLoop();
    running = false;
    endTime = null;
    document.getElementById('start-btn').textContent = 'START';
  } else {
    running = true;
    endTime = Date.now() + timeLeft * 1000;
    startIntervalLoop();
  }
  updateTabs();
  updateDisplay();
  updateRing();
  saveTimerState();
}

// Called every second while the timer is running.
// When it reaches 0, plays an alarm and auto-switches to the next mode.
function tick() {
  const next = remainingSeconds();
  if (next <= 0) {
    timeLeft = 0;
    stopIntervalLoop();
    running = false;
    endTime = null;
    handleTimerEnd(true);
    return;
  }
  if (next !== timeLeft) {
    timeLeft = next;
    updateDisplay();
    updateRing();
    saveTimerState();
  }
}

// Resets the current timer back to full duration without changing the mode
function resetTimer() {
  if (running) toggleTimer();
  timeLeft = MODES[mode].time;
  totalTime = MODES[mode].time;
  updateDisplay();
  updateRing();
  saveTimerState();
}

// Skips the current timer and moves to the next mode
function skipTimer() {
  if (running) toggleTimer();
  if (mode === 'work') {
    // Skipping focus time does not count as a completed session.
    setMode('short');
  } else {
    setMode('work');
  }
  updateSessions();
  saveTimerState();
}

// Resets the daily session counter to 0
function resetSessions() {
  ensureTodayCounter();
  sessionsCompleted = 0;
  totalToday = 0;
  localStorage.setItem('pomo_today', '0');
  updateSessions();
  saveTimerState();
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

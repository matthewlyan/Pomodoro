// ============================================================
// settings.js — Custom timer durations with localStorage persistence
// ============================================================

// Toggles the settings panel open/closed
function toggleSettings() {
  document.getElementById('settings-panel').classList.toggle('open');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readMinutes(id, fallback, min, max) {
  const raw = parseInt(document.getElementById(id).value, 10);
  return clamp(Number.isFinite(raw) ? raw : fallback, min, max);
}

// Reads input fields, updates MODES durations, saves to localStorage, resets current timer
function applySettings() {
  const w = readMinutes('set-work', 25, 1, 120);   // Focus minutes
  const s = readMinutes('set-short', 5, 1, 60);    // Short break minutes
  const l = readMinutes('set-long', 15, 1, 60);    // Long break minutes

  document.getElementById('set-work').value = w;
  document.getElementById('set-short').value = s;
  document.getElementById('set-long').value = l;

  MODES.work.time = w * 60;
  MODES.short.time = s * 60;
  MODES.long.time = l * 60;
  localStorage.setItem('pomo_settings', JSON.stringify({ work: w, short: s, long: l }));
  setMode(mode);  // Re-apply current mode with new duration
  document.getElementById('settings-panel').classList.remove('open');
}

// Restores saved settings from localStorage on page load
function loadSettings() {
  const saved = JSON.parse(localStorage.getItem('pomo_settings') || 'null');
  if (saved) {
    const w = clamp(parseInt(saved.work, 10) || 25, 1, 120);
    const s = clamp(parseInt(saved.short, 10) || 5, 1, 60);
    const l = clamp(parseInt(saved.long, 10) || 15, 1, 60);
    MODES.work.time = w * 60;
    MODES.short.time = s * 60;
    MODES.long.time = l * 60;
    document.getElementById('set-work').value = w;
    document.getElementById('set-short').value = s;
    document.getElementById('set-long').value = l;

    // If a specific timer state was restored, preserve its remaining time.
    if (!timerStateRestored) {
      timeLeft = MODES[mode].time;
      totalTime = MODES[mode].time;
    } else {
      totalTime = MODES[mode].time;
      timeLeft = Math.min(timeLeft, totalTime);
    }
  }
}

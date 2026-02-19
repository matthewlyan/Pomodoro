// ============================================================
// settings.js — Custom timer durations with localStorage persistence
// ============================================================

// Toggles the settings panel open/closed
function toggleSettings() {
  document.getElementById('settings-panel').classList.toggle('open');
}

// Reads input fields, updates MODES durations, saves to localStorage, resets current timer
function applySettings() {
  const w = parseInt(document.getElementById('set-work').value) || 25;   // Focus minutes
  const s = parseInt(document.getElementById('set-short').value) || 5;   // Short break minutes
  const l = parseInt(document.getElementById('set-long').value) || 15;   // Long break minutes
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
    MODES.work.time = saved.work * 60;
    MODES.short.time = saved.short * 60;
    MODES.long.time = saved.long * 60;
    document.getElementById('set-work').value = saved.work;
    document.getElementById('set-short').value = saved.short;
    document.getElementById('set-long').value = saved.long;
    timeLeft = MODES[mode].time;
    totalTime = MODES[mode].time;
  }
}

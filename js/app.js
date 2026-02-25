// ============================================================
// app.js — Initialization (runs after all other scripts are loaded)
// ============================================================

// Ask for notification permission on first visit
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Toggle functions for auto-start and sound
function toggleAutoStart() {
  autoStartEnabled = document.getElementById('auto-start-toggle').checked;
  localStorage.setItem('pomo_autostart', String(autoStartEnabled));
}

function toggleSound() {
  soundEnabled = document.getElementById('sound-toggle').checked;
  localStorage.setItem('pomo_sound', String(soundEnabled));
}

// Load saved settings (custom durations)
loadSettings();

// Restore toggle states
document.getElementById('auto-start-toggle').checked = autoStartEnabled;
document.getElementById('sound-toggle').checked = soundEnabled;

// Render all UI components
renderTasks();
renderMetrics();
updateDisplay();
updateRing();
updateSessions();
updateTabs();

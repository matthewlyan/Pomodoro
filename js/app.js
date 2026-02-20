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

// Global keyboard shortcuts
document.addEventListener('keydown', (event) => {
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (event.code === 'Space') {
    event.preventDefault();
    toggleTimer();
  } else if (event.key.toLowerCase() === 'r') {
    event.preventDefault();
    resetTimer();
  } else if (event.key.toLowerCase() === 'n') {
    event.preventDefault();
    skipTimer();
  }
});

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

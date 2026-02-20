// ============================================================
// app.js — Initialization (runs after all other scripts are loaded)
// ============================================================

// Ask for notification permission on first visit
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
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

// Render all UI components
renderTasks();
renderMetrics();
updateDisplay();
updateRing();
updateSessions();
updateTabs();

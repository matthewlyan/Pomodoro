// ============================================================
// app.js — Initialization (runs after all other scripts are loaded)
// ============================================================

// Ask for notification permission on first visit
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Load saved settings (custom durations)
loadSettings();

// Render all UI components
renderTasks();
renderMetrics();
updateDisplay();
updateRing();
updateSessions();
updateTabs();

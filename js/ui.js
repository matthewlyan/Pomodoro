// ============================================================
// ui.js — All DOM update functions (display, tabs, ring, sessions)
// ============================================================

// Updates the MM:SS display and the browser tab title
function updateDisplay() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  document.getElementById('time').textContent =
    String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  document.getElementById('label').textContent = MODES[mode].label;
  // Show remaining time in the browser tab
  document.title = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')} - Pomodoro`;
}

// Highlights the active tab, colors the start button and ring to match the current mode
function updateTabs() {
  // Reset all tabs to inactive
  document.querySelectorAll('.tab').forEach(t => t.className = 'tab');
  const tabs = document.querySelectorAll('.tab');
  tabs[0].className = mode === 'work'  ? 'tab active-work'  : 'tab';
  tabs[1].className = mode === 'short' ? 'tab active-short' : 'tab';
  tabs[2].className = mode === 'long'  ? 'tab active-long'  : 'tab';

  // Update start/pause button color
  const btn = document.getElementById('start-btn');
  btn.className = `btn btn-start ${running ? 'running' : MODES[mode].color}`;

  // Update SVG ring stroke color
  const ring = document.getElementById('ring');
  ring.className = `ring-progress ring-${MODES[mode].color}`;
}

// Animates the circular progress ring via SVG stroke-dashoffset
function updateRing() {
  const pct = timeLeft / totalTime;          // 1.0 = full, 0 = empty
  const offset = CIRC * (1 - pct);
  document.getElementById('ring').style.strokeDashoffset = offset;
}

// Renders the 4 session dots and updates the daily counter text
function updateSessions() {
  let html = '';
  for (let i = 0; i < 4; i++) {
    html += `<div class="dot ${i < sessionsCompleted % 4 ? 'done' : ''}"></div>`;
  }
  document.getElementById('sessions').innerHTML = html;
  document.getElementById('stats').textContent =
    `${totalToday} session${totalToday !== 1 ? 's' : ''} completed today`;
}

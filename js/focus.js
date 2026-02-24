// ============================================================
// focus.js — Fullscreen distraction-free focus mode
// Shows only the timer, current task, and quote
// ============================================================

let focusModeActive = false;

function toggleFocusMode() {
  focusModeActive = !focusModeActive;
  const overlay = document.getElementById('focus-overlay');

  if (focusModeActive) {
    overlay.classList.add('active');
    updateFocusDisplay();
    // Show a quote in focus overlay
    if (typeof getRandomQuote === 'function') {
      const q = getRandomQuote();
      const qt = document.getElementById('focus-quote-text');
      const qa = document.getElementById('focus-quote-author');
      if (qt) qt.textContent = `"${q.text}"`;
      if (qa) qa.textContent = `— ${q.author}`;
    }
    // Start timer if not running
    if (!running) toggleTimer();
    // Enter browser fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } else {
    overlay.classList.remove('active');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

function updateFocusDisplay() {
  if (!focusModeActive) return;
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  const el = document.getElementById('focus-time');
  if (el) el.textContent = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');

  const labelEl = document.getElementById('focus-label');
  if (labelEl) labelEl.textContent = MODES[mode].label;

  // Show current task if any
  const taskEl = document.getElementById('focus-task');
  if (taskEl) {
    const activeTasks = (typeof tasks !== 'undefined') ? tasks.filter(t => !t.done) : [];
    taskEl.textContent = activeTasks.length > 0 ? activeTasks[0].text : '';
  }

  // Update ring color
  const ring = document.getElementById('focus-ring');
  if (ring) {
    const colors = { work: '#e74c3c', short: '#27ae60', long: '#2980b9' };
    ring.style.stroke = colors[mode] || '#e74c3c';
    const pct = timeLeft / totalTime;
    ring.style.strokeDashoffset = 816.81 * (1 - pct);
  }
}

// Listen for Escape to exit focus mode
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && focusModeActive) {
    toggleFocusMode();
  }
});

// Exit focus mode when fullscreen exits
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && focusModeActive) {
    focusModeActive = false;
    document.getElementById('focus-overlay').classList.remove('active');
  }
});

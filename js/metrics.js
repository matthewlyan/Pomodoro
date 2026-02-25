// ============================================================
// metrics.js — Tracks focus time: today and this week
// ============================================================

let metricsLog = JSON.parse(localStorage.getItem('pomo_metrics') || '[]')
  .filter(e => e && typeof e.date === 'string' && Number.isFinite(e.minutes) && e.minutes > 0);

function dateKeyLocal(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDateKey(baseDate, offsetDays) {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  d.setDate(d.getDate() + offsetDays);
  return dateKeyLocal(d);
}

function logSession(minutes) {
  metricsLog.push({ date: dateKeyLocal(), minutes });
  localStorage.setItem('pomo_metrics', JSON.stringify(metricsLog));
  renderMetrics();
}

function minutesForDate(dateStr) {
  return metricsLog
    .filter(e => e.date === dateStr)
    .reduce((sum, e) => sum + e.minutes, 0);
}

function minutesForLastNDays(n) {
  const dates = new Set();
  const today = new Date();
  for (let i = 0; i < n; i++) dates.add(shiftDateKey(today, -i));
  return metricsLog
    .filter(e => dates.has(e.date))
    .reduce((sum, e) => sum + e.minutes, 0);
}

function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function renderMetrics() {
  const todayMins = minutesForDate(dateKeyLocal());
  const weekMins = minutesForLastNDays(7);

  document.getElementById('metrics-content').innerHTML = `
    <div class="metrics-stats">
      <div class="metric-item"><span class="metric-val">${fmtTime(todayMins)}</span><span class="metric-label">Today</span></div>
      <div class="metric-item"><span class="metric-val">${fmtTime(weekMins)}</span><span class="metric-label">This Week</span></div>
    </div>
  `;
}

function toggleMetrics() {
  document.getElementById('metrics-panel').classList.toggle('open');
  renderMetrics();
}

function clearMetrics() {
  if (confirm('Clear all study history?')) {
    metricsLog = [];
    localStorage.setItem('pomo_metrics', '[]');
    renderMetrics();
  }
}

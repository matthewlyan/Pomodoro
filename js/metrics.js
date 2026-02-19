// ============================================================
// metrics.js — Tracks focus time history and displays stats
// Stores completed session timestamps and durations in localStorage.
// ============================================================

// Each entry: { date: "2026-02-19", minutes: 25 }
let metricsLog = JSON.parse(localStorage.getItem('pomo_metrics') || '[]');

// Called when a focus session completes — logs the session duration
function logSession(minutes) {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  metricsLog.push({ date: today, minutes });
  localStorage.setItem('pomo_metrics', JSON.stringify(metricsLog));
  renderMetrics();
}

// Returns total focus minutes for a given date string
function minutesForDate(dateStr) {
  return metricsLog
    .filter(e => e.date === dateStr)
    .reduce((sum, e) => sum + e.minutes, 0);
}

// Returns total focus minutes for the last N days (including today)
function minutesForLastNDays(n) {
  const dates = new Set();
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.add(d.toISOString().slice(0, 10));
  }
  return metricsLog
    .filter(e => dates.has(e.date))
    .reduce((sum, e) => sum + e.minutes, 0);
}

// Formats minutes as "Xh Ym"
function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

// Returns the day name abbreviation for a date offset (0 = today, 1 = yesterday, etc.)
function dayLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
}

// Renders the metrics panel with today, this week, all-time stats and a 7-day bar chart
function renderMetrics() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMins = minutesForDate(todayStr);
  const weekMins = minutesForLastNDays(7);
  const monthMins = minutesForLastNDays(30);
  const allMins = metricsLog.reduce((sum, e) => sum + e.minutes, 0);
  const totalSessions = metricsLog.length;

  // Build 7-day chart data
  const days = [];
  let maxMins = 1; // avoid divide by zero
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const mins = minutesForDate(dateStr);
    if (mins > maxMins) maxMins = mins;
    days.push({ label: dayLabel(i), mins, isToday: i === 0 });
  }

  // Render
  const el = document.getElementById('metrics-content');
  let html = `
    <div class="metrics-stats">
      <div class="metric-item"><span class="metric-val">${fmtTime(todayMins)}</span><span class="metric-label">Today</span></div>
      <div class="metric-item"><span class="metric-val">${fmtTime(weekMins)}</span><span class="metric-label">This Week</span></div>
      <div class="metric-item"><span class="metric-val">${fmtTime(monthMins)}</span><span class="metric-label">30 Days</span></div>
      <div class="metric-item"><span class="metric-val">${totalSessions}</span><span class="metric-label">Sessions</span></div>
    </div>
    <div class="metrics-chart">
  `;
  for (const day of days) {
    const pct = (day.mins / maxMins * 100).toFixed(0);
    const barColor = day.isToday ? '#e74c3c' : '#444';
    html += `
      <div class="chart-col">
        <div class="chart-val">${day.mins > 0 ? fmtTime(day.mins) : ''}</div>
        <div class="chart-bar-wrap"><div class="chart-bar" style="height:${Math.max(pct, 2)}%;background:${barColor}"></div></div>
        <div class="chart-label" style="color:${day.isToday ? '#e74c3c' : '#666'}">${day.label}</div>
      </div>
    `;
  }
  html += '</div>';

  el.innerHTML = html;
}

// Toggles the metrics panel open/closed
function toggleMetrics() {
  document.getElementById('metrics-panel').classList.toggle('open');
  renderMetrics();
}

// Clears all stored metrics data
function clearMetrics() {
  if (confirm('Clear all study history?')) {
    metricsLog = [];
    localStorage.setItem('pomo_metrics', '[]');
    renderMetrics();
  }
}

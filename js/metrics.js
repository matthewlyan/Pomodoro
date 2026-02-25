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

function dayLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
}

function renderMetrics() {
  const todayMins = minutesForDate(dateKeyLocal());
  const weekMins = minutesForLastNDays(7);

  const days = [];
  let maxMins = 1;
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const mins = minutesForDate(dateKeyLocal(d));
    if (mins > maxMins) maxMins = mins;
    days.push({ label: dayLabel(i), mins, isToday: i === 0 });
  }

  let html = `
    <div class="metrics-stats">
      <div class="metric-item"><span class="metric-val">${fmtTime(todayMins)}</span><span class="metric-label">Today</span></div>
      <div class="metric-item"><span class="metric-val">${fmtTime(weekMins)}</span><span class="metric-label">This Week</span></div>
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

  document.getElementById('metrics-content').innerHTML = html;
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

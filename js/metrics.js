// ============================================================
// metrics.js — Tracks focus time history and displays stats
// Stores completed session timestamps and durations in localStorage.
// ============================================================

// Each entry: { date: "2026-02-19", minutes: 25 }
let metricsLog = JSON.parse(localStorage.getItem('pomo_metrics') || '[]')
  .filter(e => e && typeof e.date === 'string' && Number.isFinite(e.minutes) && e.minutes > 0);

const WEEKLY_GOAL_KEY = 'pomo_weekly_goal_mins';
let weeklyGoalMins = parseInt(localStorage.getItem(WEEKLY_GOAL_KEY), 10);
if (!Number.isFinite(weeklyGoalMins) || weeklyGoalMins < 60) weeklyGoalMins = 600; // 10h default

function dateKeyLocal(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function shiftDateKey(baseDate, offsetDays) {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  d.setDate(d.getDate() + offsetDays);
  return dateKeyLocal(d);
}

// Called when a focus session completes — logs the session duration
function logSession(minutes) {
  const today = dateKeyLocal();
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
  const dates = new Set(getLastNDaysKeys(n));
  return metricsLog
    .filter(e => dates.has(e.date))
    .reduce((sum, e) => sum + e.minutes, 0);
}

function getLastNDaysKeys(n) {
  const keys = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    keys.push(shiftDateKey(today, -i));
  }
  return keys;
}

function daysStudiedForLastNDays(n) {
  const activeDates = new Set(
    metricsLog
      .filter(e => e.minutes > 0)
      .map(e => e.date)
  );
  return getLastNDaysKeys(n).filter(k => activeDates.has(k)).length;
}

function computeStreaks() {
  const activeDates = new Set(
    metricsLog
      .filter(e => e.minutes > 0)
      .map(e => e.date)
  );
  const today = dateKeyLocal();

  // Current streak only counts if today has at least 1 focused minute.
  let current = 0;
  if (activeDates.has(today)) {
    for (let i = 0; ; i++) {
      const key = shiftDateKey(new Date(), -i);
      if (!activeDates.has(key)) break;
      current++;
    }
  }

  // Best streak across all logged days.
  let best = 0;
  const ordered = Array.from(activeDates).sort();
  let running = 0;
  let prev = null;
  for (const key of ordered) {
    if (!prev) {
      running = 1;
      best = Math.max(best, running);
      prev = key;
      continue;
    }

    const diffMs = parseDateKey(key).getTime() - parseDateKey(prev).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    if (diffMs === dayMs) running++;
    else running = 1;

    best = Math.max(best, running);
    prev = key;
  }

  return { current, best };
}

function applyWeeklyGoal() {
  const input = document.getElementById('metrics-goal-input');
  if (!input) return;
  const parsed = parseInt(input.value, 10);
  weeklyGoalMins = Math.min(10080, Math.max(60, Number.isFinite(parsed) ? parsed : weeklyGoalMins));
  localStorage.setItem(WEEKLY_GOAL_KEY, String(weeklyGoalMins));
  renderMetrics();
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
  const todayStr = dateKeyLocal();
  const todayMins = minutesForDate(todayStr);
  const weekMins = minutesForLastNDays(7);
  const monthMins = minutesForLastNDays(30);
  const allMins = metricsLog.reduce((sum, e) => sum + e.minutes, 0);
  const totalSessions = metricsLog.length;
  const studiedDaysWeek = daysStudiedForLastNDays(7);
  const streaks = computeStreaks();

  const goalPct = Math.max(0, Math.min(100, Math.round((weekMins / weeklyGoalMins) * 100)));
  const goalRemaining = Math.max(0, weeklyGoalMins - weekMins);

  // Build 7-day chart data
  const days = [];
  let maxMins = 1; // avoid divide by zero
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = dateKeyLocal(d);
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
      <div class="metric-item"><span class="metric-val">${streaks.current}</span><span class="metric-label">Current Streak</span></div>
      <div class="metric-item"><span class="metric-val">${streaks.best}</span><span class="metric-label">Best Streak</span></div>
      <div class="metric-item"><span class="metric-val">${studiedDaysWeek}/7</span><span class="metric-label">Days Active</span></div>
    </div>
    <div class="metrics-goal">
      <div class="goal-row">
        <span>Weekly Goal (minutes)</span>
        <div class="goal-input-wrap">
          <input id="metrics-goal-input" type="number" min="60" max="10080" value="${weeklyGoalMins}">
          <button onclick="applyWeeklyGoal()">Apply</button>
        </div>
      </div>
      <div class="goal-track"><div class="goal-fill" style="width:${goalPct}%"></div></div>
      <div class="goal-caption">${fmtTime(weekMins)} / ${fmtTime(weeklyGoalMins)} (${goalPct}%)${goalRemaining > 0 ? ` • ${fmtTime(goalRemaining)} left` : ' • Goal reached'}</div>
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

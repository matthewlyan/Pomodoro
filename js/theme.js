// ============================================================
// theme.js — Dark/light theme toggle with localStorage persistence
// ============================================================

let currentTheme = localStorage.getItem('pomo_theme') || 'dark';

function applyTheme(theme) {
  currentTheme = theme;
  document.body.classList.toggle('light-theme', theme === 'light');
  localStorage.setItem('pomo_theme', theme);

  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// Apply saved theme on load
applyTheme(currentTheme);

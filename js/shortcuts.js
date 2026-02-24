// ============================================================
// shortcuts.js — Keyboard shortcuts for quick timer control
// Space: start/pause | R: reset | S: skip | F: fullscreen focus
// ============================================================

document.addEventListener('keydown', (e) => {
  // Don't trigger shortcuts when typing in an input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      toggleTimer();
      break;
    case 'KeyR':
      resetTimer();
      break;
    case 'KeyS':
      skipTimer();
      break;
    case 'KeyF':
      toggleFocusMode();
      break;
    case 'KeyM':
      toggleMetrics();
      break;
    case 'Digit1':
      setMode('work');
      break;
    case 'Digit2':
      setMode('short');
      break;
    case 'Digit3':
      setMode('long');
      break;
  }
});

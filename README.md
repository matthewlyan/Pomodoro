# Pomodoro Timer

A clean, browser-based Pomodoro timer with task tracking, customizable durations, and session stats.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## Features

- **Pomodoro Cycle** — 25 min focus → 5 min short break → repeat → 15 min long break after 4 sessions
- **Customizable Timers** — Set your own focus and break durations (e.g. 50/10/15)
- **Task List** — Add tasks, check them off, delete them
- **Progress Ring** — Animated circular countdown with color-coded modes
- **Session Tracking** — Daily session counter with reset button
- **Sound Alarm** — 5-note chime when the timer ends
- **Desktop Notifications** — Get notified even when the tab is in the background
- **Persistent State** — Tasks, settings, and daily session count saved via localStorage
- **Timer Resume** — Running timer state is restored after page reload
- **Keyboard Shortcuts** — Space (start/pause), R (reset), N (skip)
- **Tab Title** — Shows remaining time in the browser tab

## How to Use

1. Open `index.html` in your browser
2. Click **START** to begin a 25-minute focus session
3. When the timer ends, it auto-switches to a break
4. After 4 focus sessions, you get a long break

### Controls

| Button | Action |
|--------|--------|
| **START / PAUSE** | Start or pause the timer |
| **↺** | Reset the current timer |
| **⏭** | Skip to the next mode |
| **Focus / Short Break / Long Break** | Switch modes manually |
| **⚙️ Timer Settings** | Customize durations |
| **Reset** (next to session count) | Reset daily session counter |

Notes:
- Skipping a focus block does **not** count as a completed session.
- Countdown timing is timestamp-based to stay accurate over long runs/background tab throttling.

### Task List

- Type a task and press **Enter** or click **+**
- Check the box to cross it off
- Click **✕** to delete

## Project Structure

```
pomodoro/
├── index.html          # HTML structure
├── README.md           # This file
├── css/
│   └── styles.css      # All styling
└── js/
    ├── timer.js        # Core logic (modes, countdown, alarm)
    ├── ui.js           # DOM updates (display, tabs, ring, sessions)
    ├── tasks.js        # Task list (add, check off, delete)
    ├── settings.js     # Custom timer durations
    └── app.js          # Initialization
```

## Tech

- Pure HTML, CSS, JavaScript — no frameworks, no dependencies
- Web Audio API for the alarm sound
- Notification API for desktop alerts
- localStorage for persistence

## License

Free to use, modify, and distribute.

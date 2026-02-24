// ============================================================
// quotes.js — Motivational quotes shown during focus sessions
// ============================================================

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
  { text: "Starve your distractions, feed your focus.", author: "Unknown" },
  { text: "You will never always be motivated, so you must learn to be disciplined.", author: "Unknown" },
  { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
];

let lastQuoteIndex = -1;

function getRandomQuote() {
  let idx;
  do { idx = Math.floor(Math.random() * QUOTES.length); } while (idx === lastQuoteIndex);
  lastQuoteIndex = idx;
  return QUOTES[idx];
}

function showQuote() {
  const q = getRandomQuote();
  const el = document.getElementById('quote-text');
  const authEl = document.getElementById('quote-author');
  if (el && authEl) {
    el.textContent = `"${q.text}"`;
    authEl.textContent = `— ${q.author}`;
  }
}

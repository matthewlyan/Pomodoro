// ============================================================
// background.js — Subtle floating particle animation
// Creates a full-screen canvas with slowly drifting particles
// that glow softly, like stars or dust — calming for focus.
// ============================================================

const bgCanvas = document.createElement('canvas');
bgCanvas.id = 'bg-canvas';
document.body.prepend(bgCanvas);
const bgCtx = bgCanvas.getContext('2d');

let particles = [];
const PARTICLE_COUNT = 60;

function resizeBg() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

// Initialize particles with random positions, sizes, speeds, and opacity
function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      r: Math.random() * 2 + 0.5,         // Radius: 0.5–2.5px
      vx: (Math.random() - 0.5) * 0.3,    // Slow horizontal drift
      vy: (Math.random() - 0.5) * 0.2,    // Slow vertical drift
      opacity: Math.random() * 0.4 + 0.1, // 0.1–0.5 opacity
      pulse: Math.random() * Math.PI * 2,  // Phase offset for pulsing glow
    });
  }
}
initParticles();

function drawBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  for (const p of particles) {
    // Slow pulsing glow effect
    p.pulse += 0.008;
    const glow = p.opacity + Math.sin(p.pulse) * 0.15;

    // Draw particle with soft glow
    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(150, 180, 255, ${Math.max(0.05, glow)})`;
    bgCtx.fill();

    // Outer glow halo
    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(100, 140, 255, ${Math.max(0.01, glow * 0.15)})`;
    bgCtx.fill();

    // Move particle
    p.x += p.vx;
    p.y += p.vy;

    // Wrap around screen edges
    if (p.x < -10) p.x = bgCanvas.width + 10;
    if (p.x > bgCanvas.width + 10) p.x = -10;
    if (p.y < -10) p.y = bgCanvas.height + 10;
    if (p.y > bgCanvas.height + 10) p.y = -10;
  }

  requestAnimationFrame(drawBg);
}

drawBg();

// ============================================================
// sounds.js — Ambient background sounds for focus sessions
// Uses Web Audio API to generate white noise, rain, and brown noise
// ============================================================

let soundCtx = null;
let soundNodes = [];
let currentSound = 'none';
let soundVolume = 0.3;

const SOUNDS = {
  none: { label: '🔇 Off' },
  white: { label: '🌫️ White Noise' },
  brown: { label: '🌊 Brown Noise' },
  rain: { label: '🌧️ Rain' },
};

// Creates a white noise buffer
function createNoiseBuffer(ctx, type) {
  const size = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === 'brown') {
    let last = 0;
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + (0.02 * white)) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
  } else if (type === 'rain') {
    // Rain = filtered white noise with random droplet pops
    for (let i = 0; i < size; i++) {
      let sample = Math.random() * 2 - 1;
      // Add occasional "droplet" clicks
      if (Math.random() < 0.001) sample += (Math.random() - 0.5) * 4;
      data[i] = sample * 0.5;
    }
  }
  return buffer;
}

function stopSound() {
  soundNodes.forEach(n => { try { n.stop(); } catch(e) {} try { n.disconnect(); } catch(e) {} });
  soundNodes = [];
  currentSound = 'none';
}

function playSound(type) {
  stopSound();
  if (type === 'none') { updateSoundUI(); return; }

  if (!soundCtx) soundCtx = new (window.AudioContext || window.webkitAudioContext)();

  const buffer = createNoiseBuffer(soundCtx, type);
  const source = soundCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const gainNode = soundCtx.createGain();
  gainNode.gain.value = soundVolume;

  // Add a lowpass filter for softer sound
  const filter = soundCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = type === 'rain' ? 3000 : type === 'brown' ? 800 : 6000;

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(soundCtx.destination);
  source.start();

  soundNodes = [source, gainNode, filter];
  currentSound = type;
  updateSoundUI();
}

function setSoundVolume(vol) {
  soundVolume = vol;
  if (soundNodes.length > 1) soundNodes[1].gain.value = vol;
}

function cycleSounds() {
  const types = Object.keys(SOUNDS);
  const idx = types.indexOf(currentSound);
  const next = types[(idx + 1) % types.length];
  playSound(next);
}

function updateSoundUI() {
  const el = document.getElementById('sound-label');
  if (el) el.textContent = SOUNDS[currentSound].label;
}

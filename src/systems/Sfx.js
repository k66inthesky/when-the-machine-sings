// Sfx — procedural one-shot sound effects via WebAudio.
// Keeps the game responsive-feeling before any recorded SFX lands in assets/audio/sfx/.
// If a Phaser sound key matching the SFX name is loaded (e.g. 'sfx-throw'),
// we play that instead.

function getCtx(scene) {
  if (scene.sound && scene.sound.context) return scene.sound.context;
  return (window.__sharedAudioCtx__ ||= new (window.AudioContext || window.webkitAudioContext)());
}

function envelope(ctx, gainNode, t, attack, hold, release, peak = 0.3) {
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(peak, t + attack);
  gainNode.gain.setValueAtTime(peak, t + attack + hold);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
}

function playIfLoaded(scene, key) {
  if (scene.sound && scene.cache?.audio?.exists(key)) {
    scene.sound.play(key);
    return true;
  }
  return false;
}

export const Sfx = {
  // Paper-bag whoosh: quick filtered noise burst.
  throw(scene) {
    if (playIfLoaded(scene, 'sfx-throw')) return;
    const ctx = getCtx(scene);
    const t = ctx.currentTime;
    const bufSize = ctx.sampleRate * 0.3;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(1800, t);
    filt.frequency.exponentialRampToValueAtTime(400, t + 0.3);
    const g = ctx.createGain();
    envelope(ctx, g, t, 0.01, 0.05, 0.25, 0.18);
    src.connect(filt).connect(g).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.35);
  },

  // Successful hit: short bright ding.
  hit(scene) {
    if (playIfLoaded(scene, 'sfx-hit')) return;
    const ctx = getCtx(scene);
    const t = ctx.currentTime;
    [880, 1320, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      envelope(ctx, g, t + i * 0.04, 0.005, 0.02, 0.18, 0.2);
      osc.connect(g).connect(ctx.destination);
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.25);
    });
  },

  // Miss: sad downward buzz.
  miss(scene) {
    if (playIfLoaded(scene, 'sfx-miss')) return;
    const ctx = getCtx(scene);
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.35);
    envelope(ctx, g, t, 0.005, 0.05, 0.3, 0.15);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  },

  // LINE-style notification ping.
  ping(scene) {
    if (playIfLoaded(scene, 'sfx-ping')) return;
    const ctx = getCtx(scene);
    const t = ctx.currentTime;
    [1320, 1760].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.09);
      envelope(ctx, g, t + i * 0.09, 0.005, 0.03, 0.14, 0.22);
      osc.connect(g).connect(ctx.destination);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.2);
    });
  },

  // Soft UI click.
  tick(scene) {
    if (playIfLoaded(scene, 'sfx-tick')) return;
    const ctx = getCtx(scene);
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1600, t);
    envelope(ctx, g, t, 0.002, 0.01, 0.04, 0.08);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  },

  // Phone scroll — low tick.
  scroll(scene) {
    if (playIfLoaded(scene, 'sfx-scroll')) return;
    const ctx = getCtx(scene);
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220 + Math.random() * 60, t);
    envelope(ctx, g, t, 0.002, 0.01, 0.05, 0.1);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  },

  // TV static burst — brief white noise.
  static(scene) {
    if (playIfLoaded(scene, 'sfx-static')) return;
    const ctx = getCtx(scene);
    const t = ctx.currentTime;
    const bufSize = ctx.sampleRate * 0.15;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    envelope(ctx, g, t, 0.01, 0.03, 0.1, 0.08);
    src.connect(g).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.2);
  },

  // Footstep: low thump.
  step(scene) {
    if (playIfLoaded(scene, 'sfx-step')) return;
    const ctx = getCtx(scene);
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
    envelope(ctx, g, t, 0.002, 0.02, 0.08, 0.15);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  },
};

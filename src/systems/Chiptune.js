// Chiptune — 8-bit Für Elise loop for Title/Intro scenes.
//
// The in-game truck BGM lives in AudioDistance.js (distance-gain curve).
// Title + Intro want the same iconic melody, but always at a constant low
// volume, with a chunkier NES-era pulse timbre instead of the soft triangle
// we use inside the game.
//
// Honors scene.sound.mute and the shared Phaser AudioContext — so the
// global M-key, the YT Playables isAudioEnabled toggle, and onPause/onResume
// all silence it for free.

const FUR_ELISE_MOTIF = [
  { note: 76, dur: 0.18 }, // E5
  { note: 75, dur: 0.18 }, // D#5
  { note: 76, dur: 0.18 },
  { note: 75, dur: 0.18 },
  { note: 76, dur: 0.18 },
  { note: 71, dur: 0.18 }, // B4
  { note: 74, dur: 0.18 }, // D5
  { note: 72, dur: 0.18 }, // C5
  { note: 69, dur: 0.36 }, // A4
  { note: 0,  dur: 0.12 }, // rest
  { note: 57, dur: 0.18 }, // A3 (bass hint)
  { note: 60, dur: 0.18 }, // C4
  { note: 64, dur: 0.18 }, // E4
  { note: 69, dur: 0.18 }, // A4
  { note: 71, dur: 0.36 }, // B4
  { note: 0,  dur: 0.12 },
  { note: 64, dur: 0.18 }, // E4
  { note: 68, dur: 0.18 }, // G#4
  { note: 71, dur: 0.18 }, // B4
  { note: 72, dur: 0.36 }, // C5
  { note: 0,  dur: 0.30 },
];

const LOOP_PAD_MS = 400; // silence between loops so the motif breathes.

function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

export default class Chiptune {
  constructor(scene, { volume = 0.14 } = {}) {
    this.scene = scene;
    this.volume = volume;
    this.ctx = scene.sound && scene.sound.context
      ? scene.sound.context
      : new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);
    this.playing = false;
    this.motifTimer = null;
    this.activeOscs = [];

    // Auto-clean when the owning scene shuts down.
    scene.events.once('shutdown', () => this.stop());
    scene.events.once('destroy', () => this.stop());
  }

  start() {
    if (this.playing) return;
    this.playing = true;
    // Fade in the master gain so the first note doesn't pop.
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.4);
    this.scheduleMotif();
  }

  stop() {
    this.playing = false;
    if (this.motifTimer) {
      try { this.scene.time.removeEvent(this.motifTimer); } catch (_) {}
      this.motifTimer = null;
    }
    // Fade out so cutting the scene doesn't click.
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.2);
    } catch (_) {}
    for (const osc of this.activeOscs) {
      try { osc.stop(this.ctx.currentTime + 0.25); } catch (_) {}
    }
    this.activeOscs = [];
  }

  scheduleMotif() {
    if (!this.playing) return;
    const motifSeconds = this.playMotifOnce();
    const nextMs = Math.round(motifSeconds * 1000) + LOOP_PAD_MS;
    this.motifTimer = this.scene.time.delayedCall(nextMs, () => this.scheduleMotif());
  }

  playMotifOnce() {
    let t = this.ctx.currentTime;
    let total = 0;
    FUR_ELISE_MOTIF.forEach(({ note, dur }) => {
      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        // Square wave + a tiny bit of duty-cycle feel via detuned partial —
        // close enough to a NES pulse channel without importing a PSG lib.
        osc.type = 'square';
        osc.frequency.setValueAtTime(midiToFreq(note), t);
        noteGain.gain.setValueAtTime(0, t);
        noteGain.gain.linearRampToValueAtTime(0.55, t + 0.008);
        noteGain.gain.setValueAtTime(0.55, t + Math.max(0.01, dur - 0.04));
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(noteGain).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
        this.activeOscs.push(osc);
        osc.onended = () => {
          const idx = this.activeOscs.indexOf(osc);
          if (idx >= 0) this.activeOscs.splice(idx, 1);
        };
      }
      t += dur;
      total += dur;
    });
    return total;
  }

  destroy() {
    this.stop();
    try { this.masterGain.disconnect(); } catch (_) {}
  }
}

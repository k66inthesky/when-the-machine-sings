// AudioDistance — the core creative mechanic of the game.
//
// The garbage truck's Für Elise melody is literally the countdown.
// Proximity (0..1) drives the gain: distant = barely audible, arrived = full volume.
//
// Until real BGM arrives in assets/audio/music/, we synthesize a Für Elise
// motif with a WebAudio oscillator so the mechanic is demonstrable from Day 1.
// When a loaded Phaser sound is passed in, we swap sources.

// Opening motif of Für Elise in MIDI note numbers, beat durations in seconds.
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
  { note: 0,  dur: 0.25 }, // rest
];

function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

export default class AudioDistance {
  constructor(scene) {
    this.scene = scene;
    this.proximity = 0;
    this.ctx = scene.sound && scene.sound.context ? scene.sound.context : new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);
    this.playing = false;
    this.motifTimer = null;
    this.useRealAudio = false;
    this.realSound = null;
  }

  // Optional: swap to real Phaser-loaded BGM when assets arrive.
  setRealSound(phaserSound) {
    this.realSound = phaserSound;
    this.useRealAudio = true;
    if (this.realSound && !this.realSound.isPlaying) {
      this.realSound.play({ loop: true, volume: 0 });
    }
    this.stopSynth();
  }

  start() {
    if (this.playing) return;
    this.playing = true;
    if (this.useRealAudio && this.realSound) {
      if (!this.realSound.isPlaying) this.realSound.play({ loop: true, volume: 0 });
      return;
    }
    this.scheduleMotif();
  }

  stop() {
    this.playing = false;
    this.stopSynth();
    if (this.useRealAudio && this.realSound && this.realSound.isPlaying) {
      this.realSound.stop();
    }
  }

  stopSynth() {
    if (this.motifTimer) {
      this.scene.time.removeEvent(this.motifTimer);
      this.motifTimer = null;
    }
  }

  scheduleMotif() {
    if (!this.playing) return;
    this.playMotifOnce();
    // Loop the motif every ~2.2 seconds.
    this.motifTimer = this.scene.time.delayedCall(2200, () => this.scheduleMotif());
  }

  playMotifOnce() {
    if (this.useRealAudio) return;
    let t = this.ctx.currentTime;
    FUR_ELISE_MOTIF.forEach(({ note, dur }) => {
      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(midiToFreq(note), t);
        noteGain.gain.setValueAtTime(0, t);
        noteGain.gain.linearRampToValueAtTime(0.6, t + 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(noteGain).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
      }
      t += dur;
    });
  }

  // proximity in [0, 1]. Maps to a gain curve that stays near-inaudible until ~0.4
  // then ramps up quickly — this matches the real-life experience of the truck
  // appearing around the corner suddenly louder than expected.
  setProximity(p) {
    this.proximity = Math.max(0, Math.min(1, p));
    const curved = Math.pow(this.proximity, 2.2);
    const target = curved * 0.5; // hard cap at 0.5 so it's not ear-splitting
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(target, now + 0.15);
    if (this.useRealAudio && this.realSound && this.realSound.isPlaying) {
      this.realSound.setVolume(target);
    }
  }

  destroy() {
    this.stop();
    try { this.masterGain.disconnect(); } catch (e) {}
  }
}

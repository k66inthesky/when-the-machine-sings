import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import TitleScene from './scenes/TitleScene.js';
import ApartmentScene from './scenes/ApartmentScene.js';
import StreetScene from './scenes/StreetScene.js';
import ResultScene from './scenes/ResultScene.js';
import EndingScene from './scenes/EndingScene.js';
import PauseScene from './scenes/PauseScene.js';
import IntroScene from './scenes/IntroScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0a0f',
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    ApartmentScene,
    StreetScene,
    ResultScene,
    EndingScene,
    PauseScene,
    IntroScene,
  ],
};

const game = new Phaser.Game(config);
if (import.meta.env?.DEV) {
  window.__PHASER_GAME__ = game;
}

// Global AudioContext unlock — browsers require a user gesture before
// any audio plays. Phaser sets up its own unlock path, but on some
// browser + scene-graph combinations the ctx ends up `suspended` even
// after SPACE on the title. Result: the Für Elise BGM is wired up and
// "playing" at volume 0 but the masterGain never ramps because the
// whole context is frozen. Belt-and-braces: resume on the first
// pointerdown OR keydown anywhere, then detach ourselves so we never
// fight a user-triggered mute (M key) that legitimately suspends.
const unlockAudio = () => {
  const ctx = game.sound && game.sound.context;
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  // Give Phaser a nudge too — its internal unlock flag gates HTML5
  // Audio fallback on Safari.
  if (game.sound && typeof game.sound.unlock === 'function') {
    try { game.sound.unlock(); } catch (_) {}
  }
};
const onFirstGesture = () => {
  unlockAudio();
  window.removeEventListener('pointerdown', onFirstGesture);
  window.removeEventListener('keydown', onFirstGesture);
  window.removeEventListener('touchstart', onFirstGesture);
};
window.addEventListener('pointerdown', onFirstGesture);
window.addEventListener('keydown', onFirstGesture);
window.addEventListener('touchstart', onFirstGesture, { passive: true });

// Global mute toggle — M at any time.
// AudioDistance's synth oscillators share Phaser's AudioContext (see
// AudioDistance.js:32), so suspending the ctx silences both the synth
// and any Phaser-loaded sounds in one shot. Phaser.sound.mute handles
// the non-ctx code paths Phaser uses for HTML5 audio fallback.
let muted = false;
window.addEventListener('keydown', (e) => {
  if (e.key !== 'm' && e.key !== 'M') return;
  muted = !muted;
  game.sound.mute = muted;
  const ctx = game.sound.context;
  if (ctx) {
    if (muted && ctx.state === 'running') ctx.suspend();
    else if (!muted && ctx.state === 'suspended') ctx.resume();
  }
  const flash = document.createElement('div');
  flash.textContent = muted ? '♪ muted' : '♪ on';
  flash.style.cssText = 'position:fixed;top:12px;left:12px;padding:4px 10px;background:rgba(10,10,15,0.85);color:#6acfff;font:13px sans-serif;border:1px solid #6acfff;border-radius:3px;z-index:9999;pointer-events:none;';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 900);
});

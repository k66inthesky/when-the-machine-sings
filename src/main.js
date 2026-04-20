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

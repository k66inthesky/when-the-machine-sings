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
import Playables from './systems/Playables.js';
import I18n from './systems/I18n.js';

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

// Kick off the save-store load BEFORE Phaser boots. In YT Playables the
// spec says we MUST await loadData() before any saveData() — so we gate
// scene startup on this. In every other env it resolves instantly.
// BootScene also awaits Playables.init() defensively in case a future
// refactor races ahead of this top-level kickoff.
Playables.init();

// I18n — init synchronously from localStorage / navigator.language so the
// very first frame (PreloadScene) already shows the correct language.
// Eventually this can read loaded.lang from the Playables save blob, but
// that's async; the localStorage + navigator.language path covers the
// common case and matches what TitleScene's toggle persists.
I18n.init();

const game = new Phaser.Game(config);
// Expose the Phaser instance globally on every host (not just dev). Lets the
// player open devtools and flip mute / advance scenes / dump audio cache if
// something goes wrong, and lets the jam judges peek under the hood. Phaser
// itself is already global — this just hands back the instance.
window.__PHASER_GAME__ = game;

// Respect YouTube's mute button in the Playables container ONLY. Outside
// YT, do nothing — the M-key handler below is the sole mute path. This
// gate fixes a bug where some browsers mid-load saw the YT SDK script
// with isAudioEnabled() falsy (no user gesture yet, or audio policy
// uncertain) and the previous unconditional applyYtAudioState() pinned
// game.sound.mute = true on Day 1 entry. Players reported "audio is
// muted by default; pressing M unmutes" — that was the regression.
const applyYtAudioState = (enabled) => {
  game.sound.mute = !enabled;
  const ctx = game.sound.context;
  if (ctx) {
    if (!enabled && ctx.state === 'running') ctx.suspend().catch(() => {});
    else if (enabled && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }
};
if (Playables.inEnv()) {
  applyYtAudioState(Playables.isAudioEnabled());
  Playables.onAudioEnabledChange(applyYtAudioState);
} else {
  // Belt-and-braces: explicitly unmute on every non-YT host so a stray
  // Phaser default or stale SDK state can't leave the player silent.
  game.sound.mute = false;
}

// YT Playables onPause / onResume: MUST freeze all execution (game loop,
// music, interactions, network, rendering) and resume cleanly.
let pausedByPlayables = false;
Playables.onPause(() => {
  if (pausedByPlayables) return;
  pausedByPlayables = true;
  // Pause every active scene so tweens/time events freeze.
  game.scene.scenes.forEach((s) => { if (s.scene.isActive()) s.scene.pause(); });
  game.sound.mute = true;
  const ctx = game.sound.context;
  if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {});
  game.loop.sleep();
});
Playables.onResume(() => {
  if (!pausedByPlayables) return;
  pausedByPlayables = false;
  game.loop.wake();
  game.scene.scenes.forEach((s) => { if (s.scene.isPaused()) s.scene.resume(); });
  const enabled = Playables.isAudioEnabled();
  applyYtAudioState(enabled);
});

// Global AudioContext unlock — browsers require a user gesture before
// any audio plays. Incognito + iframe (itch.io's embed) can reject the
// first ctx.resume() because of timing: Phaser fires its internal unlock
// before our handler, the user's gesture is "consumed", and any later
// resume() (e.g. from __ensureAudioOn__ in scene.create()) silently
// rejects because it's not inside a gesture frame.
//
// Fix: keep the unlock listeners attached FOREVER. Every pointerdown,
// keydown, touchstart, mousedown, click is treated as a fresh chance to
// resume. ctx.resume() on an already-running context is a no-op so
// there's no perf cost. This guarantees that by the time the player
// touches any key in the apartment (E, T, ENTER, etc.), audio is
// definitively unlocked.
const unlockAudio = () => {
  const ctx = game.sound && game.sound.context;
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  if (game.sound && typeof game.sound.unlock === 'function') {
    try { game.sound.unlock(); } catch (_) {}
  }
};
['pointerdown', 'keydown', 'touchstart', 'mousedown', 'click'].forEach((evt) => {
  window.addEventListener(evt, unlockAudio, evt === 'touchstart' ? { passive: true } : false);
});

// Global mute toggle — M at any time. Derives the new state from the LIVE
// game.sound.mute value instead of a tracked local var: if anything
// upstream (Phaser default, stale YT SDK, scene init) set mute=true while
// the local var was still false, the old code took two M presses to
// recover (first toggled local→true→re-mute, second toggled back). Now
// pressing M is always "flip whatever it is now".
window.addEventListener('keydown', (e) => {
  if (e.key !== 'm' && e.key !== 'M') return;
  const ctx = game.sound.context;
  // Always try to resume on M-press first — M is always a fresh user
  // gesture, so this is a legitimate moment to unlock if browser policy
  // had been blocking it. THEN flip mute based on the live state.
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  const newMuted = !game.sound.mute;
  game.sound.mute = newMuted;
  if (ctx && newMuted && ctx.state === 'running') ctx.suspend();
  const flash = document.createElement('div');
  flash.textContent = I18n.t(newMuted ? 'hud.muted' : 'hud.on');
  flash.style.cssText = 'position:fixed;top:12px;left:12px;padding:4px 10px;background:rgba(10,10,15,0.85);color:#6acfff;font:13px sans-serif;border:1px solid #6acfff;border-radius:3px;z-index:9999;pointer-events:none;';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 900);
});

// Audio-on guarantee — exposed globally so every gameplay scene's create()
// can call it as a belt-and-braces. Outside YT, force mute=false and
// attempt to resume the context. Inside YT we leave the platform alone.
window.__ensureAudioOn__ = () => {
  if (Playables.inEnv()) return;
  if (game.sound.mute) game.sound.mute = false;
  const ctx = game.sound.context;
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
};

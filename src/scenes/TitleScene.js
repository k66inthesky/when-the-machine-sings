import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Playables from '../systems/Playables.js';
import Chiptune from '../systems/Chiptune.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENES.TITLE);
  }

  create() {
    // Fire and forget — init() is idempotent and completes instantly
    // after the first call. Kept in create() so scene switches during
    // dev don't lose state.
    Playables.init();

    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Debug shortcut — `?day=3` skips straight into that day's apartment.
    // Handy for jam judging + my own QA. Silently ignored when absent.
    const debugDay = this.parseDebugDay();
    if (debugDay) {
      this.scene.start(SCENES.APARTMENT, { day: debugDay });
      return;
    }

    this.cameras.main.fadeIn(500, 5, 5, 10);

    // 8-bit Für Elise on the title — the melody *is* the game. Starts on
    // first-gesture unlock (main.js handles that); the Chiptune helper's
    // master gain keys off the same AudioContext so mute/pause free.
    this.chiptune = new Chiptune(this, { volume: 0.14 });
    this.chiptune.start();

    // Painted night-market alley as title backdrop — carries the mood.
    if (this.textures.exists('bg-alley-night-market')) {
      this.add.image(w / 2, h / 2, 'bg-alley-night-market').setDisplaySize(w, h);
      // Heavy vignette so text sits forward.
      this.add.rectangle(0, 0, w, h, 0x050510, 0.55).setOrigin(0);
    } else {
      this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);
    }

    // Title card — large serif, warm color pulled from Taipei truck livery.
    const title = this.add.text(w / 2, h / 2 - 100, 'WHEN THE MACHINE SINGS', {
      fontFamily: 'serif',
      fontSize: '44px',
      color: '#e8b96a',
      fontStyle: 'bold',
      stroke: '#2a1a10',
      strokeThickness: 4,
    }).setOrigin(0.5);
    // Slow breathing on the title for ambient motion.
    this.tweens.add({
      targets: title, scale: 1.015, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.add.text(w / 2, h / 2 - 55, '當機器唱起〈給愛麗絲〉,你就該跑了', {
      fontFamily: 'serif',
      fontSize: '15px',
      color: '#e8dccb',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 - 30, 'In Taiwan, when the machine sings, you run.', {
      fontFamily: 'serif',
      fontSize: '15px',
      color: '#aaa9a0',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Tiny lantern pulse — a warm point of light bottom-left for night-market mood.
    const lantern = this.add.circle(60, h - 90, 10, 0xe8892a, 0.9);
    this.tweens.add({
      targets: lantern, alpha: 0.5, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.add.circle(60, h - 90, 22, 0xe8892a, 0.15);

    const prompt = this.add.text(w / 2, h / 2 + 70, '[ Press SPACE to start ]', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#6acfff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

    this.add.text(w / 2, h - 28, 'Gamedev.js Jam 2026 — Theme: Machines', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#8a8880',
    }).setOrigin(0.5);
    this.add.text(w / 2, h - 14, 'Dedicated to the sanitation workers of Taiwan', {
      fontFamily: 'serif', fontSize: '11px', color: '#8a8880', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Persistent best from a prior run — silent if none.
    const best = Playables.getBest();
    if (best > 0) {
      this.add.text(w - 14, 14, `Best: ${best}`, {
        fontFamily: 'monospace', fontSize: '12px', color: '#e8b96a',
      }).setOrigin(1, 0);
    }

    // Mid-week resume — if the player closed the tab on Day 3, offer a resume.
    const prog = Playables.getProgress();
    if (prog && prog.day > 1 && prog.day <= 5) {
      const resume = this.add.text(w / 2, h / 2 + 100,
        `[ R — resume Day ${prog.day} (${prog.totalScore} pts) ]`, {
          fontFamily: 'sans-serif', fontSize: '13px', color: '#6affaa',
        }).setOrigin(0.5);
      this.tweens.add({ targets: resume, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });
      this.input.keyboard.once('keydown-R', () => {
        this.cameras.main.fadeOut(350, 5, 5, 10);
        this.time.delayedCall(380, () => this.scene.start(SCENES.APARTMENT, {
          day: prog.day, totalScore: prog.totalScore,
        }));
      });
    }

    this.input.keyboard.once('keydown-SPACE', () => {
      this.cameras.main.fadeOut(450, 5, 5, 10);
      this.time.delayedCall(470, () => this.scene.start(SCENES.INTRO));
    });

    // YT Playables: gameReady() once the title is interactive. Wait a tick
    // so the prompt is actually on screen before we tell YT to ship us.
    this.time.delayedCall(16, () => Playables.gameReady());
  }

  parseDebugDay() {
    try {
      const p = new URLSearchParams(window.location.search);
      const raw = p.get('day');
      if (!raw) return null;
      const n = parseInt(raw, 10);
      if (Number.isFinite(n) && n >= 1 && n <= 5) return n;
    } catch (_) {}
    return null;
  }
}

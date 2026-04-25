import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Playables from '../systems/Playables.js';
import Chiptune from '../systems/Chiptune.js';
import I18n from '../systems/I18n.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENES.TITLE);
  }

  create() {
    // Fire and forget — init() is idempotent and completes instantly
    // after the first call. Kept in create() so scene switches during
    // dev don't lose state.
    Playables.init();

    // Debug shortcut — `?day=3` skips straight into that day's apartment.
    const debugDay = this.parseDebugDay();
    if (debugDay) {
      this.scene.start(SCENES.APARTMENT, { day: debugDay });
      return;
    }

    this.cameras.main.fadeIn(500, 5, 5, 10);

    // 8-bit Für Elise on the title — the melody *is* the game.
    this.chiptune = new Chiptune(this, { volume: 0.14 });
    this.chiptune.start();

    this.renderTitle();

    // Re-render whenever the user flips language. Clean up on shutdown.
    this.unsubI18n = I18n.onChange(() => this.renderTitle());
    this.events.once('shutdown', () => {
      if (this.unsubI18n) this.unsubI18n();
    });
  }

  renderTitle() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Wipe the previous render — scene stays alive, display list resets.
    // Rebind SPACE/R/L below so the handlers fire against the fresh listeners.
    this.children.removeAll();
    this.input.keyboard.removeAllListeners();

    // Painted night-market alley as title backdrop — carries the mood.
    if (this.textures.exists('bg-alley-night-market')) {
      this.add.image(w / 2, h / 2, 'bg-alley-night-market').setDisplaySize(w, h);
      this.add.rectangle(0, 0, w, h, 0x050510, 0.55).setOrigin(0);
    } else {
      this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);
    }

    // Title card — ZH kanji reads cleaner a touch smaller.
    const title = this.add.text(w / 2, h / 2 - 100, I18n.t('title.main'), {
      fontFamily: 'serif',
      fontSize: I18n.lang === 'zh' ? '38px' : '44px',
      color: '#e8b96a',
      fontStyle: 'bold',
      stroke: '#2a1a10',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title, scale: 1.015, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.add.text(w / 2, h / 2 - 40, I18n.t('title.subtitle'), {
      fontFamily: 'serif',
      fontSize: '15px',
      color: '#e8dccb',
      fontStyle: 'italic',
      align: 'center',
    }).setOrigin(0.5);

    // Tiny lantern pulse — a warm point of light bottom-left for night-market mood.
    const lantern = this.add.circle(60, h - 90, 10, 0xe8892a, 0.9);
    this.tweens.add({
      targets: lantern, alpha: 0.5, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.add.circle(60, h - 90, 22, 0xe8892a, 0.15);

    const prompt = this.add.text(w / 2, h / 2 + 70, I18n.t('title.prompt'), {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#6acfff',
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

    this.add.text(w / 2, h - 18, I18n.t('title.credit_jam'), {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#8a8880',
    }).setOrigin(0.5);

    // Persistent best from a prior run — silent if none.
    const best = Playables.getBest();
    if (best > 0) {
      this.add.text(w - 14, 14, I18n.t('title.best', { n: best }), {
        fontFamily: 'monospace', fontSize: '12px', color: '#e8b96a',
      }).setOrigin(1, 0);
    }

    // Mid-week resume — if the player closed the tab on Day 3, offer a resume.
    const prog = Playables.getProgress();
    if (prog && prog.day > 1 && prog.day <= 5) {
      const resume = this.add.text(w / 2, h / 2 + 100,
        I18n.t('title.resume', { day: prog.day, score: prog.totalScore }), {
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

    this.addLangToggle();

    this.input.keyboard.once('keydown-SPACE', () => {
      this.cameras.main.fadeOut(450, 5, 5, 10);
      this.time.delayedCall(470, () => this.scene.start(SCENES.INTRO));
    });

    // 'L' anywhere on title also flips language.
    this.input.keyboard.on('keydown-L', () => I18n.toggle());

    // YT Playables: gameReady() once the title is interactive.
    this.time.delayedCall(16, () => Playables.gameReady());
  }

  addLangToggle() {
    // Two-segment pill top-left: [ EN | 中文 ]. Active side highlighted.
    // Keyboard L + taps flip it; TitleScene re-renders, later scenes pick
    // up I18n.lang on entry.
    const pad = 14;
    const y = 14;
    const enActive = I18n.lang === 'en';

    this.add.rectangle(pad, y, 96, 26, 0x0a0a1a, 0.75)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6acfff, 0.6);

    this.add.text(pad + 24, y + 13, 'EN', {
      fontFamily: 'sans-serif', fontSize: '13px',
      color: enActive ? '#e8b96a' : '#6acfff',
      fontStyle: enActive ? 'bold' : 'normal',
    }).setOrigin(0.5);

    this.add.text(pad + 48, y + 13, '|', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#4a5566',
    }).setOrigin(0.5);

    this.add.text(pad + 72, y + 13, '中文', {
      fontFamily: 'sans-serif', fontSize: '13px',
      color: enActive ? '#6acfff' : '#e8b96a',
      fontStyle: enActive ? 'normal' : 'bold',
    }).setOrigin(0.5);

    const enHit = this.add.rectangle(pad + 24, y + 13, 44, 24, 0x000000, 0.001)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const zhHit = this.add.rectangle(pad + 72, y + 13, 44, 24, 0x000000, 0.001)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    enHit.on('pointerdown', () => I18n.setLang('en'));
    zhHit.on('pointerdown', () => I18n.setLang('zh'));
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

import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Chiptune from '../systems/Chiptune.js';
import I18n from '../systems/I18n.js';

// Two-slide cultural primer before Day 1. Jam judges from outside Taiwan
// need the context that the sanitation truck literally plays Für Elise
// every evening and neighbours chase it on foot. Without this, the gameplay
// reads as abstract; with it, the whole loop lands.
//
// Copy now lives in strings.js so the language toggle flips it.
const SLIDE_KEYS = ['intro.slide1', 'intro.slide2'];

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super(SCENES.INTRO);
  }

  create() {
    this.slideIndex = 0;
    this.cameras.main.fadeIn(600, 5, 5, 10);
    this.bg = null;
    // Keep the title's Für Elise going across the primer — the motif
    // carrying through the cultural context reinforces that the melody
    // *is* the ritual. Slightly softer than title so text reads calmer.
    this.chiptune = new Chiptune(this, { volume: 0.11 });
    this.chiptune.start();
    // Re-render current slide if language flips mid-intro.
    this.unsubI18n = I18n.onChange(() => this.showSlide());
    this.events.once('shutdown', () => {
      if (this.unsubI18n) this.unsubI18n();
    });
    this.showSlide();
  }

  showSlide() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.children.removeAll();
    this.input.keyboard.removeAllListeners();

    // Soft painted backdrop — alley for slide 1, apartment hint for slide 2.
    const bgKey = this.slideIndex === 0 ? 'bg-alley-clear' : 'bg-apartment';
    if (this.textures.exists(bgKey)) {
      this.add.image(w / 2, h / 2, bgKey).setDisplaySize(w, h);
      this.add.rectangle(0, 0, w, h, 0x050510, 0.62).setOrigin(0);
    } else {
      this.add.rectangle(0, 0, w, h, 0x0a0a0f).setOrigin(0);
    }

    const lines = I18n.tArray(SLIDE_KEYS[this.slideIndex]).join('\n');
    const body = this.add.text(w / 2, h / 2, lines, {
      fontFamily: 'serif',
      fontSize: I18n.lang === 'zh' ? '22px' : '20px',
      color: '#e8dccb',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: body, alpha: 1, duration: 700 });

    const isLast = this.slideIndex === SLIDE_KEYS.length - 1;
    const prompt = this.add.text(w / 2, h - 36,
      I18n.t(isLast ? 'intro.begin' : 'intro.continue'), {
        fontFamily: 'sans-serif', fontSize: '14px', color: '#6acfff',
      }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.slideIndex += 1;
      if (this.slideIndex >= SLIDE_KEYS.length) {
        this.cameras.main.fadeOut(500, 5, 5, 10);
        this.time.delayedCall(520, () => this.scene.start(SCENES.APARTMENT, { day: 1, totalScore: 0 }));
      } else {
        this.showSlide();
      }
    });
    this.input.keyboard.once('keydown-ESC', () => {
      this.cameras.main.fadeOut(300, 5, 5, 10);
      this.time.delayedCall(320, () => this.scene.start(SCENES.APARTMENT, { day: 1, totalScore: 0 }));
    });
  }
}
